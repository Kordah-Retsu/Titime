import React, { useState } from 'react'
import LoginPage from './components/LoginPage'
import HomePage from './components/HomePage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleSignOut = () => {
    setIsLoggedIn(false)
  }

  return (
    <>
      {isLoggedIn ? <HomePage onSignOut={handleSignOut} /> : <LoginPage onLogin={handleLogin} />}
    </>
  )
}

export default App
