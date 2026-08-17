import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import inviteFriendReducer from './slices/friendInviteSlice';
const store = configureStore({
    reducer: {
        authReducer,
        inviteFriendReducer
    }
})

export default store;