import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useEffect } from 'react';
function Profile() {
    const [profile, setProfile] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [user, setUser] = useState([]);
    const [matches, setMatches] = useState([]);
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
        try {
            const matches = await api.get(`/auth/getMatches/${user._id}`);
            setMatches(matches);
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
        <div>

            {/* User Details Sections */}
            <div className='border-2 border-black p-4'>
                <div className='flex gap-8'>
                    {/* Profile Image */}
                    <div className='w-30 h-30 border-2 border-black rounded-2xl'>
                        <img src={user.avatar ? user.avatar : ""} className='object-cover w-full h-full rounded-2xl' />
                    </div>
                    {/* Details Div */}
                    <div className='flex flex-col gap-4'>
                        <h1>{user.name}</h1>
                        <h1>{user.email}</h1>
                        <input type='file' accept='image/*'
                            onChange={uploadProfile}
                            name='profileImage'
                            id='profileImage'
                            className='hidden'
                        />
                        <label htmlFor="profileImage" className='bg-blue-500 p-2 rounded-2xl cursor-pointer text-white'>
                            Change Avatar
                        </label>
                    </div>
                </div>
            </div>

            {/* User Stats */}
            <div>
                <h1>User Stats</h1>

                <div>
                    <div>
                        Rating: {user?.stats?.rating}
                    </div>
                    <div>
                        Games Played:{user?.stats?.gamesPlayed}
                    </div>
                    <div>
                        Wins: {user?.stats?.wins}
                    </div>
                    <div>
                        Loses {user?.stats?.loses}
                    </div>

                    <div>
                        Draws: {user?.stats?.draws}
                    </div>
                </div>
            </div>

            <div>

                <div>

                </div>

                {/* Recent Matches */}
                <div onClick={fetchMatches} className='cursor-pointer'>
                    View Recent Matches
                </div>

            </div>

        </div>
    )
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