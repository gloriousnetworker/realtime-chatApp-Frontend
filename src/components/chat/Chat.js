import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import useAuthGuard from '../../hooks/useAuthGuard';
import useUserInitialization from '../../hooks/useUserInitialization'; // Custom hook
import ChatHeader from './ChatHeader';
import UserSidebar from './UserSidebar';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import EmojiPicker from './EmojiPicker';

function Chat() {
  useAuthGuard();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]); // Updated: Added setMessages
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null); // Initialize chatId with useState
  const messageEndRef = useRef(null);

  const { customUserId, users, loading } = useUserInitialization(setFilteredUsers); // Get initialized user data

  // Add console log to debug customUserId in Chat
  console.log('customUserId in Chat:', customUserId);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !chatId) return;
  
    // Create a temporary message with a local timestamp and a temporary ID
    const temporaryMessage = {
      id: Date.now().toString(), // Temporary ID based on current time
      text: newMessage,
      timestamp: new Date(), // Client-side timestamp
      senderId: customUserId,
      recipientId: selectedUser,
      isRead: false,
      chatId,
    };
  
    // Optimistically add the message to the local state before sending
    setMessages((prevMessages) => [...prevMessages, temporaryMessage]);
    setNewMessage('');
  
    try {
      // Send the message to Firestore with the real server timestamp
      const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
        ...temporaryMessage,
        timestamp: serverTimestamp(), // Firestore server-side timestamp
      });
  
      // After the message is saved to Firestore, update the local state with the real message ID and timestamp
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === temporaryMessage.id
            ? { ...msg, id: messageRef.id, timestamp: temporaryMessage.timestamp }
            : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally handle errors and remove the optimistic message if it fails
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

    // Generate chatId based on both users
    const newChatId = customUserId < userId 
      ? `${customUserId}_${userId}` 
      : `${userId}_${customUserId}`;
    setChatId(newChatId);
    

    // Add console log to debug chatId
    console.log('ChatId after user click:', newChatId);

    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
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

  // Subscribe to messages when chatId changes
  useEffect(() => {
    if (!chatId) return;
  
    const unsubscribe = onSnapshot(
      collection(db, 'chats', chatId, 'messages'),
      (snapshot) => {
        const fetchedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Update messages state with fetched messages (sorted by timestamp)
        setMessages(fetchedMessages.sort((a, b) => a.timestamp?.toMillis() - b.timestamp?.toMillis()));
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  
    return () => unsubscribe();
  }, [chatId]);
  
  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-300 to-blue-300">
      {/* Mobile header */}
      <ChatHeader
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        handleLogout={handleLogout}
        setShowSidebar={setShowSidebar}
      />

      {/* Sidebar */}
      <UserSidebar
        showSidebar={showSidebar}
        users={filteredUsers}
        messages={messages}
        customUserId={customUserId}
        selectedUser={selectedUser}
        handleUserClick={handleUserClick}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        setShowSidebar={setShowSidebar}
      />

      {/* Chat area */}
      <div className="w-full md:w-3/5 lg:w-2/3 xl:w-3/4 flex flex-col h-screen p-4 ml-auto">
        {/* Message list */}
        <MessageList
          messages={messages}
          customUserId={customUserId}
          messageEndRef={messageEndRef}
          selectedUser={selectedUser}
        />


        {/* Message input */}
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          handleFileSend={handleFileSend}
          handleKeyDown={handleKeyDown}
          setShowEmojiPicker={setShowEmojiPicker}
          customUserId={customUserId}
          chatId={chatId} // Ensure chatId is passed
        />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker onEmojiClick={onEmojiClick} />
      )}
    </div>
  );
}

export default Chat;
