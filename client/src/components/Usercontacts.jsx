import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { Link, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from "date-fns";

const Usercontacts = ({ setSelectedUser, messages }) => {
    const { user } = useSelector((state) => state.user);
    const [contacts, setContacts] = useState([]);
    const location = useLocation();
    const [selectedUser, setCurrentSelectUser] = useState('');
    const defaultProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

    useEffect(() => {
        const currentScreen = location.pathname.slice(7);
        setCurrentSelectUser(currentScreen);
    }, [location]);

    const getUserContacts = async () => {
        try {
            const response = await fetch(`http://localhost:3001/users/contacts/${user._id}`);
            const data = await response.json();
            setContacts(data);
        } catch (error) {
            console.log(error);
        }
    }
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        // setMessages(chatMessages[user.id] || []);
    };

    useEffect(() => {
        getUserContacts();
    }, [messages]);

    const formatDate = (dateString) => {
        try {
            const formatted = formatDistanceToNow(new Date(dateString), { addSuffix: true });
            return formatted
                .replace(' minutes ago', 'm')
                .replace(' minute ago', 'm')
                .replace(' days ago', 'd')
                .replace(' day ago', 'd')
                .replace(' hours ago', 'h')
                .replace(' hour ago', 'h')
                .replace(' months ago', 'mo')
                .replace(' month ago', 'mo')
                .replace(' years ago', 'y')
                .replace(' year ago', 'y')
                .replace('about', '')
                .replace('less than ', '<')
                .replace('over ', '>')
                .replace('almost ', '~');
        } catch (error) {
            console.error("Error formatting date:", error);
            return "Invalid date";
        }
    };

    return (
        <div className='p-1'>
            <div>
                <input type='text' className='w-full pl-2 text-black bg-[#f5f4fd] h-9 rounded-sm object-cover outline-none'
                    placeholder='Search...'
                />
            </div>
            {contacts?.map(contact => {
                if (contact.type == "contact") {
                    return <Link to={`/chats/${contact._id}`} onClick={() => handleUserSelect(contact)} className={`flex mt-4 ${contact._id == selectedUser ? 'bg-gray-800 p-2 rounded-md' : ''}`} key={contact._id}>
                        <div className=''>
                            <img
                                src={contact.picture ? `http://localhost:3001${contact.picture}` : defaultProfile}
                                alt='profile'
                                className='w-[50px] h-[48px] rounded-md object-fill left-0 z-10'
                            />
                        </div>
                        <div className='ml-2 flex-1'>
                            <h4 className={`${contact._id == selectedUser ? 'text-white' : 'text-black'} text-[16px]`}>{contact.username}</h4>
                            <p className='text-gray-400 text-[14px] overflow-hidden whitespace-nowrap text-ellipsis w-[190px]'>
                                {contact.lastMessageContent && contact.lastMessageContent ? contact.lastMessageContent : "Start Chat"}
                            </p>
                        </div>
                        <p className='text-gray-400'>{formatDate(contact.lastMessageTime)}</p>
                    </Link>
                } else {
                    return <Link to={`/chats/${contact._id}`} onClick={() => setSelectedUser(contact)} className={`flex mt-4 ${contact._id == selectedUser ? 'bg-gray-800 p-2 rounded-md' : ''}`} key={contact._id}>
                        <div className=''>
                            <img
                                src={contact.picture ? `http://localhost:3001${contact.picture}` : defaultProfile}
                                alt='profile'
                                className='w-[50px] h-[48px] rounded-md object-fill left-0 z-10'
                            />
                        </div>
                        <div className='ml-2 flex-1'>
                            <h4 className={`${contact._id == selectedUser ? 'text-white' : 'text-black'} text-[16px]`}>
                                {contact.name}</h4>
                            <p className='text-gray-400 text-[14px] overflow-hidden whitespace-nowrap text-ellipsis w-[190px]'>
                                {contact.lastMessageContent && contact.lastMessageContent ? contact.lastMessageContent : "Start Chat"}
                            </p>
                        </div>
                        <p className='text-gray-400'>{formatDate(contact.lastMessageTime)}</p>
                    </Link>
                }
            })}
        </div>
    )
}

{/* <div className='flex mt-4 bg-gray-900 p-2 rounded-md'>
{/* Group of profile images */}
{/* <div className='relative w-full flex'> */ }
//     <img
//         src='https://cdn6.f-cdn.com/files/download/38546484/28140e.jpg'
//         alt='profile'
//         className='w-[30px] h-[30px] rounded-full object-cover absolute left-0 z-10 border-2 border-white'
//     />
//     <img
//         src='https://cdn6.f-cdn.com/files/download/38546484/28140e.jpg'
//         alt='profile'
//         className='w-[30px] h-[30px] rounded-full object-cover absolute left-4 z-20 border-2 border-white'
//     />
//     <img
//         src='https://cdn6.f-cdn.com/files/download/38546484/28140e.jpg'
//         alt='profile'
//         className='w-[30px] h-[30px] rounded-full object-cover absolute top-4 z-30 border-2 border-white'
//     />
// </div>

{/* Message details */ }
{/* <div className='ml-2 flex-1'> */ }
// <h4 className='text-[16px] text-white'>Osman Compos</h4>
// <p className='text-gray-400 text-[14px] overflow-hidden whitespace-nowrap text-ellipsis w-[190px]'>
// Hey, we are reading your message and we agree that you should start the job by Friday!
// </p>
// </div>

{/* Timestamp */ }
{/* <p className='text-gray-400'>4m</p> */ }
// </div>

export default Usercontacts