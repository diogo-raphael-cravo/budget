import React, { useState } from 'react';
import { Select } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useAppSelector } from './Hooks';
import { selectExpenseEntries, filterExpenseEntries } from './slices/expenseEntriesSlice';
import { selectIncomeEntries, filterIncomeEntries } from './slices/incomeEntriesSlice';
import { Col, Row, Statistic } from 'antd';
import SelectDate from './SelectDate';
import { selectYear, selectMonth } from './slices/selectDateSlice';

function Statistics() {
    const year = useAppSelector(selectYear);
    const month = useAppSelector(selectMonth);
    const expenseEntries = useAppSelector(selectExpenseEntries);
    const incomeEntries = useAppSelector(selectIncomeEntries);

    const timeFilteredExpenseEntries = filterExpenseEntries(expenseEntries, year, month);
    const timeFilteredIncomeEntries = filterIncomeEntries(incomeEntries, year, month);
    
    const categoryOptions: string[] = ['Todas'];
    categoryOptions.push(...timeFilteredExpenseEntries.reduce((prev: string[], curr) => {
        if (undefined === prev.find(category => category === curr.category)) {
            prev.push(curr.category);
        }
        return prev;
    }, []));
    const [category, setCategory] = useState(categoryOptions[0]);
    const handleChangeCategory = (value: string) => {
        setCategory(value);
    };

    const filteredEntries = timeFilteredExpenseEntries
        .filter(entry => (category === 'Todas' || entry.category === category));

    const totalExpenses = filteredEntries.reduce((prev, curr) => prev + curr.value, 0)
    const totalIncome = timeFilteredIncomeEntries.reduce((prev, curr) => prev + curr.value, 0)
    const balance = totalIncome - totalExpenses;
    return  <div>
        <Row gutter={16}>
            <Col span={12}>
                <SelectDate/>
                <label style={{ marginRight: 10 }} >Categoria (despesas)</label>
                <Select
                    value={category}
                    style={{ width: 120 }}
                    onChange={handleChangeCategory}
                    options={categoryOptions.map(x => ({ value: x, label: x }))}
                />
                <Row style={{ marginTop: 30 }} >
                    <Statistic title="Gasto total" value={`R$ ${totalExpenses.toLocaleString()}`} style={{ marginRight: 30 }} />
                    <Statistic title="Entrada total" value={`R$ ${totalIncome.toLocaleString()}`} style={{ marginRight: 30 }} />
                    {0 >= balance && <Statistic title="Balanço" value={`R$ ${balance.toLocaleString()}`} valueStyle={{ color: '#cf1322' }} prefix={<ArrowDownOutlined />}/>}
                    {0 < balance && <Statistic title="Balanço" value={`R$ ${balance.toLocaleString()}`} valueStyle={{ color: '#3f8600' }} prefix={<ArrowUpOutlined />}/>}
                </Row>
            </Col>
        </Row>
    </div>;
}

export default Statistics;