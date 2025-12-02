import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { alertsAPI } from '../../services/api';

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.getAlerts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createAlert = createAsyncThunk(
  'alerts/createAlert',
  async (data, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.createAlert(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateAlert = createAsyncThunk(
  'alerts/updateAlert',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.updateAlert(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteAlert = createAsyncThunk(
  'alerts/deleteAlert',
  async (id, { rejectWithValue }) => {
    try {
      await alertsAPI.deleteAlert(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const testAlert = createAsyncThunk(
  'alerts/testAlert',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.testAlert(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const processAllAlerts = createAsyncThunk(
  'alerts/processAllAlerts',
  async (data = {}, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.processAllAlerts(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    items: [],
    loading: false,
    error: null,
    testResult: null,
    processResult: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTestResult: (state) => {
      state.testResult = null;
    },
    clearProcessResult: (state) => {
      state.processResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAlert.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateAlert.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(testAlert.fulfilled, (state, action) => {
        state.testResult = action.payload;
      })
      .addCase(processAllAlerts.fulfilled, (state, action) => {
        state.processResult = action.payload;
      });
  },
});

export const { clearError, clearTestResult, clearProcessResult } = alertsSlice.actions;
export default alertsSlice.reducer;

