import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const UserSidebar = ({
  customUserId,
  selectedUser,
  handleUserClick,
  showSidebar,
  messages,
}) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [unreadMessagesMap, setUnreadMessagesMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error.message);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!customUserId) return;

    // Firestore listener to track unread messages for all chats of the current user
    const q = query(
      collection(db, 'messages'),
      where('recipientId', '==', customUserId),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newUnreadMessagesMap = {};
      
      snapshot.docs.forEach((doc) => {
        const { senderId } = doc.data();
        
        console.log(`New unread message from ${senderId}`); // Debug log
        if (!newUnreadMessagesMap[senderId]) {
          newUnreadMessagesMap[senderId] = 0;
        }
    
        newUnreadMessagesMap[senderId] += 1; // Count unread messages per sender
      });
    
      console.log('Unread messages map:', newUnreadMessagesMap); // Debug log
      setUnreadMessagesMap(newUnreadMessagesMap);
    });
    

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [customUserId]);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = users.filter((user) =>
      user.customUserId.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  };

  // Sort users based on recent message activity
  const sortedUsers = filteredUsers.sort((a, b) => {
    const lastMessageA = messages
      .filter(
        (msg) =>
          msg.senderId === a.customUserId || msg.recipientId === a.customUserId
      )
      .sort((x, y) => {
        const xTimestamp = x.timestamp?.toMillis
          ? x.timestamp.toMillis()
          : new Date(x.timestamp).getTime();
        const yTimestamp = y.timestamp?.toMillis
          ? y.timestamp.toMillis()
          : new Date(y.timestamp).getTime();
        return yTimestamp - xTimestamp;
      })[0];
  
    const lastMessageB = messages
      .filter(
        (msg) =>
          msg.senderId === b.customUserId || msg.recipientId === b.customUserId
      )
      .sort((x, y) => {
        const xTimestamp = x.timestamp?.toMillis
          ? x.timestamp.toMillis()
          : new Date(x.timestamp).getTime();
        const yTimestamp = y.timestamp?.toMillis
          ? y.timestamp.toMillis()
          : new Date(y.timestamp).getTime();
        return yTimestamp - xTimestamp;
      })[0];
  
    const lastTimestampA = lastMessageA?.timestamp
      ? lastMessageA.timestamp.toMillis ? lastMessageA.timestamp.toMillis() : new Date(lastMessageA.timestamp).getTime()
      : 0;
    const lastTimestampB = lastMessageB?.timestamp
      ? lastMessageB.timestamp.toMillis ? lastMessageB.timestamp.toMillis() : new Date(lastMessageB.timestamp).getTime()
      : 0;
  
    return lastTimestampB - lastTimestampA;
  });
  

  return (
    <div
      className={`${
        showSidebar ? 'block' : 'hidden'
      } md:block md:w-2/5 lg:w-1/3 xl:w-1/4 p-6 flex-col bg-gradient-to-b from-gray-100 to-gray-200 fixed inset-y-0 left-0 overflow-y-auto z-50`}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome to the Chat App</h2>

      {customUserId && (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">Your Custom User ID:</p>
          <p className="text-lg font-bold text-gray-700">{customUserId}</p>
        </div>
      )}

      <input
        type="text"
        className="w-full p-3 rounded-lg border border-gray-300 mb-4"
        placeholder="Search for user by ID..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <div className="mt-4 w-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Users:</h3>
        {sortedUsers.length === 0 ? (
          <p className="text-sm text-gray-500">No users found</p>
        ) : (
          sortedUsers.slice(0, 10).map((user) => {
            const unreadMessagesCount = unreadMessagesMap[user.customUserId] || 0;

            return (
              <div
                key={user.id}
                className={`relative p-4 mb-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-all shadow-md ${
                  selectedUser === user.customUserId ? 'bg-gray-300' : ''
                }`}
                onClick={() => handleUserClick(user.customUserId)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-700 font-medium">{user.customUserId}</p>

                  {/* Green dot to indicate new unread messages */}
                  {unreadMessagesCount > 0 && (
                    <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-green-500"></div>
                  )}
                </div>

                {/* Unread Messages Count */}
                {unreadMessagesCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                    {unreadMessagesCount} unread
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserSidebar;
