import { app } from '../server.js';

/**
 * Emit an event to a specific user
 * @param {string} userId - The ID of the user to send the event to
 * @param {string} event - The event name
 * @param {object} data - The data to send
 */
/**
 * Emit an event to a specific user
 * @param {string} userId - The ID of the user to send the event to
 * @param {string} event - The event name
 * @param {object} data - The data to send
 * @returns {boolean} True if the event was emitted successfully, false otherwise
 */
export const emitToUser = (userId, event, data) => {
  try {
    if (!userId) {
      console.error('[Socket] Error: User ID is required');
      return false;
    }

    if (!event) {
      console.error('[Socket] Error: Event name is required');
      return false;
    }

    const io = app.get('io');
    if (!io) {
      console.error('[Socket] Error: Socket.IO not initialized');
      return false;
    }

    // Get the room name for the user
    const roomName = `user-${userId}`;
    
    // Check if there are any sockets in the room
    const room = io.sockets.adapter.rooms.get(roomName);
    if (!room || room.size === 0) {
      console.warn(`[Socket] Warning: No active connections found for user ${userId} in room ${roomName}`);
      // We still try to emit in case the room check has a race condition
    }

    // Emit the event
    io.to(roomName).emit(event, data);
    console.log(`[Socket] Emitted ${event} to user ${userId} in room ${roomName}`, {
      timestamp: new Date().toISOString(),
      userId,
      event,
      data: data ? '[REDACTED]' : 'No data'
    });
    
    return true;
  } catch (error) {
    console.error(`[Socket] Error emitting ${event} to user ${userId}:`, error);
    return false;
  }
};

/**
 * Emit an event to all connected clients
 * @param {string} event - The event name
 * @param {object} data - The data to send
 * @returns {boolean} True if the event was emitted successfully, false otherwise
 */
export const emitToAll = (event, data) => {
  try {
    if (!event) {
      console.error('[Socket] Error: Event name is required');
      return false;
    }

    const io = app.get('io');
    if (!io) {
      console.error('[Socket] Error: Socket.IO not initialized');
      return false;
    }

    // Get the number of connected clients
    const connectedClients = io.engine?.clientsCount || 0;
    
    if (connectedClients === 0) {
      console.warn('[Socket] Warning: No connected clients to emit to');
    }

    // Emit the event
    io.emit(event, data);
    console.log(`[Socket] Emitted ${event} to all ${connectedClients} connected clients`, {
      timestamp: new Date().toISOString(),
      event,
      connectedClients,
      data: data ? '[REDACTED]' : 'No data'
    });
    
    return true;
  } catch (error) {
    console.error(`[Socket] Error emitting ${event} to all clients:`, error);
    return false;
  }
};

/**
 * Notify user about balance update
 * @param {string} userId - The ID of the user
 * @param {number} newBalance - The updated balance
 * @returns {boolean} True if the notification was sent successfully
 */
export const notifyBalanceUpdate = (userId, newBalance) => {
  if (typeof newBalance !== 'number' || isNaN(newBalance)) {
    console.error('[Socket] Error: Invalid balance value', { userId, newBalance });
    return false;
  }
  
  const success = emitToUser(userId, 'balance-updated', { 
    balance: parseFloat(newBalance.toFixed(2)),
    updatedAt: new Date().toISOString()
  });
  
  if (!success) {
    console.error('[Socket] Failed to send balance update', { userId, newBalance });
  }
  
  return success;
};

/**
 * Notify user about trade update
 * @param {string} userId - The ID of the user
 * @param {object} trade - The updated trade
 * @returns {boolean} True if the notification was sent successfully
 */
export const notifyTradeUpdate = (userId, trade) => {
  if (!trade || !trade.id) {
    console.error('[Socket] Error: Invalid trade object', { userId, trade });
    return false;
  }
  
  // Create a safe copy of the trade object with only necessary fields
  const tradeData = {
    id: trade.id,
    status: trade.status,
    pair: trade.pair,
    amount: trade.amount,
    price: trade.price,
    type: trade.type,
    profitLoss: trade.profitLoss,
    updatedAt: trade.updatedAt || new Date().toISOString()
  };
  
  const success = emitToUser(userId, 'trade-updated', { trade: tradeData });
  
  if (!success) {
    console.error('[Socket] Failed to send trade update', { userId, tradeId: trade.id });
  }
  
  return success;
};

/**
 * Send a notification to a user
 * @param {string} userId - The ID of the user
 * @param {string} message - The notification message
 * @param {string} type - The notification type (info, success, warning, error)
 * @returns {boolean} True if the notification was sent successfully
 */
export const sendNotification = (userId, message, type = 'info') => {
  if (!message || typeof message !== 'string') {
    console.error('[Socket] Error: Invalid notification message', { userId, message, type });
    return false;
  }
  
  // Validate notification type
  const validTypes = ['info', 'success', 'warning', 'error'];
  if (!validTypes.includes(type)) {
    console.warn(`[Socket] Warning: Invalid notification type '${type}'. Defaulting to 'info'.`);
    type = 'info';
  }
  
  const notification = {
    id: `notif-${Date.now()}`,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  const success = emitToUser(userId, 'notification', notification);
  
  if (!success) {
    console.error('[Socket] Failed to send notification', { userId, message, type });
  } else {
    console.log(`[Socket] Sent ${type} notification to user ${userId}`, {
      message,
      notificationId: notification.id
    });
  }
  
  return success;
};
