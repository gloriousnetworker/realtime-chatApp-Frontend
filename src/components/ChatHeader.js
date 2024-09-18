import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function ChatHeader({ handleLogout }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <h2 className="text-2xl font-semibold">Chats</h2>
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
