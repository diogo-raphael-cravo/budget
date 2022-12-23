import { configureStore } from '@reduxjs/toolkit';

import selectDateSlice from './slices/selectDateSlice';

export const store = configureStore({
  reducer: {
    selectDateSlice,
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;