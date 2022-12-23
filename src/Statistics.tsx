import React from 'react';
import { useAppSelector } from './Hooks';
import { selectEntries, BudgetEntry } from './slices/budgetEntriesSlice';
import { Col, Row, Statistic } from 'antd';

function Statistics() {
    const entries = useAppSelector(selectEntries);

    const total = entries.reduce((prev, curr) => prev + curr.value, 0)

    return  <div>
        <Row gutter={16}>
            <Col span={12}>
                <Statistic title="Gasto total" value={`R$ ${total.toLocaleString()}`} />
            </Col>
        </Row>
    </div>;
}

export default Statistics;