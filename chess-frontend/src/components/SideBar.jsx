import React from 'react'
import { Link } from 'react-router-dom'




function SideBar() {
    function handleLogout() {

    }
    return (
        <div className='w-full h-full flex flex-col gap-4'>
            <Link to="/lobby" replace className="rounded-lg px-3 py-2 font-medium text-indigo-50 transition hover:bg-white/15">🎮 Lobby</Link>
            <Link to="/profile" replace className="rounded-lg px-3 py-2 font-medium text-indigo-50 transition hover:bg-white/15">👤 Profile</Link>
            <Link to="/leaderboard" replace className="rounded-lg px-3 py-2 font-medium text-indigo-50 transition hover:bg-white/15">🏆 Leaderboard</Link>
            <button onClick={handleLogout} className="rounded-lg bg-rose-500 px-4 py-2 font-bold text-white shadow-md shadow-rose-900/20 transition hover:bg-rose-600 hover:shadow-lg">⇥ Logout</button>
        </div>
    )
}

export default SideBar