import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, login } from '../slices/authSlice';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const notify = (message) => toast(message);
    const { user, authChecked } = useSelector((state) => {
        //console.log(state)
        return state.authReducer;
    })
    console.log(user, authChecked, "Checking the behaviour");

    if (user) {
        return <Navigate to="/lobby" />
    }
    const handleLogin = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email')
        const password = formData.get('password');
        console.log(email, password);
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
            notify('Login failed');
            console.log(err || "login failed");
        }

        e.target.reset();
    }
    return (

        <div className="flex min-h-[75vh] items-center justify-center px-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-md">

                <span className="absolute -left-6 top-4 text-8xl text-white/5">♞</span>
                <span className="absolute -right-4 bottom-4 text-8xl text-white/5">♜</span>

                <div className="relative z-10">
                    <div className="mb-6 text-center">
                        <div className="mb-2 text-5xl">♛</div>
                        <h1 className="text-3xl font-bold text-white">Login</h1>
                        <p className="mt-2 text-sm text-gray-300">
                            Enter the board and continue your game
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-yellow-400"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-yellow-400"
                        />

                        <button
                            type="submit"
                            className="w-full rounded-xl cursor-pointer bg-yellow-400 px-4 py-3 font-bold text-white text-lg shadow-lg transition hover:bg-yellow-300 active:scale-[0.98]"
                        >
                            Login ♔
                        </button>
                    </form>
                </div>

                <ToastContainer />
            </div>
        </div>
        // <div>
        //     <h1>Login</h1>
        //     <form onSubmit={handleLogin}>
        //         <input type="email" placeholder='Email' name='email' />
        //         <input type="password" placeholder='Password' name='password' />
        //         <button type='submit'>Login</button>
        //     </form>
        //     <ToastContainer />
        // </div>
    )
}

export default Login