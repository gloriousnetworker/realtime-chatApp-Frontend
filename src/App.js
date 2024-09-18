import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Chat from './components/Chat';
import Signup from './components/Signup';
import Login from './components/Login';
import Maintenance from './pages/Maintenance'; // Import the Maintenance page

function App() {
  // State to control maintenance mode (true means maintenance mode is on)
  const [isMaintenanceMode] = useState(true); // Remove the setIsMaintenanceMode

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Check if maintenance mode is on */}
          {isMaintenanceMode ? (
            // If in maintenance mode, show only the maintenance page
            <Route path="*" element={<Maintenance />} />
          ) : (
            // Normal routes when not in maintenance mode
            <>
              <Route path="/" element={<Navigate to="/login" />} /> {/* Default to Login */}
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/chat" element={<Chat />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
