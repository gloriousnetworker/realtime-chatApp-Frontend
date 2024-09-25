import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt, faBell } from '@fortawesome/free-solid-svg-icons';

function ChatHeader({ setShowSidebar, handleLogout, selectedUser, unreadCount }) {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md border-b fixed top-0 left-0 right-0 z-10">
      {/* Hamburger menu icon for mobile screens */}
      <button
        className="text-gray-600 lg:hidden focus:outline-none" // Only visible on small screens
        onClick={() => setShowSidebar((prev) => !prev)} // Toggle sidebar visibility
      >
        <FontAwesomeIcon icon={faBars} size="lg" />
      </button>

      {/* Chat title or selected user */}
      <h2 className="text-xl font-bold text-center flex-1 lg:text-left text-gray-800">
        {selectedUser ? `Chat with ${selectedUser}` : 'CHATS ✍🏽'}
      </h2>

      {/* Notification bell icon with unread count */}
      <div className="relative mr-4">
        <FontAwesomeIcon icon={faBell} size="lg" className="text-gray-600 cursor-pointer" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="text-gray-600 hover:text-red-500 transition-colors duration-200 focus:outline-none"
      >
        <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
      </button>
    </header>
  );
}

export default ChatHeader;
