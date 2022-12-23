import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../Store';
import entries from '../data';

export type BudgetEntry = {
  day: number,
  month: number,
  year: number,
  value: number,
  account: string,
  category: string,
  description?: string,
};

interface BudgetEntriesState {
  entries: BudgetEntry[],
};

const initialState: BudgetEntriesState = {
    entries,
};

export const budgeEntriesSlice = createSlice({
  name: 'budgeEntriesSlice',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {},
})

export function filterEntries(entries: BudgetEntry[], year: number, month: number): BudgetEntry[] {
  return entries.filter(entry => (entry.year === year || 0 === year)
    && (entry.month === month || 0 === month));
}

// Other code such as selectors can use the imported `RootState` type
export const selectEntries = (state: RootState) => state.budgetEntriesSlice.entries;

export default budgeEntriesSlice.reducer;