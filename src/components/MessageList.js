import React, { useEffect } from 'react';

function MessageList({ messages, customUserId, messageEndRef }) {

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white">
      {messages.length === 0 ? (
        <p className="text-center text-red-500">No messages yet.</p>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-4 ${
              message.senderId === customUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs ${
                message.senderId === customUserId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))
      )}
      <div ref={messageEndRef} />
    </div>
  );
}

export default MessageList;
