import React, { useEffect, useState } from 'react'
import { socket } from '../socket';
import { useSelector } from 'react-redux';
import { Chessboard } from 'react-chessboard';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
function Game() {
    const { user } = useSelector((state) => state.authReducer);
    const [fen, setFen] = useState(null);
    const [turn, setTurn] = useState(null);
    const [room, setRoom] = useState(null)
    const { roomCode } = useParams();
    const notify = (message) => notify(message);
    useEffect(() => {
        socket.emit('room:join', roomCode, (response) => {
            if (!response.ok) {
                return notify(response.message);
            }
            setRoom(response.room);
        })
        socket.emit('game:state', roomCode, (response) => {
            if (!response.ok) {
                return notify(response.message || "Unable get the fen");
            }
            setFen(response.gameState.fen);
            setTurn(response.gameState.turn);
        })
        function roomPresence(data) {
            setRoom(data);
        }
        socket.on('room:presence', roomPresence);

        return () => {
            socket.off('room:presence', roomPresence);
        }
    }, []);
    console.log(room, user);
    //Current player and opponent player using players.some()

    function onDrop(from, to) {

    }

    return (
        <div>
            <div className='w-100'>
                <Chessboard position={fen}
                    onPieceDrop={onDrop}
                />
            </div>

            <ToastContainer />
        </div>
    )
}

export default Game