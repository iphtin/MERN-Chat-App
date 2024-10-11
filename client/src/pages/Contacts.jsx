import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";

const Contacts = () => {
  const [isGroup, setIsGroup] = useState(false);
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupId, setGrouId] = useState(null);
  const defaultProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const getAllUser = async () => {
    try {
      const response = await fetch("http://localhost:3001/users");
      const data = await response.json();
      setContacts(data.filter(me => me._id != user._id));
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getAllUser();
  }, [])

  // Handle radio selection
  const handleSelect = (contact) => {
    if (groups.includes(contact._id)) {
      // Remove contact if already selected (unselect)
      setGroups(groups.filter(groupId => groupId !== contact._id));
    } else {
      setGroups([...groups, contact._id]);
    }
  };

  const createGroup = async () => {
    if (!groupName || groups.length === 0) {
      alert('Please provide a group name and select at least one member.');
      return;
    }

    const allMembers = [...new Set(groups.flat().concat(user._id))]; 

    const groupData = {
      name: groupName,
      members: allMembers,
      createdBy: user._id
    };

    try {
      const response = await fetch("http://localhost:3001/messages/group", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Group created successfully");
        setIsGroup(false); // Reset after successful group creation
        setGroups([]);
        setGrouId(data._id);
        navigate.push(`/chats/${data._id}`);
        setGroupName('');
      } else {
        console.error("Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div className='p-4 w-full overflow-y-auto'>
      <h2 className='pb-4 font-semibold text-2xl'>Contacts</h2>
      <div className='flex'>

        {/* Contacts Section */}
        <div className='w-[60%] bg-[#1e293b] p-6 rounded-lg'>

          {/* Search Input */}
          <input
            type="text"
            className="bg-gray-50 border-none outline-none text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:text-white"
            placeholder="Search..."
          />

          {/* List of Contacts */}
          {contacts.map((contact) => (
            <div key={contact._id} className='flex items-center mt-6 px-4 bg-gray-800 rounded-lg justify-between'>
              <div className='flex items-center'>
                <img
                  src={contact.picture ? `http://localhost:3001${contact.picture}` : defaultProfile }
                  alt='profile'
                  className='w-[50px] h-[50px] rounded-full object-cover'
                />
                <h2 className='pl-4 font-semibold text-white'>{contact.username}</h2>
              </div>
              {!isGroup ? (
                <Link to={`/chats/${contact._id}`} className='bg-blue-500 text-white font-medium rounded-md px-4 py-2'>
                  Message
                </Link>
              ) : (
                <input
                  type="radio"
                  className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                  checked={groups.includes(contact._id)}  // Check if contact is in group
                  onChange={() => handleSelect(contact)}  // Toggle select/unselect
                />
              )}
            </div>
          ))}
        </div>

        {/* Group Section */}
        <div className='ml-4 w-[40%]'>
          <button
            onClick={() => setIsGroup(!isGroup)}
            className='py-3 px-6 bg-black rounded-md text-white font-semibold'
          >
            {!isGroup ? 'Create New Group' : 'Cancel'}
          </button>

          {/* Show selected group members */}
          {isGroup && groups.length > 0 && (
            <div className='mt-4 w-full px-2 flex flex-wrap'>
              {groups.map((groupId) => {
                const selectedContact = contacts.find(contact => contact._id === groupId);
                return (
                  <div key={groupId} className='flex mr-1 gap-2 justify-between px-4 py-3 bg-blue-500 text-white rounded-lg mt-2'>
                    <h3>{selectedContact.username}</h3>
                    <button
                      className='text-white font-bold'
                      onClick={() => handleSelect(selectedContact)}
                    >
                      X
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {isGroup && groups.length > 0 && (
            <div className='mt-4'>
              <input type="text" 
              onChange={e => setGroupName(e.target.value)}
              className='w-full h-[40px] outline-none rounded-md bg-gray-200 pl-4 bg-grey-400'
              placeholder='Group Name'
               />
              <Link to={`/chats/${groupId}`}>
              <button onClick={createGroup} className='mt-6 w-[70%] font-bold text-white rounded-md h-[50px] bg-slate-800'>
               Start Message
              </button>
              </Link>           
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contacts;
