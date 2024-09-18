// components/Header.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBars } from '@fortawesome/free-solid-svg-icons';

const Header = ({ showSearch, setShowSearch, showSidebar, setShowSidebar }) => {
  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg">
      <h2 className="text-2xl font-bold text-white">YDKM Chat App 😁</h2>
      <div className="flex items-center space-x-4">
        <button onClick={() => setShowSearch(!showSearch)} className="text-white text-xl">
          <FontAwesomeIcon icon={faSearch} />
        </button>
        <button onClick={() => setShowSidebar(!showSidebar)} className="text-white text-xl">
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
    </div>
  );
};

export default Header;
