import React, { useState, useEffect, useRef } from 'react';
import { FaCamera, FaUser } from "react-icons/fa";
import { MdDarkMode } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";
import { useSelector, useDispatch } from 'react-redux'
import { setLogIn } from "../state/index"

const Profile = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useSelector((state) => state.user);
  const [image, setImage] = useState(null);
  const dispatch = useDispatch();

  const defaultProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  
  console.log("User",user);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email); 
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); 
      setImage(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('userId', user._id);
    formData.append('email', email);
    if(image){
      formData.append("picture", image);
      formData.append("picture", image.name);
   }

    try {
      const response = await fetch('http://localhost:3001/auth/update', {
        method: 'PUT',
        body: formData, 
      });

      const result = await response.json();
      dispatch(
        setLogIn({
          user: result.user,
          token: result.token,
      })
    );
      console.log('Update response:', result);
      alert(result.message);
    } catch (error) {
      console.log('Error updating profile:', error.message);
    }
  };

  return (
    <div className='bg-[#E7E9EB] w-full flex justify-center items-center py-10'>
      <div className='w-[80%] bg-white rounded-lg shadow-lg'>
        
        {/* Profile Header */}
        <div className='w-full h-[200px] relative rounded-tl-lg rounded-tr-lg bg-gradient-to-r from-teal-400 to-blue-500'>
          
          {/* Profile Image with Camera Icon */}
          <div className='absolute bottom-[-50px] left-6 flex items-center'>
            <div className='relative'>
              <img
                src={selectedImage || `${user.picture ? `http://localhost:3001${user.picture}` : defaultProfile}`}
                className='w-[120px] h-[120px] rounded-full border-4 border-white object-cover'
                alt='profile'
              />
              <button
                className='absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full'
                onClick={() => fileInputRef.current && fileInputRef.current.click()} // Ensure fileInputRef is not null
              >
                <FaCamera />
              </button>

              {/* Hidden File Input */}
              <input
                type='file'
                ref={fileInputRef} // Attach ref to input
                style={{ display: 'none' }}
                accept='image/*'
                onChange={handleImageChange} // Handle file selection
              />
            </div>
          </div>
        </div>

        {/* Username and Email Section */}
        <div className='pt-20 pl-8 pb-8'>
          <div className='flex flex-col space-y-3'>
            <input
              type='text'
              value={username}
              onChange={e => setUsername(e.target.value)}
              className='text-2xl font-semibold border-none outline-none'
              placeholder='Username'
            />
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='text-[16px] w-[350px] font-semibold border-none outline-none'
              placeholder='Email'
            />
          </div>

          {/* Additional Information Section */}
          <div className='pt-6 space-y-4'>
            <p className='text-[16px]'>🇺🇸 Los Angeles, United States</p>
            <div className='flex items-center space-x-4'>
              <MdDarkMode />
              <p className='font-semibold'>Dark Mode</p>
            </div>
            <div className='flex items-center space-x-4'>
              <FaUser />
              <p className='font-semibold'>Profile Details</p>
            </div>
            <div className='flex items-center space-x-4'>
              <IoIosSettings />
              <p className='font-semibold'>Settings</p>
            </div>
            <div className='flex items-center space-x-4'>
              <button className='font-semibold border-2 px-8 py-3 rounded-md text-blue-500 border-blue-400'
              onClick={handleUpdate}>
                Update Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
