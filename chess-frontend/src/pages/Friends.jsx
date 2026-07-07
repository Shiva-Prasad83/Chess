import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import api from '../api/client';
import { ToastContainer, toast } from 'react-toastify';
import { connectSocket, socket } from '../socket';
// function debounce(callback, delay) {
//     let timer;

//     return (e) => {
//         if (timer) {
//             clearTimeout(timer);
//         }
//         timer = setTimeout(() => {
//             callback(e.target.value);
//         }, delay);
//     }
// }

function Friends() {
    const [showFriends, setShowFriends] = useState(true);
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [showFriendRequests, setShowFriendRequests] = useState(false);
    const [myFriends, setMyFriends] = useState([]);
    const [searchedFriend, setSearchedFriend] = useState("");
    const [searchedFriendsList, setSearchedFriendsList] = useState();
    const notify = (message) => toast(message);
    const [buttonText, setButtonText] = useState('Add Friend');
    const [refresh, setRefresh] = useState(false);
    const [myFriendRequests, setMyFriendRequests] = useState([]);
    const { user } = useSelector((state) => state.authReducer);
    //trying query params
    async function getFriendRequests() {
        try {
            const res = await api.get('/user/friendRequests');
            setMyFriendRequests(res.data.friendRequests);
        } catch (err) {
            console.log(err);
        }
    }
    async function getAllFriends() {
        try {
            const res = await api.get('/user/friends');
            setMyFriends(res.data.friends);
            console.log(res.data.friends, "friends");
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        connectSocket();
        socket.emit('user:online', user._id);
        getFriendRequests();
        getAllFriends();
    }, [refresh]);
    async function findUser(e) {
        e.preventDefault();
        try {
            //console.log(name, "searched name");
            const res = await api.get(`/user/search?name=${searchedFriend}`);
            //console.log(res);
            console.log(res.data);
            setSearchedFriendsList(res.data);
            setSearchedFriend("");
        } catch (err) {
            if (err.response.status === 400) {
                //console.log('Inside if ')
                toast.info("You cannot add yourself as a friend.");
            } else if (err.response.status === 401) {
                toast.error('User Not found');
            } else {
                console.log('Inside else ')
                console.log(err);
            }
            setSearchedFriend("");
        }
    }
    //const handleSearchUser = debounce(searchUser, 500);

    async function sendFriendRequest(friendId, name) {
        setSearchedFriendsList("");
        try {
            const res = await api.post('/user/sendFriendRequest', { friendId, name });
            console.log(res);
            setButtonText('Request sent');
            notify(res.data.message);
        } catch (err) {
            console.log(err);
        }
    }

    async function acceptFriendRequest(id) {
        try {
            const res = await api.get(`/user/acceptFriendRequest/${id}`);
            setMyFriendRequests(res.data.friendRequests);
            notify(res.data.message);
        } catch (err) {
            console.log(err);
        }
    }
    async function rejectFriendRequest(id) {
        try {
            const res = await api.get(`/user/rejectFriendRequest/${id}`);
            setMyFriendRequests(res.data.friendRequests);
            notify(res.data.message);
        } catch (err) {
            console.log(err);
        }
    }
    console.log(myFriends, "my friends");
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
                    Friends
                </h1>

                <p className="mt-2 text-slate-500">
                    Manage your friends, requests and invite players.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">

                <button
                    onClick={() => {
                        getAllFriends();
                        setShowFriends(true);
                        setShowAddFriend(false);
                        setShowFriendRequests(false);
                    }}
                    className={`cursor-pointer rounded-xl px-6 py-3 font-semibold transition-all duration-300
            ${showFriends
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl"
                            : "bg-white hover:bg-indigo-50 border border-indigo-100"
                        }`}
                >
                    👥 My Friends
                </button>

                <button
                    onClick={() => {
                        setShowAddFriend(true);
                        setShowFriends(false);
                        setShowFriendRequests(false);
                    }}
                    className={`cursor-pointer rounded-xl px-6 py-3 font-semibold transition-all duration-300
            ${showAddFriend
                            ? "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-xl"
                            : "bg-white hover:bg-pink-50 border border-pink-100"
                        }`}
                >
                    ➕ Add Friend
                </button>

                <button
                    onClick={() => {
                        getFriendRequests();
                        setShowFriendRequests(true);
                        setShowAddFriend(false);
                        setShowFriends(false);
                    }}
                    className={`cursor-pointer relative rounded-xl px-6 py-3 font-semibold transition-all duration-300
            ${showFriendRequests
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl"
                            : "bg-white hover:bg-amber-50 border border-amber-100"
                        }`}
                >
                    📩 Friend Requests

                    {myFriendRequests?.length > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-lg">
                            {myFriendRequests.length}
                        </span>
                    )}
                </button>

            </div>

            {showFriends && (

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                    {myFriends.length ? (
                        myFriends.map((friend) => (

                            <div
                                key={friend.userId}
                                className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl"
                            >

                                <div className="flex items-center justify-between">

                                    <div>

                                        <h2 className="text-xl font-bold text-slate-800">
                                            {friend.name}
                                        </h2>

                                        <div className="mt-2">

                                            {friend.isOnline ? (
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                                                    🟢 Online
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-500">
                                                    ⚪ Offline
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                </div>

                                {friend.isOnline && (

                                    <button
                                        className="cursor-pointer mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-3 font-semibold
                                         text-white transition hover:scale-105
                                         disabled:cursor-not-allowed
                                         disabled:opacity-50
                                       disabled:hover:from-rose-500
                                       disabled:hover:to-red-600
                                         "
                                        disabled={friend.status === "In Room" || friend.status === "In Game" ? true : false}
                                    >
                                        {
                                            friend.status === "In Room" ? "In Room" : friend.status === "In Game" ? "In Game" : "🎮 Invite to Game"
                                        }
                                    </button>

                                )}

                            </div>

                        ))
                    ) : (

                        <div className="col-span-full rounded-3xl bg-white/70 p-10 text-center shadow-lg">

                            <h2 className="text-xl font-bold text-slate-700">
                                No Friends Yet
                            </h2>

                            <p className="mt-2 text-slate-500">
                                Search and add your friends to play together.
                            </p>

                        </div>

                    )}

                </div>

            )}

            {showAddFriend && (

                <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur">

                    <h2 className="mb-6 text-2xl font-bold">
                        Search Friend
                    </h2>

                    <form
                        onSubmit={findUser}
                        className="flex flex-col gap-4 sm:flex-row"
                    >

                        <input
                            type="text"
                            placeholder="Search by username..."
                            value={searchedFriend}
                            onChange={(e) => setSearchedFriend(e.target.value)}
                            className="flex-1 rounded-xl border border-slate-300 px-5 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300"
                        />

                        <button
                            type="submit"
                            className="cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-8 py-3 font-semibold text-white transition hover:scale-105"
                        >
                            Search
                        </button>

                    </form>

                    {searchedFriendsList && (

                        <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <h2 className="text-xl font-bold">
                                    {searchedFriendsList.name}
                                </h2>

                                {!searchedFriendsList.already ? (

                                    <button
                                        onClick={() =>
                                            sendFriendRequest(
                                                searchedFriendsList._id,
                                                searchedFriendsList.name
                                            )
                                        }
                                        disabled={buttonText === "Request sent"}
                                        className="cursor-pointer rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {buttonText}
                                    </button>

                                ) : (

                                    <button
                                        className="cursor-pointer rounded-xl bg-gray-300 px-6 py-3 font-semibold text-gray-700"
                                    >
                                        {searchedFriendsList.message}
                                    </button>

                                )}

                            </div>

                        </div>

                    )}

                </div>

            )}

            {showFriendRequests && (

                <div className="space-y-5">

                    {myFriendRequests?.length ? (

                        myFriendRequests?.map((fr) => (

                            <div
                                key={fr._id}
                                className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur sm:flex-row sm:items-center"
                            >

                                <div>

                                    <h2 className="text-xl font-bold text-slate-800">
                                        {fr.name}
                                    </h2>

                                    <p className="text-slate-500">
                                        wants to become your friend.
                                    </p>

                                </div>

                                <div className="flex gap-3">

                                    <button
                                        onClick={() => acceptFriendRequest(fr.userId)}
                                        className="cursor-pointer rounded-xl bg-green-500 px-5 py-2 font-semibold text-white transition hover:scale-105"
                                    >
                                        Accept
                                    </button>

                                    <button
                                        onClick={() => rejectFriendRequest(fr.userId)}
                                        className="cursor-pointer rounded-xl bg-red-500 px-5 py-2 font-semibold text-white transition hover:scale-105"
                                    >
                                        Reject
                                    </button>

                                </div>

                            </div>

                        ))

                    ) : (

                        <div className="rounded-3xl bg-white/70 p-10 text-center shadow-lg">

                            <h2 className="text-2xl font-bold text-slate-700">
                                📭 No Friend Requests
                            </h2>

                            <p className="mt-2 text-slate-500">
                                You're all caught up.
                            </p>

                        </div>

                    )}

                </div>

            )}

            <div className="flex justify-center">

                <button
                    className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
                    onClick={() => setRefresh(!refresh)}
                >
                    🔄 Refresh
                </button>

            </div>

            <ToastContainer />

        </div>
    )
}

export default Friends