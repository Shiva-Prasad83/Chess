import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    invites: []
};

const friendInviteSlice = createSlice({
    name: 'friendInviteSlice',
    initialState,
    reducers: {
        gotInvite: (state, action) => {
            console.log(action.payload, "Checking action payload");
            let invite = {
                from: action.payload.from,
                fromUserId: action.payload.fromUserId,
                roomCode: action.payload.roomCode,
                fromSocketId: action.payload.fromSocketId
            }
            state.invites.push(invite);
        },
        removeInvite: (state, action) => {
            //console.log(action.payload, "payload");
            let index = action.payload;
            state.invites.splice(index, 1);
        }
    }
});

export const { gotInvite, removeInvite } = friendInviteSlice.actions;
export default friendInviteSlice.reducer;