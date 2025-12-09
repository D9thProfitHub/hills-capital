import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    
    if (!isAuthenticated || !token) {
      console.log('WebSocket: Not initializing - missing auth or token');
      return;
    }

    // Close existing connection if any
    if (socketRef.current) {
      console.log('WebSocket: Disconnecting existing connection');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const wsUrl = process.env.REACT_APP_WS_URL || 'https://api.hillscapitaltrade.com';
    console.log('WebSocket: Connecting to', wsUrl);

    // Create new socket connection
    try {
      const socketOptions = {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        transports: ['websocket'],
        upgrade: false,
        forceNew: true,
        withCredentials: true,
        autoConnect: true,
        secure: process.env.NODE_ENV === 'production',
        rejectUnauthorized: process.env.NODE_ENV === 'production',
        path: '/socket.io/'
      };
      
      console.log('WebSocket connection options:', socketOptions);
      socketRef.current = io(wsUrl, socketOptions);

      // Connection established
      socketRef.current.on('connect', () => {
        console.log('WebSocket: Connected to server');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      });

      // Handle connection error
      socketRef.current.on('connect_error', (error) => {
        console.error('WebSocket: Connection error:', error.message);
        setIsConnected(false);
        
        // Show error toast if this is not a reconnection attempt
        if (reconnectAttempts.current === 0) {
          toast.error('Connection error: ' + (error.message || 'Failed to connect to server'));
        }
        
        reconnectAttempts.current++;
      });

      // Handle disconnection
      socketRef.current.on('disconnect', (reason) => {
        console.log('WebSocket: Disconnected:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          console.log('WebSocket: Server disconnected, attempting to reconnect...');
          // Try to reconnect after a delay
          setTimeout(() => {
            if (socketRef.current && !socketRef.current.connected) {
              console.log('Attempting to reconnect...');
              socketRef.current.connect();
            }
          }, 1000);
        }
      });

      // Log all incoming events for debugging
      const originalEmit = socketRef.current.emit;
      socketRef.current.emit = function(event, ...args) {
        console.log(`WebSocket: Emitting event '${event}':`, args);
        return originalEmit.apply(this, [event, ...args]);
      };

      // Log all received events
      socketRef.current.onAny((eventName, ...args) => {
        console.log(`WebSocket: Received event '${eventName}':`, args);
      });
      
      // Handle successful reconnection
      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log(`WebSocket: Successfully reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
        toast.success('Reconnected to live updates');
      });
      
      // Handle reconnection attempts
      socketRef.current.on('reconnect_attempt', (attemptNumber) => {
        console.log(`WebSocket: Reconnection attempt ${attemptNumber}`);
        setConnectionStatus(`Reconnecting (${attemptNumber}/${maxReconnectAttempts})...`);
      });
      
      // Expose connection status and socket
      return () => {
        if (socketRef.current) {
          socketRef.current.off('connect');
          socketRef.current.off('connect_error');
          socketRef.current.off('disconnect');
          socketRef.current.off('reconnect');
          socketRef.current.off('reconnect_attempt');
        }
      };

    } catch (error) {
      console.error('WebSocket: Error initializing socket:', error);
      toast.error('Failed to initialize WebSocket connection');
    }

    // Handle reconnection attempts
    socketRef.current.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
      reconnectAttempts.current = attempt;
    });

    // Handle successful reconnection
    socketRef.current.on('reconnect', (attempt) => {
      console.log(`Reconnected after ${attempt} attempts`);
      setIsConnected(true);
      toast.success('Connection restored');
    });

    // Handle reconnection failure
    socketRef.current.on('reconnect_failed', () => {
      console.error('Failed to reconnect to WebSocket server');
      toast.error('Connection lost. Please refresh the page.');
    });

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user?.token]);

  // Initialize socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.token) {
      initializeSocket();
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user?.token, initializeSocket]);

  // The value that will be supplied to any descendants of this provider
  const value = {
    socket: socketRef.current,
    isConnected,
    setIsConnected,
    connectionStatus,
    emit: useCallback((event, data) => {
      if (socketRef.current) {
        socketRef.current.emit(event, data);
        return true;
      }
      console.warn('Cannot emit: WebSocket not connected');
      return false;
    }, []),
    subscribe: useCallback((event, callback) => {
      if (socketRef.current) {
        socketRef.current.on(event, callback);
        return () => socketRef.current.off(event, callback);
      }
      return () => {};
    }, []),
    disconnect: useCallback(() => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    }, []),
    subscribeToPriceUpdates: useCallback((symbols) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('subscribeToPrices', { symbols });
        return true;
      }
      return false;
    }, [isConnected])
  };

  // Subscribe to price updates for a symbol
  const subscribeToPriceUpdates = useCallback((symbols) => {
    if (!isConnected || !socketRef.current) {
      console.warn('Cannot subscribe to price updates: WebSocket not connected');
      return false;
    }
    
    try {
      const symbolsArray = Array.isArray(symbols) ? symbols : [symbols];
      console.log('Subscribing to price updates for symbols:', symbolsArray);
      socketRef.current.emit('subscribe_prices', { symbols: symbolsArray });
      return true;
    } catch (error) {
      console.error('Error subscribing to price updates:', error);
      return false;
    }
  }, [isConnected]);

  // Unsubscribe from price updates
  const unsubscribeFromPriceUpdates = useCallback((symbols) => {
    if (!isConnected || !socketRef.current) {
      console.warn('Cannot unsubscribe from price updates: WebSocket not connected');
      return false;
    }
    
    try {
      const symbolsArray = Array.isArray(symbols) ? symbols : [symbols];
      console.log('Unsubscribing from price updates for symbols:', symbolsArray);
      socketRef.current.emit('unsubscribe_prices', { symbols: symbolsArray });
      return true;
    } catch (error) {
      console.error('Error unsubscribing from price updates:', error);
      return false;
    }
  }, [isConnected]);

  // Join a room
  const joinRoom = useCallback((room) => {
    if (!socketRef.current) return false;
    socketRef.current.emit('join_room', { room });
    return true;
  }, []);

  // Leave a room
  const leaveRoom = useCallback((room) => {
    if (!socketRef.current) return false;
    socketRef.current.emit('leave_room', { room });
    return true;
  }, []);

  // Get current connection status
  const getStatus = useCallback(() => {
    return {
      isConnected,
      socketId: socketRef.current?.id,
      reconnectAttempts: reconnectAttempts.current,
    };
  }, [isConnected]);

  return (
    <WebSocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        emit: (event, data) => socketRef.current?.emit(event, data),
        on: (event, callback) => {
          socketRef.current?.on(event, callback);
          return () => socketRef.current?.off(event, callback);
        },
        off: (event, callback) => socketRef.current?.off(event, callback),
        subscribeToPriceUpdates,
        unsubscribeFromPriceUpdates,
        joinRoom,
        leaveRoom,
        getStatus,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;
