import { createSlice } from '@reduxjs/toolkit';

const watchListSlice = createSlice({
  name: 'watchlist',
  initialState: [],
  reducers: {
    setWatchlist: (state, action) => action.payload,
    addToWatchlist: (state, action) => {
      state.push(action.payload);
    },
    removeFromWatchlist: (state, action) => {
      return state.filter(coin => coin.id !== action.payload);
    },
    clearWatchlist: () => {
      return [];
    },
  },
});

export const { setWatchlist, addToWatchlist, removeFromWatchlist, clearWatchlist } = watchListSlice.actions;
export default watchListSlice.reducer;
