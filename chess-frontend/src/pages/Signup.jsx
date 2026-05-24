import React from 'react'
import { signup } from '../slices/authSlice';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
function Signup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const notify = (message) => toast(message);
    const handleSignup = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        console.log(name, email, password);
        try {
            const res = await dispatch(signup({ name, email, password })).unwrap();
            console.log(res, 'signup response');
            notify(res.message)
            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (err) {
            console.log('hello', err)
            notify(err || "signup failed");
        }

    }

    const user = useSelector((state) => state.authReducer.user);
    if (user) {
        return <Navigate to="/lobby" />
    }

    return (

        <div className="flex min-h-[75vh] items-center justify-center px-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
                {/* Chess Background */}
                <span className="absolute -left-6 top-6 text-8xl text-white/5">♟</span>
                <span className="absolute -right-5 bottom-5 text-8xl text-white/5">♚</span>

                <div className="relative z-10">
                    <div className="mb-6 text-center">
                        <div className="mb-2 text-5xl">♞</div>
                        <h1 className="text-3xl font-bold text-white">Signup</h1>
                        <p className="mt-2 text-sm text-gray-300">
                            Create your account and join the chess board
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            name="name"
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-yellow-400"
                        />

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
                            className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-bold text-black shadow-lg transition hover:bg-yellow-300 active:scale-[0.98]"
                        >
                            Signup ♛
                        </button>
                    </form>
                </div>

                <ToastContainer />
            </div>
        </div>
        // <div>
        //     <h1>Signup</h1>
        //     <form onSubmit={handleSignup}>
        //         <input type="text" placeholder='Full Name' name='name' />
        //         <input type="email" placeholder='Email' name='email' />
        //         <input type="password" placeholder='Password' name='password' />
        //         <button type='submit'>Signup</button>
        //     </form>
        //     <ToastContainer />
        // </div>
    )
}

export default Signup