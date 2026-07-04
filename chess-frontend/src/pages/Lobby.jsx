import React from 'react'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket, connectSocket } from '../socket';
import { useSelector } from 'react-redux';
function Lobby() {
    const navigate = useNavigate();
    function play() {
        navigate('/online');
        return;
    }
    const { user } = useSelector((state) => state.authReducer);
    function playWithFriends() {
        navigate('/play_with_friends');
        return;
    }
    useEffect(() => {
        connectSocket();
        socket.emit('user:online', user._id);
    }, [])
    return (
        // <div>
        //     <button onClick={play}>Play</button>
        //     <button onClick={playWithFriends}>Play with friends</button>
        // </div>

        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-10">
            {/* Heading */}
            <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-indigo-400">
                    Welcome back{user?.name ? `, ${user.name}` : ''}
                </p>
                <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                    Ready for your next move?
                </h2>
                <p className="mt-3 text-slate-500">
                    Pick a board and start playing
                </p>
            </div>

            {/* Mode cards */}
            <div className="grid w-full max-w-4xl flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Play Online */}
                <button
                    onClick={play}
                    className="cursor-pointer group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-indigo-400/30 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 p-8 text-white shadow-xl shadow-indigo-900/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-900/40 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                >
                    <span className="pointer-events-none absolute -right-8 -top-8 text-[10rem] text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                        ♞
                    </span>
                    <span className="relative grid h-20 w-20 place-items-center rounded-2xl bg-white/15 text-5xl ring-1 ring-white/30 backdrop-blur transition-transform duration-300 group-hover:scale-110">
                        ♞
                    </span>
                    <span className="relative text-2xl font-bold">Play Online</span>
                    <span className="relative text-sm text-indigo-100/90">
                        Get matched with a random opponent
                    </span>
                    <span className="relative mt-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white ring-1 ring-white/30 transition group-hover:bg-white/25">
                        Find a match →
                    </span>
                </button>

                {/* Play with Friends */}
                <button
                    onClick={playWithFriends}
                    className="cursor-pointer group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-400 via-amber-400 to-orange-500 p-8 text-slate-900 shadow-xl shadow-amber-900/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-900/40 focus:outline-none focus:ring-4 focus:ring-amber-300"
                >
                    <span className="pointer-events-none absolute -right-8 -top-8 text-[10rem] text-white/15 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                        ♜
                    </span>
                    <span className="relative grid h-20 w-20 place-items-center rounded-2xl bg-white/30 text-5xl ring-1 ring-white/40 backdrop-blur transition-transform duration-300 group-hover:scale-110">
                        🤝
                    </span>
                    <span className="relative text-2xl font-bold">Play with Friends</span>
                    <span className="relative text-sm text-slate-900/80">
                        Create or join a private room
                    </span>
                    <span className="relative mt-2 rounded-full bg-white/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-900 ring-1 ring-white/40 transition group-hover:bg-white/40">
                        Start a room →
                    </span>
                </button>
            </div>
        </div>

    );

}

export default Lobby