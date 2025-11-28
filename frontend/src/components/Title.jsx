import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'; 
import './../App.css';
import { useState, useContext, useEffect, useCallback } from 'react';
import { UserContext } from '../context/userContext';

const useAuthCheck = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const { user, loading } = useContext(UserContext);

  const checkAuthRedirect = useCallback(() => {
    const pubPaths = ['/login', '/signup'];
    const token = localStorage.getItem('authToken');

    if (loading) {
      return;
    } 
    if (!pubPaths.includes(location.pathname) && !token) {
      navigate('/login');
    };
  }, [location, navigate, user, loading]);
  return checkAuthRedirect; 
}

function Title({ children }) {

  
  const { user, setUser } = useContext(UserContext);  
  const [loggedUser, setLoggedUser] = useState(''); 
  const checkAuthRedirect = useAuthCheck();

  useEffect(() => {
    checkAuthRedirect();

    const intervalId = setInterval(() => {
      checkAuthRedirect();
    }, 1000);
    return () => clearInterval(intervalId);

  }, [checkAuthRedirect]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoggedUser(localStorage.getItem('user'));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className='App'>
      { <p style={{ color: 'white' }}>
        {loggedUser ? `User: ${loggedUser}` : 'Not Logged in!'}
      </p> }

      <div className="App-backround"> 
        <h1 style={{ color: 'white' }}>Astro - Planner</h1>
        <nav style={{ padding: '20px' }}>
          <Link to="/signup" style={{ color: 'white', marginRight: '20px' }}>Sign Up</Link>
          <Link to="/login" style={{ color: 'white', marginRight: '20px' }}>Login</Link>
          <Link to="/home" style={{ color: 'white' }}>Home</Link>
        </nav>

        <main>
            {children}
        </main>
      </div>
    </div>
  );
}

export default Title;