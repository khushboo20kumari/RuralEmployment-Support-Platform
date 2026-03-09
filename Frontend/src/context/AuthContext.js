import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error loading user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token, loadUser]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
