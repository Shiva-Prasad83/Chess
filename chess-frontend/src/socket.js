import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
    withCredentials: true,
    autoConnect: false
})

export function connectSocket() {
    if (!socket.connected) {
        socket.connect();
    }
}
