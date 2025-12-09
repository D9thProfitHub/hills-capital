import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { webSocketService } from '../services/websocketService';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(webSocketService.isConnected);

  // Handle connection status changes
  useEffect(() => {
    const handleConnectionStatus = (status) => {
      setIsConnected(status === 'connected');
    };

    // Set initial connection status
    setIsConnected(webSocketService.isConnected);

    // Listen for connection status changes
    const cleanup = webSocketService.on('connection-status', handleConnectionStatus);

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Wrap the emit function to handle reconnection if needed
  const emit = useCallback((event, data) => {
    if (!webSocketService.isConnected) {
      console.warn('Attempting to emit while disconnected. Trying to reconnect...');
      webSocketService.connect();
      // Queue the emit for when connection is established
      const onConnect = () => {
        webSocketService.emit(event, data);
        webSocketService.off('connect', onConnect);
      };
      webSocketService.on('connect', onConnect);
      return false;
    }
    return webSocketService.emit(event, data);
  }, []);

  const value = {
    isConnected,
    emit,
    on: webSocketService.on.bind(webSocketService),
    off: webSocketService.off.bind(webSocketService),
    joinRoom: webSocketService.joinRoom.bind(webSocketService),
    leaveRoom: webSocketService.leaveRoom.bind(webSocketService),
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
