// components/MessageList.js
import React from 'react';

const MessageList = ({ messages, customUserId, messageEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => (
        <div key={message.id} className={`mb-4 ${message.senderId === customUserId ? 'text-right' : ''}`}>
          <div className={`inline-block p-2 rounded-lg ${message.senderId === customUserId ? 'bg-blue-300' : 'bg-gray-200'}`}>
            {message.text}
          </div>
        </div>
      ))}
      <div ref={messageEndRef}></div>
    </div>
  );
};

export default MessageList;
