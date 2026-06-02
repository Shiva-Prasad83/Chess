import React, { useEffect } from 'react';
import { connectSocket, socket } from '../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Chessboard } from 'react-chessboard';
import { ToastContainer, toast } from 'react-toastify';
function Room() {
    const [room, setRoom] = useState(null);
    // const [roomCreator, setRoomCreator] = useState(false);
    const [showBoard, setShowBoard] = useState(false);
    const { roomCode } = useParams();
    const notify = (message) => toast(message);
    const { user } = useSelector((state) => {
        //console.log(state.authReducer)
        return state.authReducer
    });
    //console.log(user);
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
        socket.on('game:started', (response) => {
            if (response.ok) {
                navigate(`/game/${roomCode}`);
            }
        })
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
            setRoom(response.room);
            return navigate('/lobby');
        })
    }
    const roomCreator = room?.players?.some((player) => {
        if (player.userId.toString() === user._id.toString() && player.createdRoom) {
            return true;
        }
    });

    function startGame() {
        if (room.players.length !== 2 || room?.status === "waiting") {
            return notify('Waiting for Opponent');
        }
        // Step1: The person who created the room can only start the game.
        // Step2: Emit the start:game event from the frontend, make the backend listen to it.
        // Step3: Emit game:started event from the backend, on success navigate the user to Game.jsx

        socket.emit('start:game', roomCode, (response) => {
            if (!response.ok) {
                return notify(response.message);
            }
            notify(response.message);
            navigate(`/game/${roomCode}`);
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
                    room?.players.map((player, index) => {
                        return <li key={player.socketId}>{
                            player.userId.toString() === user._id.toString() ? player.name + " (Me)" : player.name
                        }</li>
                    })
                }
            </ul>
            {/* room?.status === "ready" && <button className='bg-green-400 p-4 rounded-lg cursor-pointer'>Start Game</button> */}

            <div className='flex gap-4'>
                {
                    roomCreator && <button className='bg-green-400 p-4 rounded-lg cursor-pointer'
                        onClick={startGame}
                    >{room?.status === "ready" ? "Start Game" : "Waiting for Opponent"}</button>
                }
                <button className='bg-red-400 p-4 rounded-lg cursor-pointer' onClick={leaveRoom}>Leave Room</button>
            </div>

            <ToastContainer />
        </div>
    )
}

export default Room;