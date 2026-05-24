import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';
function Layout() {
    const user = useSelector((state) => state.authReducer.user);
    const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(logout());
    }
    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-800 text-white">

            <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">

                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-3xl">♛</span>
                        <div>
                            <h1 className="text-xl font-bold tracking-wide">
                                Chess<span className="text-yellow-400">Game</span>
                            </h1>
                            <p className="text-xs text-gray-400">Play. Think. Win.</p>
                        </div>
                    </Link>


                    <div className="flex items-center gap-3 text-sm font-medium">
                        {!user ? (
                            <>
                                <Link
                                    to="/"
                                    className="rounded-lg px-3 py-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
                                >
                                    Home
                                </Link>

                                <Link
                                    to="/login"
                                    className="rounded-lg px-4 py-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/signup"
                                    className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black shadow-md transition hover:bg-yellow-300"
                                >
                                    Sign up
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/lobby"
                                    className="rounded-lg px-3 py-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
                                >
                                    Lobby
                                </Link>

                                <Link
                                    to="/profile"
                                    className="rounded-lg px-3 py-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
                                >
                                    Profile
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="rounded-lg cursor-pointer bg-red-500 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>


            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <span className="absolute left-5 top-28 text-7xl text-white/5">♞</span>
                <span className="absolute right-8 top-40 text-8xl text-white/5">♜</span>
                <span className="absolute bottom-16 left-10 text-8xl text-white/5">♝</span>
                <span className="absolute bottom-24 right-16 text-7xl text-white/5">♚</span>
            </div>


            <main className="relative mx-auto max-w-6xl px-4 py-8">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-sm sm:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
        // <div>
        //     <h1>Layout</h1>
        //     {
        //         !user ? <>
        //             <Link to="/login">Login</Link>
        //             <Link to="/signup">Sign up</Link>
        //             <Link to="/">Home</Link>
        //         </> :
        //             <>
        //                 <Link to="/profile">Profile</Link>
        //                 <Link onClick={handleLogout}>Logout</Link>
        //             </>
        //     }

        //     <Outlet />
        // </div>
    )
}

export default Layout;