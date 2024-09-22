import React, { useState } from "react";
import { auth } from "../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    // Regex pattern for validating email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    // Password should be at least 6 characters long
    return password.length >= 6;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;
      setUserId(uid);
      console.log("User signed up successfully with UID:", uid);

      // Navigate to another page after showing the UID
      setTimeout(() => navigate("/chat"), 3000); // Wait 3 seconds and then navigate to '/chat'
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userId);
    alert("User ID copied to clipboard!");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-800 bg-cover bg-center relative">
      {/* Background pattern */}
      <div
        className="absolute inset-0 bg-no-repeat bg-top bg-cover"
        style={{ backgroundImage: "url(/path-to-your-background-image.svg)" }}
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
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Create New Account
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Already registered?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 font-bold underline"
          >
            Log in here
          </button>
          .
        </p>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-8">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 text-base font-medium mb-3"
            >
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
            <label
              htmlFor="password"
              className="block text-gray-700 text-base font-medium mb-3"
            >
              Password
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"} // Toggle between 'text' and 'password'
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    class="h-6 w-6"
                  >
                    <path d="M8 2.5c-2.1 0-4.1.9-5.6 2.4C.9 6.5 0 8.2 0 8.2s.9 1.7 2.4 3.2c1.5 1.5 3.5 2.4 5.6 2.4s4.1-.9 5.6-2.4c1.5-1.5 2.4-3.2 2.4-3.2s-.9-1.7-2.4-3.2C12.1 3.4 10.1 2.5 8 2.5zm0 9.2c-1.5 0-2.7-1.2-2.7-2.7S6.5 6.3 8 6.3 10.7 7.5 10.7 9 9.5 11.7 8 11.7zm0-4.2c-.8 0-1.4.7-1.4 1.4s.7 1.4 1.4 1.4 1.4-.7 1.4-1.4-.6-1.4-1.4-1.4z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    class="h-6 w-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 3l18 18M12 6c-3.313 0-6.12 1.537-8 4s-1.685 4.375-1 7c1.877-3.123 5.285-5 9-5s7.123 1.877 9 5c.685-2.625.11-5.138-1-7-1.879-2.463-4.688-4-8-4z"
                    />
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
