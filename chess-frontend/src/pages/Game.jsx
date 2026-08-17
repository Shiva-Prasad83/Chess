import React, { useEffect, useRef, useState } from 'react'
import { connectSocket, socket } from '../socket';
import { useSelector } from 'react-redux';
import { Chessboard } from '@gustavotoyota/react-chessboard';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import LoadingPage from '../components/LoadingPage';
import api from '../api/client';
function Game() {
    const [refresh, setRefresh] = useState(null);
    const { user, authChecked } = useSelector((state) => state.authReducer);
    const [fen, setFen] = useState(null);
    const [turn, setTurn] = useState(null);
    const [room, setRoom] = useState(null);
    const [result, setResult] = useState("");
    const [reason, setReason] = useState("");
    const whiteTimerRef = useRef(null);
    const blackTimerRef = useRef(null);
    const [whiteTotalSeconds, setWhiteTotalSeconds] = useState(null);
    const [blackTotalSeconds, setBlackTotalSeconds] = useState(null);
    const [messages, setMessages] = useState([]);
    const { roomCode } = useParams();
    const messagesEndRef = useRef();
    const [displayDraw, setDisplayDraw] = useState(false);
    const notify = (message) => toast(message);
    const navigate = useNavigate();

    useEffect(() => {
        connectSocket();
        socket.emit('user:online', user?._id);
        socket.emit('room:join', roomCode, (response) => {
            if (!response.ok) {
                return notify(response.message);
            }
            setRoom(response.room);
            setFen(response.room.fen);
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

        function gameOver({ result, reason, message }) {
            if (message) {
                notify(message);
            }
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
            //console.log(clock, "This is clock");
            if (roomCode !== clock.roomCode) {
                return;
            }
            //setWhiteMs(clock.whiteMs);
            setWhiteTotalSeconds(Math.floor(clock.whiteMs / 1000));

            //setBlackMs(clock.blackMs);
            setBlackTotalSeconds(Math.floor(clock.blackMs / 1000));
        }
        socket.on('clock:update', onClock);
        function newMessage(message) {
            setMessages((prev) => [...prev, message]);
        }
        socket.on('new:message', newMessage)

        socket.emit('game:state', roomCode, (response) => {
            if (!response.ok) {
                return notify(response.message || "Unable get the fen");
            }
            setFen(response.gameState.fen);
            setTurn(response.gameState.turn);
            // setWhiteMs(response?.clock.whiteMs);
            // setBlackMs(response?.clock.blackMs);
            setBlackTotalSeconds(Math.floor((response?.clock.blackMs / 1000)));
            setWhiteTotalSeconds(Math.floor((response?.clock.whiteMs / 1000)));
        })
        function offeredDraw() {
            setDisplayDraw(true);
            setTimeout(() => {
                setDisplayDraw(false);
            }, 10000);
        }
        socket.on('offered:draw', offeredDraw);
        function drawRejected(message) {
            //console.log(message);
            notify(message);
        }
        socket.on('rejected:draw', drawRejected);
        return () => {
            socket.off('room:presence', roomPresence);
            socket.off('game:update', gameUpdate);
            socket.off('game:over', gameOver);
            socket.off('clock:update', onClock);
            socket.off('time:out', timeOut);
            socket.off('new:message', newMessage);
            socket.off('offered:draw', offeredDraw);
            socket.off('rejected:draw', drawRejected);
        }
    }, []);


    //console.log(messages, "Messages");
    useEffect(() => {
        socket.emit('chat:history', roomCode, (response) => {
            if (!response.ok) {
                notify(response.message);
                return;
            }

            setMessages(response.messages);
        })

    }, [refresh]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        })
    }, [messages]);

    async function changeUserStatus() {
        try {
            const res = await api.post('/user/changeUserStatus', { status: "In Game" });
            notify(res?.data?.message);
            return;
        } catch (err) {
            notify(err?.response?.message);
            return;
        }
    }
    useEffect(() => {
        changeUserStatus();

        return async () => {
            try {
                const res = await api.post('/user/changeUserStatus', { status: "idle" });
                notify(res?.data?.message);
                return;
            } catch (err) {
                notify(err?.response?.message);
                return;
            }
        }
    }, []);


    // const whiteMinutes = Math.floor((whiteMs / 1000) / 60).toString();
    // const whiteSeconds = Math.floor((whiteMs / 1000) % 60).toString();

    // const blackMinutes = Math.floor((blackMs / 1000) / 60).toString();
    // const blackSeconds = Math.floor((blackMs / 1000) % 60).toString();

    //Dynamic Chess Timers
    //onDrop function we are stopping the timers like if turn is white then stop black timer.
    useEffect(() => {
        if (turn === "w") {
            whiteTimerRef.current = setInterval(() => {
                setWhiteTotalSeconds((prev) => {
                    if (prev <= 1) {
                        clearInterval(whiteTimerRef.current);
                        socket.emit('player:timeout', roomCode, room?.whiteId, (response) => {
                            if (!response.ok) {
                                notify(response.message);
                                return;
                            }
                        });
                        return 0;
                    }
                    return prev - 1;
                })
            }, 1000)
        }
        if (turn === "b") {
            blackTimerRef.current = setInterval(() => {
                setBlackTotalSeconds((prev) => {
                    if (prev <= 1) {
                        clearInterval(blackTimerRef.current);
                        socket.emit('player:timeout', roomCode, room?.blackId, (response) => {
                            if (!response.ok) {
                                notify(response.message);
                                return;
                            }
                        });
                        return 0;
                    }
                    return prev - 1;
                })
            }, 1000);
        }
        return () => {
            clearInterval(whiteTimerRef.current);
            clearInterval(blackTimerRef.current);
        }
    }, [whiteTotalSeconds, blackTotalSeconds]);


    if (!authChecked) {
        return <LoadingPage />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (room?.status === "ready" && room?.players?.length < 2) {
        console.log("Please exit from the room")
    }

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
        //console.log(from, to, "on Drop");
        if (!fen || fen === "start") {
            return false;
        }
        if (turn === "w" && whiteTimerRef.current) {
            clearInterval(whiteTimerRef.current);
        }
        if (turn === "b" && blackTimerRef.current) {
            clearInterval(blackTimerRef.current);
        }
        socket.emit("game:move", roomCode, from, to, 'q', (response) => {
            if (!response.ok) {
                if (response.message.includes("Invalid move")) {
                    return notify("Invalid Move");
                }
                return notify(response.message)
            }
        })
        return true;
    }
    //console.log(fen, "fen");


    function leaveRoom() {
        socket.emit('room:leave', roomCode, (response) => {
            if (!response?.ok) {
                notify(response.message);
                // navigate('/lobby');
                return;
            }
            setRoom(response.room);
            return navigate('/lobby');
        })
    }


    if (result) {
        clearInterval(whiteTimerRef.current);
        clearInterval(blackTimerRef.current);
    }

    const updatedWhiteMins = Math.floor((whiteTotalSeconds / 60)).toString();
    const updatedWhiteSecs = (whiteTotalSeconds % 60).toString();
    const updatedBlackMins = Math.floor(blackTotalSeconds / 60).toString();
    const updatedBlackSecs = (blackTotalSeconds % 60).toString();

    function sendMessage(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        let textMessage = formData.get('textMessage');
        socket.emit('send:message', roomCode, textMessage, (response) => {
            if (!response.ok) {
                notify(response.message);
                return;
            }
            //console.log(response, 'message sent');
        })
        e.target.reset();
    }
    function resign() {
        socket.emit('player:resign', roomCode, user._id, (response) => {
            if (!response.ok) {
                notify(response.message);
                return;
            }
        })
    }
    function requestDraw() {
        //console.log("Requesting Draw")
        socket.emit('request:draw', roomCode, opponentPlayer.userId, (response) => {
            if (!response.ok) {
                return notify(response.message);
            }
            //notify(response.message);
        })
    }
    function acceptDraw() {
        socket.emit('accept:draw', roomCode, opponentPlayer.userId, (response) => {
            if (!response.ok) {
                return notify(response.message);
            }
            notify(response.message);
        });
        setDisplayDraw(false);
    }
    function rejectDraw() {
        socket.emit('reject:draw', roomCode, opponentPlayer.userId, (response) => {
            if (!response.ok) {
                return notify(response.message);
            }
            notify(response.message);
        });
        setDisplayDraw(false);
    }
    return (
        <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 p-1">

            <div className="h-auto min-h-[70px] sm:h-[90px] rounded-2xl bg-white border border-slate-200 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 sm:gap-5">
                    <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-blue-100 flex items-center justify-center text-xl sm:text-2xl">
                        ♟️
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900">
                            Room: {roomCode}
                        </h1>
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-emerald-700">
                            ✓ Ready To Play
                        </div>
                    </div>
                </div>
                <button
                    className="rounded-xl cursor-pointer bg-gradient-to-r from-rose-500 to-red-600 px-4 sm:px-6 py-2 sm:py-3 font-semibold text-white shadow-md hover:from-rose-600 hover:to-red-700 transition text-sm sm:text-base"
                    onClick={leaveRoom}
                >
                    Leave Game
                </button>
            </div>

            <div className="mt-3 flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:h-[calc(100vh-114px)]">

                <div className="lg:col-span-3 flex flex-col gap-3 lg:h-full order-2 lg:order-1">

                    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                            <span className="text-indigo-600">👥</span>
                            Players ({room?.players?.length || 0}/2)
                        </h2>

                        <div className="space-y-3">

                            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                                    {user?.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex gap-2 items-center flex-wrap">
                                        <p className="font-semibold">{user?.name}</p>
                                        <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">You</span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {piecesColor === "white"
                                            ? result === "white" ? "White 👑" : "White"
                                            : result === "black" ? "Black 👑" : "Black"}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                                    {opponentPlayer?.name?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <p className="font-semibold">{opponentPlayer?.name || "Waiting..."}</p>
                                    <p className="text-sm text-slate-500">
                                        {piecesColor === "white"
                                            ? result === "black" ? "Black 👑" : "Black"
                                            : result === "white" ? "White 👑" : "White"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-5">
                            <span className="text-indigo-600">ⓘ</span>
                            Game Info
                        </h2>
                        <div className="space-y-5">
                            <div className="flex justify-between">
                                <span className="text-slate-500">🕐 Time Control</span>
                                <span className="font-semibold">10 + 0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">● Status</span>
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                                    Ready
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Result</span>
                                <span className="font-semibold">{result || "Playing"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3 flex justify-center gap-3 flex-wrap">
                        <button className="rounded-xl bg-gradient-to-r from-rose-500 cursor-pointer
                         to-red-600 px-4 py-2 font-semibold text-white shadow-md hover:from-rose-600
                         hover:to-red-700 transition text-sm
                         disabled:cursor-not-allowed
                         disabled:opacity-50
                       disabled:hover:from-rose-500
                       disabled:hover:to-red-600
                         "
                            onClick={resign}
                            disabled={result ? true : false}
                        >
                            🚩 Resign
                        </button>
                        <button onClick={requestDraw}
                            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2
                         font-semibold text-white shadow-md hover:from-amber-600 cursor-pointer
                          hover:to-orange-600 transition text-sm
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        disabled:hover:from-rose-500
                        disabled:hover:to-red-600
                          "
                            disabled={result ? true : false}
                        >
                            🤝 Draw
                        </button>

                    </div>
                </div>

                <div className="lg:col-span-6 lg:h-full order-1 lg:order-2">

                    <div className="h-full rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/60 shadow-sm flex flex-col overflow-hidden">

                        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
                            {!result ? (
                                <div className="w-full flex flex-col items-center gap-3">

                                    <div className="w-full flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-emerald-500 text-white grid place-items-center font-bold text-sm">
                                                {opponentPlayer?.name?.[0] || "?"}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                                    {opponentPlayer?.name || "Waiting..."}
                                                </p>
                                                <p className="text-xs text-slate-500">Opponent</p>
                                            </div>
                                            {!piecesColor.includes(turn) && (
                                                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                                            )}
                                        </div>

                                        <div className={`rounded-xl border px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm ${!piecesColor.includes(turn)
                                            ? "bg-green-50 border-green-300 ring-2 ring-green-200"
                                            : "bg-white border-slate-200"
                                            }`}>
                                            <p className="text-xs text-slate-500">Time</p>
                                            <h2 className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                                                {opponentPlayer?.userId?.toString() === room?.whiteId?.toString()
                                                    ? `${updatedWhiteMins.padStart(2, "0")}:${updatedWhiteSecs.padStart(2, "0")}`
                                                    : `${updatedBlackMins.padStart(2, "0")}:${updatedBlackSecs.padStart(2, "0")}`
                                                }
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-2 sm:p-4 shadow-inner w-full flex justify-center">
                                        <div>
                                            {fen && <Chessboard
                                                position={fen}
                                                onPieceDrop={onDrop}
                                                boardOrientation={piecesColor}
                                                arePiecesDraggable={true}
                                                boardWidth={Math.min(
                                                    580,
                                                    typeof window !== 'undefined'
                                                        ? Math.min(window.innerWidth - 32, window.innerHeight * 0.55)
                                                        : 480
                                                )}
                                            />}
                                        </div>
                                    </div>
                                    {displayDraw ?
                                        //  <div className='flex gap-8 items-center'>
                                        //     <h1>Draw</h1>
                                        //     <button onClick={acceptDraw} className='bg-green-500 p-2 rounded-full cursor-pointer'>accept</button>
                                        //     <button onClick={rejectDraw} className='bg-red-500 p-2 rounded-full cursor-pointer'>reject</button>
                                        // </div> 
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
                                            <div>
                                                <h2 className="text-lg font-semibold text-white">
                                                    Draw Offer
                                                </h2>
                                                <p className="text-sm text-slate-400">
                                                    Your opponent has offered a draw.
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={acceptDraw}
                                                    className="cursor-pointer px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200 active:scale-95"
                                                >
                                                    ✓ Accept
                                                </button>

                                                <button
                                                    onClick={rejectDraw}
                                                    className="cursor-pointer px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200 active:scale-95"
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        </div>

                                        : ""}
                                    <div className="w-full flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-indigo-500 text-white grid place-items-center font-bold text-sm">
                                                {user?.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                                    {user?.name}
                                                </p>
                                                <p className="text-xs text-slate-500">You</p>
                                            </div>
                                            {piecesColor.includes(turn) && (
                                                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                                            )}
                                        </div>

                                        <div className={`rounded-xl border px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm ${piecesColor.includes(turn)
                                            ? "bg-green-50 border-green-300 ring-2 ring-green-200"
                                            : "bg-white border-slate-200"
                                            }`}>
                                            <p className="text-xs text-slate-500">Time</p>
                                            <h2 className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                                                {user?._id.toString() === room?.whiteId?.toString()
                                                    ? `${updatedWhiteMins.padStart(2, "0")}:${updatedWhiteSecs.padStart(2, "0")}`
                                                    : `${updatedBlackMins.padStart(2, "0")}:${updatedBlackSecs.padStart(2, "0")}`
                                                }
                                            </h2>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center px-4 gap-2">
                                    <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-5xl sm:text-6xl grid place-items-center shadow-xl">
                                        👑
                                    </div>
                                    <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold text-slate-900">
                                        Game Over
                                    </h1>
                                    <p className="mt-3 text-xl sm:text-2xl font-bold text-indigo-700">
                                        {result === "white"
                                            ? "White Wins"
                                            : result === "black"
                                                ? "Black Wins"
                                                : result}
                                    </p>
                                    <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 shadow-sm">
                                        <p className="text-slate-700 font-medium">{reason}</p>
                                    </div>

                                    <div>
                                        <button className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 sm:px-6 py-2 sm:py-3 font-semibold
                                     text-white shadow-md hover:from-rose-600 cursor-pointer
                                      hover:to-red-700 transition text-sm sm:text-base"
                                            onClick={() => {
                                                navigate('/lobby')
                                                leaveRoom()
                                            }}
                                        >
                                            Go to Lobby
                                        </button>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 lg:h-full order-3 min-h-[320px]">

                    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">

                        <div className="border-b p-4 flex gap-8">
                            <button className="font-semibold text-blue-600 border-b-2 border-blue-600 pb-2">
                                Chat
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-gray-100">
                            {messages.map((m, index) => {
                                const isMe = m.userId.toString() === user._id.toString();

                                return (
                                    <div
                                        key={m.text + index}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm wrap-break-words ${isMe
                                                ? "bg-blue-500 text-white rounded-br-md"
                                                : "bg-white text-gray-800 rounded-bl-md border"
                                                }`}
                                        >
                                            <p className="text-xs font-semibold mb-1 opacity-80">
                                                {isMe ? "You" : opponentPlayer?.name}
                                            </p>

                                            <p className="text-sm">{m.text}</p>
                                        </div>
                                    </div>
                                );
                            })}

                            <div ref={messagesEndRef}></div>
                        </div>

                        <div className="border-t p-3">
                            <form className="flex gap-2" onSubmit={sendMessage}>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                                    name='textMessage'
                                />
                                <button className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-5 text-white font-semibold shadow-md
                                 hover:from-indigo-600 hover:to-blue-700 
                                 transition text-sm py-2
                                 disabled:cursor-not-allowed
                                 disabled:opacity-50
                                 disabled:hover:from-rose-500
                                 disabled:hover:to-red-600
                                 "
                                    type='submit'
                                    disabled={result ? true : false}
                                >
                                    Send
                                </button>
                            </form>
                        </div>

                    </div>
                </div>

            </div>

            <ToastContainer />
        </div>
    );
}

export default Game;