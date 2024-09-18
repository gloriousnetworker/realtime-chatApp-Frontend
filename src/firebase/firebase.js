// src/firebase.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken } from 'firebase/messaging';

// Your web app's Firebase configuration
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

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Messaging
const messaging = getMessaging(app);

// Function to get the Firebase Cloud Messaging token
const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const token = await getToken(messaging, { 
        vapidKey: 'BO6Yh-iAtyzzYWfw-e_CTitwmqmg00kvMZZTL5d4NgTyZ0DmAdDGre8Ka_6oc6O1TuYGshgdk5q5NV2KndXbWKo' 
      });
      console.log('FCM token:', token);
      // You can now store this token in the database for sending push notifications later
      return token;
    } else {
      console.error('Notification permission denied.');
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

export { db, auth, messaging, requestNotificationPermission };
