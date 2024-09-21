import React, { useEffect } from 'react';
import { format, isToday, isYesterday } from 'date-fns'; // To handle date formatting

function MessageList({ messages, customUserId, messageEndRef, selectedUser }) {

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom(); // Scrolls to the latest message after the messages are updated
  }, [messages]);

  // Helper function to format the date label
  const formatDateLabel = (timestamp) => {
    const messageDate = timestamp instanceof Date 
      ? timestamp 
      : timestamp?.toDate ? timestamp.toDate() : new Date(); // Ensure proper Date conversion
    
    if (isToday(messageDate)) return 'Today';
    if (isYesterday(messageDate)) return 'Yesterday';
    return format(messageDate, 'MMMM dd, yyyy'); // Custom date format for older dates
  };

  // Helper function to format message time
  const formatMessageTime = (timestamp) => {
    const messageDate = timestamp instanceof Date 
      ? timestamp 
      : timestamp?.toDate ? timestamp.toDate() : new Date(); // Ensure proper Date conversion
    
    return format(messageDate, 'HH:mm');
  };

  // Group messages by date
  let lastMessageDate = null;

  return (
    <div className="flex-1 overflow-y-auto bg-white relative">
      {/* Sticky header for "Chat with CustomID" */}
      <div className="sticky top-0 z-10 bg-white p-2 border-b">
        <p className="text-center text-gray-500">
          {selectedUser ? `Chat with ${selectedUser}` : 'No user selected.'}
        </p>
      </div>

      {/* Message area */}
      <div className="p-4 pb-24"> {/* Adjusted padding-bottom to prevent input overlap */}
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet.</p>
        ) : (
          messages.map((message) => {
            const messageDate = message.timestamp instanceof Date 
              ? message.timestamp 
              : message.timestamp?.toDate ? message.timestamp.toDate() : new Date(); // Handle different timestamp formats
            const showDateLabel = !lastMessageDate || formatDateLabel(lastMessageDate) !== formatDateLabel(messageDate);
            lastMessageDate = messageDate;

            return (
              <div key={message.id}>
                {/* Show the date label if it's a new day */}
                {showDateLabel && (
                  <div className="text-center text-gray-500 my-2">
                    {formatDateLabel(message.timestamp)}
                  </div>
                )}

                {/* Message bubble */}
                <div className={`flex mb-4 ${message.senderId === customUserId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-2 rounded-lg max-w-xs md:max-w-md ${message.senderId === customUserId ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                    <p className="break-words">{message.text}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatMessageTime(message.timestamp)} {/* Show message time */}
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
