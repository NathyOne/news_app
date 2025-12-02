import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { newsAPI } from '../../services/api';

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await newsAPI.getNews(params);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || { message: error.message };
      if (error.code === 'ERR_NETWORK' || !error.response) {
        errorData.message = 'Cannot connect to backend server. Please make sure it is running at http://localhost:8000';
      }
      return rejectWithValue(errorData);
    }
  }
);

export const fetchNewsFromAPI = createAsyncThunk(
  'news/fetchNewsFromAPI',
  async (data = {}, { rejectWithValue }) => {
    try {
      const response = await newsAPI.fetchNews(data);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || { message: error.message };
      if (error.code === 'ERR_NETWORK' || !error.response) {
        errorData.message = 'Cannot connect to backend server. Please make sure it is running at http://localhost:8000';
      }
      return rejectWithValue(errorData);
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    items: [],
    loading: false,
    error: null,
    count: 0,
    next: null,
    previous: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || action.payload;
        state.count = action.payload.count || action.payload.length;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'An unknown error occurred' };
      })
      .addCase(fetchNewsFromAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsFromAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || [];
        state.count = action.payload.count || 0;
      })
      .addCase(fetchNewsFromAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'An unknown error occurred' };
      });
  },
});

export const { clearError } = newsSlice.actions;
export default newsSlice.reducer;

