import React, { useEffect, useRef, useState } from 'react'
import { connectSocket, socket } from '../socket';
import { useSelector } from 'react-redux';
import { Chessboard } from '@gustavotoyota/react-chessboard';
import { useParams, Navigate } from 'react-router-dom';
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
    if (!user) {
        return <Navigate to="/login" />
    }

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
    // <div className='w-[480px]'>
    //     <p className='text-lg font-bold text-white'>Turn:{turn}</p>
    //     <Chessboard
    //         position={fen}
    //         onPieceDrop={onDrop}
    //         boardWidth={480}
    //     />
    //     <ToastContainer />
    // </div>
    // <div className='flex gap-4 h-screen w-screen justify-center items-center'>
    //     <div className='flex-1 border-2'>

    //     </div>
    //     <div className="flex flex-2 justify-center p-2 sm:p-4 border-2">
    //         <div className="w-full max-w-[480px]">

    //             <div className="mb-2 flex justify-between p-2">
    //                 <p className="truncate">
    //                     Opponent: {opponentPlayer?.name}
    //                 </p>
    //                 {!result && <div className='flex items-center gap-4'>
    //                     {!piecesColor.includes(turn) && <p>*</p>}
    //                     {
    //                         user._id.toString() === room?.blackId.toString() ?
    //                             <h1>{`${whiteMinutes.padStart(2, "0")} : ${whiteSeconds.padStart(2, "0")}`}</h1> :
    //                             <h1>{`${blackMinutes.padStart(2, "0")} : ${blackSeconds.padStart(2, "0")}`}</h1>
    //                     }

    //                 </div>}
    //             </div>

    //             <div className="w-full flex justify-center">
    //                 {!result ? <Chessboard
    //                     position={fen}
    //                     onPieceDrop={onDrop}
    //                     boardWidth={Math.min(600, window.innerWidth - 16)}
    //                     boardOrientation={piecesColor}
    //                     arePiecesDraggable={result ? false : true}
    //                 /> :
    //                     //Create a new Component and render it here and style that component like winning component.
    //                     <div>
    //                         <h1>{result === "white" ? `${room.players[0].name} -> (White) is the Winner` : result === "black" ?
    //                             `${room.players[1].name} -> (Black) is the winner` : result}</h1>
    //                         <h1>{reason}</h1>
    //                     </div>
    //                 }
    //             </div>

    //             <div className="mt-2 flex justify-between p-2">
    //                 <p className="truncate">
    //                     You: {user.name}
    //                 </p>
    //                 {!result && <div className='flex items-center gap-4'>
    //                     {piecesColor.includes(turn) && <p>*</p>}
    //                     {
    //                         user._id.toString() === room?.whiteId.toString() ?
    //                             <h1>{`${whiteMinutes.padStart(2, "0")} : ${whiteSeconds.padStart(2, "0")}`}</h1> :
    //                             <h1>{`${blackMinutes.padStart(2, "0")} : ${blackSeconds.padStart(2, "0")}`}</h1>
    //                     }
    //                 </div>
    //                 }
    //             </div>

    //         </div>
    //     </div>
    //     <div className='h-150 w-35 border-2 flex-1'>
    //         <h1>Chat with your Opponent</h1>
    //     </div>
    // </div>

    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-100 p-1">
            {/* Header */}
            <div className="h-[90px] bg-white rounded-2xl shadow-sm border px-6 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                        👥
                    </div>

                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-slate-800">
                            Room: {roomCode}
                        </h1>

                        <div className="bg-green-500 text-white px-4 py-2 rounded-full font-medium">
                            Ready To Play
                        </div>
                    </div>
                </div>

                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow">
                    Leave Room
                </button>
            </div>

            {/* Main Content */}
            <div className="h-[calc(100vh-114px)] mt-3 grid grid-cols-12 gap-3">

                {/* LEFT PANEL */}
                <div className="col-span-3 h-full flex flex-col gap-3">

                    {/* Players */}
                    <div className="bg-white rounded-2xl border shadow-sm">
                        <div className="p-4 border-b">
                            <h2 className="font-bold text-lg">
                                Players ({room?.players?.length || 0}/2)
                            </h2>
                        </div>

                        <div className="p-4 space-y-4">

                            <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                    {user?.name?.charAt(0)}
                                </div>

                                <div>
                                    <div className="flex gap-2 items-center">
                                        <p className="font-semibold">
                                            {user?.name}
                                        </p>

                                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                            You
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-500">
                                        {piecesColor === "white"
                                            ? "👑 White"
                                            : "⚫ Black"}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-purple-50 rounded-xl p-4 flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                                    {opponentPlayer?.name?.charAt(0)}
                                </div>

                                <div>
                                    <p className="font-semibold">
                                        {opponentPlayer?.name || "Waiting..."}
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        {piecesColor === "white"
                                            ? "⚫ Black"
                                            : "👑 White"}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Game Info */}
                    <div className="flex-1 bg-white rounded-2xl border shadow-sm p-5">
                        <h2 className="font-bold text-lg mb-6">
                            Game Info
                        </h2>

                        <div className="space-y-5">

                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Time Control
                                </span>

                                <span className="font-semibold">
                                    5:00 + 0
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Status
                                </span>

                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                    Ready
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Result
                                </span>

                                <span className="font-semibold">
                                    {result || "Playing"}
                                </span>
                            </div>

                        </div>
                    </div>
                    {/* Footer Buttons */}
                    <div className="border-t p-3 flex justify-center gap-4">

                        <button className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">
                            🚩 Resign
                        </button>

                        <button className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">
                            🤝 Draw
                        </button>

                        <button className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200">
                            🔄 Flip
                        </button>

                    </div>
                </div>

                {/* CENTER PANEL */}
                <div className="col-span-6 h-full">

                    <div className="bg-white rounded-2xl border shadow-sm h-full flex flex-col overflow-hidden">


                        {/* Board */}
                        <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">

                            {!result ? (
                                <div>
                                    <div>
                                        <h1>{opponentPlayer?.name}</h1>
                                        {
                                            opponentPlayer?.userId?.toString() === room?.whiteId?.toString() ?
                                                <h1>{whiteMinutes.padStart(2, "0")} : {whiteSeconds.padStart(2, "0")}</h1> :
                                                <h1>{blackMinutes.padStart(2, "0")} : {blackSeconds.padStart(2, "0")}</h1>
                                        }
                                    </div>
                                    <div>

                                        <Chessboard
                                            position={fen}
                                            onPieceDrop={onDrop}
                                            boardOrientation={piecesColor}
                                            arePiecesDraggable={true}
                                            boardWidth={Math.min(
                                                560,
                                                window.innerHeight * 0.62
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <h1>{user?.name}</h1>
                                        {
                                            user?._id.toString() === room?.whiteId?.toString() ?
                                                <h1>{whiteMinutes.padStart(2, "0")} : {whiteSeconds.padStart(2, "0")}</h1> :
                                                <h1>{blackMinutes.padStart(2, "0")} : {blackSeconds.padStart(2, "0")}</h1>
                                        }
                                    </div>
                                </div>

                            ) : (
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold">
                                        Game Over
                                    </h1>

                                    <p className="mt-3 text-lg">
                                        {result}
                                    </p>

                                    <p className="text-slate-500">
                                        {reason}
                                    </p>
                                </div>
                            )}

                        </div>



                    </div>

                </div>

                {/* RIGHT PANEL */}
                <div className="col-span-3 h-full">

                    <div className="bg-white rounded-2xl border shadow-sm h-full flex flex-col overflow-hidden">

                        <div className="border-b p-4 flex gap-8">
                            <button className="font-semibold text-blue-600 border-b-2 border-blue-600 pb-2">
                                Chat
                            </button>

                            <button className="font-semibold text-slate-500">
                                Moves
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">

                            <div className="flex gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
                                    A
                                </div>

                                <div>
                                    <p className="font-semibold">
                                        {opponentPlayer?.name || "Opponent"}
                                    </p>

                                    <div className="bg-slate-100 px-3 py-2 rounded-xl mt-1">
                                        gl hf
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <div className="bg-blue-600 text-white px-3 py-2 rounded-xl">
                                    you too!
                                </div>
                            </div>

                        </div>

                        <div className="border-t p-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 border rounded-xl px-3 py-2 outline-none"
                                />

                                <button className="bg-blue-600 text-white px-5 rounded-xl">
                                    Send
                                </button>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

            <ToastContainer />
        </div>
    );


}

export default Game