import React, { useState } from 'react';
import { Select } from 'antd';
import { useAppSelector } from './Hooks';
import { selectEntries, BudgetEntry, filterEntries } from './slices/budgetEntriesSlice';
import { Col, Row, Statistic } from 'antd';
import SelectDate from './SelectDate';
import { selectYear, selectMonth } from './slices/selectDateSlice';

function Statistics() {
    const year = useAppSelector(selectYear);
    const month = useAppSelector(selectMonth);
    const entries = useAppSelector(selectEntries);

    const timeFilteredEntries = filterEntries(entries, year, month);
    
    const categoryOptions: string[] = ['Todas'];
    categoryOptions.push(...timeFilteredEntries.reduce((prev: string[], curr) => {
        if (undefined === prev.find(category => category === curr.category)) {
            prev.push(curr.category);
        }
        return prev;
    }, []));
    const [category, setCategory] = useState(categoryOptions[0]);
    const handleChangeCategory = (value: string) => {
        setCategory(value);
    };

    const filteredEntries = timeFilteredEntries
        .filter(entry => (category === 'Todas' || entry.category === category));

    const total = filteredEntries.reduce((prev, curr) => prev + curr.value, 0)

    return  <div>
        <Row gutter={16}>
            <Col span={12}>
                <SelectDate/>
                <Select
                    value={category}
                    style={{ width: 120 }}
                    onChange={handleChangeCategory}
                    options={categoryOptions.map(x => ({ value: x, label: x }))}
                />
                <Statistic title="Gasto total" value={`R$ ${total.toLocaleString()}`} />
            </Col>
        </Row>
    </div>;
}

export default Statistics;