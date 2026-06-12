import React, { useEffect, useRef, useState } from 'react'
import { connectSocket, socket } from '../socket';
import { useSelector } from 'react-redux';
import { Chessboard } from '@gustavotoyota/react-chessboard';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
function Game() {
    const { user } = useSelector((state) => state.authReducer);
    const [fen, setFen] = useState("start");
    const [turn, setTurn] = useState(null);
    const [room, setRoom] = useState(null);
    const [result, setResult] = useState("");
    const [reason, setReason] = useState("");
    const [whiteMs, setWhiteMs] = useState("");
    const [blackMs, setBlackMs] = useState("");
    const { roomCode } = useParams();
    const notify = (message) => toast(message);


    useEffect(() => {
        connectSocket();
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
            setWhiteMs(response?.clock.whiteMs);
            setBlackMs(response?.clock.blackMs);
        })
        function roomPresence(data) {
            setRoom(data);
        }
        socket.on('room:presence', roomPresence);
        function gameUpdate(data) {
            setFen(data.fen);
            setTurn(data.turn);
        }
        socket.on('game:update', gameUpdate);

        function gameOver({ result, reason }) {
            setResult(result);
            setReason(reason);
        }
        socket.on('game:over', gameOver);
        function timeOut({ result, reason }) {
            //console.log("Time out", result);
            setResult(result);
            setReason(reason);
        }
        socket.on('time:out', timeOut);

        //clock is coming from the backend by emittin update:clock emit
        function onClock(clock) {
            console.log(clock, "This is clock");
            if (roomCode !== clock.roomCode) {
                return;
            }
            setWhiteMs(clock.whiteMs);
            setBlackMs(clock.blackMs);
        }
        socket.on('clock:update', onClock);
        return () => {
            socket.off('room:presence', roomPresence);
            socket.off('game:update', gameUpdate);
            socket.off('game:over', gameOver);
            socket.off('clock:update', onClock);
            socket.off('time:out', timeOut);
        }
    }, []);


    //console.log(room, user);
    //Current player and opponent player and which the color the player is playing with.
    //To Check we added whiteId and blackId properties in the room in the backend and sent to frontend
    //We get this room, by calling the getPublicRoom() in the backend, all the event which are sending
    //room to the frontend will use this function to remove the game property.

    const piecesColor = room?.whiteId.toString() === user?._id.toString() ? "white" : "black";
    const [opponentPlayer] = room?.players?.filter((player) => player.userId.toString() != user._id.toString()) ?? [];

    //onPieceDrop prop automatically sends the start position of the piece and end position of the
    //piece when it is dragged.
    function onDrop(from, to) {
        console.log(from, to, "on Drop");
        if (!fen || fen === "start") {
            return false;
        }
        socket.emit("game:move", roomCode, from, to, 'q', (response) => {
            if (!response.ok) {
                return notify(response.message)
            }
        })
        return true;
    }
    //console.log(fen, "fen");

    //Timer Calculations
    const whiteMinutes = Math.floor((whiteMs / 1000) / 60).toString();
    const whiteSeconds = Math.floor((whiteMs / 1000) % 60).toString();

    const blackMinutes = Math.floor((blackMs / 1000) / 60).toString();
    const blackSeconds = Math.floor((blackMs / 1000) % 60).toString();
    return (
        // <div className='w-[480px]'>
        //     <p className='text-lg font-bold text-white'>Turn:{turn}</p>
        //     <Chessboard
        //         position={fen}
        //         onPieceDrop={onDrop}
        //         boardWidth={480}
        //     />
        //     <ToastContainer />
        // </div>
        <div className="flex justify-center p-2 sm:p-4">
            <div className="w-full max-w-[480px]">

                <div className="mb-2 flex justify-between p-2">
                    <p className="truncate">
                        Opponent: {opponentPlayer?.name}
                    </p>
                    {!result && <div className='flex items-center gap-4'>
                        {!piecesColor.includes(turn) && <p>*</p>}
                        {
                            user._id.toString() === room?.blackId.toString() ?
                                <h1>{`${whiteMinutes.padStart(2, "0")} : ${whiteSeconds.padStart(2, "0")}`}</h1> :
                                <h1>{`${blackMinutes.padStart(2, "0")} : ${blackSeconds.padStart(2, "0")}`}</h1>
                        }

                    </div>}
                </div>

                <div className="w-full">
                    {!result ? <Chessboard
                        position={fen}
                        onPieceDrop={onDrop}
                        boardWidth={Math.min(480, window.innerWidth - 16)}
                        boardOrientation={piecesColor}
                        arePiecesDraggable={result ? false : true}
                    /> :
                        <div>
                            <h1>{result === "white" ? `${room.players[0].name} -> (White) is the Winner` : result === "black" ?
                                `${room.players[1].name} -> (Black) is the winner` : result}</h1>
                            <h1>{reason}</h1>
                        </div>
                    }
                </div>

                <div className="mt-2 flex justify-between p-2">
                    <p className="truncate">
                        You: {user.name}
                    </p>
                    {!result && <div className='flex items-center gap-4'>
                        {piecesColor.includes(turn) && <p>*</p>}
                        {
                            user._id.toString() === room?.whiteId.toString() ?
                                <h1>{`${whiteMinutes.padStart(2, "0")} : ${whiteSeconds.padStart(2, "0")}`}</h1> :
                                <h1>{`${blackMinutes.padStart(2, "0")} : ${blackSeconds.padStart(2, "0")}`}</h1>
                        }
                    </div>
                    }
                </div>

            </div>
        </div>

    )
}

export default Game