import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/authSlice.js'
import urlSlice from '../features/urlSlice.js'

const store = configureStore({
    reducer: {
        auth: authReducer,
        url:urlSlice
    }
});

export default store;