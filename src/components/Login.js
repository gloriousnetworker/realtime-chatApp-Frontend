import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully!');
      navigate('/chat'); // Redirect user to chat page
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-800 bg-cover bg-center relative">
      {/* Background pattern (for the top part) */}
      <div className="absolute inset-0 bg-no-repeat bg-top bg-cover" style={{ backgroundImage: 'url(/path-to-your-background-image.svg)' }} />

      {/* White curved container for the login form */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl px-10 pt-10 pb-16 z-10">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Login</h1>
        <p className="text-center text-gray-600 mb-6">Sign in to continue.</p>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-base font-medium mb-3">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-5 py-4 rounded-lg border bg-gray-200 text-gray-700 focus:outline-none text-lg"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                className="w-full px-5 py-4 rounded-lg border bg-gray-200 text-gray-700 focus:outline-none text-lg"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            Log in
          </button>
        </form>

        <div className="text-center mt-8">
          <button 
            onClick={() => navigate('/forgot-password')} 
            className="text-gray-600 hover:text-gray-800 text-base underline"
          >
            Forgot Password?
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-600">
            Not an existing user?{' '}
            <button 
              className="text-black font-bold underline text-base" 
              onClick={() => navigate('/signup')}
            >
              Signup!
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
