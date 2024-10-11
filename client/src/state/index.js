import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    user: null,
    token: null,
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLogIn: (state, action) => {
            state.user = action.payload;
            state.token = action.payload;
        },
        setLogout: (state) => {
          state.user = null;
          state.token = null;
        },
        setFriends: (state, action) => {
          if(state.user){
            state.user.friends = action.payload.friends;
          }else {
            console.error("User Freinds none-existent :( ")
          }
        },
        setUsers: (state, action) => {
           const updatedFriend = state.user.friends.map((friend) => {
            if(friend._id === action.payload.friend._id) return action.payload.friend;
            return friend;
           })
           state.user.firneds = updatedFriend;
        }
    }
})

export const { setMode, setFriends, setLogIn, setLogout, setUsers } = authSlice.actions;

export default authSlice.reducer;