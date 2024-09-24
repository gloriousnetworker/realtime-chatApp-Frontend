import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import { doc } from "firebase/firestore";

import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import useAuthGuard from "../hooks/useAuthGuard";
import useUserInitialization from "../hooks/useUserInitialization"; // Custom hook
import ChatHeader from "../components/chat/ChatHeader";
import UserSidebar from "../components/chat/UserSidebar";
import MessageInput from "../components/chat/MessageInput";
import MessageList from "../components/chat/MessageList";
import EmojiPicker from "../components/chat/EmojiPicker";

function Chat() {
  useAuthGuard();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [unreadMessagesMap, setUnreadMessagesMap] = useState({});
  const messageEndRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const calculateUnreadCount = () => {
    const unreadMessages = messages.filter(
      (message) => message.senderId !== customUserId && !message.isRead
    );
    setUnreadCount(unreadMessages.length);
  };

  useEffect(() => {
    calculateUnreadCount();
  }, [messages]);

  const { customUserId, users, loading } =
    useUserInitialization(setFilteredUsers); // Get initialized user data

  console.log("customUserId in Chat:", customUserId);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);
  
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !chatId) return;

    const temporaryMessage = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date(),
      senderId: customUserId,
      recipientId: selectedUser,
      isRead: false,
      chatId,
    };

    setMessages((prevMessages) => [...prevMessages, temporaryMessage]);
    setNewMessage("");

    try {
      const messageRef = await addDoc(
        collection(db, "chats", chatId, "messages"),
        {
          ...temporaryMessage,
          timestamp: serverTimestamp(),
        }
      );

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === temporaryMessage.id
            ? {
                ...msg,
                id: messageRef.id,
                timestamp: temporaryMessage.timestamp,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
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
      await addDoc(collection(db, "chats", chatId, "messages"), messageData);
    } catch (error) {
      console.error("Error sending file:", error);
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

    const newChatId =
      customUserId < userId
        ? `${customUserId}_${userId}`
        : `${userId}_${customUserId}`;
    setChatId(newChatId);

    console.log("ChatId after user click:", newChatId);

    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      navigate(-1);
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("userId");
        localStorage.removeItem("customUserId");
        navigate("/login");
      })
      .catch((error) => console.error("Error logging out:", error.message));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        setNewMessage((prevMessage) => prevMessage + "\n");
      } else {
        handleSendMessage();
      }
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleChatAreaClick = () => {
    setIsChatActive(true);
    if (showSidebar) {
      setShowSidebar(false);
    }
  };

  useEffect(() => {
    if (isChatActive) {
      console.log("Chat is active");
    }
  }, [isChatActive]);

  // Subscribe to messages when chatId changes
  // Mark messages as read when a chat is opened
  useEffect(() => {
    if (!selectedUser) return;
  
    // Reset unread messages for the selected user
    setUnreadMessagesMap((prev) => ({
      ...prev,
      [selectedUser]: 0,
    }));
  }, [selectedUser]);
  

// Subscribe to messages when chatId changes
useEffect(() => {
  if (!chatId) return;

  const unsubscribe = onSnapshot(
    collection(db, "chats", chatId, "messages"),
    (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(
        fetchedMessages.sort(
          (a, b) => a.timestamp?.toMillis() - b.timestamp?.toMillis()
        )
      );

      // Track unread messages for the selected user
      if (selectedUser && document.visibilityState === "hidden") {
        const unreadCount = fetchedMessages.filter(
          (msg) => msg.recipientId === customUserId && !msg.isRead
        ).length;

        if (unreadCount > 0) {
          setUnreadMessagesMap((prev) => ({
            ...prev,
            [selectedUser]: unreadCount,
          }));

          if (Notification.permission === "granted") {
            new Notification(
              `You have ${unreadCount} new message(s) from ${selectedUser}`
            );
          }
        }
      }

      // Mark messages as read when the chat is active and opened
      const markMessagesAsRead = async () => {
        const unreadMessages = fetchedMessages.filter(
          (message) =>
            message.recipientId === customUserId && !message.isRead
        );
      
        if (unreadMessages.length > 0) {
          try {
            const batch = db.batch();
            unreadMessages.forEach((message) => {
              const messageRef = doc(
                db,
                "chats",
                chatId,
                "messages",
                message.id
              );
              batch.update(messageRef, { isRead: true });
            });
            await batch.commit();
            console.log("Messages marked as read in Firestore");
      
            // Reset unread message count locally
            setUnreadMessagesMap((prev) => ({
              ...prev,
              [selectedUser]: 0, // Resetting count after marking as read
            }));
          } catch (error) {
            console.error("Error marking messages as read:", error);
          }
        }
      };
      

      if (selectedUser && fetchedMessages.length > 0) {
        console.log("Marking messages as read for:", selectedUser);
        markMessagesAsRead();
      }
      
    },
    (error) => {
      console.error("Error fetching messages:", error);
    }
  );

  return () => unsubscribe();
}, [chatId, selectedUser, customUserId]);


  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Mobile header */}
      <ChatHeader
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        handleLogout={handleLogout}
        setShowSidebar={setShowSidebar}
        unreadCount={unreadCount}  
        goBack={() => navigate(-1)}
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
        setUnreadCount={setUnreadCount}
        unreadMessagesMap={unreadMessagesMap} // Pass this prop
      />

      {/* Chat area */}
      <div className="w-full md:w-3/5 lg:w-2/3 xl:w-3/4 flex flex-col height-chat sm:overflow-hidden p-4 ml-auto">
        {/* Message list */}
        <MessageList
          messages={messages}
          customUserId={customUserId}
          messageEndRef={messageEndRef}
          selectedUser={selectedUser}
          setActive={handleChatAreaClick}
          setShowEmojiPicker={setShowEmojiPicker}
          setUnreadCount={setUnreadCount}
        unreadMessagesMap={unreadMessagesMap}
        unreadCount={unreadCount}  
        />

        {/* Input area */}
        <div className="relative">
          {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
          <MessageInput
            newMessage={newMessage}
            handleFileSend={handleFileSend}
            handleKeyDown={handleKeyDown}
            handleSendMessage={handleSendMessage}
            setNewMessage={setNewMessage}
            setShowEmojiPicker={setShowEmojiPicker}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;
