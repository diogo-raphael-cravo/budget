import React from 'react';
import { Select } from 'antd';
import { useAppSelector, useAppDispatch } from './Hooks';
import { selectYear, selectMonth, setMonth, setYear } from './slices/selectDateSlice';
import entries, { BudgetEntry } from './data';

function getAllYears(data: BudgetEntry[]): number[] {
    const years: number[] = [];
    data.forEach(entry => {
        if (undefined === years.find(year => entry.year === year)) {
            years.push(entry.year);
        }
    });
    return years;
}

function getAllMonthsPerYear(data: BudgetEntry[], year: number): number[] {
    const months: number[] = [];
    data.forEach(entry => {
        if (entry.year !== year) {
            return;
        }
        if (undefined === months.find(month => entry.month === month)) {
            months.push(entry.month);
        }
    });
    return months;
}

function getAllDaysPerMonthPerYear(data: BudgetEntry[], year: number, month: number): number[] {
    const days: number[] = [];
    data.forEach(entry => {
        if (entry.year !== year) {
            return;
        }
        if (entry.month !== month) {
            return;
        }
        if (undefined === days.find(day => entry.day === day)) {
            days.push(entry.day);
        }
    });
    return days;
}

export function MonthValueToLabel(value: number): string {
    switch (value) {
        case 1: return 'Janeiro';
        case 2: return 'Fevereiro';
        case 3: return 'Março';
        case 4: return 'Abril';
        case 5: return 'Maio';
        case 6: return 'Junho';
        case 7: return 'Julho';
        case 8: return 'Agosto';
        case 9: return 'Setembro';
        case 10: return 'Outubro';
        case 11: return 'Novembro';
        case 12: return 'Dezembro';
        default: return 'Erro';
    }
}

function SelectDate() {
    const dispatch = useAppDispatch();

    const year = useAppSelector(selectYear);
    const yearOptions = getAllYears(entries);
    if (undefined === yearOptions.find(option => option === year)) {
        dispatch(setYear(yearOptions[0]));
    }
    const handleChangeYear = (value: number) => {
        dispatch(setYear(value));
    };

    const month = useAppSelector(selectMonth);
    const monthOptions = getAllMonthsPerYear(entries, year);
    if (undefined === monthOptions.find(option => option === month)) {
        dispatch(setMonth(monthOptions[0]));
    }
    const handleChangeMonth = (value: number) => {
        dispatch(setMonth(value));
    };
    
    return <div>
         <Select
            value={year}
            style={{ width: 120 }}
            onChange={handleChangeYear}
            options={yearOptions.map(option => ({
                value: option,
                label: option,
            }))}
        />
        <Select
            value={month}
            style={{ width: 120 }}
            onChange={handleChangeMonth}
            options={monthOptions.map(option => ({
                value: option,
                label: MonthValueToLabel(option),
            }))}
        />
    </div>;
}

export default SelectDate;