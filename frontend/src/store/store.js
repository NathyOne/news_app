import { configureStore } from '@reduxjs/toolkit';
import newsReducer from './slices/newsSlice';
import filtersReducer from './slices/filtersSlice';
import alertsReducer from './slices/alertsSlice';
import alertHistoryReducer from './slices/alertHistorySlice';

export const store = configureStore({
  reducer: {
    news: newsReducer,
    filters: filtersReducer,
    alerts: alertsReducer,
    alertHistory: alertHistoryReducer,
  },
});

