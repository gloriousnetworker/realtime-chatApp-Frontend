import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Please check your inbox.');
    } catch (error) {
      setError(error.message);
    }
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

      {/* Forgot Password form */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl px-10 pt-10 pb-16 z-10 mt-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Forgot Password</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your email to receive a password reset link.
        </p>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">{success}</p>}

        <form onSubmit={handleForgotPassword} className="space-y-8">
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

          <button
            type="submit"
            className="w-full py-4 bg-black text-white text-lg font-bold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Send Reset Link
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 font-bold underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
