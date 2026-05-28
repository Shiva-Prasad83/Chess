import React, { useEffect } from 'react'
import { connectSocket, socket } from '../socket'
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react'
import { useSelector } from 'react-redux';

function Room() {
    const [room, setRoom] = useState(null);
    const { roomCode } = useParams();
    const { user } = useSelector((state) => state.authReducer);
    const navigate = useNavigate();
    useEffect(() => {
        connectSocket();
        //joining room, for the second time, even if the room creator also will be joined the room for the second time because
        //in the backend index.js "room:join" listener will emit the "room:presence" event to the frontend with the current room object
        // And this room:presence event will give live updates.
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
    function leaveRoom() {
        socket.emit('room:leave', roomCode, (response) => {
            if (!response?.ok) {
                alert(response.message)
                navigate('/lobby');
            }
            return navigate('/lobby');
        })
    }
    return (
        <div>
            <h1 className='text-2xl font-bold'>roomCode:{roomCode}</h1>
            <h1 className='text-2xl font-bold'>Status:{room?.status}</h1>
            <ul>
                {
                    // room?.players?.map((player) => {
                    //     if (player.userId.toString() === user._id.toString()) {
                    //         return <li>{player.name} (Me)</li>
                    //     }
                    //     return <li>{player.name} (Opponent)</li>
                    // })
                    room?.players.map((player, index) => <li key={player.socketId}>{
                        player.userId.toString() === user._id.toString() ? player.name + " (Me)" : player.name
                    }</li>)
                }
            </ul>

            <div className='flex gap-4'>
                {room?.status === "ready" && <button className='bg-green-400 p-4 rounded-lg cursor-pointer'>Start Game</button>}
                <button className='bg-red-400 p-4 rounded-lg cursor-pointer' onClick={leaveRoom}>Leave Room</button>
            </div>
        </div>
    )
}

export default Room;