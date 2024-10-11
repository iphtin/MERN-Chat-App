import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import Input from './Input';
import ChatHeader from './ChatHeader';
import { format } from 'date-fns';

const Chat = ({ selectedUser, socket, messages, setMessages }) => {
  const { user } = useSelector((state) => state.user);
  const scrollRef = useRef();
  const [arrivalMsg, setArrivalMsg] = useState(null);

  console.log(messages);

  // useEffect(() => {
  //   if (socket.current) {
  //     // Emit "add-user" to the server when the component mounts or user logs in
  //     socket.current.emit("add-user", user._id);
  //   }

  //   // return () => {
  //   //   // Optionally, you could emit "remove-user" or handle cleanup on unmount
  //   //   socket.current.emit("logout", user._id);
  //   // };
  // }, [socket, user._id]); 

  // Handle real-time message arrival
  useEffect(() => {
    if (socket?.current) {
      const messageHandler = (msg) => {
        console.log("MsgArrval", msg);
        setArrivalMsg({
          fromSelf: false,
          message: msg.message,
          image: msg.image,
          sentAt: msg.sentAt
        });
      };

      socket.current.on("msg-recieve", messageHandler);

      console.log("MessageHandler", messageHandler);

      // Clean up the listener when component unmounts or socket changes
      return () => {
        socket.current.off("msg-recieve", messageHandler);
      };
    }
  }, [socket]);


  // Append new incoming message to the message list
  useEffect(() => {
    arrivalMsg && console.log("New incoming message:", arrivalMsg);
    arrivalMsg && setMessages((prev) => [...prev, arrivalMsg]);
  }, [arrivalMsg]);

  // Fetch messages from backend (both direct and group)
  const getAllMessage = async () => {
    try {
      const body = {
        to: selectedUser._id,
        from: user._id
      };

      // Add group ID if selected user is a group
      if (selectedUser.type === "group") {
        body.isGroup = true;
        body.groupId = selectedUser._id;
      }

      const response = await fetch("http://localhost:3001/messages/getmsg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  };

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      getAllMessage();
    }
  }, [selectedUser]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`w-full h-full flex-col ${selectedUser ? 'flex' : 'hidden'}`}>
      {/* Header */}
      <ChatHeader selectedUser={selectedUser} socket={socket} />

      {/* Chat messages */}
      <div className='flex-1 overflow-y-auto p-6 bg-white'>
        {messages.map(message => (
          <div className={`flex items-start mb-4 gap-2.5 ${message.fromSelf ? "justify-end" : "justify-start"}`} ref={scrollRef} key={uuidv4()}>
            {selectedUser && (
              selectedUser.type === "group" && !message.fromSelf ? (
                <img className="w-8 h-8 rounded-full" src={`http://localhost:3001${message.sender.picture}`} alt={`${message.sender.picture}`} />
              ) : null
            )}
            <div className={`flex flex-col leading-1.5 border-gray-200 ${message.fromSelf ? 'dark:bg-gray-700 rounded-lg px-4 py-2 text-white' : 'rounded-e-xl rounded-es-xl bg-gray-100 px-4 py-2 text-gray-800'}`}>
              {selectedUser && (
                selectedUser.type === "group" && !message.fromSelf ? (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-sm font-semibold text-gray-900 dark:text-black">{message.sender.username}</span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{format(new Date(message.sentAt), 'MMM dd, hh:mm a')}</span>
                  </div>
                ) : null
              )}
              {selectedUser && (
                selectedUser?.type === "contact" || message.fromSelf ? (
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {format(new Date(message.sentAt), 'MMM dd, hh:mm a')}
                  </span>
                ) : null
              )}
              <p className={`text-sm font-normal py-2.5 ${message.fromSelf ? 'text-white' : 'text-gray-800'}`}>{message.message}</p>
              {message.image && (
                <img
                  src={`http://localhost:3001${message.image}`}
                  className="rounded w-[280px] h-[250px] object-cover mb-2"
                  alt=""
                />
              )}
              {/* <span class="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span> */}
            </div>
          </div>
        ))}
      </div>
      {/* Input field */}
      <Input setMessages={setMessages} user={user} selectedUser={selectedUser} socket={socket} />
    </div>
  );
};


export default Chat;