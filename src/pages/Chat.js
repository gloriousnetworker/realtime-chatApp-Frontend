import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
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

  const [messages, setMessages] = useState([]); // Updated: Added setMessages
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null); // Initialize chatId with useState
  const [unreadMessagesMap, setUnreadMessagesMap] = useState({});
  const messageEndRef = useRef(null);

  const { customUserId, users, loading } =
    useUserInitialization(setFilteredUsers); // Get initialized user data

  // Add console log to debug customUserId in Chat
  console.log("customUserId in Chat:", customUserId);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !chatId) return;

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
    setNewMessage("");

    try {
      // Send the message to Firestore with the real server timestamp
      const messageRef = await addDoc(
        collection(db, "chats", chatId, "messages"),
        {
          ...temporaryMessage,
          timestamp: serverTimestamp(), // Firestore server-side timestamp
        }
      );

      // After the message is saved to Firestore, update the local state with the real message ID and timestamp
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

    // Generate chatId based on both users
    const newChatId =
      customUserId < userId
        ? `${customUserId}_${userId}`
        : `${userId}_${customUserId}`;
    setChatId(newChatId);

    // Add console log to debug chatId
    console.log("ChatId after user click:", newChatId);

    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault(); // Prevent default back button behavior
      navigate(-1); // Navigate one step back
    };

    // Add event listener for browser back button
    window.addEventListener("popstate", handleBackButton);

    return () => {
      // Cleanup listener on component unmount
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
      // Do something when the chat is active, e.g., logging
      console.log("Chat is active");
    }
  }, [isChatActive]);

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
              [selectedUser]: unreadCount, // Add unread count for selected user
            }));

            new Notification(
              `You have ${unreadCount} new message(s) from ${selectedUser}`
            );
          }
        }
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => unsubscribe();
  }, [chatId, selectedUser, customUserId]);

  // Mark messages as read when a chat is opened
  useEffect(() => {
    if (!selectedUser) return;

    // Reset unread messages for the selected user
    setUnreadMessagesMap((prev) => ({
      ...prev,
      [selectedUser]: 0,
    }));
  }, [selectedUser]);

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
      {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
    </div>
  );
}

export default Chat;
