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
  setDoc,
  getDocs,
} from 'firebase/firestore';
import { signInAnonymously, signOut } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBook, faChartBar, faSignOutAlt, faSmile, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import Picker from 'emoji-picker-react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const generateCustomUserId = () => {
  const adjectives = ["Quick", "Lazy", "Happy", "Bright", "Brave"];
  const nouns = ["Lion", "Eagle", "Shark", "Panda", "Tiger"];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${randomAdjective}${randomNoun}${randomNumber}`.toLowerCase();
};

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [customUserId, setCustomUserId] = useState('');
  const messageEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const messaging = getMessaging();

  useEffect(() => {
    const initializeUser = async () => {
      let storedUserId = localStorage.getItem('customUserId');
      if (!storedUserId) {
        try {
          await signInAnonymously(auth);
          const uid = auth.currentUser?.uid;
          if (uid) {
            localStorage.setItem('userId', uid);
            storedUserId = generateCustomUserId();
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, {
              userId: uid,
              customUserId: storedUserId.toLowerCase(),
              createdAt: serverTimestamp(),
            });
            localStorage.setItem('customUserId', storedUserId);
          }
        } catch (error) {
          console.error('Error during initialization:', error.message);
        }
      }
      setCustomUserId(storedUserId);
      setLoading(false);
    };

    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map((doc) => ({
          ...doc.data(),
          customUserId: doc.data().customUserId.toLowerCase(),
        }));
        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error.message);
      }
    };

    initializeUser();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filteredMessages = fetchedMessages.filter(
        (message) =>
          (message.userId === customUserId && message.recipientId === selectedUser) ||
          (message.userId === selectedUser && message.recipientId === customUserId)
      );
      
      setMessages(filteredMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedUser, customUserId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedUser) return;

    try {
      const messageData = {
        text: newMessage,
        timestamp: serverTimestamp(),
        userId: customUserId,
        recipientId: selectedUser,
      };
      await addDoc(collection(db, 'messages'), messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSend = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;

    try {
      const messageData = {
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        timestamp: serverTimestamp(),
        userId: customUserId,
        recipientId: selectedUser,
      };
      await addDoc(collection(db, 'messages'), messageData);
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

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: 'BO6Yh-iAtyzzYWfw-e_CTitwmqmg00kvMZZTL5d4NgTyZ0DmAdDGre8Ka_6oc6O1TuYGshgdk5q5NV2KndXbWKo',
          });
          console.log('FCM Token:', token);
        } else {
          console.log('Notification permission denied.');
        }
      } catch (error) {
        console.error('Error getting FCM token:', error.message);
      }
    };

    requestNotificationPermission();
  }, [messaging]);

  useEffect(() => {
    const unsubscribeOnMessage = onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
    });

    return () => unsubscribeOnMessage();
  }, [messaging]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar for desktop view */}
      <div className="hidden md:flex md:w-2/5 lg:w-1/3 xl:w-1/4 p-4 flex-col bg-gray-200 fixed inset-y-0 left-0 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Welcome to the Chat App</h2>
        {customUserId && (
          <div className="text-center mt-4">
            <p className="text-sm">Your Custom User ID:</p>
            <p className="text-lg font-bold">{customUserId}</p>
          </div>
        )}
        {/* Search Bar for Users */}
        <input
          type="text"
          className="mt-4 p-2 border rounded"
          placeholder="Search for user by ID..."
          value={searchTerm}
          onChange={handleSearch}
        />
        {/* Display filtered users */}
        <div className="mt-4 w-full">
          <h3 className="text-lg font-semibold mb-2">Users:</h3>
          {filteredUsers.length === 0 ? (
            <p className="text-sm">No users found</p>
          ) : (
            filteredUsers.slice(0, 10).map((user, index) => (
              <div
                key={index}
                className={`p-2 mb-2 border rounded cursor-pointer hover:bg-gray-300 ${
                  selectedUser === user.customUserId ? 'bg-gray-300' : ''
                }`}
                onClick={() => handleUserClick(user.customUserId)}
              >
                {user.customUserId}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="w-full md:w-3/5 lg:w-2/3 xl:w-3/4 flex flex-col p-4 ml-auto md:ml-auto">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <h2 className="text-2xl font-semibold">Chat</h2>
          <button onClick={handleLogout} className="text-gray-500">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet.</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${
                  message.userId === customUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-xs ${
                    message.userId === customUserId
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
