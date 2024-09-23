import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Chat from "./pages/Chat";
import Signup from "./auth/Signup";
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword"; // Import the Forgot Password page
import Maintenance from "./pages/Maintenance"; // Import the Maintenance page

function App() {
  // State to control maintenance mode (true means maintenance mode is on)
  const [isMaintenanceMode] = useState(false); // Remove the setIsMaintenanceMode

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
              <Route path="/" element={<Navigate to="/login" />} />{" "}
              {/* Default to Login */}
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/forgot-password"
                element={<ForgotPassword />}
              />{" "}
              {/* Forgot Password Route */}
              <Route path="/chat" element={<Chat />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
