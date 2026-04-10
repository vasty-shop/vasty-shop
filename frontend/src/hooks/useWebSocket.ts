import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/types/notification';
import { WS_URL } from '@/config/api.config';

interface UseWebSocketOptions {
  onNotification?: (notification: Notification) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  enabled?: boolean; // Only connect when this is true
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Don't connect if disabled
    if (options.enabled === false) {
      return;
    }

    // Get auth token
    const token = localStorage.getItem('authToken');

    // Don't connect if no token - silently skip
    if (!token) {
      return;
    }

    // Initialize socket connection
    const socket = io(`${WS_URL}/notifications`, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      setIsConnected(true);
      setReconnectAttempts(0);
      options.onConnect?.();
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      options.onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      setReconnectAttempts((prev) => prev + 1);
      options.onError?.(error);
    });

    // Notification handler
    socket.on('notification', (notification: Notification) => {
      options.onNotification?.(notification);
    });

    // Error handler
    socket.on('error', (error: any) => {
      console.error('[WebSocket] Error:', error);
      options.onError?.(error);
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('notification');
      socket.off('error');
      socket.close();
      socketRef.current = null;
    };
  }, [options.enabled, options.onNotification, options.onConnect, options.onDisconnect, options.onError]);

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  const reconnect = () => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    }
  };

  return {
    isConnected,
    reconnectAttempts,
    disconnect,
    reconnect,
    socket: socketRef.current,
  };
};
