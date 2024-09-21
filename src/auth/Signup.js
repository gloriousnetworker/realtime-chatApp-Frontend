import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      setUserId(uid);
      console.log('User signed up successfully with UID:', uid);

      // Navigate to another page after showing the UID
      setTimeout(() => navigate('/chat'), 3000); // Wait 3 seconds and then navigate to '/chat'
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userId);
    alert('User ID copied to clipboard!');
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-800 bg-cover bg-center relative">
      {/* Background pattern */}
      <div
        className="absolute inset-0 bg-no-repeat bg-top bg-cover"
        style={{ backgroundImage: 'url(/path-to-your-background-image.svg)' }}
      />

      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 text-2xl"
          aria-label="Go back"
        >
          ←
        </button>
      </div>

      {/* Signup form */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl px-10 pt-10 pb-16 z-10 mt-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Create New Account</h1>
        <p className="text-center text-gray-600 mb-6">
          Already registered?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 font-bold underline"
          >
            Log in here
          </button>.
        </p>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-8">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-base font-medium mb-3">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-5 py-4 rounded-lg border border-gray-300 bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 text-base font-medium mb-3">
              Password
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}  // Toggle between 'text' and 'password'
                id="password"
                className="w-full px-5 py-4 rounded-lg border border-gray-300 bg-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {/* Button to toggle password visibility */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19.25c-5 0-9-4-9-9s4-9 9-9c2.113 0 4.073.757 5.625 2.025M16.243 12.243A3.003 3.003 0 0012 9a3.003 3.003 0 00-3.243 3.243M7.757 7.757a9 9 0 0112.486 0M16.243 16.243a9 9 0 01-12.486 0" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.25 5 12 5c4.75 0 8.268 2.943 9.542 7-.85 3.14-3.364 5.705-6.594 6.493M15 12c0 1.48-.5 2.837-1.35 3.93m-2.3 2.55c-.677.241-1.396.37-2.149.37-4.75 0-8.268-2.943-9.542-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-black text-white text-lg font-bold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign Up
          </button>
        </form>

        {/* Show the User ID after successful signup */}
        {userId && (
          <div className="mt-6 text-center">
            <p className="text-gray-700">
              Your User ID: <span className="font-bold">{userId}</span>
            </p>
            <button
              className="bg-green-500 text-white px-4 py-2 mt-2 rounded-lg hover:bg-green-600 transition-colors"
              onClick={handleCopyUserId}
            >
              Copy User ID
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Signup;
