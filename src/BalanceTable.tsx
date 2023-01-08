import React from 'react';
import { Table as AntTable } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import SelectDate, { monthValueToLabel } from './SelectDate';
import { useAppSelector } from './Hooks';
import { selectYear, selectMonth } from './slices/selectDateSlice';
import { selectExpenseEntries, ExpenseEntry, filterExpenseEntries } from './slices/expenseEntriesSlice';
import { selectIncomeEntries, IncomeEntry, filterIncomeEntries } from './slices/incomeEntriesSlice';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function makeColumns(): ColumnsType<EntryType> {
    return [{
        title: 'Mês',
        dataIndex: 'month',
        render: text => monthValueToLabel(text),
        sorter: (a, b) => a.month - b.month,
        sortDirections: ['descend', 'ascend'],
    }, {
        title: 'Ano',
        dataIndex: 'year',
        sorter: (a, b) => a.year - b.year,
        sortDirections: ['descend', 'ascend'],
    }, {
        title: 'Entrada (R$)',
        dataIndex: 'income',
        sorter: (a, b) => a.income - b.income,
        render: text => text.toLocaleString(),
        sortDirections: ['descend', 'ascend'],
    }, {
        title: 'Saída (R$)',
        dataIndex: 'expense',
        sorter: (a, b) => a.expense - b.expense,
        render: text => text.toLocaleString(),
        sortDirections: ['descend', 'ascend'],
    }, {
        title: 'Balanço (R$)',
        dataIndex: 'balance',
        sorter: (a, b) => a.balance - b.balance,
        render: text => {
            if (0 < parseFloat(text)) {
                return <div style={{ color: '#3f8600' }}>{text.toLocaleString()} <ArrowUpOutlined /></div>
            } else {
                return <div style={{ color: '#cf1322' }}>{text.toLocaleString()} <ArrowDownOutlined /></div>
            }
        },
        sortDirections: ['descend', 'ascend'],
    }, {
        title: '%',
        dataIndex: 'percentage',
        sorter: (a, b) => a.balance - b.balance,
        render: text => {
            if (100 >= parseFloat(text)) {
                return <div style={{ color: '#3f8600' }}>{text.toFixed(2)} %</div>
            } else {
                return <div style={{ color: '#cf1322' }}>{text.toFixed(2)} %</div>
            }
        },
        sortDirections: ['descend', 'ascend'],
    }];
}

function makeLineData(entries: EntryType[]): ChartData<"line", number[], string> {
    return {
        labels: entries.map(entry => `${entry.month}/${entry.year}`),
        datasets: [{
            label: 'Entrada',
            data: entries.map(entry => entry.income),
            borderColor: 'rgb(99, 255, 132)',
            backgroundColor: 'rgba(204, 255, 153, 0.5)',
        }, {
            label: 'Saída',
            data: entries.map(entry => entry.expense),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 102, 102, 0.5)',
        }, {
            label: 'Balanço',
            data: entries.map(entry => entry.balance),
            borderColor: 'rgba(102, 153, 153, 1)',
            backgroundColor: 'rgba(102, 153, 153, 0.5)',
        }, {
            label: 'Balanço acumulado',
            data: entries.map((_, index) => entries.slice(0, index + 1).reduce((prev, curr) => prev + curr.balance, 0)),
            borderColor: 'rgb(50, 50, 50)',
            backgroundColor: 'rgba(100, 100, 100, 0.5)',
        }],
    }
}

type EntryType = {
    id: string,
    month: number,
    year: number,
    expense: number,
    income: number,
    balance: number,
    percentage: number,
};

function Table() {
    const year = useAppSelector(selectYear);
    const month = useAppSelector(selectMonth);

    const expenseEntries = useAppSelector(selectExpenseEntries);
    let filteredExpenseEntries = filterExpenseEntries(expenseEntries, year, month);
    const aggregatedExpenses: ExpenseEntry[] = filteredExpenseEntries.reduce((prev: ExpenseEntry[], curr: ExpenseEntry) => {
        const thisMonth = prev.find(entry => entry.month === curr.month && entry.year === curr.year);
        if (!thisMonth) {
            prev.push({...curr});
            return prev;
        }
        thisMonth.value += curr.value;
        return prev;
    }, []);
    
    const incomeEntries = useAppSelector(selectIncomeEntries);
    let filteredIncomeEntries = filterIncomeEntries(incomeEntries, year, month);
    const aggregatedIncome: IncomeEntry[] = filteredIncomeEntries.reduce((prev: IncomeEntry[], curr: IncomeEntry) => {
        const thisMonth = prev.find(entry => entry.month === curr.month && entry.year === curr.year);
        if (!thisMonth) {
            prev.push({...curr});
            return prev;
        }
        thisMonth.value += curr.value;
        return prev;
    }, []);

    const entries: EntryType[] = aggregatedExpenses.map(expense => {
        const entry: EntryType = {
            id: `${expense.month}-${expense.year}`,
            month: expense.month,
            year: expense.year,
            expense: expense.value,
            balance: 0,
            percentage: 0,
            income: 0,
        };
        const incomeThisMonth = aggregatedIncome.find(income => income.month === expense.month && income.year === expense.year);
        if (incomeThisMonth) {
            entry.income = incomeThisMonth.value;
        }
        entry.balance = entry.income - entry.expense;
        entry.percentage = entry.income ? (100 * entry.expense / entry.income) : 0;
        return entry;
    });

    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: 'Balanço',
          },
        },
    };
    return <div>
        <SelectDate/>
        <Line options={options} data={makeLineData(entries)} />
        <AntTable rowKey={'id'} columns={makeColumns()} dataSource={entries} style={{ marginTop: 50 }}/>
    </div>;
}

export default Table;