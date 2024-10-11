import React, { useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Nevbar';
import Contacts from './pages/Contacts';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import Login from './pages/login';
 
const Main = () => {
  const socketConnected = useRef(false);
  const socket = useRef();
  const isAuthenticated = Boolean(useSelector((state) => state.token));
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if(user && !socketConnected.current) {
        socket.current = io("http://localhost:3001");
        socket.current.emit("add-user", user._id);
        socketConnected.current = true;
        
        return () => {
            if (socket.current) {
                socket.current.disconnect();
                socketConnected.current = false;
            }
        };
    }
}, [user]);

  return (
    <Router>
      {isAuthenticated ? (
        <div className='w-full h-screen flex bg-black overflow-hidden'>
          <Navbar socket={socket} />
          <div className='flex-1 m-2 bg-white rounded-lg flex overflow-hidden'>
            <Routes>
              <Route path="/chats" element={<Home socket={socket} />} />
              <Route path="/chats/:id" element={<Home socket={socket} />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/chats" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
}

export default Main;
