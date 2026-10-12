import { io, Socket } from 'socket.io-client';

// When running on client, connect to origin (Vite proxies /socket.io to server)
// If needed, specify backend directly
const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
