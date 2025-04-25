import { createSlice } from "@reduxjs/toolkit";

// Check if we have a token in localStorage on startup
const token = localStorage.getItem('token');

// Initial state for the user slice
const initialState = {
  currentUser: null,
  loading: false,
  error: false,
  isLoggedIn: !!token, // Set initial login state based on token existence
  token: token || null, // Include token in the state
};

// Create a slice of the Redux store for user management
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Action to indicate the start of the login process
    loginStart: (state) => {
      state.loading = true;
    },
    // Action to handle successful login
    loginSuccess: (state, action) => {
      state.loading = false;
      state.currentUser = action.payload;
      state.isLoggedIn = true;
      state.token = action.payload.token;
      
      // Ensure token is saved to localStorage
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
    },
    // Action to handle failed login attempts
    loginFailure: (state) => {
      state.loading = false;
      state.error = true;
    },
    // Action to handle user logout
    logout: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = false;
      state.token = null;
      
      // Clear token from localStorage
      localStorage.removeItem('token');
    },
    // Action to verify the current user
    verified: (state, action) => {
      if (state.currentUser) {
        state.currentUser.verified = action.payload;
      }
    },
    // Action to update the user's token
    updateToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
  },
});

// Exporting actions for use in components
export const { loginStart, loginSuccess, loginFailure, logout, verified, updateToken } = userSlice.actions;

export default userSlice.reducer;