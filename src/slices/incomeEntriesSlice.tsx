import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../Store';
import entries from '../data/income';

export type IncomeEntry = {
  day: number,
  month: number,
  year: number,
  value: number,
  source: string,
};

interface IncomeEntriesState {
  entries: IncomeEntry[],
};

const initialState: IncomeEntriesState = {
    entries,
};

export const incomeEntriesSlice = createSlice({
  name: 'incomeEntriesSlice',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {},
})

export function filterIncomeEntries(entries: IncomeEntry[], year: number, month: number): IncomeEntry[] {
  return entries.filter(entry => (entry.year === year || 0 === year)
    && (entry.month === month || 0 === month));
}

// Other code such as selectors can use the imported `RootState` type
export const selectIncomeEntries = (state: RootState) => state.incomeEntriesSlice.entries;

export default incomeEntriesSlice.reducer;