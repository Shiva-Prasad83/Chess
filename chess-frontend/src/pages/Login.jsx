import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, login } from '../slices/authSlice';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const notify = (message) => toast(message);
    const { user, authChecked } = useSelector((state) => {
        //console.log(state)
        return state.authReducer;
    })
    //console.log(user, authChecked, "Checking the behaviour");

    if (user) {
        return <Navigate to="/lobby" />
    }
    const handleLogin = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email')
        const password = formData.get('password');
        //console.log(email, password);
        //.unwrap()is used because dispatch() will return the data from the authSlice
        //in the form of object
        //Lets say dispatch(login()) is failed because of invalid crendentials and we didn't
        //use .unwrap() then here that doesn't goes to the catch block and user will know 
        // about the login is failed.
        //To make dispatch() return promise back we use .unwrap() here.
        try {
            const res = await dispatch(login({ email, password })).unwrap();
            console.log(res, "thunk response");
            notify('Login Success');
            if (res.message === "OK") {
                const user = await dispatch(fetchMe()).unwrap();
                //console.log(user, "hitting fetchMe after logging in");
            }
            navigate('/lobby');
        } catch (err) {
            notify(err);
        }

        e.target.reset();
    }
    return (
        <div className="flex min-h-[60vh] w-full items-center justify-center overflow-hidden px-2 py-4">

            <div className="
        relative w-full max-w-md overflow-hidden 
        rounded-3xl border border-indigo-200
        bg-gradient-to-br from-indigo-50 via-white to-blue-100
        p-6 sm:p-8
        shadow-2xl shadow-indigo-300/30
    ">

                <div className="absolute inset-0 pointer-events-none">

                    <span className="absolute -left-4 top-4 text-8xl text-indigo-200/50 animate-float">
                        ♔
                    </span>

                    <span className="absolute right-3 top-2 text-6xl text-blue-200/50 animate-float-slow">
                        ♞
                    </span>

                    <span className="absolute -right-5 bottom-0 text-9xl text-indigo-200/40 animate-float">
                        ♜
                    </span>

                </div>


                <div className="relative z-10">

                    <div className="text-center">

                        <div className="
                    mx-auto grid h-16 w-16 place-items-center
                    rounded-full bg-gradient-to-br
                    from-indigo-600 to-blue-600
                    text-3xl text-white shadow-lg
                ">
                            ♔
                        </div>


                        <h1 className="mt-5 text-3xl font-extrabold text-slate-900">
                            Welcome Back
                        </h1>


                        <p className="mt-2 text-sm text-slate-600">
                            Return to the battlefield and claim victory
                        </p>

                    </div>


                    <form onSubmit={handleLogin} className="mt-8 space-y-4">

                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className="
                    w-full rounded-xl border border-indigo-200
                    bg-white/70 px-4 py-3 text-slate-900
                    outline-none backdrop-blur
                    focus:border-indigo-500
                    focus:bg-white transition
                "
                        />


                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="
                    w-full rounded-xl border border-indigo-200
                    bg-white/70 px-4 py-3 text-slate-900
                    outline-none backdrop-blur
                    focus:border-indigo-500
                    focus:bg-white transition
                "
                        />


                        <button
                            type="submit"
                            className="
                    w-full rounded-xl cursor-pointer
                    bg-gradient-to-r from-indigo-600 to-blue-600
                    px-4 py-3 font-bold text-white
                    shadow-lg shadow-indigo-400/40
                    transition hover:scale-[1.02]
                    hover:from-indigo-700 hover:to-blue-700
                "
                        >
                            Login ♔
                        </button>

                    </form>


                    <p className="mt-6 text-center text-sm text-slate-600">

                        Don't have an account?

                        <Link
                            to="/signup"
                            className="ml-1 font-bold text-indigo-700 hover:text-blue-700"
                        >
                            Signup
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    )
}

export default Login