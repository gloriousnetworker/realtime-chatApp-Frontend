import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Chat from "./pages/Chat";
import Signup from "./auth/Signup";
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword"; 
import Maintenance from "./pages/Maintenance";
import { requestNotificationPermission, messaging } from "./firebase/firebase";
import { onMessage } from "firebase/messaging";

function App() {
  const [isMaintenanceMode] = useState(false);

  useEffect(() => {
    // Listen for messages when the app is in the foreground
    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
      alert(`Notification received: ${payload.notification.title} - ${payload.notification.body}`);
    });
  }, []);

  const handleRequestPermission = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      console.log("FCM Token received:", token);
    }
  };

  return (
    <Router>
      <div className="App">
        {/* Add a button to request notification permission */}
        <button onClick={handleRequestPermission}>Click to Enable Notifications</button>
        
        <Routes>
          {isMaintenanceMode ? (
            <Route path="*" element={<Maintenance />} />
          ) : (
            <>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/chat" element={<Chat />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
