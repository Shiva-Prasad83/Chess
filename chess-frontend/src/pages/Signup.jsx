import React from 'react'
import { signup } from '../slices/authSlice';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
function Signup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const notify = (message, type) => {
        if (type === 'error') {
            toast.error(message);
        } else {
            toast(message);
        }
    };
    const handleSignup = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        //console.log(name, email, password);
        if (!name || !email || !password) {
            return notify("Please fill all fields");
        }
        try {
            const res = await dispatch(signup({ name, email, password })).unwrap();
            console.log(res, 'signup response');
            notify(res.message)
            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (err) {
            console.log('hello', err);
            if (err.includes('E11000 duplicate key error collection')) {
                notify('This name is already taken', 'error');
            } else {
                notify(err || "signup failed");
            }
        }

    }

    const user = useSelector((state) => state.authReducer.user);
    if (user) {
        return <Navigate to="/lobby" />
    }

    return (
        <div className="flex min-h-[60vh] w-full items-center justify-center overflow-hidden px-2 py-4">

            <div className="
        relative w-full max-w-md overflow-hidden
        rounded-3xl border border-blue-200
        bg-gradient-to-br from-blue-50 via-white to-indigo-100
        p-6 sm:p-8
        shadow-2xl shadow-blue-300/30
    ">

                <div className="absolute inset-0 pointer-events-none">

                    <span className="absolute -left-4 top-4 text-8xl text-blue-200/50 animate-float">
                        ♛
                    </span>

                    <span className="absolute right-3 top-3 text-6xl text-indigo-200/50 animate-float-slow">
                        ♝
                    </span>

                    <span className="absolute -right-5 bottom-0 text-9xl text-blue-200/40 animate-float">
                        ♚
                    </span>

                </div>


                <div className="relative z-10">

                    <div className="text-center">

                        <div className="
                    mx-auto grid h-16 w-16 place-items-center
                    rounded-full bg-gradient-to-br
                    from-blue-600 to-indigo-600
                    text-3xl text-white shadow-lg
                ">
                            ♛
                        </div>


                        <h1 className="mt-5 text-3xl font-extrabold text-slate-900">
                            Join The Kingdom
                        </h1>


                        <p className="mt-2 text-sm text-slate-600">
                            Create your account and start your chess journey
                        </p>

                    </div>


                    <form onSubmit={handleSignup} className="mt-8 space-y-4">

                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            className="
                    w-full rounded-xl border border-blue-200
                    bg-white/70 px-4 py-3 text-slate-900
                    outline-none backdrop-blur
                    focus:border-blue-500 transition
                "
                        />


                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className="
                    w-full rounded-xl border border-blue-200
                    bg-white/70 px-4 py-3 text-slate-900
                    outline-none backdrop-blur
                    focus:border-blue-500 transition
                "
                        />


                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="
                    w-full rounded-xl border border-blue-200
                    bg-white/70 px-4 py-3 text-slate-900
                    outline-none backdrop-blur
                    focus:border-blue-500 transition
                "
                        />


                        <button
                            type="submit"
                            className="
                    w-full cursor-pointer rounded-xl
                    bg-gradient-to-r from-blue-600 to-indigo-600
                    px-4 py-3 font-bold text-white
                    shadow-lg shadow-blue-400/40
                    transition hover:scale-[1.02]
                    hover:from-blue-700 hover:to-indigo-700
                ">
                            Signup ♛
                        </button>

                    </form>


                    <p className="mt-6 text-center text-sm text-slate-600">

                        Already have an account?

                        <Link
                            to="/login"
                            className="ml-1 font-bold text-blue-700 hover:text-indigo-700"
                        >
                            Login
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    )
}

export default Signup