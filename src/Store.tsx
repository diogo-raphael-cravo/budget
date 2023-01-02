import { configureStore } from '@reduxjs/toolkit';

import selectDateSlice from './slices/selectDateSlice';
import expenseEntriesSlice from './slices/expenseEntriesSlice';
import incomeEntriesSlice from './slices/incomeEntriesSlice';

export const store = configureStore({
  reducer: {
    selectDateSlice,
    expenseEntriesSlice,
    incomeEntriesSlice,
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;