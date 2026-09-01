import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const socket = io(SERVER_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log(`[Socket.IO Client] Connected to NewsSphere real-time server (${socket.id})`);
});

socket.on('disconnect', () => {
  console.log('[Socket.IO Client] Disconnected from real-time server');
});
