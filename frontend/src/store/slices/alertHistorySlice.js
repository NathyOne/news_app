import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { alertHistoryAPI } from '../../services/api';

export const fetchAlertHistory = createAsyncThunk(
  'alertHistory/fetchAlertHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await alertHistoryAPI.getAlertHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const alertHistorySlice = createSlice({
  name: 'alertHistory',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlertHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlertHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || action.payload;
      })
      .addCase(fetchAlertHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = alertHistorySlice.actions;
export default alertHistorySlice.reducer;

