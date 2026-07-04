import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import api from '../api/client';
import { ToastContainer, toast } from 'react-toastify';
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

    const [myFriendRequests, setMyFriendRequests] = useState([]);
    // async function getMyFriends() {
    //     try {

    //     } catch (err) {
    //         console.log(err);
    //     }
    // }
    // useEffect(() => {
    //     getMyFriends();
    // }, [])

    //trying query params
    async function getFriendRequests() {
        try {
            const res = await api.get('/user/friendRequests');
            setMyFriendRequests(res.data.friendRequests);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getFriendRequests();
    }, [])
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
    return (
        <div>
            <div className='flex gap-8'>
                <button
                    className='bg-blue-500 p-2 rounded-xl cursor-pointer text-white'
                    onClick={() => {
                        setShowFriends(true);
                        setShowAddFriend(false);
                        setShowFriendRequests(false);
                    }}>My Friends</button>
                <button
                    className='bg-blue-500 p-2 rounded-xl cursor-pointer text-white'
                    onClick={() => {
                        setShowAddFriend(true);
                        setShowFriends(false);
                        setShowFriendRequests(false);
                    }}

                >Add Friends</button>
                <div className='relative'>
                    <button
                        className='bg-blue-500 p-2 rounded-xl cursor-pointer text-white'
                        onClick={() => {
                            getFriendRequests();
                            setShowFriendRequests(true);
                            setShowAddFriend(false);
                            setShowFriends(false);
                        }}>Friend Requests</button>
                    <h1 className='absolute h-6 w-4 text-center text-white font-bold rounded-full bg-red-500 -top-5 right-0'>{myFriendRequests.length}</h1>
                </div>
            </div>
            <div>

                {showFriends && <div>
                    {

                    }
                </div>}

                {showAddFriend && <div>
                    Add Friend
                    <form onSubmit={findUser}>
                        <input type="text" placeholder='Search Friend by Username'
                            onChange={(e) => setSearchedFriend(e.target.value)}
                            value={searchedFriend}
                        />
                        <button type='submit'>Search</button>
                    </form>

                    {
                        searchedFriendsList ? <div>

                            <div className='flex gap-4'>
                                <p>{searchedFriendsList.name}</p>
                                {!searchedFriendsList.already ? <button className='bg-blue-400 p-2 text-white rounded-2xl cursor-pointer'
                                    onClick={() => sendFriendRequest(searchedFriendsList._id, searchedFriendsList.name)}
                                    disabled={buttonText === "Request sent" ? true : false}
                                >{buttonText}</button> : <button className='bg-blue-400 p-2 text-white rounded-2xl cursor-pointer'
                                >{searchedFriendsList.message}</button>}
                            </div>
                        </div> : ""
                    }
                </div>}

                {
                    showFriendRequests && <div>

                        {
                            myFriendRequests?.length ? <div>
                                {
                                    myFriendRequests?.map((fr) => {
                                        return (
                                            <div key={fr._id} className='flex gap-4'>
                                                <p>{fr.name}</p>
                                                <button
                                                    className='cursor-pointer'
                                                    onClick={() => {
                                                        acceptFriendRequest(fr.userId);
                                                    }}>Accept</button>
                                                <button
                                                    className='cursor-pointer'
                                                    onClick={() => {
                                                        rejectFriendRequest(fr.userId)
                                                    }}>Reject</button>
                                            </div>
                                        )
                                    })
                                }
                            </div> :

                                <div>
                                    No Friend Requests
                                </div>
                        }

                    </div>
                }

                <button className='bg-green-500 text-white p-2 rounded-xl cursor-pointer'>Refresh</button>
            </div>
            <ToastContainer />
        </div>
    )
}

export default Friends