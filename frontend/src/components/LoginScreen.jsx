import React, { useState } from 'react';
import axios from 'axios';
import { Shield } from 'lucide-react';

import catLogo from '../assets/catLogo.jpeg'; // Adjust the path as necessary

const LoginScreen = ({ onLogin }) => {
  const [driverId, setDriverId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!driverId.trim() || !password.trim()) {
      setError('Please enter both Driver ID and Password');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username: driverId,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
        // 🔴 Removed withCredentials: true
      });

      console.log('Login success:', response.data);
      onLogin(response.data.user);
    } catch (error) {
      console.error('Login error:', error.message);
      const errorMessage = error.response?.data?.error || 'Failed to connect to the server. Please try again.';
      setError(errorMessage);
    }
  };

  return (
      <div className="bg-gray-700 rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header with Shield Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 ">
            <img src={catLogo} alt="CAT Logo" />
          </div>
          <h1 className="text-2xl font-bold text-gray-200 mb-2">
            Operator Login
          </h1>
          <p className="text-gray-400">
            Secure access to your operator assistance system
          </p>
        </div>


        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="driverId" className="block text-sm font-medium text-gray-200 mb-2">
              Driver ID
            </label>
            <input
              type="text"
              id="driverId"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              placeholder="Enter your driver ID"
              className="w-full px-4 py-3 bg-gray-600 text-white placeholder-gray-400 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-gray-600 text-white placeholder-gray-400 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
            Sign In
          </button>
        </div>

        <div className="mt-6 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-2">
              <span className="font-medium">Demo:</span> Try Driver ID: <code>driver21</code>, Password: <code>password123</code>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LoginScreen;


