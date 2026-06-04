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
        <div className="min-h-screen bg-gray-900 text-white">
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-3xl">♛</span>
                        <div>
                            <h1 className="text-xl font-bold">
                                Chess<span className="text-yellow-400">Game</span>
                            </h1>
                            <p className="text-xs text-gray-400">Play. Think. Win.</p>
                        </div>
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        {!user ? (
                            <>
                                <Link to="/" className="rounded px-3 py-2 hover:bg-gray-700">
                                    Home
                                </Link>

                                <Link to="/login" className="rounded px-3 py-2 hover:bg-gray-700">
                                    Login
                                </Link>

                                <Link
                                    to="/signup"
                                    className="rounded bg-yellow-400 px-3 py-2 font-semibold text-black hover:bg-yellow-300"
                                >
                                    Sign up
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/lobby" className="rounded px-3 py-2 hover:bg-gray-700">
                                    Lobby
                                </Link>

                                <Link to="/profile" className="rounded px-3 py-2 hover:bg-gray-700">
                                    Profile
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="rounded bg-red-500 px-3 py-2 font-semibold hover:bg-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="rounded-lg bg-gray-800 p-4 sm:p-6">
                    <Outlet />
                </div>
            </main>

            <ToastContainer />
        </div>

        // <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-800 text-white">

        //     <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md">
        //         <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">

        //             <Link to="/" className="flex items-center gap-2">
        //                 <span className="text-3xl">♛</span>
        //                 <div>
        //                     <h1 className="text-xl font-bold tracking-wide">
        //                         Chess<span className="text-yellow-400">Game</span>
        //                     </h1>
        //                     <p className="text-xs text-gray-400">Play. Think. Win.</p>
        //                 </div>
        //             </Link>


        //             <div className="flex items-center gap-3 text-sm font-medium">
        //                 {!user ? (
        //                     <>
        //                         <Link
        //                             to="/"
        //                             className="rounded-lg px-3 py-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
        //                         >
        //                             Home
        //                         </Link>

        //                         <Link
        //                             to="/login"
        //                             className="rounded-lg px-4 py-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
        //                         >
        //                             Login
        //                         </Link>

        //                         <Link
        //                             to="/signup"
        //                             className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black shadow-md transition hover:bg-yellow-300"
        //                         >
        //                             Sign up
        //                         </Link>
        //                     </>
        //                 ) : (
        //                     <>
        //                         <Link
        //                             to="/lobby"
        //                             className="rounded-lg px-3 py-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
        //                         >
        //                             Lobby
        //                         </Link>

        //                         <Link
        //                             to="/profile"
        //                             className="rounded-lg px-3 py-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
        //                         >
        //                             Profile
        //                         </Link>

        //                         <button
        //                             onClick={handleLogout}
        //                             className="rounded-lg cursor-pointer bg-red-500 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-red-600"
        //                         >
        //                             Logout
        //                         </button>
        //                     </>
        //                 )}
        //             </div>
        //         </div>
        //     </nav>


        //     <div className="pointer-events-none fixed inset-0 overflow-hidden">
        //         <span className="absolute left-5 top-28 text-7xl text-white/5">♞</span>
        //         <span className="absolute right-8 top-40 text-8xl text-white/5">♜</span>
        //         <span className="absolute bottom-16 left-10 text-8xl text-white/5">♝</span>
        //         <span className="absolute bottom-24 right-16 text-7xl text-white/5">♚</span>
        //     </div>


        //     <main className="relative mx-auto max-w-6xl px-4 py-8 overflow-visible">
        //         <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl sm:p-8 overflow-visible">
        //             <Outlet />
        //         </div>
        //     </main>

        //     <ToastContainer />
        // </div>
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