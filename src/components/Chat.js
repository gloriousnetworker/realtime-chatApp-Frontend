import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  getDocs,
} from 'firebase/firestore';
import { signInAnonymously, signOut } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faSmile, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { faSearch, faBars } from '@fortawesome/free-solid-svg-icons';
import Picker from 'emoji-picker-react';
import useAuthGuard from '../hooks/useAuthGuard';

const generateCustomUserId = () => {
  const adjectives = ["Quick", "Lazy", "Happy", "Bright", "Brave"];
  const nouns = ["Lion", "Eagle", "Shark", "Panda", "Tiger"];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${randomAdjective}${randomNoun}${randomNumber}`.toLowerCase();
};

function Chat() {
  useAuthGuard();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [customUserId, setCustomUserId] = useState('');
  const [chatId, setChatId] = useState(null);
  const messageEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeUser = async () => {
      let storedUserId = localStorage.getItem('customUserId');
      let userId = localStorage.getItem('userId');
  
      if (auth.currentUser && !userId) {
        userId = auth.currentUser.uid;
      }
  
      if (!userId) {
        try {
          const userCredential = await signInAnonymously(auth);
          userId = userCredential.user.uid;
          localStorage.setItem('userId', userId);
        } catch (error) {
          console.error('Error during anonymous sign-in:', error.message);
          return;
        }
      }
  
      if (!storedUserId) {
        try {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
  
          if (userDoc.exists()) {
            storedUserId = userDoc.data().customUserId;
          } else {
            storedUserId = generateCustomUserId();
            await setDoc(userRef, {
              userId: userId,
              customUserId: storedUserId,
              createdAt: serverTimestamp(),
            });
          }
  
          localStorage.setItem('customUserId', storedUserId);
        } catch (error) {
          console.error('Error checking/creating user in Firestore:', error.message);
        }
      }
  
      setCustomUserId(storedUserId);
      setLoading(false);
    };
  
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error.message);
      }
    };
  
    initializeUser().then(fetchUsers);
  }, []);
  
  // Inside the `useEffect` for fetching messages
  useEffect(() => {
    if (!selectedUser || !customUserId) return;
  
    const chatId = [customUserId, selectedUser].sort().join('-');
    setChatId(chatId);
  
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      // Check and update unread status for messages
      const unreadMessagesReceived = fetchedMessages.some(
        (message) => message.recipientId === customUserId && !message.isRead
      );

      console.log("Unread messages received:", unreadMessagesReceived);
  
      if (unreadMessagesReceived) {
        document.title = "New Message!";
      } else {
        document.title = "Chat App";
      }
  
      // Mark unread messages as read
      fetchedMessages.forEach(async (message) => {
        if (message.recipientId === customUserId && !message.isRead) {
          const messageRef = doc(db, 'chats', chatId, 'messages', message.id);
          await setDoc(messageRef, { isRead: true }, { merge: true });
          console.log(`Marked message ${message.id} as read`);
        }
      });
  
      setMessages(fetchedMessages);
      scrollToBottom();
    });
  
    return () => unsubscribe();
  }, [selectedUser, customUserId]);
  


  

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !chatId) return;

    try {
      const messageData = {
        text: newMessage,
        timestamp: serverTimestamp(),
        senderId: customUserId,
        recipientId: selectedUser,
        isRead: false,
        chatId,
      };
      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSend = async (e) => {
    const file = e.target.files[0];
    if (!file || !chatId) return;

    try {
      const fileUrl = URL.createObjectURL(file);
      const messageData = {
        fileUrl,
        fileType: file.type,
        timestamp: serverTimestamp(),
        senderId: customUserId,
        recipientId: selectedUser,
        chatId,
      };
      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
    } catch (error) {
      console.error('Error sending file:', error);
    }
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = users.filter((user) =>
      user.customUserId.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  };

  const handleUserClick = (userId) => {
    setSelectedUser(userId);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem('userId');
        localStorage.removeItem('customUserId');
        navigate('/login');
      })
      .catch((error) => console.error('Error logging out:', error.message));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        setNewMessage((prevMessage) => prevMessage + '\n');
      } else {
        handleSendMessage();
      }
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-300 to-blue-300">
      {/* Mobile header with search icon */}
<div className="md:hidden flex items-center justify-between p-4 bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg">
  <h2 className="text-2xl font-bold text-white">YDKM Chat App 😁</h2>
  <div className="flex items-center space-x-4">
    {/* Mobile search button */}
    <button
      onClick={() => setShowSearch(!showSearch)}
      className="text-white text-xl"
    >
      <FontAwesomeIcon icon={faSearch} />
    </button>
    {/* Mobile menu button */}
    <button
      onClick={() => setShowSidebar(!showSidebar)}
      className="text-white text-xl"
    >
      <FontAwesomeIcon icon={faBars} />
    </button>
  </div>
</div>


  
      {/* Sidebar for desktop and mobile */}
<div
  className={`${
    showSidebar ? 'block' : 'hidden'
  } md:block md:w-2/5 lg:w-1/3 xl:w-1/4 p-6 flex-col bg-gradient-to-b from-gray-100 to-gray-200 fixed inset-y-0 left-0 overflow-y-auto z-50`}
>
  <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome to the Chat App</h2>
  
  {customUserId && (
    <div className="text-center mb-6">
      <p className="text-sm text-gray-500">Your Custom User ID:</p>
      <p className="text-lg font-bold text-gray-700">{customUserId}</p>
    </div>
  )}
  
  {/* Mobile Search Bar */}
  {showSearch && (
    <input
      type="text"
      className="w-full p-3 rounded-lg border border-gray-300 mb-4"
      placeholder="Search for user by ID..."
      value={searchTerm}
      onChange={handleSearch}
    />
  )}
  
  {/* Search Bar for Desktop */}
  <div className="hidden md:block mb-6">
    <input
      type="text"
      className="w-full p-3 rounded-lg border border-gray-300"
      placeholder="Search for user by ID..."
      value={searchTerm}
      onChange={handleSearch}
    />
  </div>

  {/* Display filtered users */}
  <div className="mt-4 w-full">
    <h3 className="text-lg font-semibold mb-4 text-gray-700">Users:</h3>
    <p className="mb-4 text-sm font-semibold text-blue-600">
    For support, contact: +234 8024983733
  </p>
    {filteredUsers.length === 0 ? (
      <p className="text-sm text-gray-500">No users found</p>
    ) : (
      filteredUsers.slice(0, 10).map((user) => {
        const unreadMessagesSent = messages.some(
          (message) =>
            message.senderId === customUserId && 
            message.recipientId === user.customUserId && 
            !message.isRead
        );

        const unreadMessagesReceived = messages.some(
          (message) =>
            message.recipientId === customUserId && 
            message.senderId === user.customUserId && 
            !message.isRead
        );

        return (
          <div
            key={user.id}
            className={`p-4 mb-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-all shadow-md ${
              selectedUser === user.customUserId ? 'bg-gray-300' : ''
            }`}
            onClick={() => handleUserClick(user.customUserId)}
          >
            <p className="text-gray-700 font-medium">{user.customUserId}</p>
            <div className="flex items-center mt-1">
              {unreadMessagesSent && (
                <span className="ml-2 bg-red-500 rounded-full h-3 w-3 inline-block"></span>
              )}
              {unreadMessagesReceived && (
                <span className="ml-2 bg-green-500 rounded-full h-3 w-3 inline-block"></span>
              )}
            </div>
          </div>
        );
      })
    )}
  </div>
</div>

  
      {/* Chat area */}
<div className="w-full md:w-3/5 lg:w-2/3 xl:w-3/4 flex flex-col h-screen p-4 ml-auto">
  {/* Chat header */}
<div className="flex items-center justify-between p-4 bg-white border-b">
  <h2 className="text-2xl font-semibold">Chats</h2>
  <button
    onClick={handleLogout}
    className="text-gray-500 hover:text-red-500 transition-colors"
  >
    <FontAwesomeIcon icon={faSignOutAlt} />
  </button>
</div>


  {/* Chat messages */}
  <div className="flex-1 overflow-y-auto p-4 bg-white">
    {messages.length === 0 ? (
      <p className="text-center text-red-500">No messages yet.</p>
    ) : (
      messages.map((message) => (
        <div
          key={message.id}
          className={`flex mb-4 ${
            message.senderId === customUserId ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`p-2 rounded-lg max-w-xs ${
              message.senderId === customUserId
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-800'
            }`}
          >
            {message.text}
          </div>
        </div>
      ))
    )}
    <div ref={messageEndRef} />
  </div>

  {/* Message input */}
  <div className="p-4 bg-white border-t flex items-center">
    <button
      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      className="text-gray-500 mr-2"
    >
      <FontAwesomeIcon icon={faSmile} />
    </button>

    <input
      type="file"
      className="hidden"
      id="fileInput"
      onChange={handleFileSend}
    />
    <label htmlFor="fileInput" className="text-gray-500 cursor-pointer mr-2">
      <FontAwesomeIcon icon={faPaperclip} />
    </label>

    <input
      type="text"
      className="flex-1 p-2 border rounded"
      placeholder="Type your message..."
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      onKeyDown={handleKeyDown}
    />

    <button
      onClick={handleSendMessage}
      className="ml-2 p-2 bg-blue-500 text-white rounded"
    >
      Send
    </button>
  </div>
</div>

  
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-8 md:left-auto md:right-8">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </div>
  );
  
}

export default Chat;
