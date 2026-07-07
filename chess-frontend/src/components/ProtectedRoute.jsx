import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoadingPage from './LoadingPage';
function ProtectedRoute() {
    const { user, authChecked } = useSelector((state) => state.authReducer);
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


    if (!authChecked) {
        return <LoadingPage heading={'Loading User Details'} para={'Please wait'} />
    }
    if (!user) {
        return <Navigate to="/login" />
    }
    return (
        <div>
            <Outlet />
        </div>
    )
}

export default ProtectedRoute