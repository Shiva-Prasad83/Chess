import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';
function Profile() {
    const { user } = useSelector((state) => state.authReducer);
    const [profile, setProfile] = useState("");
    function uploadProfile(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("profile", profile);
    }
    return (
        <div>
            <h1>{user.name}</h1>
            <form onSubmit={uploadProfile}>
                <input type="file" onChange={(e) => setProfile(e.target.files[0])} accept='image/*' required />
                <button type='submit'>Upload</button>
            </form>
        </div>
    )
}

export default Profile