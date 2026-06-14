import React from 'react'
import { useSelector } from 'react-redux'
import { Link, Navigate } from 'react-router-dom';
function Home() {
    const { user } = useSelector((state) => state.authReducer);

    if (user) {
        return <Navigate to={"/lobby"} />
    }
    return (
        <div className="relative w-full overflow-hidden">

            {/* Background Chess Pieces */}
            <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">

                <span className="absolute -left-6 top-0 text-[10rem] text-indigo-200/40 animate-float">
                    ♞
                </span>

                <span className="absolute right-6 top-10 text-[7rem] text-blue-200/40 animate-float-slow">
                    ♜
                </span>

                <span className="absolute right-0 bottom-20 text-[12rem] text-indigo-200/30 animate-glow">
                    ♛
                </span>

            </div>


            {/* Hero Section */}
            <section
                className="
        relative
        flex min-h-[55vh]
        flex-col
        items-center
        justify-center
        rounded-3xl
        border border-indigo-100
        bg-gradient-to-br
        from-indigo-50/80
        via-white
        to-blue-100/80
        px-6 py-10
        text-center
        shadow-xl shadow-indigo-200/30
        overflow-hidden
    "
            >

                <div className="
            grid h-24 w-24 place-items-center
            rounded-full
            bg-gradient-to-br
            from-indigo-600
            to-blue-600
            text-6xl
            text-white
            shadow-lg shadow-indigo-400/40
        ">
                    ♚
                </div>


                <h1
                    className="
            mt-6 max-w-4xl
            bg-gradient-to-r
            from-indigo-700
            via-blue-600
            to-indigo-500
            bg-clip-text
            text-4xl
            font-extrabold
            leading-tight
            text-transparent
            sm:text-6xl
        "
                >
                    Master The Chess Board
                </h1>


                <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                    Play intense chess battles, challenge friends,
                    sharpen your strategy, and rise to become
                    the ultimate chess champion.
                </p>


                <div className="mt-8 flex flex-col gap-4 sm:flex-row">

                    <Link
                        to="/signup"
                        className="
                rounded-2xl
                bg-gradient-to-r
                from-amber-400
                to-yellow-500
                px-8 py-4
                font-bold
                text-slate-900
                shadow-lg shadow-amber-300/50
                transition
                hover:scale-105
                hover:from-yellow-400
                hover:to-amber-500
            "
                    >
                        Start Playing ♟
                    </Link>


                    <Link
                        to="/login"
                        className="
                rounded-2xl
                border border-indigo-200
                bg-white/70
                px-8 py-4
                font-semibold
                text-indigo-700
                backdrop-blur
                shadow-md
                transition
                hover:bg-indigo-50
                hover:scale-105
            "
                    >
                        Login
                    </Link>

                </div>

            </section>


            {/* How It Works */}
            <div
                className="
        mt-6
        rounded-3xl
        border border-blue-100
        bg-gradient-to-r
        from-blue-50
        to-indigo-50
        p-6
        shadow-md
    "
            >

                <h4 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-slate-900">
                    💡 How It Works
                </h4>


                <div className="grid gap-4 sm:grid-cols-3">

                    {[
                        { n: 1, t: "Create or join a room", c: "bg-indigo-600" },
                        { n: 2, t: "Wait for your opponent", c: "bg-emerald-600" },
                        { n: 3, t: "Battle in real time", c: "bg-fuchsia-600" },
                    ].map((s) => (

                        <div
                            key={s.n}
                            className="
                    rounded-2xl
                    bg-white/70
                    border border-white
                    p-4
                    shadow-sm
                    flex items-center gap-3
                "
                        >

                            <span
                                className={`
                        grid h-10 w-10 shrink-0 place-items-center
                        rounded-full text-white font-bold ${s.c}
                    `}
                            >
                                {s.n}
                            </span>


                            <span className="font-semibold text-slate-700">
                                {s.t}
                            </span>

                        </div>

                    ))}

                </div>

            </div>


            {/* Bottom Cards */}
            <div className="mt-6 grid gap-5 lg:grid-cols-2">


                {/* Tips Card */}
                <div
                    className="
            rounded-3xl
            border border-indigo-100
            bg-gradient-to-br
            from-white
            to-indigo-50
            p-6
            shadow-md
        "
                >

                    <h4 className="flex items-center gap-3 text-lg font-extrabold text-slate-900">

                        <span
                            className="
                    grid h-10 w-10 place-items-center
                    rounded-xl
                    bg-indigo-100
                    text-indigo-700
                ">
                            📖
                        </span>

                        Quick Tips

                    </h4>


                    <ul className="mt-5 space-y-3 text-slate-600">

                        <li>♙ Control the center early with your pawns and knights.</li>
                        <li>♔ Castle early to protect your king.</li>
                        <li>♞ Develop pieces before launching attacks.</li>
                        <li>♟ Think ahead — every move shapes the battle.</li>

                    </ul>

                </div>



                {/* Leaderboard Card */}
                <div
                    className="
            rounded-3xl
            bg-gradient-to-br
            from-indigo-600
            via-blue-600
            to-indigo-700
            p-6
            text-white
            shadow-xl shadow-indigo-400/30
        "
                >

                    <h4 className="flex items-center gap-3 text-lg font-extrabold">

                        <span className="text-3xl">
                            🏆
                        </span>

                        Climb The Leaderboard

                    </h4>


                    <p className="mt-4 text-indigo-100 leading-relaxed">

                        Every victory moves you closer to greatness.
                        Challenge rivals, master tactics, and prove
                        your mind is the sharpest on the board.

                    </p>


                    <Link
                        to="/leaderboard"
                        className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-white
                px-5 py-3
                font-bold
                text-indigo-700
                shadow-md
                transition
                hover:bg-amber-300
                hover:text-slate-900
            "
                    >
                        View Leaderboard →
                    </Link>

                </div>

            </div>

        </div>

    )
}

export default Home