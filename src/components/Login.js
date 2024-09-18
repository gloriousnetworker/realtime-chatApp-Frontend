import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
            <input
              type="password"
              id="password"
              className="w-full px-5 py-4 rounded-lg border bg-gray-200 text-gray-700 focus:outline-none text-lg"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
