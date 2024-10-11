import React, { useState, useEffect } from 'react'
import { IoIosSearch } from "react-icons/io";
import { IoCallOutline } from "react-icons/io5";
import { CiMenuKebab } from "react-icons/ci";
import { formatDistanceToNow } from "date-fns";

const ChatHeader = ({ selectedUser, socket }) => {
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    if (socket.current && selectedUser) {
      // Request user status when selected user changes
      socket.current.emit("get-user-status", selectedUser._id);

      // Listen for status updates
      const handleStatusUpdate = ({ userId, online, lastSeenAt }) => {
        if (userId === selectedUser._id) {
          setIsUserOnline(online);
          if (!online && lastSeenAt) {
            setLastSeen(new Date(lastSeenAt));
          }
        }
      };

      socket.current.on("user-status", handleStatusUpdate);

      return () => {
        socket.current.off("user-status", handleStatusUpdate);
      };
    }
  }, [selectedUser, socket.current]);

  const getStatusText = () => {
    if (isUserOnline) return "Online";
    if (lastSeen) {
      const timeAgo = formatDistanceToNow(lastSeen, { addSuffix: true })
        .replace(' minutes', 'm')
        .replace(' minute', 'm')
        .replace(' hours', 'h')
        .replace(' hour', 'h')
        .replace(' days', 'd')
        .replace(' day', 'd');
      return `Last seen ${timeAgo}`;
    }
    return "Offline";
  };
  return (
    <div className='flex justify-between items-center px-6 py-4 bg-gray-100 border-b'>
      <div className='w-full'>
        <h3 className='font-semibold text-lg'>{selectedUser?.username || selectedUser?.name}</h3>
        <div className='w-full flex gap-x-2'>
        {selectedUser && (
          selectedUser.type !== "group" ? (
            <p className={`text-sm ${isUserOnline ? 'text-green-500' : 'text-red-500'}`}>
              {getStatusText()}
            </p>
         ) : <></> )
      }
        {selectedUser && (
          selectedUser.type === "group" ? (
            selectedUser.members.map(member => (
             <p className='flex gap-2 text-purple-700 bg-gray-200 rounded p-2' key={member._id}>{member.username}</p>
          ))
          ) : <></>
        )}
        </div>
      </div>
      <div className='flex items-center space-x-6'>
        <IoIosSearch size={22} className='text-gray-600 cursor-pointer' />
        <IoCallOutline size={22} className='text-gray-600 cursor-pointer' />
        <CiMenuKebab size={22} className='text-gray-600 cursor-pointer' />
      </div>
    </div>
  )
}

export default ChatHeader