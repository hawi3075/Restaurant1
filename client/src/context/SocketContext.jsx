import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const socketConnection = io(import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000', {
      transports: ['polling']
    });
    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && user) {
      // Join restaurant-specific room for staff or individual user room for customer tracking
      if (user.restaurantId) {
        socket.emit('join_room', user.restaurantId);
      }
      socket.emit('join_room', user.id);
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);