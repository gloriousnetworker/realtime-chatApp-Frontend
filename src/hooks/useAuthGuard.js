// hooks/useAuthGuard.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase'; // Import your Firebase Auth

const useAuthGuard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      }
      setIsLoading(false); // Set loading to false when auth check is complete
    });

    return () => unsubscribe();
  }, [navigate]);

  return isLoading;
};

export default useAuthGuard;
