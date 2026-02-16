import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; 
import './App.css';
import { useState, useContext, useEffect } from 'react';

import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Home from './components/Home.jsx';
import Search from './components/Search.jsx';
import Reset from './components/Reset.jsx';
import Reset1 from './components/Reset1.jsx';


function App({ latitude, longitude }) {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/home' element={<Home latitude={latitude} longitude={longitude} />} />
        <Route path='/search' element={<Search latitude={latitude} longitude={longitude} />} />
        <Route path='/reset' element={<Reset />} />
        <Route path='/reset1' element={<Reset1 />} />
      </Routes>
    </div>
  );
}

export default App;