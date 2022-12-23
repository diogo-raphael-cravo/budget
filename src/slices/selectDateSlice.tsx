import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../Store';

interface SelectedDateState {
  year: number,
  month: number,
};

const initialState: SelectedDateState = {
    year: 0,
    month: 0,
};

export const selectDateSlice = createSlice({
  name: 'selectDateSlice',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setYear: (state, action: PayloadAction<number>) => {
        state.year = action.payload;
    },
    setMonth: (state, action: PayloadAction<number>) => {
        state.month = action.payload;
    },
  },
})

export const { setYear, setMonth } = selectDateSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectYear = (state: RootState) => state.selectDateSlice.year;
export const selectMonth = (state: RootState) => state.selectDateSlice.month;

export default selectDateSlice.reducer;