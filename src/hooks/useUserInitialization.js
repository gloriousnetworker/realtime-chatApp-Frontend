import { useEffect, useState } from 'react';
import { db, auth } from '../firebase/firebase';
import { signInAnonymously } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

const generateUniqueCustomUserId = async () => {
  let isUnique = false;
  let customUserId = '';

  const adjectives = ["Quick", "Lazy", "Happy", "Bright", "Brave"];
  const nouns = ["Lion", "Eagle", "Shark", "Panda", "Tiger"];

  while (!isUnique) {
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    customUserId = `${randomAdjective}${randomNoun}${randomNumber}`.toLowerCase();

    // Check if this customUserId already exists in Firestore
    const usersSnapshot = await getDocs(
      query(collection(db, 'users'), where('customUserId', '==', customUserId))
    );

    if (usersSnapshot.empty) {
      isUnique = true;
    }
  }

  return customUserId;
};

const useUserInitialization = (setFilteredUsers) => {
  const [customUserId, setCustomUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      let storedUserId = localStorage.getItem('customUserId');
      let userId = localStorage.getItem('userId');

      if (auth.currentUser && !userId) {
        userId = auth.currentUser.uid;
      }

      if (!userId) {
        try {
          const userCredential = await signInAnonymously(auth);
          userId = userCredential.user.uid;
          localStorage.setItem('userId', userId);
        } catch (error) {
          console.error('Error during anonymous sign-in:', error.message);
          return;
        }
      }

      if (!storedUserId) {
        try {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            storedUserId = userDoc.data().customUserId;
          } else {
            // Use the new function to ensure uniqueness
            storedUserId = await generateUniqueCustomUserId();
            await setDoc(userRef, {
              userId: userId,
              customUserId: storedUserId,
              createdAt: serverTimestamp(),
            });
          }

          localStorage.setItem('customUserId', storedUserId);
        } catch (error) {
          console.error('Error checking/creating user in Firestore:', error.message);
        }
      }

      setCustomUserId(storedUserId);

      // Add console log to debug customUserId after setting it
      console.log('customUserId in useUserInitialization:', storedUserId);
    };

    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        setFilteredUsers(usersList); // Populate filtered users initially
      } catch (error) {
        console.error('Error fetching users:', error.message);
      }
    };

    initializeUser().then(() => fetchUsers().finally(() => setLoading(false)));
  }, [setFilteredUsers]);

  return { customUserId, users, loading };
};

export default useUserInitialization;
