import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { filtersAPI } from '../../services/api';

export const fetchFilters = createAsyncThunk(
  'filters/fetchFilters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await filtersAPI.getFilters();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createFilter = createAsyncThunk(
  'filters/createFilter',
  async (data, { rejectWithValue }) => {
    try {
      const response = await filtersAPI.createFilter(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFilter = createAsyncThunk(
  'filters/updateFilter',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await filtersAPI.updateFilter(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFilter = createAsyncThunk(
  'filters/deleteFilter',
  async (id, { rejectWithValue }) => {
    try {
      await filtersAPI.deleteFilter(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const applyFilter = createAsyncThunk(
  'filters/applyFilter',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await filtersAPI.applyFilter(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filteredNews: [],
    filteredCount: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearFilteredNews: (state) => {
      state.filteredNews = [];
      state.filteredCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || action.payload;
      })
      .addCase(fetchFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createFilter.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateFilter.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteFilter.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(applyFilter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyFilter.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredNews = action.payload.results || [];
        state.filteredCount = action.payload.count || 0;
      })
      .addCase(applyFilter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearFilteredNews } = filtersSlice.actions;
export default filtersSlice.reducer;

