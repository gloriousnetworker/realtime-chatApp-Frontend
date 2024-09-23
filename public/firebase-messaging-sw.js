// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

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
firebase.initializeApp(firebaseConfig);

// Initialize messaging
const messaging = firebase.messaging();

// Background notification handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
