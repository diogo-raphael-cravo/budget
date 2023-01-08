import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../Store';
import { v4 } from 'uuid';
import entries from '../data/expenses';

export type ExpenseEntry = {
  id: string,
  day: number,
  month: number,
  year: number,
  value: number,
  account: string,
  category: string,
  subcategory: string,
  description?: string,
};

interface BudgetEntriesState {
  entries: ExpenseEntry[],
};

const initialState: BudgetEntriesState = {
    entries: entries.map(entry => ({ ...entry, id: v4() })),
};

export const expenseEntriesSlice = createSlice({
  name: 'expenseEntriesSlice',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {},
})

export function filterExpenseEntries(entries: ExpenseEntry[], year: number, month: number): ExpenseEntry[] {
  return entries.filter(entry => (entry.year === year || 0 === year)
    && (entry.month === month || 0 === month));
}

// Other code such as selectors can use the imported `RootState` type
export const selectExpenseEntries = (state: RootState) => state.expenseEntriesSlice.entries;

export default expenseEntriesSlice.reducer;