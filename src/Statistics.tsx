import React, { useState } from 'react';
import { Select } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useAppSelector } from './Hooks';
import { selectExpenseEntries, filterExpenseEntries } from './slices/expenseEntriesSlice';
import { selectIncomeEntries, filterIncomeEntries, getMonths, getMeanIncomeEntries } from './slices/incomeEntriesSlice';
import { Col, Row, Statistic } from 'antd';
import SelectDate from './SelectDate';
import { selectYear, selectMonth } from './slices/selectDateSlice';
import styled from 'styled-components';

const Table = styled.table`
  border-collapse: collapse;
  width: 60%;
  margin: 20px auto;
`;

const Th = styled.th`
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #f2f2f2;
  text-align: left;
`;

const Td = styled.td`
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
`;

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
    const allCategoriesSelected = categoryOptions[0] === category;

    const filteredExpenseEntries = timeFilteredExpenseEntries
        .filter(entry => (category === 'Todas' || entry.category === category));

    const totalExpenses = filteredExpenseEntries.reduce((prev, curr) => prev + curr.value, 0)
    const totalIncome = timeFilteredIncomeEntries.reduce((prev, curr) => prev + curr.value, 0)
    const balance = totalIncome - totalExpenses;

    const monthsFilteredIncomeEntries = getMonths(timeFilteredIncomeEntries);
    const meanIncome = getMeanIncomeEntries(timeFilteredIncomeEntries, monthsFilteredIncomeEntries);

    const categories: Record<string, Set<string>> = {};
    filteredExpenseEntries.forEach(e => {
        if (!categories[e.category]) {
            categories[e.category] = new Set();
        }
        categories[e.category].add(e.subcategory);
    });

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
                <h3 style={{ marginTop: 30 }}>Valores</h3>
                <Row>
                    <Statistic title="Despesas" value={`R$ ${totalExpenses.toLocaleString()}`} style={{ marginRight: 30 }} />
                    {allCategoriesSelected && <Statistic title="Entradas" value={`R$ ${totalIncome.toLocaleString()}`} style={{ marginRight: 30 }} />}{}
                    {allCategoriesSelected && 0 >= balance && <Statistic title="Balanço" value={`R$ ${balance.toLocaleString()}`} valueStyle={{ color: '#cf1322' }} prefix={<ArrowDownOutlined />}/>}
                    {allCategoriesSelected && 0 < balance && <Statistic title="Balanço" value={`R$ ${balance.toLocaleString()}`} valueStyle={{ color: '#3f8600' }} prefix={<ArrowUpOutlined />}/>}
                </Row>
                <Row>
                    {allCategoriesSelected && <Statistic title="Meses" value={monthsFilteredIncomeEntries} style={{ marginRight: 30 }} />}
                    {allCategoriesSelected && <Statistic title="Média" value={`R$ ${meanIncome.toLocaleString()}`} style={{ marginRight: 30 }} />}
                </Row>
                <h3 style={{ marginTop: 30 }}>Registros</h3>
                <Row>
                    <Statistic title="Despesas" value={filteredExpenseEntries.length} style={{ marginRight: 30 }} />
                    {allCategoriesSelected && <Statistic title="Entradas" value={timeFilteredIncomeEntries.length} style={{ marginRight: 30 }} />}
                    {allCategoriesSelected && <Statistic title="Total" value={filteredExpenseEntries.length + timeFilteredIncomeEntries.length} style={{ marginRight: 30 }} />}
                </Row>
                <h3 style={{ marginTop: 30 }}>Categorias de despesas</h3>
                <Row>
                    <Table>
                        <thead>
                            <tr>
                                <Th>Categoria</Th>
                                <Th>Subcategorias</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Object.keys(categories).map(c => (
                                    <tr>
                                        <Td>{c}</Td>
                                        <Td>{JSON.stringify(Array.from(categories[c]))}</Td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                </Row>
            </Col>
        </Row>
    </div>;
}

export default Statistics;