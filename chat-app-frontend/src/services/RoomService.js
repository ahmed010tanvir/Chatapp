import { httpClient } from "../config/AxiosHelper"
import axios from 'axios';

export const createRoomApi = async (roomDetail) => {
   const response = await httpClient.post('/api/v1/room', (roomDetail), {
        headers: {
             'Content-Type': 'application/json',
        },
   })
   return response.data
}

// Function to check if a room exists and join it
export const joinChatApi = async(roomId) => {
     const response = await httpClient.get(`/api/v1/room/${roomId}`)
     return response.data
   }
export const getMessages = async (roomId,size=50,page=0) => {
  const response = await httpClient.get(`/api/v1/room/${roomId}/messages?size=${size}&page=${page}`)
  return response.data
}