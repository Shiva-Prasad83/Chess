import React from 'react'
import api from '../api/client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
function Leaderboard() {
    const [leaderboardPlayers, setLeaderboardPlayers] = useState([]);
    const { user } = useSelector((state) => state.authReducer);
    async function getLeaboard() {
        const data = await api.get('/leaderboard');
        //console.log(data.data.players);
        setLeaderboardPlayers(data.data.players);
    }
    useEffect(() => {
        getLeaboard();
    }, [])
    return (
        <div className="relative w-full overflow-hidden mt-[-30px]">

            {/* Background Chess Pieces */}
            <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">

                <span className="absolute -left-6 top-5 text-[10rem] text-indigo-200/40 animate-float">
                    ♔
                </span>

                <span className="absolute right-5 top-10 text-[8rem] text-blue-200/40 animate-float-slow">
                    ♞
                </span>

                <span className="absolute right-0 bottom-0 text-[12rem] text-indigo-100/40 animate-glow">
                    ♛
                </span>

            </div>


            <div className="relative z-10">

                {/* Header */}
                <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 p-8 text-center text-white shadow-xl shadow-indigo-400/30">

                    <div className="text-6xl animate-float">
                        🏆
                    </div>

                    <h1 className="mt-4 text-4xl font-extrabold">
                        Chess Hall of Fame
                    </h1>

                    <p className="mt-2 text-indigo-100">
                        Battle, win, and climb to the throne of champions
                    </p>

                </div>


                {/* Leaderboard Table */}
                <div className="mt-2 overflow-x-auto rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50 shadow-lg max-h-82">

                    <table className="min-w-full">

                        <thead>
                            <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">

                                <th className="px-5 py-4 text-left font-bold">
                                    Rank
                                </th>

                                <th className="px-5 py-4 text-left font-bold">
                                    Player
                                </th>

                                <th className="px-5 py-4 font-bold">
                                    Games
                                </th>

                                <th className="px-5 py-4 font-bold">
                                    Wins
                                </th>

                                <th className="px-5 py-4 font-bold">
                                    Losses
                                </th>

                                <th className="px-5 py-4 font-bold">
                                    Rating
                                </th>

                                <th className="px-5 py-4 font-bold">
                                    Winning Streak
                                </th>

                            </tr>
                        </thead>


                        <tbody>

                            {
                                leaderboardPlayers?.map((player, index) => {

                                    const isMe = user._id.toString() === player._id.toString();

                                    const rank =
                                        index === 0 ? "🥇" :
                                            index === 1 ? "🥈" :
                                                index === 2 ? "🥉" :
                                                    `#${index + 1}`;


                                    return (
                                        <tr
                                            key={player._id}
                                            className={`
                                        border-b border-indigo-100
                                        transition duration-300
                                        hover:bg-indigo-50
                                        ${isMe
                                                    ? "bg-gradient-to-r from-amber-100 to-yellow-50 shadow-md"
                                                    : ""
                                                }
                                    `}
                                        >

                                            <td className="px-5 py-4 font-bold text-slate-800">
                                                {rank}
                                            </td>


                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className={`
                                                grid h-10 w-10 place-items-center 
                                                rounded-full font-bold text-white
                                                ${isMe
                                                            ? "bg-gradient-to-br from-amber-500 to-yellow-600"
                                                            : "bg-gradient-to-br from-indigo-500 to-blue-600"
                                                        }
                                            `}>

                                                        {player.name?.[0]?.toUpperCase()}

                                                    </div>


                                                    <div>

                                                        <p className="font-bold text-slate-900">

                                                            {
                                                                isMe
                                                                    ? `${player.name} ♔ You`
                                                                    : player.name
                                                            }

                                                        </p>


                                                        {
                                                            index === 0 &&
                                                            <span className="text-xs font-semibold text-amber-600">
                                                                Current Champion
                                                            </span>
                                                        }

                                                    </div>

                                                </div>

                                            </td>


                                            <td className="px-5 py-4 text-center text-slate-700">
                                                {player.stats.gamesPlayed}
                                            </td>


                                            <td className="px-5 py-4 text-center font-bold text-emerald-600">
                                                {player.stats.wins}
                                            </td>


                                            <td className="px-5 py-4 text-center font-bold text-red-500">
                                                {player.stats.loses}
                                            </td>


                                            <td className="px-5 py-4 text-center">

                                                <span className="rounded-full bg-indigo-100 px-3 py-1 font-bold text-indigo-700">
                                                    ♟ {player.stats.rating}
                                                </span>

                                            </td>


                                            <td className="px-5 py-4 text-center">

                                                <span className="rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-700">
                                                    🔥 {player.stats.maxWinningStreak}
                                                </span>

                                            </td>

                                        </tr>
                                    );
                                })
                            }

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    )
}

export default Leaderboard;