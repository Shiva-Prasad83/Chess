import React, { useState } from 'react';
import { connectSocket, socket } from '../socket';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
function Lobby() {
    const [roomCode, setRoomCode] = useState("");
    const navigate = useNavigate();
    const notify = (message) => toast(message);
    function createRoom() {
        connectSocket();
        //This callback function is passed as an argument to the backend.
        //Socket which is listening to room:create -> socket.on('room:create',(argument)=>{
        //this argument is called the callback function we are passing from frontend
        //argument('response');
        //This is response we get to the frontend.
        //})
        socket.emit('room:create', (response) => {
            if (!response.ok) {
                return alert(response.message || "Failed to create room");
            }
            navigate(`/rooms/${response.room.roomCode}`);
        })
    }

    function joinRoom() {
        connectSocket();
        //Here roomCode is the state variable which has the input value.
        socket.emit('room:join', roomCode, (response) => {
            console.log(response, "Join Room Response");
            if (!response.ok) {
                notify(response.message || "Failed to join room");
                return;
            }
            navigate(`/rooms/${roomCode}`);
        })
    }
    return (
        <div className="w-full">
            {/* Heading */}
            <div className="mb-10 text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-700">
                    ♟ Game Lobby
                </span>
                <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                    Welcome to <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Chess</span>
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
                    Create a room or join an existing one to start playing
                </p>
            </div>

            {/* Action cards — side by side */}
            <div className="relative grid items-stretch gap-6 md:grid-cols-2 md:gap-0">
                {/* Create Room */}
                <div className="group relative overflow-hidden rounded-2xl border-t-4 border-indigo-600 bg-white p-6 shadow-lg shadow-indigo-900/5 transition hover:-translate-y-1 hover:shadow-xl sm:p-8 md:mr-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-4xl text-white shadow-lg shadow-indigo-500/40">
                            ＋
                        </div>
                        <h3 className="text-2xl font-extrabold text-indigo-700">Create Room</h3>
                        <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
                            Start a new game and share the room code with your opponent.
                        </p>
                        <button
                            onClick={createRoom}
                            className="cursor-pointer mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 font-bold text-white shadow-md shadow-indigo-500/30 transition hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
                        >
                            ＋ Create Room
                        </button>
                    </div>
                </div>

                {/* OR divider — centered between cards */}
                <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:flex md:flex-col md:items-center">
                    <div className="h-16 w-px bg-slate-200" />
                    <span className="my-2 grid h-12 w-12 place-items-center rounded-full border border-slate-200 bg-white text-xs font-bold tracking-widest text-slate-500 shadow-sm">
                        OR
                    </span>
                    <div className="h-16 w-px bg-slate-200" />
                </div>

                {/* Mobile OR divider */}
                <div className="flex items-center justify-center md:hidden">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="mx-4 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-xs font-bold tracking-widest text-slate-500 shadow-sm">
                        OR
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Join Room */}
                <div className="group relative overflow-hidden rounded-2xl border-t-4 border-emerald-600 bg-white p-6 shadow-lg shadow-emerald-900/5 transition hover:-translate-y-1 hover:shadow-xl sm:p-8 md:ml-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-4xl text-white shadow-lg shadow-emerald-500/40">
                            ⇥
                        </div>
                        <h3 className="text-2xl font-extrabold text-emerald-700">Join Room</h3>
                        <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
                            Enter a room code to join an existing game.
                        </p>

                        <div className="mt-6 w-full">
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200">
                                <span className="font-bold text-slate-400">#</span>
                                <input
                                    type="text"
                                    placeholder="Enter room code"
                                    className="w-full bg-transparent font-mono text-base tracking-[0.2em] text-slate-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                />
                            </div>

                            <button
                                onClick={joinRoom}
                                className="mt-3 cursor-pointer w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 font-bold text-white shadow-md shadow-emerald-500/30 transition hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
                            >
                                → Join as a Player
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>

        // <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        //     <button
        //         className="w-full rounded-lg bg-yellow-400 p-2 text-black sm:w-auto"
        //         onClick={createRoom}
        //     >
        //         Create Room
        //     </button>

        //     <p className="text-center">OR</p>

        //     <input
        //         type="text"
        //         placeholder="Enter Room Code"
        //         className="w-full rounded-lg border p-2 text-black sm:w-48"
        //         value={roomCode}
        //         onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        //     />

        //     <button
        //         className="w-full rounded-lg bg-green-500 p-2 text-white sm:w-auto"
        //         onClick={joinRoom}
        //     >
        //         Join Room
        //     </button>
        // </div>
    )

}

export default Lobby


// <div className='flex gap-4 items-center'>
//     <button className='bg-yellow-400 text-white rounded-lg cursor-pointer p-2'
//         onClick={createRoom}
//     >Create Room</button>
//     <p>OR</p>
//     <input type="text" placeholder='Enter Room Code'
//         className='border p-2 rounded-lg'
//         value={roomCode}
//         onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
//     />
//     < button className='bg-green-500 p-2 rounded-lg cursor-pointer'
//         onClick={joinRoom}
//     >Join Room</button>
// </div>
// <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
//     <button
//         className="w-full rounded-lg bg-yellow-400 p-2 text-black sm:w-auto"
//         onClick={createRoom}
//     >
//         Create Room
//     </button>

//     <p className="text-center">OR</p>

//     <input
//         type="text"
//         placeholder="Enter Room Code"
//         className="w-full rounded-lg border p-2 text-black sm:w-48"
//         value={roomCode}
//         onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
//     />

//     <button
//         className="w-full rounded-lg bg-green-500 p-2 text-white sm:w-auto"
//         onClick={joinRoom}
//     >
//         Join Room
//     </button>
// </div>