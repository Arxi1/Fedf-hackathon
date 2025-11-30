import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (user && role) {
      // Create socket connection
      const newSocket = io('http://localhost:5000', {
        auth: {
          userId: user.uid,
          role: role
        }
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('🔗 Connected to real-time server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from real-time server');
        setIsConnected(false);
      });

      // Real-time events
      newSocket.on('donation-created', (data) => {
        console.log('📦 New donation created:', data);
        // This will be handled by individual components
      });

      newSocket.on('donation-updated', (data) => {
        console.log('🔄 Donation updated:', data);
      });

      newSocket.on('donation-claimed', (data) => {
        console.log('🤝 Donation claimed:', data);
      });

      newSocket.on('donation-distributed', (data) => {
        console.log('✅ Donation distributed:', data);
      });

      newSocket.on('donation-deleted', (data) => {
        console.log('🗑️ Donation deleted:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, role]);

  const updateUser = (newUser, newRole) => {
    setUser(newUser);
    setRole(newRole);
  };

  const value = {
    socket,
    isConnected,
    user,
    role,
    updateUser
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
