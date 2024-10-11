import React, { useState } from 'react';
import { useNavigate } from "react-router-dom"

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      
      const response = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
  
      if(response.status === 201) {
        alert(data.message);
        navigate('/login');
      } else {
        console.error("Registration failed:", data);
      }
    } catch (error) {
      console.log("Error:", error.message);
    }
  }
  

  return (
    <div className='w-full h-screen flex flex-col items-center justify-center bg-[#f7f7f7]'>
      <div className='w-[440px] px-8 py-10 bg-white shadow-lg rounded-lg'>
        <h1 className='text-2xl font-semibold text-gray-800 mb-6 text-center'>Sign Up</h1>
        <form className='space-y-5' onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label htmlFor="username" className='block text-sm font-medium text-gray-700 mb-1'>
              Username
            </label>
            <input 
              id="username" 
              type="text" 
              onChange={e => setUsername(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400' 
              placeholder="Enter your username" 
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className='block text-sm font-medium text-gray-700 mb-1'>
              Email Address
            </label>
            <input 
              id="email" 
              type="email" 
              onChange={e => setEmail(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400' 
              placeholder="Enter your email address" 
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className='block text-sm font-medium text-gray-700 mb-1'>
              Password
            </label>
            <input 
              id="password" 
              type="password" 
              onChange={e => setPassword(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400' 
              placeholder="Enter your password" 
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className='w-full bg-green-700 text-white font-semibold py-2 rounded-md transition duration-300'
          >
            Sign Up
          </button>
        </form>
      </div>
      <p className='mt-4 text-sm text-gray-600'>
        Already have an account?{' '}
        <a href="/login" className='text-black font-semibold hover:underline'>
          Sign In
        </a>
      </p>
    </div>
  );
};

export default Signup;
