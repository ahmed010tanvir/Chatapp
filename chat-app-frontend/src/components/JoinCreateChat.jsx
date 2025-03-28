import React, { useState } from 'react'
import chatIcon from '../assets/chat.png'
import toast, { Toaster } from 'react-hot-toast'
import {createRoomApi , joinChatApi } from '../services/RoomService'
import useChatContext from '../context/ChatContext'; // Adjust the relative path
import { useNavigate } from 'react-router';


const JoinCreateChat = () => {

  const [detail, setDetail] = useState({
    roomId: '',
    userName: '',

  })


  const {roomId, userName, connected, setRoomId, setCurrentUser,setConnected} = useChatContext()
  const navigate = useNavigate()

  function handleFormInputChange(event){
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    })
  }

  function validateForm(){
    if (detail.roomId === '' || detail.userName === ''){
      toast.error('Invalid Input')
      return false
  }
  return true
    }


 async function joinChat(){
    if (validateForm()){
      
      try{

        const room = await joinChatApi(detail.roomId)
        toast.success('Room Joined successfully')
        //join room
        setCurrentUser(detail.userName)
        setRoomId(room.roomId)
        setConnected(true)
        //forwards to chat page
        navigate('/chat')

      }catch(error){
        if(error.status==400){
          toast.error(error.response.data)
        }
        else{
        toast.error('Error to join room')
        }
        console.log(error)
     
    }
  }

 }

 async function createRoom(){  

    if (validateForm()){
      console.log(detail)
    // api call to create new room on roomcontroller
        try
        {
         const response=await createRoomApi(detail)
         console.log(response)
         toast.success('Room Created successfully')
        //join room
          setCurrentUser(detail.userName)
          setRoomId(response.roomId)
          setConnected(true)
          //forwards to chat page
          navigate('/chat')
        }
        catch(error){
          if (error.response && error.response.status === 400) {
            // Handle the case where the room already exists
            toast.error(error.response.data);  // Show the error message from the backend
        } else {
            console.log(error);
            toast.error('Something went wrong. Please try again later.');
        }
        }
    }
  }


  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className="p-10 dark:border-gray-700 border w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow">
      
      
    {/* Chat Icon */}
      
    <div className='flex justify-center mb-5'>
    <img src={chatIcon} className='w-16 h-16 object-contain shadow-md'/>
    </div>
        
        <h1 className='text-2xl font-semibold text-center'>
        Join or Create a ChatRoom</h1>

        {/* Name */}
        <div className=''>
            <label htmlFor='chatroom' className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Chatroom Name
            </label>
            <input 
            name='userName'
            onChange={handleFormInputChange}
            value={detail.userName}
            type='text' 
            id='name'
            placeholder='Enter your name'  
            className='mt-1 p-3 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black-500 focus:border-black-500 transition-all duration-300 ease-in-out sm:text-sm dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 placeholder-gray-500'  />
        </div>

         {/* roomId */}
        <div className=''>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Room ID
            </label>
            <input 
            name='roomId'
            onChange={handleFormInputChange}
            value={detail.roomId}
            type='text' 
            id='roomId'
            placeholder='Enter Room ID'  
            className='mt-1 p-3 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black-500 focus:border-black-500 transition-all duration-300 ease-in-out sm:text-sm dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 placeholder-gray-500'  />
        </div>

        {/* Buttons */}
        <div className='flex gap-5'>
            <button onClick={joinChat} className='w-1/2 py-3 bg-gray-800 text-white rounded hover:bg-green-800 transition-all duration-300 ease-in-out'>
                Join Chat
            </button>
            <button onClick={createRoom} className='w-1/2 py-3 bg-gray-800 text-white rounded hover:bg-blue-800 transition-all duration-300 ease-in-out'>
                Create Chat
            </button>
        </div>
      </div>
    </div>
  )
}

export default JoinCreateChat
