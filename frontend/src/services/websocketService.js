import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import * as authService from './authService';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.eventListeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return;

    const token = authService.getToken();
    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }

    // Close existing connection if any
    if (this.socket) {
      this.socket.disconnect();
    }

    const wsUrl = process.env.REACT_APP_WS_URL || 'https://api.hillscapitaltrade.com';
    console.log('WebSocket: Connecting to', wsUrl);
    
    this.socket = io(wsUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: this.maxReconnectDelay,
      autoConnect: true,
      transports: ['websocket'],
      upgrade: false,
      forceNew: true,
      withCredentials: true,
      secure: process.env.NODE_ENV === 'production',
      rejectUnauthorized: process.env.NODE_ENV === 'production',
      path: '/socket.io/'
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.emit('connection-status', 'connected');
      
      // Re-register all event listeners
      this.eventListeners.forEach((handlers, event) => {
        handlers.forEach(handler => {
          this.socket.on(event, handler);
        });
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection-status', 'disconnected');
      
      if (reason === 'io server disconnect') {
        // The server has forcefully disconnected the socket
        // Attempt to reconnect after a short delay
        setTimeout(() => this.connect(), 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.emit('connection-status', 'error');
      
      // Exponential backoff for reconnection
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        console.log(`Attempting to reconnect in ${delay}ms...`);
        setTimeout(() => this.connect(), delay);
      } else {
        console.error('Max reconnection attempts reached');
      }
    });

    // Handle balance updates
    this.socket.on('balance-updated', (data) => {
      console.log('Balance updated:', data);
      this.emit('balance-updated', data);
    });

    // Handle trade updates
    this.socket.on('trade-updated', (data) => {
      console.log('Trade updated:', data);
      this.emit('trade-updated', data);
    });

    // Handle notifications
    this.socket.on('notification', (data) => {
      console.log('Notification received:', data);
      if (data.message) {
        toast[data.type || 'info'](data.message);
      }
      this.emit('notification', data);
    });
  }

  // Emit an event to the server
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      return true;
    }
    console.warn(`Cannot emit ${event}: WebSocket not connected`);
    return false;
  }

  // Listen to an event from the server
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
    
    if (this.socket) {
      this.socket.on(event, callback);
    }
    
    // Return cleanup function
    return () => this.off(event, callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const handlers = this.eventListeners.get(event);
      if (handlers.has(callback)) {
        handlers.delete(callback);
        if (this.socket) {
          this.socket.off(event, callback);
        }
      }
    }
  }

  // Join a room
  joinRoom(room) {
    if (this.socket?.connected) {
      this.socket.emit('join-room', room);
      return true;
    }
    return false;
  }

  // Leave a room
  leaveRoom(room) {
    if (this.socket?.connected) {
      this.socket.emit('leave-room', room);
      return true;
    }
    return false;
  }

  // Disconnect the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }
}

export const webSocketService = new WebSocketService();

// Initialize WebSocket connection when the user is authenticated
const initWebSocket = () => {
  const token = authService.getToken();
  if (token) {
    webSocketService.connect();
  }
};

// Reconnect when the user logs in
authService.authEventEmitter.onLogin(initWebSocket);

// Clean up when the user logs out
authService.authEventEmitter.onLogout(() => {
  webSocketService.disconnect();
});

// Initialize on app start if already authenticated
if (authService.getToken()) {
  initWebSocket();
}

export default webSocketService;
