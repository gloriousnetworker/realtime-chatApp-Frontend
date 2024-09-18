import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import useAuthGuard from '../hooks/useAuthGuard';
import useUserInitialization from '../hooks/useUserInitialization'; // Custom hook
import ChatHeader from './ChatHeader';
import UserSidebar from './UserSidebar';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import EmojiPicker from './EmojiPicker';

function Chat() {
  useAuthGuard();
  const navigate = useNavigate();

  const [messages,] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId,] = useState(null);
  const messageEndRef = useRef(null);

  const { customUserId, users, loading } = useUserInitialization(setFilteredUsers); // Get initialized user data

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
      {/* Mobile header */}
      <ChatHeader
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        setShowSidebar={setShowSidebar}
        handleLogout={handleLogout}
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
        />

        {/* Message input */}
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          handleKeyDown={handleKeyDown}
          handleFileSend={handleFileSend}
          setShowEmojiPicker={setShowEmojiPicker}
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
