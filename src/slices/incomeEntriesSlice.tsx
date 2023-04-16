import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../Store';
import entries from '../data/income';
import { v4 } from 'uuid';

export type IncomeEntry = {
  id: string,
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
  entries: entries.map(entry => ({ ...entry, id: v4() })),
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
export function getMonths(entries: IncomeEntry[]): number {
  const makeDate = (year: number, month: number, day: number) => new Date(`${year}/${month}/${day}`);
  const makeDateFromIncome = (income: IncomeEntry) => makeDate(income.year, income.month, income.day);
  const before = (dateA: IncomeEntry, dateB: IncomeEntry) => makeDateFromIncome(dateA).getTime() < makeDateFromIncome(dateB).getTime();
  const after = (dateA: IncomeEntry, dateB: IncomeEntry) => makeDateFromIncome(dateA).getTime() > makeDateFromIncome(dateB).getTime();
  const firstEntry = entries.reduce((prev, curr) => before(prev, curr) ? prev : curr, entries[0]);
  const lastEntry = entries.reduce((prev, curr) => after(prev, curr) ? prev : curr, entries[0]);
  // source: https://stackoverflow.com/questions/2536379/difference-in-months-between-two-dates-in-javascript
  const differenceInMonths = (first: Date, second: Date) => {
    let months = (second.getFullYear() - first.getFullYear()) * 12;
    if (0 === months && first.getMonth() !== second.getMonth()) {
      months = 1;
    }
    months -= first.getMonth();
    months += second.getMonth();
    return months <= 0 ? 0 : months;
  }
  return differenceInMonths(makeDateFromIncome(firstEntry), makeDateFromIncome(lastEntry));
}
export function getMeanIncomeEntries(entries: IncomeEntry[], parts: number): number {
  const total = entries.reduce((prev, curr) => prev + curr.value, 0);
  if (0 === parts) {
    return total;
  }
  return total / parts;
}

// Other code such as selectors can use the imported `RootState` type
export const selectIncomeEntries = (state: RootState) => state.incomeEntriesSlice.entries;

export default incomeEntriesSlice.reducer;