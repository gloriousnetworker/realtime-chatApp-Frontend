// src/pages/Maintenance.js
import React from 'react';

const Maintenance = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* SVG Image */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-64 w-64 mb-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
        />
      </svg>

      {/* Maintenance Message */}
      <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
        We're currently under maintenance
      </h1>
      <p className="text-gray-600 text-lg text-center">
        Our site is temporarily unavailable, but we’ll be back soon. Thank you for your patience!
      </p>
    </div>
  );
};

export default Maintenance;
