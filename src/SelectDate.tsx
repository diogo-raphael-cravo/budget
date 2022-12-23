import React, { useState } from 'react';
import { Select } from 'antd';
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

function MonthValueToLabel(value: number): string {
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
    const yearOptions = getAllYears(entries);

    const [year, selectYear] = useState(yearOptions[0]);
    const handleChangeYear = (value: number) => {
        selectYear(value);
    };

    const monthOptions = getAllMonthsPerYear(entries, year);
    const [month, selectMonth] = useState(monthOptions[0]);
    const handleChangeMonth = (value: number) => {
        selectMonth(value);
    };
    
    return <div>
         <Select
            defaultValue={yearOptions[0]}
            style={{ width: 120 }}
            onChange={handleChangeYear}
            options={yearOptions.map(option => ({
                value: option,
                label: option,
            }))}
        />
        <Select
            defaultValue={monthOptions[0]}
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