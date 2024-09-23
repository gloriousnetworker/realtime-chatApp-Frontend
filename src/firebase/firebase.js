import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD76erEmRp6Wh_6ldr1fXPQDIL0QPW2R0I",
  authDomain: "realchatapp-6b63f.firebaseapp.com",
  projectId: "realchatapp-6b63f",
  storageBucket: "realchatapp-6b63f.appspot.com",
  messagingSenderId: "970906801211",
  appId: "1:970906801211:web:a0de174ebff942b785f81e",
  measurementId: "G-913NXZHXNZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const messaging = getMessaging(app);

// Request notification permission and get the token
const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // Get the current token
      const token = await getToken(messaging, { 
        vapidKey: 'BO6Yh-iAtyzzYWfw-e_CTitwmqmg00kvMZZTL5d4NgTyZ0DmAdDGre8Ka_6oc6O1TuYGshgdk5q5NV2KndXbWKo' 
      });
      console.log('FCM token:', token);
      return token; // Optionally send this token to your backend server
    } else {
      console.error('Notification permission denied.');
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

// Listen for incoming messages when the app is open
onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // Display notification or update UI as needed
  alert(`New message: ${payload.notification.title} - ${payload.notification.body}`);
});

// Check for token on app load
requestNotificationPermission();

export { db, auth, messaging, requestNotificationPermission };
