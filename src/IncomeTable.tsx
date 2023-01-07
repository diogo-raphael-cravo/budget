import React from 'react';
import { Table as AntTable } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SelectDate, { monthValueToLabel } from './SelectDate';
import { useAppSelector } from './Hooks';
import { selectYear, selectMonth } from './slices/selectDateSlice';
import { IncomeEntry, selectIncomeEntries, filterIncomeEntries } from './slices/incomeEntriesSlice'

function getSources(data: IncomeEntry[]): string[] {
    const sources: string[] = [];
    data.forEach(entry => {
        if (undefined === sources.find(source => source === entry.source)) {
            sources.push(entry.source);
        }
    });
    sources.sort();
    return sources;
}

function toFilters(filters: string[]): { text: string, value: string }[] {
    return filters.map(filter => ({
        text: filter,
        value: filter
    }));
}

function makeColumns(data: IncomeEntry[]): ColumnsType<IncomeEntry> {
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
        title: 'Origem',
        dataIndex: 'source',
        filters: toFilters(getSources(data)),
        onFilter: (value: string | boolean | number, record) => record.source.indexOf(`${value}`) === 0,
    }];
}

function Table() {
    const year = useAppSelector(selectYear);
    const month = useAppSelector(selectMonth);
    const entries = useAppSelector(selectIncomeEntries);
    let filteredEntries = filterIncomeEntries(entries, year, month);
    return <div>
        <SelectDate/>
        <AntTable rowKey={'id'} columns={makeColumns(filteredEntries)} dataSource={filteredEntries} style={{ marginTop: 30 }}/>
    </div>;
}

export default Table;