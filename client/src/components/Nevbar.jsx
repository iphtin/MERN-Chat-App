import React, { useEffect, useState } from 'react';
import { IoMdChatbubbles, IoMdContact, IoMdPerson, IoMdLogOut } from "react-icons/io";
import { Link, useLocation } from 'react-router-dom';
import { setLogout } from '../state';
import { useSelector, useDispatch } from "react-redux";

const Navbar = ({ socket }) => { // Ensure socket is passed as a prop
  const [selectedScreen, setSelectedScreen] = useState('');
  const location = useLocation();
  const dispatch = useDispatch();
  const defaultProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  const { user } = useSelector((state) => state.user);

  console.log("User From Nevbar", user);

  useEffect(() => {
    const currentScreen = location.pathname.slice(1);
    setSelectedScreen(currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1));
  }, [location]);

  const handleLogout = () => {
    // Emit the 'logout' event through the socket
    if (socket.current) {
      socket.current.emit("logout", user._id);
    }

    // Dispatch the Redux action to handle logout
    dispatch(setLogout());
  };

  return (
    <div className="w-[80px] h-screen flex flex-col items-center text-white py-4 justify-between">
      {/* Top - Logo */}
      <div>
        <img
          src={user.picture ? `http://localhost:3001${user.picture}` : defaultProfile}
          alt='profile'
          className='w-[50px] h-[50px] rounded-full object-cover'
        />
      </div>

      {/* Center - Icons with Labels */}
      <div className="flex-1 flex flex-col justify-center gap-8">
        {/* All Chats */}
        <Link to="/Chat"
          onClick={() => setSelectedScreen('Chats')}
          className={`flex flex-col items-center p-2 rounded-md cursor-pointer ${selectedScreen === 'Chats' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}
        >
          <IoMdChatbubbles size={24} className={selectedScreen === 'Chats' ? 'text-white' : 'text-gray-400'} />
          <p className={`text-xs mt-1 ${selectedScreen === 'Chats' ? 'text-white' : 'text-gray-400'}`}>All Chats</p>
        </Link>

        {/* Contacts */}
        <Link to="/contacts"
          onClick={() => setSelectedScreen('Contacts')}
          className={`flex flex-col items-center p-2 rounded-md cursor-pointer ${selectedScreen === 'Contacts' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}
        >
          <IoMdContact size={24} className={selectedScreen === 'Contacts' ? 'text-white' : 'text-gray-400'} />
          <p className={`text-xs mt-1 ${selectedScreen === 'Contacts' ? 'text-white' : 'text-gray-400'}`}>Contacts</p>
        </Link>

        {/* Profile */}
        <Link to="/profile"
          onClick={() => setSelectedScreen('Profile')}
          className={`flex flex-col items-center p-2 rounded-md cursor-pointer ${selectedScreen === 'Profile' ? 'bg-gray-600 text-white' : 'text-gray-400'}`}
        >
          <IoMdPerson size={24} className={selectedScreen === 'Profile' ? 'text-white' : 'text-gray-400'} />
          <p className={`text-xs mt-1 ${selectedScreen === 'Profile' ? 'text-white' : 'text-gray-400'}`}>Profile</p>
        </Link>
      </div>

      {/* Bottom - Logout */}
      <div
        onClick={handleLogout} // Use the handleLogout function here
        className="flex flex-col items-center mb-4 cursor-pointer text-gray-400 hover:text-white"
      >
        <IoMdLogOut size={24} />
        <p className="text-xs mt-1">Logout</p>
      </div>
    </div>
  );
};

export default Navbar;
