import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function ChatHeader({ setShowSidebar, handleLogout, unreadCount }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      {/* Hamburger menu icon for mobile */}
      <button
        className="text-gray-500 lg:hidden"
        onClick={() => setShowSidebar((prev) => !prev)}
      >
        <FontAwesomeIcon icon={faBars} size="lg" />
      </button>

      {/* Title with Unread Message Notification */}
      <div className="flex-1 text-center lg:text-left">
        <h2 className="text-2xl font-semibold">Chats</h2>

        {/* Global Unread messages badge */}
        {unreadCount > 0 && (
          <span className="text-sm text-white bg-red-500 rounded-full px-2 py-1 ml-2">
            {unreadCount} new
          </span>
        )}
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="text-gray-500 hover:text-red-500 transition-colors"
      >
        <FontAwesomeIcon icon={faSignOutAlt} />
      </button>
    </div>
  );
}

export default ChatHeader;
