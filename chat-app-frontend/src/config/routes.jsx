import React from 'react'
import { Routes, Route } from 'react-router'
import App from '../App'
import ChatPage from '../components/ChatPage'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/about" element={<h1>About</h1>} />
      <Route path="*" element={<h1>Page not found</h1>} />
    </Routes>
  )
}

export default AppRoutes
