import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; 
import './App.css';
import { useState, useContext } from 'react';

import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Home from './components/Home.jsx';
// import { UserContext } from './context/userContext';

function App() {
  // const [user, setUser] = useContext();

  return (
    <div className="App">
      {/* <p style={{ color: 'white' }}>
        {user ? `User: ${user.username}` : 'Not Logged in!'}
      </p> */}
      <div className="App-backround">
        <h1 style={{ color: 'white' }}>Astro - Planner</h1>
        <nav style={{ padding: '20px' }}>
          <Link to="/signup" style={{ color: 'white', marginRight: '20px' }}>Sign Up</Link>
          <Link to="/login" style={{ color: 'white', marginRight: '20px' }}>Login</Link>
          <Link to="/home" style={{ color: 'white' }}>Home</Link>
        </nav>
        
        <Routes>
          <Route path='/' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/home' element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;