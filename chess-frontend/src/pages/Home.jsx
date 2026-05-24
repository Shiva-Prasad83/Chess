import React from 'react'
import { useSelector } from 'react-redux'
import { Link, Navigate } from 'react-router-dom';
function Home() {
    const { user } = useSelector((state) => state.authReducer);

    if (user) {
        return <Navigate to={"/lobby"} />
    }
    return (
        <div className="relative overflow-hidden rounded-3xl">

            <span className="absolute left-5 top-5 text-8xl text-white/5">
                ♞
            </span>

            <span className="absolute bottom-5 right-5 text-8xl text-white/5">
                ♛
            </span>

            <span className="absolute right-20 top-20 text-7xl text-white/5">
                ♜
            </span>


            <div className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center">

                <div className="mb-6 text-7xl drop-shadow-lg sm:text-8xl">
                    ♚
                </div>


                <h1 className="max-w-4xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-6xl">
                    Master The Chess Board
                </h1>


                <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
                    Play intense chess battles, challenge your friends, improve your
                    strategy, and become the ultimate chess champion.
                </p>


                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <Link
                        to="/signup"
                        className="rounded-2xl bg-yellow-400 px-8 py-4 font-bold text-black shadow-xl transition hover:scale-105 hover:bg-yellow-300"
                    >
                        Start Playing ♟
                    </Link>

                    <Link
                        to="/login"
                        className="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                    >
                        Login
                    </Link>
                </div>


                <div className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/10">
                        <div className="mb-3 text-4xl">♞</div>
                        <h2 className="mb-2 text-xl font-bold text-white">
                            Real Matches
                        </h2>
                        <p className="text-sm text-gray-400">
                            Compete with players and enjoy exciting real-time chess battles.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/10">
                        <div className="mb-3 text-4xl">♜</div>
                        <h2 className="mb-2 text-xl font-bold text-white">
                            Smart Strategy
                        </h2>
                        <p className="text-sm text-gray-400">
                            Improve your thinking and decision-making with every move.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/10">
                        <div className="mb-3 text-4xl">♛</div>
                        <h2 className="mb-2 text-xl font-bold text-white">
                            Become Champion
                        </h2>
                        <p className="text-sm text-gray-400">
                            Climb the leaderboard and prove yourself as the king of chess.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home