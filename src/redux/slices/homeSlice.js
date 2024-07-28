import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithCache } from '@/lib/api';

export const fetchGlobalMarketCap = createAsyncThunk(
  'home/fetchGlobalMarketCap',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithCache('https://api.coingecko.com/api/v3/global');
      const marketCapData = response.data.total_market_cap;
      const formattedData = Object.entries(marketCapData).map(([currency, value]) => ({
        currency,
        marketCap: value
      }));

      return formattedData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPublicCompaniesHoldings = createAsyncThunk(
  'home/fetchPublicCompaniesHoldings',
  async (_, { rejectWithValue }) => {
    try {
      const mockData = [
        { name: 'Million Token', bitcoin: 100000, ethereum: 2000000 },
        { name: 'Polygon', bitcoin: 100, ethereum: 200 },
        { name: 'Solana', bitcoin: 120, ethereum: 240 },
      ];
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    globalMarketCap: [],
    publicCompaniesHoldings: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalMarketCap.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGlobalMarketCap.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.globalMarketCap = action.payload;
      })
      .addCase(fetchGlobalMarketCap.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchPublicCompaniesHoldings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPublicCompaniesHoldings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.publicCompaniesHoldings = action.payload;
      })
      .addCase(fetchPublicCompaniesHoldings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export default homeSlice.reducer;
