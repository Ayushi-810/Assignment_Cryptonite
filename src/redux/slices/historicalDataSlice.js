import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://api.coingecko.com/api/v3';

export const fetchHistoricalData = createAsyncThunk('historicalData/fetchHistoricalData', async (_, { rejectWithValue }) => {
  try {
    const coins = ['bitcoin', 'ethereum', 'binancecoin'];
    const days = '30'; 
    const promises = coins.map((coin) =>
      axios.get(`${API_URL}/coins/${coin}/market_chart`, 
        {
          params: {
            vs_currency: 'usd',
            days: days,
            api_key: 'CG-byTzA9vQnMTod9y15ee11Lg3',
          },
        })
    );

    const responses = await Promise.all(promises);
    const data = responses.map((response, index) => ({
      name: coins[index],
      prices: response.data.prices,
    }));

    console.log('Fetched Data:', data); // Debug log

    return data;
  } catch (error) {
    console.error('Error fetching data:', error); // Debug log
    if (!error.response) {
      throw error;
    }
    return rejectWithValue(error.response.data);
  }
});

const historicalDataSlice = createSlice({
  name: 'historicalData',
  initialState: {
    data: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistoricalData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHistoricalData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchHistoricalData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export default historicalDataSlice.reducer;
