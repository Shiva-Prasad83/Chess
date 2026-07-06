import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';
import { ToastContainer, toast } from 'react-toastify';
function Layout() {
    const user = useSelector((state) => state.authReducer.user);
    const dispatch = useDispatch();
    const notify = (message) => toast(message)
    const navigate = useNavigate()
    const handleLogout = async () => {
        try {
            const res = await dispatch(logout()).unwrap();
            console.log(res, 'Response after logout');
            if (res.message === "OK") {
                toast('Logout Successful');
                navigate('/login');
            }
        } catch (err) {
            return notify(err.message || "Logout Failed");
        }
    }
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-900">
            {/* Header */}
            {/* <nav className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 shadow-lg shadow-indigo-900/20">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <Link to="/" className="group flex items-center gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl text-white ring-1 ring-white/30 backdrop-blur transition group-hover:rotate-6 group-hover:bg-white/25">
                            ♞
                        </span>
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-extrabold tracking-tight text-white">
                                Chess<span className="text-amber-300">Game</span>
                            </h1>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-100/80">
                                Play · Think · Win
                            </p>
                        </div>
                    </Link>

                    <div className="flex flex-wrap items-center gap-1.5 text-sm sm:gap-2">
                        {!user ? (
                            <>
                                <Link to="/" className="rounded-lg px-3 py-2 font-medium text-indigo-50 transition hover:bg-white/15">Home</Link>
                                <Link to="/login" className="rounded-lg px-3 py-2 font-medium text-indigo-50 transition hover:bg-white/15">Login</Link>
                                <Link to="/signup" className="rounded-lg bg-amber-400 px-4 py-2 font-bold text-slate-900 shadow-md shadow-amber-900/20 transition hover:bg-amber-300 hover:shadow-lg">Sign up</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/lobby" replace className="rounded-lg px-3 py-2 font-medium text-indigo-50 transition hover:bg-white/15">🎮 Lobby</Link>
                                <a href={`/profile/${user.name}`} replace className="rounded-lg px-3 py-2 font-medium text-indigo-50 transition hover:bg-white/15">👤 Profile</a>
                                <Link to="/leaderboard" replace className="rounded-lg px-3 py-2 font-medium text-indigo-50 transition hover:bg-white/15">🏆 Leaderboard</Link>
                                <button onClick={handleLogout} className="rounded-lg bg-rose-500 px-4 py-2 font-bold text-white shadow-md shadow-rose-900/20 transition hover:bg-rose-600 hover:shadow-lg">⇥ Logout</button>
                            </>
                        )}
                    </div>
                </div>
            </nav> */}

            <nav className="sticky top-0 z-50 border-b border-fuchsia-500/20 bg-gradient-to-r from-[#1b102f] via-[#2d174d] to-[#431c5d] shadow-2xl shadow-fuchsia-900/30">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* Logo */}
                    <Link
                        to="/"
                        className="group flex items-center gap-4"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 text-3xl shadow-xl shadow-amber-500/40 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                            ♞
                        </div>

                        <div>
                            <h1 className="text-3xl font-black tracking-wide text-white">
                                Chess
                                <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                                    Game
                                </span>
                            </h1>

                            <p className="text-xs uppercase tracking-[0.35em] text-purple-200/80">
                                Play • Think • Conquer
                            </p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <div className="flex flex-wrap items-center gap-3">

                        {!user ? (
                            <>
                                <Link
                                    to="/"
                                    className="rounded-xl px-4 py-2 font-semibold text-purple-100 transition-all duration-300 hover:bg-white/10 hover:text-white"
                                >
                                    Home
                                </Link>

                                <Link
                                    to="/login"
                                    className="rounded-xl px-4 py-2 font-semibold text-purple-100 transition-all duration-300 hover:bg-white/10 hover:text-white"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/signup"
                                    className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-2 font-bold text-slate-900 shadow-lg shadow-orange-500/40 transition-all duration-300 hover:scale-105 hover:shadow-orange-400/60"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/lobby"
                                    className="rounded-xl px-4 py-2 font-semibold text-purple-100 transition-all duration-300 hover:bg-fuchsia-500/20 hover:text-pink-300"
                                >
                                    🎮 Lobby
                                </Link>

                                <Link
                                    to="/friends"
                                    className="rounded-xl px-4 py-2 font-semibold text-purple-100 transition-all duration-300 hover:bg-fuchsia-500/20 hover:text-pink-300"
                                >
                                    👥 Friends
                                </Link>

                                <a
                                    href={`/profile/${user.name}`}
                                    className="rounded-xl px-4 py-2 font-semibold text-purple-100 transition-all duration-300 hover:bg-indigo-500/20 hover:text-indigo-200"
                                >
                                    👤 Profile
                                </a>

                                <Link
                                    to="/leaderboard"
                                    className="rounded-xl px-4 py-2 font-semibold text-purple-100 transition-all duration-300 hover:bg-amber-500/20 hover:text-yellow-300"
                                >
                                    🏆 Leaderboard
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="cursor-pointer rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2 font-bold text-white shadow-lg shadow-red-900/40 transition-all duration-300 hover:scale-105"
                                >
                                    Logout
                                </button>
                            </>
                        )}

                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                {/* <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06] select-none">
                    <span className="absolute -left-6 top-10 text-[12rem] leading-none">♙</span>
                    <span className="absolute -right-4 top-20 text-[14rem] leading-none">♞</span>
                </div> */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">

                    <span className="absolute -left-10 -top-6 text-[12rem] text-indigo-300/25 animate-float">
                        ♔
                    </span>

                    <span className="absolute right-6 top-10 text-[9rem] text-blue-300/20 animate-float-slow">
                        ♞
                    </span>

                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[18rem] text-slate-300/10 animate-glow">
                        ♛
                    </span>

                    <span className="absolute left-5 bottom-8 text-[8rem] text-indigo-200/25 animate-float">
                        ♜
                    </span>

                    <span className="absolute right-0 bottom-0 text-[10rem] text-blue-200/25 animate-float-slow">
                        ♝
                    </span>

                </div>

                <div className="relative rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl shadow-indigo-900/5 backdrop-blur sm:p-8 lg:p-10">
                    <Outlet />
                </div>
            </main>

            <ToastContainer position="top-right" />
        </div>
    )
}

export default Layout;