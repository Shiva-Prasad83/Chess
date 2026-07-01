import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useEffect } from 'react';
import Modal from 'react-modal';
import {
    FaStar,
    FaChessBoard,
    FaTrophy,
    FaTimesCircle,
    FaHandshake
} from "react-icons/fa";
function Profile() {
    const [profile, setProfile] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const loggedInUser = useSelector((state) => state.authReducer.user);
    const [user, setUser] = useState([]);
    const [matches, setMatches] = useState([]);
    const [open, setOpen] = useState(false);
    const { name } = useParams();

    async function fetchUser() {
        try {
            const res = await api.get(`/auth/getUser/${name}`);
            //console.log(res);
            setUser(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    async function fetchMatches() {
        setOpen(true);
        try {
            const response = await api.get(`/auth/getMatches/${user._id}`);
            //console.log(matches);
            setMatches(response.data.matches);
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        fetchUser();
    }, [imageUrl]);

    async function uploadProfile(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("profileImage", e.target.files[0]);
        //console.log(e.target.files[0], "files");
        const res = await api.post('/upload', formData);
        console.log(res);
        setImageUrl(res.data.profileImageUrl);
    }
    return (
        <div className="w-full min-h-[80vh] flex flex-col gap-8">

            {/* ================= Profile Card ================= */}
            <div className="w-full rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white shadow-2xl">

                <div className="p-10 flex flex-col lg:flex-row items-center lg:items-start gap-8">

                    <div className="relative">

                        <img
                            src={user.avatar || "https://placehold.co/250x250"}
                            className="w-44 h-44 rounded-full object-cover border-[6px] border-cyan-400 shadow-2xl"
                        />

                        <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-green-400 border-4 border-slate-900"></div>

                    </div>

                    <div className="flex-1">

                        <h1 className="text-5xl font-black tracking-wide">
                            {user.name}
                        </h1>

                        <p className="mt-2 text-slate-300 text-lg">
                            {user.email}
                        </p>

                        <div className="flex gap-3 mt-6 flex-wrap">

                            <div className="px-5 py-2 rounded-full bg-cyan-500 text-slate-900 font-bold">
                                Rating {user?.stats?.rating}
                            </div>

                            <div className="px-5 py-2 rounded-full bg-purple-500 font-semibold">
                                Chess Player
                            </div>

                        </div>

                        {
                            loggedInUser._id.toString() === user?._id?.toString() && (
                                <>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="profileImage"
                                        className="hidden"
                                        onChange={uploadProfile}
                                    />

                                    <label
                                        htmlFor="profileImage"
                                        className="inline-block mt-8 cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
                                    >
                                        📷 Change Avatar
                                    </label>

                                </>
                            )
                        }

                    </div>

                </div>

            </div>

            {/* ================= Stats ================= */}

            <div>

                <h2 className="text-3xl font-bold mb-5 text-slate-700">
                    Player Statistics
                </h2>

                {/* <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">

                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 text-center shadow-xl">
                        <h3 className="text-sm uppercase">Rating</h3>
                        <p className="text-4xl font-black mt-3">
                            {user?.stats?.rating}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-white p-6 text-center shadow-xl">
                        <h3 className="text-sm uppercase">Games</h3>
                        <p className="text-4xl font-black mt-3">
                            {user?.stats?.gamesPlayed}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-6 text-center shadow-xl">
                        <h3 className="text-sm uppercase">Wins</h3>
                        <p className="text-4xl font-black mt-3">
                            {user?.stats?.wins}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white p-6 text-center shadow-xl">
                        <h3 className="text-sm uppercase">Losses</h3>
                        <p className="text-4xl font-black mt-3">
                            {user?.stats?.loses}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white p-6 text-center shadow-xl">
                        <h3 className="text-sm uppercase">Draws</h3>
                        <p className="text-4xl font-black mt-3">
                            {user?.stats?.draws}
                        </p>
                    </div>

                </div> */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">

                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold uppercase">Rating</h3>
                            <FaStar className="text-2xl opacity-80" />
                        </div>
                        <p className="text-4xl font-black mt-4">
                            {user?.stats?.rating}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold uppercase">Games</h3>
                            <FaChessBoard className="text-2xl opacity-80" />
                        </div>
                        <p className="text-4xl font-black mt-4">
                            {user?.stats?.gamesPlayed}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold uppercase">Wins</h3>
                            <FaTrophy className="text-2xl opacity-80" />
                        </div>
                        <p className="text-4xl font-black mt-4">
                            {user?.stats?.wins}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold uppercase">Losses</h3>
                            <FaTimesCircle className="text-2xl opacity-80" />
                        </div>
                        <p className="text-4xl font-black mt-4">
                            {user?.stats?.loses}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold uppercase">Draws</h3>
                            <FaHandshake className="text-2xl opacity-80" />
                        </div>
                        <p className="text-4xl font-black mt-4">
                            {user?.stats?.draws}
                        </p>
                    </div>

                </div>

            </div>

            {/* ================= Recent Matches ================= */}

            <div className="rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 shadow-2xl">

                <div className="flex justify-between items-center flex-wrap gap-5">

                    <div>

                        <h2 className="text-3xl font-bold">
                            ♟ Recent Matches
                        </h2>

                        <p className="text-slate-300 mt-3 max-w-2xl leading-7">

                            Review your latest battles, analyze victories and defeats,
                            and improve your strategy by revisiting your previous
                            games. Every match is another step toward becoming a
                            stronger chess player.

                        </p>

                    </div>

                    <button
                        onClick={fetchMatches}
                        className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400
                         text-slate-900 font-bold transition hover:scale-105 shadow-lg
                         cursor-pointer
                         "
                    >
                        View Match History →
                    </button>

                </div>

            </div>

            {/* ================= Modal ================= */}

            <Modal
                isOpen={open}
                onRequestClose={() => setOpen(false)}
                className="w-full max-w-3xl bg-slate-900 rounded-3xl mx-auto mt-16 outline-none shadow-2xl border border-slate-700"
                overlayClassName="fixed inset-0 bg-black/70 backdrop-blur flex justify-center items-start z-50"
            >

                <div className="p-8 text-white">

                    <div className="flex justify-between items-center border-b border-slate-700 pb-5">

                        <h2 className="text-3xl font-black">
                            Match History
                        </h2>

                        <button
                            onClick={() => setOpen(false)}
                            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 cursor-pointer"
                        >
                            Close
                        </button>

                    </div>

                    <div className="mt-6 h-[500px] overflow-y-auto space-y-4 pr-2">

                        {
                            matches.length === 0 && (

                                <div className="text-center mt-24 text-slate-400">

                                    No matches played yet.

                                </div>

                            )
                        }

                        {
                            matches.map((match) => {

                                const color =
                                    match.whiteId._id.toString() === user._id.toString()
                                        ? "white"
                                        : "black";

                                const meWon = color === match.result;

                                return (
                                    <div
                                        key={match._id}
                                        className="bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-cyan-400 transition"
                                    >

                                        <div className="flex justify-between">

                                            <div>

                                                <h3 className="font-bold text-lg">

                                                    {color === "white"
                                                        ? match.whiteId.name
                                                        : match.blackId.name}

                                                    <span className="mx-3 text-slate-400">
                                                        VS
                                                    </span>

                                                    {color === "white"
                                                        ? match.blackId.name
                                                        : match.whiteId.name}

                                                </h3>

                                                <p className="text-slate-400 mt-2">
                                                    You played as {color}.
                                                </p>

                                            </div>

                                            <div
                                                className={`font-bold px-5 py-2 rounded-full h-fit ${meWon
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                                    }`}
                                            >
                                                {meWon ? "Victory" : "Defeat"}
                                            </div>

                                        </div>

                                    </div>
                                );
                            })
                        }

                    </div>

                </div>

            </Modal>

        </div>
    );


    // <div>

    //     {/* User Details Sections */}
    //     <div className='border-2 border-black p-4'>
    //         <div className='flex gap-8'>
    //             {/* Profile Image */}
    //             <div className='w-30 h-30 border-2 border-black rounded-2xl'>
    //                 <img src={user.avatar ? user.avatar : null} className='object-cover w-full h-full rounded-2xl' />
    //             </div>
    //             {/* Details Div */}
    //             <div className='flex flex-col gap-4'>
    //                 <h1>{user.name}</h1>
    //                 <h1>{user.email}</h1>
    //                 {loggedInUser._id.toString() === user?._id?.toString() &&
    //                     <>
    //                         <input type='file' accept='image/*'
    //                             onChange={uploadProfile}
    //                             name='profileImage'
    //                             id='profileImage'
    //                             className='hidden'
    //                         />
    //                         <label htmlFor="profileImage" className='bg-blue-500 p-2 rounded-2xl cursor-pointer text-white'>
    //                             Change Avatar
    //                         </label></>}
    //             </div>
    //         </div>
    //     </div>

    //     {/* User Stats */}
    //     <div>
    //         <h1>User Stats</h1>

    //         <div>
    //             <div>
    //                 Rating: {user?.stats?.rating}
    //             </div>
    //             <div>
    //                 Games Played:{user?.stats?.gamesPlayed}
    //             </div>
    //             <div>
    //                 Wins: {user?.stats?.wins}
    //             </div>
    //             <div>
    //                 Loses {user?.stats?.loses}
    //             </div>

    //             <div>
    //                 Draws: {user?.stats?.draws}
    //             </div>
    //         </div>
    //     </div>

    //     <div>

    //         {/* Friends list */}
    //         <div>

    //         </div>

    //         {/* Recent Matches */}
    //         <div onClick={fetchMatches} className='cursor-pointer'>
    //             View Recent Matches
    //         </div>

    //     </div>
    //     <Modal isOpen={open}>
    //         <button onClick={() => setOpen(false)}>Close</button>
    //         <div>
    //             {
    //                 matches.map((match) => {
    //                     const color = match.whiteId._id.toString() === user._id.toString() ? "white" : "black";
    //                     const meWon = color === match.result;
    //                     return <div className='flex gap-2' key={match._id}>
    //                         <h1>{meWon ? "Won" : "Lost"}</h1>
    //                         <h1>{color === "white" ? match.whiteId.name : match.blackId.name}
    //                             V/S
    //                             {color === "white" ? match.blackId.name : match.whiteId.name}
    //                         </h1>
    //                     </div>
    //                 })
    //             }
    //         </div>
    //     </Modal>
    // </div>

}

export default Profile;

{/* <h1>{user.name}</h1>
            <div>
                {!imageUrl ? <form onSubmit={uploadProfile}>
                    <input type="file" onChange={(e) => setProfile(e.target.files[0])} accept='image/*' required name='profile' />
                    <button type='submit'>Upload</button>
                </form> :
                    <div className='w-20 h-10'>
                        <img src={imageUrl} />
                    </div>
                }
            </div> */}