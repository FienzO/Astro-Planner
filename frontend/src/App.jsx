import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; // <-- IMPORT THIS
import './App.css';

import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';

function App() {
  return (
    <div className="App">
      <div className="App-backround">
        <h1 style={{ color: 'white' }}>Astro - Planner</h1>
        <nav style={{ padding: '20px' }}>
          <Link to="/signup" style={{ color: 'white', marginRight: '20px' }}>Sign Up</Link>
          <Link to="/login" style={{ color: 'white' }}>Login</Link>
        </nav>
        
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/' element={<h1></h1>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;