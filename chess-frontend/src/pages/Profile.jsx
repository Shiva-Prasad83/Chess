import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';
import api from '../api/client';
function Profile() {
    const { user } = useSelector((state) => state.authReducer);
    const [profile, setProfile] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    async function uploadProfile(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("profile", profile);
        const res = await api.post('/upload', formData);
        // console.log(res);
        setImageUrl(res.data.profileImageUrl);
    }
    return (
        <div>
            <h1>{user.name}</h1>
            <div>
                {!imageUrl ? <form onSubmit={uploadProfile}>
                    <input type="file" onChange={(e) => setProfile(e.target.files[0])} accept='image/*' required name='profile' />
                    <button type='submit'>Upload</button>
                </form> :
                    <div className='w-20 h-10'>
                        <img src={imageUrl} />
                    </div>
                }
            </div>

        </div>
    )
}

export default Profile