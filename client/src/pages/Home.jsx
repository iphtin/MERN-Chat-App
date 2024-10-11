import React, { useState, useEffect, useRef } from 'react'
import Usercontacts from '../components/Usercontacts';
import Chat from '../components/Chat';
import { useParams } from 'react-router-dom';
import { useSelector } from "react-redux"

const Home = ({socket}) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const { id } = useParams(); 
    const { user } = useSelector((state) => state.user);

    console.log("SelectedUser From Home",selectedUser);

    const getSelectedUser = async () => {
        try {
            const response = await fetch(`http://localhost:3001/users/${id}`);
            const data = await response.json();
            console.log("Data", data);
            setSelectedUser(data);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (id && selectedUser === null) {
          getSelectedUser();
        }
      }, [id]);
      
    return (
        <div className='w-full flex p-2'>
            <div className='w-1/4'>
                <Usercontacts 
                setSelectedUser={setSelectedUser}
                messages={messages}
                />
            </div>
            <div className='w-3/4 p-2'>
                <Chat 
                messages={messages}
                setMessages={setMessages}
                socket={socket}
                selectedUser={selectedUser}
                />
            </div>
        </div>
    );
};

export default Home;
