import React, { useState } from 'react'
import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import LoadingPage from './LoadingPage';
import { useEffect } from 'react';
import { removeInvite } from '../slices/friendInviteSlice';
import { socket } from '../socket';
import { ToastContainer, toast } from 'react-toastify';
function ProtectedRoute() {
    const [totalInvites, setTotalInvites] = useState([]);
    const { user, authChecked } = useSelector((state) => state.authReducer);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const notify = (message) => toast(message);
    const { invites } = useSelector((state) => {
        //console.log(state.inviteFriendReducer, "Invite Friend Reducer");
        return state.inviteFriendReducer
    });
    //console.log(invites, "Testing gotFriendInvite");
    useEffect(() => {
        setTotalInvites(invites);
    }, [invites]);
    //After ten seconds we need to remove the invites from the invites slice and
    //we need to send the invite:rejected to the backend.

    //This is just for notifying purpose.
    useEffect(() => {
        const notification = (message) => {
            //console.log(message, "Notify message");
            notify(message);
        }
        socket.on('invite:reject', notification)
        function startGame(roomCode) {
            navigate(`/game/${roomCode}`);
        }
        socket.on('start:game', startGame);
        return () => {
            socket.off('invite"reject', notification)
            socket.off('start:game', startGame);
        }
    }, [])

    //console.log(user);

    //Step 1: First thing is this Lobby Page is Accessed after user is logged in.
    //That means in userSlice user is there and isAuthenticated is true

    //Step 2: If the page is reloaded manually by user, userSlice is reset to default
    //that means now user is null and isAuthencated is false.

    //Step 3: On every reload we are hitting fetchMe end point from App.jsx
    //that updates the userSlice and again we got user from database and isAuthenticated is true again.

    // ***** Understand this *****//
    //Within the gap of the getting user from database by hitting fetchMe endpoint our redux userSlice
    //was updated or reset that means components using that userSlice state will re-render
    //Now we are on /lobby route within this gap my user is null and isAuthenticated is false.
    //So this component is re-render and if don't skip this re-render It will redirected to login page.
    //So to skip this re-render I'm checking if the isAuthenticated is false then show loading.
    //isAuthenticated becomes false in lobby when page reloads

    //After getting the response the fetchMe api endpoint, Again redux userSlice state is updated
    //So this component is using userSlice state so it re-renders.
    //Now user is there and isAuthenticated is true So we'll access this component.

    if (totalInvites?.length) {
        totalInvites.forEach((invite, index) => {
            setTimeout(() => {
                dispatch(removeInvite(index));
            }, 8000);
        })
    }

    function acceptRequest(invite) {
        console.log(invite);
        socket.emit('invite:accept', invite.roomCode, (response) => {
            notify(response);
        })
    }
    function rejectRequest(invite, index) {
        let to = invite.fromSocketId;
        let from = user?.name;
        socket.emit('invite:rejected', invite.roomCode, to, from, (response) => {
            dispatch(removeInvite(index));
            notify(response);
        });
    }
    if (!authChecked) {
        return <LoadingPage heading={'Loading User Details'} para={'Please wait'} />
    }
    if (!user) {
        return <Navigate to="/login" />
    }
    return (
        <div>

            {totalInvites?.length ?
                //  <div className='flex gap-8 items-center'>
                //     <h1>Draw</h1>
                //     <button onClick={acceptDraw} className='bg-green-500 p-2 rounded-full cursor-pointer'>accept</button>
                //     <button onClick={rejectDraw} className='bg-red-500 p-2 rounded-full cursor-pointer'>reject</button>
                // </div> 
                <div className='flex flex-col items-center'>
                    {
                        totalInvites.map((invite, index) => {
                            return (
                                <div key={index} className="top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">
                                            Got Invite
                                        </h2>
                                        <p className="text-sm text-slate-400">
                                            {invite.from} is inviting for a match
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            className="cursor-pointer px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200 active:scale-95"
                                            onClick={() => acceptRequest(invite, index)}
                                        >
                                            ✓ Accept
                                        </button>

                                        <button
                                            className="cursor-pointer px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200 active:scale-95"
                                            onClick={() => rejectRequest(invite, index)}
                                        >
                                            ✕ Reject
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                : ""}
            <Outlet />
        </div>
    )
}

export default ProtectedRoute