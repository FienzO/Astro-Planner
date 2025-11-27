import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext(null);


export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

    useEffect(() => {
    const fetchUser = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
        try {
            const response = await axios.get("http://127.0.0.1:5000/profile");
            setUser({ username: response.data.username });
        } catch (error) {
            console.error("Token validation failed", error);
            localStorage.removeItem('authToken');
        }
        }
    };
  
  fetchUser();
}, []); 

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});