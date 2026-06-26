import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/client";
import { socket } from "../socket";
export const login = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
    try {
        const res = await api.post('auth/login',
            { email, password }
        )
        console.log(res.data, 'login res from api');
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || "login failed");
    }
})

export const signup = createAsyncThunk('auth/signup', async ({ name, email, password }, thunkAPI) => {
    try {
        const res = await api.post('auth/signup', {
            name, email, password
        });
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || "signup failed");
    }
})

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
    try {
        socket.disconnect();
        const res = await api.post('auth/logout');
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || "logout failed");
    }
})

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, thunkAPI) => {
    try {
        const res = await api.get('auth/me');
        //console.log(res.data.user, "user infetchMe");
        return res.data.user;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || "fetchMe failed");
    }
})

export const refresh = createAsyncThunk('auth/refresh', async (_, thunkAPI) => {
    try {
        const res = await api.post('auth/refresh');
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || "refresh failed");
    }
})
const initialState = {
    user: null,
    status: 'idle',
    error: null,
    authChecked: false
}

console.log(initialState, 'initial State');
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        function pending(state) {
            state.status = 'pending'
            state.error = null
        }
        function rejected(state, action) {
            state.user = null;
            state.status = 'error';
            state.error = action.payload;
        }
        function fulfilled(state, action) {
            state.status = 'success';
            state.error = null;
        }
        builder
            .addCase(login.pending, pending)
            .addCase(login.fulfilled, fulfilled)
            .addCase(login.rejected, rejected)
            .addCase(signup.pending, pending)
            .addCase(signup.fulfilled, fulfilled)
            .addCase(signup.rejected, rejected)
            .addCase(logout.pending, pending)
            .addCase(logout.fulfilled, (state) => {
                state.status = "success";
                state.user = null;
                state.error = null;
                // state.authChecked = true;
            })
            .addCase(logout.rejected, rejected)
            .addCase(fetchMe.pending, pending)
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.status = "success";
                console.log(action.payload, "User in slice");
                state.user = action.payload;
                state.error = null;
                state.authChecked = true;
            })
            .addCase(fetchMe.rejected, (state, action) => {
                state.status = "error";
                state.error = action.payload;
                state.user = null;
                state.authChecked = true;
            })

    }
})

console.log(authSlice.reducer, "authSlice Reducer");
export default authSlice.reducer;