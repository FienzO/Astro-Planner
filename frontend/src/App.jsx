import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; 
import './App.css';
import { useState, useContext, useEffect } from 'react';

import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Home from './components/Home.jsx';


function App({ latitude, longitude }) {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route
        path='/home'
        element={<Home latitude={latitude} longitude={longitude} />}
        />
      </Routes>
    </div>
  );
}

export default App;