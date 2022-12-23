import React from 'react';
import { useAppSelector } from './Hooks';
import { selectEntries, BudgetEntry, filterEntries } from './slices/budgetEntriesSlice';
import { Col, Row, Statistic } from 'antd';
import SelectDate from './SelectDate';
import { selectYear, selectMonth } from './slices/selectDateSlice';

function Statistics() {
    const year = useAppSelector(selectYear);
    const month = useAppSelector(selectMonth);
    const entries = useAppSelector(selectEntries);

    const filteredEntries = filterEntries(entries, year, month);
    const total = filteredEntries.reduce((prev, curr) => prev + curr.value, 0)

    return  <div>
        <Row gutter={16}>
            <Col span={12}>
                <SelectDate/>
                <Statistic title="Gasto total" value={`R$ ${total.toLocaleString()}`} />
            </Col>
        </Row>
    </div>;
}

export default Statistics;