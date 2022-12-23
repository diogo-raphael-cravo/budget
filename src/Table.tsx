import React from 'react';
import { Table as AntTable } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SelectDate from './SelectDate';
import entries, { BudgetEntry } from './data';

function getAccounts(data: BudgetEntry[]): string[] {
    const accounts: string[] = [];
    data.forEach(entry => {
        if (undefined === accounts.find(account => account === entry.account)) {
            accounts.push(entry.account);
        }
    });
    return accounts;
}

function getCategories(data: BudgetEntry[]): string[] {
    const categories: string[] = [];
    data.forEach(entry => {
        if (undefined === categories.find(category => category === entry.category)) {
            categories.push(entry.category);
        }
    });
    return categories;
}

function toFilters(filters: string[]): { text: string, value: string }[] {
    return filters.map(filter => ({
        text: filter,
        value: filter
    }));
}

function makeColumns(data: BudgetEntry[]): ColumnsType<BudgetEntry> {
    return [{
        title: 'Dia',
        dataIndex: 'day',
        sorter: (a, b) => a.day - b.day,
        sortDirections: ['descend', 'ascend'],
    }, {
        title: 'Mês',
        dataIndex: 'month',
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
        onFilter: (value: string | boolean | number, record) => record.category.indexOf(`${value}`) === 0,
    }, {
        title: 'Categoria',
        dataIndex: 'category',
        filters: toFilters(getCategories(data)),
        onFilter: (value: string | boolean | number, record) => record.category.indexOf(`${value}`) === 0,
    }, {
        title: 'Descrição',
        dataIndex: 'description',
    }];
}

function Table() {
    return <div>
        <SelectDate/>
        <AntTable columns={makeColumns(entries)} dataSource={entries} />
    </div>;
}

export default Table;