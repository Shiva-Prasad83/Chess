import React, { useEffect } from 'react';
import { connectSocket, socket } from '../socket';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
function Room() {
    const [room, setRoom] = useState(null);
    // const [roomCreator, setRoomCreator] = useState(false);
    const [showBoard, setShowBoard] = useState(false);
    const { roomCode } = useParams();
    const notify = (message) => toast(message);
    const navigate = useNavigate();
    const { user } = useSelector((state) => {
        //console.log(state.authReducer)
        return state.authReducer
    });
    console.log(room);
    //console.log(user);
    useEffect(() => {
        navigate(`/rooms/${roomCode}`)
        // connectSocket();
        // socket.emit('user:online', user?._id);
    }, [room]);

    useEffect(() => {
        connectSocket();
        //joining room, for the second time, even if the room creator also will be joined the room for the second time because
        //in the backend index.js "room:join" listener will emit the "room:presence" event to the frontend with the current room object
        // And this room:presence event will give live updates.
        socket.emit('room:join', roomCode, (response) => {
            if (!response.ok) {
                alert(response.message || "Failed to join room");
                navigate('/lobby');
                return;
            }
            setRoom(response.room);
        })
        const roomPresence = (data) => {
            setRoom(data);
        }
        socket.on('room:presence', roomPresence);
        const gameStart = (response) => {
            if (response.ok) {
                navigate(`/game/${roomCode}`);
            }
        }
        socket.on('game:started', gameStart);
        return () => {
            socket.off('room:presence', roomPresence);
            socket.off('game:started', gameStart);
        }
    }, [roomCode]);

    const meExistInRoom = room?.players.some((player) => player.userId.toString() === user._id.toString());
    if (!meExistInRoom) {
        return <Navigate to="/lobby" />
    }

    if (!user) {
        return <Navigate to={"/login"} replace />
    }
    function leaveRoom() {
        socket.emit('room:leave', roomCode, (response) => {
            if (!response?.ok) {
                notify(response.message);
                socket.off();
                navigate('/lobby');
            }
            setRoom(response.room);
            socket.off();
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

    const me = room?.players?.find(
        (p) => p.userId?.toString() === user?._id?.toString()
    );
    //console.log(me?.userId, "Me");
    const myColor = room?.whiteId === me?.userId ? "White" : "Black";
    const opponent = room?.players?.[1] && room?.players[1].userId?.toString() !== user?._id?.toString()
        ? room.players[1]
        : room?.players?.find((p) => p.userId?.toString() !== user?._id?.toString());
    const opponentColor = myColor === "White" ? "Black" : "White";
    const playersCount = room?.players?.length || 0;
    const isReady = room?.status === 'ready';

    const copyCode = () => {
        if (!roomCode) return;
        navigator.clipboard?.writeText(roomCode);
        notify('Room code copied!');
    };

    return (
        <div className='min-h-screen w-full bg-gradient-to-b from-slate-50 to-indigo-50/40 px-4 py-6 sm:px-6 lg:px-10'>
            <div className='mx-auto w-full max-w-7xl'>
                <Link
                    to='/lobby'
                    className='inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold text-sm sm:text-base transition'
                >
                    <span className='text-lg'>←</span> Back to Lobby
                </Link>

                <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'>
                    <div className='flex min-w-0 items-center gap-3 sm:gap-4'>
                        <div className='grid h-14 w-14 sm:h-16 sm:w-16 shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-600 text-2xl'>
                            👥
                        </div>
                        <div className='min-w-0'>
                            <h1 className='truncate text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900'>
                                Room: <span className='tracking-wider'>{roomCode}</span>
                            </h1>
                            {!isReady ? (
                                <span className='mt-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs sm:text-sm font-semibold text-amber-700'>
                                    🕐 Waiting for opponent
                                </span>
                            ) : (
                                <span className='mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs sm:text-sm font-semibold text-emerald-700'>
                                    ✓ Ready to play
                                </span>
                            )}
                        </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
                        <button
                            onClick={copyCode}
                            className='inline-flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-white px-4 py-2.5 text-sm sm:text-base font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer'
                        >
                            📋 Copy Code
                        </button>
                        {roomCreator && isReady && (
                            <button
                                onClick={startGame}
                                className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-sm sm:text-base font-semibold text-white shadow-md hover:from-emerald-600 hover:to-green-700 transition cursor-pointer'
                            >
                                ▶ Start Game
                            </button>
                        )}
                        <button
                            onClick={leaveRoom}
                            className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2.5 text-sm sm:text-base font-semibold text-white shadow-md hover:from-rose-600 hover:to-red-700 transition cursor-pointer'
                        >
                            ⎋ Leave Room
                        </button>
                    </div>
                </div>

                <hr className='my-6 border-slate-200' />

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>

                    <div className='lg:col-span-1 space-y-5'>

                        <div className='rounded-2xl bg-white border border-slate-200 shadow-sm p-5'>
                            <h2 className='flex items-center gap-2 text-base sm:text-lg font-bold text-slate-800 mb-4'>
                                <span className='text-indigo-600'>👥</span> Players ({playersCount}/2)
                            </h2>

                            <div className='space-y-3'>

                                {me && (
                                    <div className='rounded-xl bg-indigo-50 border border-indigo-100 p-3 flex items-center gap-3'>
                                        <div className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-indigo-500 text-white font-bold'>
                                            {me.name?.[0]?.toUpperCase() || 'M'}
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                            <div className='flex items-center gap-2'>
                                                <p className='truncate font-semibold text-slate-900'>{me.name}</p>
                                                <span className='shrink-0 rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white'>
                                                    You
                                                </span>
                                            </div>
                                            <p className='text-xs text-slate-600 mt-0.5'>
                                                Color: <span className='rounded bg-indigo-100 px-1.5 py-0.5 text-indigo-700 font-semibold'>{myColor}</span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {opponent ? (
                                    <div className='rounded-xl bg-emerald-50 border border-emerald-100 p-3 flex items-center gap-3'>
                                        <div className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-500 text-white font-bold'>
                                            {opponent.name?.[0]?.toUpperCase() || 'O'}
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                            <p className='truncate font-semibold text-slate-900'>{opponent.name}</p>
                                            <p className='text-xs text-slate-600 mt-0.5'>
                                                Color: <span className='rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700 font-semibold'>{opponentColor}</span>
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 flex items-center gap-3'>
                                        <div className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-400'>
                                            👤
                                        </div>
                                        <div className='min-w-0'>
                                            <p className='font-semibold text-slate-700 text-sm'>Waiting for opponent...</p>
                                            <p className='text-xs text-slate-500 mt-0.5'>Share the room code to invite a friend</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='rounded-2xl bg-white border border-slate-200 shadow-sm p-5'>
                            <h2 className='flex items-center gap-2 text-base sm:text-lg font-bold text-slate-800 mb-4'>
                                <span className='text-indigo-600'>ⓘ</span> Room Info
                            </h2>
                            <div className='divide-y divide-slate-100'>
                                <div className='flex items-center justify-between py-2.5'>
                                    <span className='flex items-center gap-2 text-slate-600 text-sm'>
                                        <span className='text-indigo-500'>#</span> Room Code
                                    </span>
                                    <span className='font-bold text-slate-900 tracking-wider text-sm'>{roomCode}</span>
                                </div>
                                <div className='flex items-center justify-between py-2.5'>
                                    <span className='flex items-center gap-2 text-slate-600 text-sm'>
                                        <span className='text-indigo-500'>🕐</span> Time Control
                                    </span>
                                    <span className='font-semibold text-slate-900 text-sm'>10:00 + 0</span>
                                </div>
                                <div className='flex items-center justify-between py-2.5'>
                                    <span className='flex items-center gap-2 text-slate-600 text-sm'>
                                        <span className='text-indigo-500'>📅</span> Created
                                    </span>
                                    <span className='font-semibold text-slate-900 text-sm'>Just now</span>
                                </div>
                                <div className='flex items-center justify-between py-2.5'>
                                    <span className='flex items-center gap-2 text-slate-600 text-sm'>
                                        <span className='text-indigo-500'>●</span> Status
                                    </span>
                                    <span className={`font-semibold text-sm ${isReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {room?.status || 'waiting'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='lg:col-span-2'>
                        <div className='rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/60 shadow-sm p-6 sm:p-10 h-full flex flex-col items-center justify-center text-center'>
                            <div className='grid h-24 w-24 sm:h-28 sm:w-28 place-items-center rounded-full bg-indigo-100/70 text-5xl sm:text-6xl shadow-inner'>
                                ♚♞
                            </div>

                            <h2 className='mt-6 text-2xl sm:text-3xl font-extrabold text-slate-900'>
                                {opponent ? 'Opponent Joined!' : 'Waiting for Opponent'}
                            </h2>
                            <p className='mt-2 text-sm sm:text-base text-slate-600 max-w-md'>
                                {opponent
                                    ? `${opponent.name} is ready. ${roomCreator ? 'Click Start Game to begin!' : 'Waiting for host to start the game.'}`
                                    : 'Share the room code with your friend to start the game.'}
                            </p>

                            <div className='mt-8 w-full max-w-md'>
                                <div className='flex items-center gap-3'>
                                    <div className='h-px flex-1 bg-slate-300' />
                                    <span className='text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider'>
                                        Room Code
                                    </span>
                                    <div className='h-px flex-1 bg-slate-300' />
                                </div>

                                <button
                                    onClick={copyCode}
                                    className='mt-4 w-full rounded-2xl border-2 border-indigo-200 bg-indigo-100/60 px-6 py-5 text-2xl sm:text-3xl font-extrabold tracking-[0.4em] text-indigo-800 hover:bg-indigo-200/60 hover:border-indigo-300 transition shadow-sm cursor-pointer'
                                >
                                    {roomCode}
                                </button>
                            </div>

                            <div className='mt-8 w-full max-w-xl rounded-xl bg-blue-50 border border-blue-100 p-3 sm:p-4 text-left'>
                                <p className='text-xs sm:text-sm text-slate-700 text-center'>
                                    <span className='inline-flex items-center gap-1.5 font-bold text-blue-700'>
                                        💡 Tip:
                                    </span>{' '}
                                    Once both players joins the room, Room Creator should start the game.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    )
}

export default Room;