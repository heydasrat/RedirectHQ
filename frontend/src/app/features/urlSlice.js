import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  urlArr: [],
  isUrlLoading: false,
  urlError: "",
};

const urlSlice = createSlice({
  name: "url",

  initialState,

  reducers: {
    setUrls: (state, action) => {
      state.urlArr = action.payload;
    },

    addUrl: (state, action) => {
      state.urlArr.unshift(action.payload);
    },

    updateUrlInStore: (state, action) => {
      const index = state.urlArr.findIndex(
        (url) => url.shortCode === action.payload.shortCode
      );

      if (index !== -1) {
        state.urlArr[index] = action.payload;
      }
    },

    removeUrlFromStore: (state, action) => {
      state.urlArr = state.urlArr.filter(
        (url) => url.shortCode !== action.payload
      );
    },

    setUrlLoading: (state, action) => {
      state.isUrlLoading = action.payload;
    },

    setUrlError: (state, action) => {
      state.urlError = action.payload;
    },

    clearUrls: (state) => {
      state.urlArr = [];
    },
  },
});

export const {
  setUrls,
  addUrl,
  updateUrlInStore,
  removeUrlFromStore,
  setUrlLoading,
  setUrlError,
  clearUrls,
} = urlSlice.actions;

export default urlSlice.reducer;