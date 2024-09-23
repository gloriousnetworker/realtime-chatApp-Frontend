import React, { useEffect } from "react";
import { format, isToday, isYesterday } from "date-fns";

function MessageList({ messages, customUserId, messageEndRef, selectedUser, setActive }) {
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleClick = () => {
    setActive(true); // Assuming this function makes the message list active
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white relative" onClick={handleClick}>
      <div className="sticky top-0 z-10 bg-white p-2 border-b">
        <p className="text-center text-gray-500">
          {selectedUser ? `Chat with ${selectedUser}` : "No user selected."}
        </p>
      </div>

      <div className="p-4 pb-24">
        {messages.length === 0 ? (
          <div className="text-center">
            <img
              src="Message.jpg" // Replace with your image URL
              alt="No messages illustration"
              className="mt-4 mx-auto h-32 w-auto" // Adjust the height as needed
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
        <div ref={messageEndRef} />
      </div>
    </div>
  );
}

export default MessageList;
