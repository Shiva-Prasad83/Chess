import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';
function Profile() {
    const { user } = useSelector((state) => state.authReducer);
    return (
        <div>
            <h1>{user.name}</h1>
        </div>
    )
}

export default Profile