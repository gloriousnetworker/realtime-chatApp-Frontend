import React, { useEffect, useRef, useState, useCallback } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function MessageList({
  messages,
  customUserId,
  messageEndRef,
  selectedUser,
  setActive,
  closePickers,
}) {
  const navigate = useNavigate(); // Initialize the navigate function
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messageListRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (isAtBottom && messages.length > 0) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isAtBottom, messageEndRef, messages.length]);

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

  const handleClick = (event) => {
    const target = event.target;
    if (target.closest(".picker-button")) {
      return; // Prevent closing if a picker button is clicked
    }

    if (closePickers) {
      closePickers(); // Close pickers first
    }
    setActive(true); // Activate chat area
    navigate("/chat"); // Navigate to the chat area
  };

  return (
    <div
      className="flex-1 bg-white relative"
      style={{ height: "calc(100vh - 120px)", overflow: "hidden" }}
      onClick={handleClick}
    >
      <div
        ref={messageListRef}
        className="p-4 pb-24 overflow-y-auto"
        style={{ height: "calc(100% - 56px)", overflowY: "auto" }} // Ensure auto-scroll works correctly
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="text-center mt-32">
            <img
              src="Message.jpg" // Replace with your image URL
              alt="No messages illustration"
              className="mt-4 mx-auto h-32 w-auto"
            />
            <p className="text-gray-500 mt-4">No messages yet</p>
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
