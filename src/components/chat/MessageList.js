import React, { useEffect, useRef, useState, useCallback } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { useNavigate } from "react-router-dom";

function MessageList({
  messages,
  customUserId,
  messageEndRef,
  selectedUser,
  setActive,
  closePickers,
  setUnreadCount,
  updateMessageReadStatus // New prop to update message read status in the parent state or database
}) {
  const navigate = useNavigate();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messageListRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (isAtBottom) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isAtBottom, messageEndRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = messageListRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 1);
  };

  const formatDateLabel = (timestamp) => {
    const messageDate =
      timestamp instanceof Date
        ? timestamp
        : timestamp?.toDate
        ? timestamp.toDate()
        : new Date();

    if (isToday(messageDate)) return "Today";
    if (isYesterday(messageDate)) return "Yesterday";
    return format(messageDate, "MMMM dd, yyyy");
  };

  const formatMessageTime = (timestamp) => {
    const messageDate =
      timestamp instanceof Date
        ? timestamp
        : timestamp?.toDate
        ? timestamp.toDate()
        : new Date();

    return format(messageDate, "HH:mm");
  };

  let lastMessageDate = null;

  const handleClick = (event, message) => {
    const target = event.target;
    if (target.closest('.picker-button')) {
      return;
    }

    if (closePickers) {
      closePickers();
    }
    setActive(true);
    navigate("/chat");

    // Mark message as read if it's unread and update the unread count
    if (message.recipientId === customUserId && !message.isRead) {
      setUnreadCount((prevCount) => Math.max(prevCount - 1, 0));
      updateMessageReadStatus(message.id); // This updates the read status in the parent or database
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white relative h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white p-2 border-b">
        <p className="text-center text-gray-500">
          {selectedUser ? `Chat with ${selectedUser}` : "No user selected."}
        </p>
      </div>

      {/* Message List */}
      <div
        ref={messageListRef}
        className="flex-1 p-4 pb-24 overflow-auto"
        onScroll={handleScroll}
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 ? (
          <div className="text-center">
            <img
              src="Message.jpg"
              alt="No messages illustration"
              className="mt-4 mx-auto h-32 w-auto"
            />
          </div>
        ) : (
          messages.map((message) => {
            const messageDate =
              message.timestamp instanceof Date
                ? message.timestamp
                : message.timestamp?.toDate
                ? message.timestamp.toDate()
                : new Date();
            const showDateLabel =
              !lastMessageDate ||
              formatDateLabel(lastMessageDate) !== formatDateLabel(messageDate);
            lastMessageDate = messageDate;

            const isUnread =
              message.recipientId === customUserId && !message.isRead;

            return (
              <div key={message.id}>
                {showDateLabel && (
                  <div className="text-center text-gray-500 my-2">
                    {formatDateLabel(message.timestamp)}
                  </div>
                )}

                <div
                  className={`flex mb-4 ${
                    message.senderId === customUserId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                  onClick={(e) => handleClick(e, message)}
                >
                  <div
                    className={`p-2 rounded-lg max-w-xs md:max-w-md ${
                      message.senderId === customUserId
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-gray-800"
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">
                      {message.text}
                    </p>
                    <div
                      className={`text-xs ${
                        message.senderId === customUserId
                          ? "text-white"
                          : "text-gray-800"
                      } mt-1`}
                    >
                      {formatMessageTime(message.timestamp)}
                    </div>

                    {isUnread && (
                      <div className="text-xs text-green-500 mt-1">Unread</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>
    </div>
  );
}

export default MessageList;
