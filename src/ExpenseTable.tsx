import React from 'react';
import { Table as AntTable } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SelectDate, { monthValueToLabel } from './SelectDate';
import { useAppSelector } from './Hooks';
import { selectYear, selectMonth } from './slices/selectDateSlice';
import { selectExpenseEntries, ExpenseEntry, filterExpenseEntries } from './slices/expenseEntriesSlice';

function getAccounts(data: ExpenseEntry[]): string[] {
    const accounts: string[] = [];
    data.forEach(entry => {
        if (undefined === accounts.find(account => account === entry.account)) {
            accounts.push(entry.account);
        }
    });
    accounts.sort();
    return accounts;
}

function getCategories(data: ExpenseEntry[]): string[] {
    const categories: string[] = [];
    data.forEach(entry => {
        if (undefined === categories.find(category => category === entry.category)) {
            categories.push(entry.category);
        }
    });
    categories.sort();
    return categories;
}

function getDescriptions(data: ExpenseEntry[]): string[] {
    const descriptions: string[] = [];
    data.forEach(entry => {
        if (entry.description && undefined === descriptions.find(description => description === entry.description)) {
            descriptions.push(entry.description);
        }
    });
    descriptions.sort();
    return descriptions;
}

function toFilters(filters: string[]): { text: string, value: string }[] {
    return filters.map(filter => ({
        text: filter,
        value: filter
    }));
}

function makeColumns(data: ExpenseEntry[]): ColumnsType<ExpenseEntry> {
    return [{
        title: 'Dia',
        dataIndex: 'day',
        sorter: (a, b) => a.day - b.day,
        sortDirections: ['descend', 'ascend'],
    }, {
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
        title: 'Valor (R$)',
        dataIndex: 'value',
        sorter: (a, b) => a.value - b.value,
        sortDirections: ['descend', 'ascend'],
    }, {
        title: 'Conta',
        dataIndex: 'account',
        filters: toFilters(getAccounts(data)),
        onFilter: (value: string | boolean | number, record) => record.account.indexOf(`${value}`) === 0,
    }, {
        title: 'Categoria',
        dataIndex: 'category',
        filters: toFilters(getCategories(data)),
        onFilter: (value: string | boolean | number, record) => record.category.indexOf(`${value}`) === 0,
    }, {
        title: 'Descrição',
        dataIndex: 'description',
        filters: toFilters(getDescriptions(data)),
        onFilter: (value: string | boolean | number, record) => record.description?.indexOf(`${value}`) === 0,
    }];
}

function Table() {
    const year = useAppSelector(selectYear);
    const month = useAppSelector(selectMonth);
    const entries = useAppSelector(selectExpenseEntries);
    let filteredEntries = filterExpenseEntries(entries, year, month);
    return <div>
        <SelectDate/>
        <AntTable rowKey={'id'} columns={makeColumns(filteredEntries)} dataSource={filteredEntries} style={{ marginTop: 30 }}/>
    </div>;
}

export default Table;