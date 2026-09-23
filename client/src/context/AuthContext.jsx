import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    // Verify token and user data consistency
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Basic validation of user data
        if (parsedUser && parsedUser.id && parsedUser.email) {
          setUser(parsedUser);
          setToken(storedToken);
        } else {
          // Invalid user data, clear everything
          localStorage.clear();
          setUser(null);
          setToken(null);
        }
      } catch (e) {
        // Corrupted user data, clear everything
        localStorage.clear();
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      // Clear any existing user data first to prevent cross-user contamination
      localStorage.clear();
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      
      return { success: true, role: userData.role };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please check your credentials.',
      };
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await API.post('/auth/google', { credential });
      const { token: newToken, user: userData } = response.data;

      // Clear any existing user data first to prevent cross-user contamination
      localStorage.clear();
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      
      return { success: true, role: userData.role };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Google sign-in failed. Please try again.',
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await API.post('/auth/register', formData);
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true, role: userData.role };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed.',
      };
    }
  };

  const logout = () => {
    // Clear all localStorage data to prevent data leakage
    localStorage.clear();
    setToken(null);
    setUser(null);
    
    // Navigate to home page
    window.location.href = '/';
  };

  const updateUserProfile = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, googleLogin, register, logout, updateUserProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);