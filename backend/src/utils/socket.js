import app from '../server.js';

/**
 * Emit an event to a specific user
 * @param {string} userId - The ID of the user to send the event to
 * @param {string} event - The event name
 * @param {object} data - The data to send
 */
export const emitToUser = (userId, event, data) => {
  const io = app.get('io');
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  } else {
    console.error('Socket.IO not initialized');
  }
};

/**
 * Emit an event to all connected clients
 * @param {string} event - The event name
 * @param {object} data - The data to send
 */
export const emitToAll = (event, data) => {
  const io = app.get('io');
  if (io) {
    io.emit(event, data);
  } else {
    console.error('Socket.IO not initialized');
  }
};
