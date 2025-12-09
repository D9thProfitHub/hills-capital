import { useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';

/**
 * Hook to handle real-time updates via WebSocket
 * @param {string} event - The event name to listen for
 * @param {function} callback - The callback function to execute when the event is received
 * @param {array} dependencies - Dependencies for the callback function
 */
export const useRealtimeUpdate = (event, callback, dependencies = []) => {
  const { on, off, emit } = useSocket();

  useEffect(() => {
    if (event && callback) {
      // Set up the event listener
      const cleanup = on(event, callback);

      // Clean up the event listener
      return () => {
        if (cleanup) cleanup();
        else off(event, callback);
      };
    }
  }, [event, on, off, ...dependencies]);

  // Function to emit an event
  const emitEvent = useCallback((eventName, data) => {
    return emit(eventName, data);
  }, [emit]);

  return { emitEvent };
};

/**
 * Hook to handle balance updates
 * @param {function} onBalanceUpdate - Callback function when balance is updated
 */
export const useBalanceUpdates = (onBalanceUpdate) => {
  return useRealtimeUpdate('balance-updated', onBalanceUpdate, [onBalanceUpdate]);
};

/**
 * Hook to handle trade updates
 * @param {function} onTradeUpdate - Callback function when a trade is updated
 */
export const useTradeUpdates = (onTradeUpdate) => {
  return useRealtimeUpdate('trade-updated', onTradeUpdate, [onTradeUpdate]);
};

/**
 * Hook to handle notifications
 * @param {function} onNotification - Callback function when a notification is received
 */
export const useNotifications = (onNotification) => {
  return useRealtimeUpdate('notification', (data) => {
    if (data.message) {
      toast[data.type || 'info'](data.message);
    }
    if (onNotification) {
      onNotification(data);
    }
  }, [onNotification]);
};
