import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function ChatHeader({ setShowSidebar, handleLogout }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      {/* Hamburger menu icon for mobile */}
      <button
        className="text-gray-500 lg:hidden" // Only show on small screens
        onClick={() => setShowSidebar((prev) => !prev)} // Toggle sidebar visibility
      >
        <FontAwesomeIcon icon={faBars} size="lg" />
      </button>

      {/* Title */}
      <h2 className="text-2xl font-semibold flex-1 text-center lg:text-left">Chats</h2>

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
