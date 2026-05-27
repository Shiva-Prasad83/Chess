import React, { useEffect } from 'react'
import { connectSocket, socket } from '../socket'
import { useParams } from 'react-router-dom';
import { useState } from 'react'

function Room() {
    const [room, setRoom] = useState(null);
    const { roomCode } = useParams();
    useEffect(() => {
        connectSocket();
        socket.emit('room:join', roomCode, (response) => {
            if (!response.ok) {
                return alert(response.message || "Failed to join room");
            }
            setRoom(response.room);
        })
        const roomPresence = (data) => {
            setRoom(data);
        }
        socket.on('room:presence', roomPresence);

        return () => {
            socket.off('room:presence', roomPresence);
        }
    }, [roomCode]);
    return (
        <div>
            <h1 className='text-2xl font-bold'>roomCode:{roomCode}</h1>
            <h1 className='text-2xl font-bold'>Status:{room?.status}</h1>
        </div>
    )
}

export default Room;