import React, { useEffect, useRef, useCallback } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { useNavigate } from "react-router-dom";

function MessageList({ messages, customUserId, selectedUser, setActive, closePickers }) {
  const navigate = useNavigate();
  const messageListRef = useRef(null);
  const messageEndRef = useRef(null); // Initialize messageEndRef here

  // Scroll to the bottom of the messages
  const scrollToBottom = useCallback(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Trigger scrollToBottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle user scrolling to determine if they're at the bottom
  const handleScroll = () => {
    // const { scrollTop, clientHeight, scrollHeight } = messageListRef.current;
    // Optionally perform some action if needed when user scrolls
  };

  // Format date labels
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

  // Format message time
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

  // Handle click events for interacting with the chat area
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
      <div className="sticky top-0 z-10 bg-white p-2 border-b">
        <p className="text-center text-gray-500">
          {selectedUser ? `Chat with ${selectedUser}` : "No user selected."}
        </p>
      </div>

      <div
        ref={messageListRef}
        className="p-4 pb-24 overflow-y-auto"
        style={{ height: "calc(100% - 56px)" }}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="text-center">
            <img
              src="Message.jpg" // Replace with your image URL
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
                    <div className={`text-xs ${message.senderId === customUserId ? "text-white" : "text-gray-800"} mt-1`}>
                      {formatMessageTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {/* Ensure this is positioned at the end of the message list */}
        <div ref={messageEndRef} />
      </div>
    </div>
  );
}

export default MessageList;
