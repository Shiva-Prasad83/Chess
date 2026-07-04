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
    const [time, setTime] = useState(120);
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
            socket.emit('leave:online');
        }
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(time - 1);
        }, 1000)
        if (time === 0) {
            clearInterval(timer);
            navigate('/lobby');
        }

        return () => {
            clearInterval(timer);
        }
    });

    let seconds = time % 60;
    let minutes = Math.floor(time / 60);
    return (
        // <div>
        //     Searching for Opponent
        //     <h1>{minutes.toString().padStart(2, "0")} : {seconds.toString().padStart(2, "0")}</h1>
        //     <ToastContainer />
        // </div>

        <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">

            {/* Background Glow */}
            <div className="absolute w-[600px] h-[600px] bg-indigo-600/20 blur-[180px] rounded-full -top-40 -left-40"></div>
            <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-[160px] rounded-full bottom-0 right-0"></div>

            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:35px_35px] opacity-20"></div>

            {/* Main Card */}
            <div className="relative z-10 w-[90%] max-w-xl rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-10">

                {/* Spinner */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full border-4 border-indigo-500/20"></div>

                        <div className="absolute inset-0 w-28 h-28 rounded-full border-4 border-transparent border-t-cyan-400 border-r-indigo-500 animate-spin"></div>

                        <div className="absolute inset-4 rounded-full bg-slate-900 flex items-center justify-center shadow-inner">
                            <span className="text-3xl">♟️</span>
                        </div>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-center text-4xl font-extrabold text-white tracking-wide">
                    Searching for Opponent
                </h1>

                <p className="text-center text-gray-300 mt-3 text-lg">
                    Matching you with players of similar skill...
                </p>

                {/* Timer */}
                <div className="mt-10 flex justify-center">
                    <div className="px-10 py-5 rounded-2xl bg-slate-900/60 border border-indigo-500/30 shadow-xl">
                        <div className="text-gray-400 text-sm text-center uppercase tracking-widest">
                            Time Remaining
                        </div>

                        <div className="mt-2 text-5xl font-bold text-cyan-300 tracking-widest">
                            {minutes.toString().padStart(2, "0")} :
                            {seconds.toString().padStart(2, "0")}
                        </div>
                    </div>
                </div>

                {/* Searching Dots */}
                <div className="mt-10 flex justify-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce"></div>
                    <div className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce delay-150"></div>
                    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce delay-300"></div>
                </div>

                {/* Bottom Text */}
                <p className="mt-10 text-center text-gray-400">
                    Please wait while we find the best opponent for you.
                </p>

                <p className="mt-2 text-center text-sm text-gray-500">
                    You'll automatically enter the game once a match is found.
                </p>
            </div>

            <ToastContainer />
        </div>
    )
}

export default PlayOnline