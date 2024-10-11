import React, { useState, useRef } from 'react'
import { IoMdSend } from "react-icons/io";
import { FaCamera } from "react-icons/fa";

const Input = ({ setMessages, selectedUser, user, socket }) => {
  const [textMessage, setTextMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setSelectedImage(URL.createObjectURL(file));
          setImage(file);
        }
      };

    const sendMessage = async (e) => {
        e.preventDefault();
    
        if (!selectedUser || (!textMessage && !selectedImage)) return;
    
        const formData = new FormData();
        formData.append('to', selectedUser._id);
        formData.append('from', user._id);
        formData.append('message', textMessage);
        // formData.append('isGroup', 'false');
        // formData.append('GroupId', '');
    
        if (selectedImage) {
          formData.append('image', image);
        }

        if(selectedUser.type === "group") {
          formData.append('isGroup', true);
          formData.append('GroupId', selectedUser._id);
        }
    
        try {
          const response = await fetch("http://localhost:3001/messages/addmsg", {
            method: "POST",
            body: formData
          });
    
          if (!response.ok) throw new Error('Failed to send message');
    
          const data = await response.json();
    
          // Emit socket event
          socket.current.emit("send-msg", {
            to: selectedUser._id,
            from: user._id,
            message: textMessage,
            image: selectedImage,
            sentAt: new Date(),
          });
    
          // Update local messages
          setMessages(prev => [...prev, {
            fromSelf: true,
            message: textMessage,
            image: selectedImage,
            sentAt: new Date(),
          }]);
    
          // Reset form
          setTextMessage('');
          setSelectedImage(null);
    
        } catch (error) {
          console.error("Error sending message:", error);
        }
      };
      
  return (
    <div className='flex items-center p-4'>
        <button
          className='mr-2 bg-gray-900 text-white p-2 rounded-full'
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
        <input
          type="text"
          value={textMessage}
          onChange={e => setTextMessage(e.target.value)}
          className='flex-1 bg-[#f1f0ff] rounded-md px-4 py-2 outline-none '
          placeholder='Type a message...'
        />
        <button onClick={sendMessage} className='ml-4 bg-green-700 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-600 transition duration-300'>
          <IoMdSend size={20} />
        </button>
      </div>
  )
}

export default Input