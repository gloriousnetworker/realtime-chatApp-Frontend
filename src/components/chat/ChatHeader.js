import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt, faBell } from '@fortawesome/free-solid-svg-icons';

function ChatHeader({ setShowSidebar, handleLogout, selectedUser, unreadCount }) {
  // Debugging: check the value of selectedUser
  console.log('Selected User:', selectedUser);

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b fixed top-0 left-0 right-0 z-10">
      {/* Hamburger menu icon for mobile */}
      <button
        className="text-gray-500 lg:hidden"
        onClick={() => setShowSidebar((prev) => !prev)}
      >
        <FontAwesomeIcon icon={faBars} size="lg" />
      </button>

      {/* Title with selected user */}
      <h2 className="text-2xl font-semibold flex-1 text-center lg:text-left">
        {selectedUser ? `Chat with ${selectedUser}` : 'CHATS ✍🏽'}
      </h2>

      {/* Notification bell icon with unread badge */}
      <div className="relative">
        <FontAwesomeIcon icon={faBell} size="lg" className="text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="ml-4 text-gray-500 hover:text-red-500 transition-colors"
      >
        <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
      </button>
    </div>
  );
}

export default ChatHeader;
