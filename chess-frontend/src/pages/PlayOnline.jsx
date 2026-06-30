import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { ToastContainer, toast } from 'react-toastify';
function PlayOnline() {
    const { user } = useSelector((state) => state.authReducer);
    const navigate = useNavigate();
    //const [roomCode, setRoomCode] = useState("");
    const notify = (message) => notify(message);

    if (!user) {
        navigate('/login');
        return;
    }
    useEffect(() => {
        socket.emit('play:online', (response) => {
            if (!response.ok) {
                notify(response.message);
                return;
            }
            // navigate(`/game/${response.roomCode}`);
        })

        function startGame(roomCode) {
            navigate(`/game/${roomCode}`);
        }
        socket.on('start:game', startGame);

        return () => {
            socket.off('start:game', startGame);
        }
    }, [])
    return (
        <div>
            Searching for Opponent
            <ToastContainer />
        </div>
    )
}

export default PlayOnline