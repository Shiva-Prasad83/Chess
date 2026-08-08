import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    autoConnect: false
})

export function connectSocket() {
    if (!socket.connected) {
        socket.connect();
    }
}
