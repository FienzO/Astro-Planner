import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Outlet} from 'react-router-dom'; 
import App from './../App';
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

  
  // const { user, setUser } = useContext(UserContext);  
  const [loggedUser, setLoggedUser] = useState(''); 
  const checkAuthRedirect = useAuthCheck();
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

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

  const logOut = async() => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setLoggedUser('')
    checkAuthRedirect();
  };

  

  return (
    <div className='App'>
      <div className='title-bar'>
        <div style={{width:100}}></div>
        <div style={{ flex: 0.7 }}></div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          { <p style={{ color: 'white', alignItems: 'center'}}>
            {loggedUser ? `User: ${loggedUser}` : 'Not Logged in!'}
          </p> }
        </div>

        {loggedUser && (
          <>
            <input
              type="number"
              value={latitude}
              placeholder="Latitude (°)"
              onChange={(e) => setLatitude(e.target.value)}
              min="-90"
              max="90"
              step="0.0001"
              style={{ width: '90px', padding: '5px', marginRight: '6px' }}
            />

            <input
              type="number"
              value={longitude}
              placeholder="Longitude (°)"
              onChange={(e) => setLongitude(e.target.value)}
              min="-180"
              max="180"
              step="0.0001"
              style={{ width: '90px', padding: '5px' }}
            />
          </>
        )}

        <div style={{ flex:0.6}}></div>
        <button onClick={logOut} style={{width:100, flex:0.2}}>Log Out</button>
      </div>

      <div className="App-backround"> 
        <div></div>
        <div></div>
        <div></div>
        <h1 style={{ color: 'white' }}>Astro - Planner</h1>
        <nav style={{ padding: '20px' }}>
          <Link to="/signup" style={{ color: 'white', marginRight: '20px' }}>Sign Up</Link>
          <Link to="/login" style={{ color: 'white', marginRight: '20px' }}>Login</Link>
          <Link to="/home" style={{ color: 'white' }}>Home</Link>
        </nav>

        <main>
          <App latitude={latitude} longitude={longitude} />
        </main>
      </div>
    </div>
  );
}

export default Title;