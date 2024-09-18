// components/Sidebar.js
import React from 'react';

const Sidebar = ({
  customUserId,
  searchTerm,
  setSearchTerm,
  filteredUsers,
  handleUserClick,
  messages,
  selectedUser,
  showSearch,
  handleSearch,
}) => {
  return (
    <div className="md:block md:w-2/5 lg:w-1/3 xl:w-1/4 p-6 bg-gradient-to-b from-gray-100 to-gray-200 fixed inset-y-0 left-0 overflow-y-auto z-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome to the Chat App</h2>
      {customUserId && (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">Your Custom User ID:</p>
          <p className="text-lg font-bold text-gray-700">{customUserId}</p>
        </div>
      )}
      {showSearch && (
        <input
          type="text"
          className="w-full p-3 rounded-lg border border-gray-300 mb-4"
          placeholder="Search for user by ID..."
          value={searchTerm}
          onChange={handleSearch}
        />
      )}
      <div className="mt-4 w-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Users:</h3>
        {filteredUsers.length === 0 ? (
          <p className="text-sm text-gray-500">No users found</p>
        ) : (
          filteredUsers.slice(0, 10).map((user) => {
            const unreadMessagesSent = messages.some(
              (message) => message.senderId === customUserId && message.recipientId === user.customUserId && !message.isRead
            );
            const unreadMessagesReceived = messages.some(
              (message) => message.recipientId === customUserId && message.senderId === user.customUserId && !message.isRead
            );
            return (
              <div
                key={user.id}
                className={`p-4 mb-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-all shadow-md ${
                  selectedUser === user.customUserId ? 'bg-gray-300' : ''
                }`}
                onClick={() => handleUserClick(user.customUserId)}
              >
                <p className="text-gray-700 font-medium">{user.customUserId}</p>
                <div className="flex items-center mt-1">
                  {unreadMessagesSent && <span className="ml-2 bg-red-500 rounded-full h-3 w-3 inline-block"></span>}
                  {unreadMessagesReceived && <span className="ml-2 bg-green-500 rounded-full h-3 w-3 inline-block"></span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
