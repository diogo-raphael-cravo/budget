import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import entries, { BudgetEntry } from './data';
import { colorToString, randomColor } from './helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

function makeLabels(data: BudgetEntry[]) {
    const labels: string[] = [];
    data.forEach(entry => {
        if (undefined === labels.find(label => label === entry.category)) {
            labels.push(entry.category);
        }
    });
    return labels;
}

function makeData(rawData: BudgetEntry[], labels: string[]): number[] {
    const data: Record<string, number> = {};
    labels.forEach(label => {
        data[label] = 0;
    });
    rawData.forEach(entry => {
        data[entry.category] += entry.value;
    });
    const dataSortedByLabel: number[] = [];
    labels.forEach(label => {
        dataSortedByLabel.push(data[label]);
    });
    return dataSortedByLabel;
}

function makeColors(howMany: number): { backgroundColor: string[], borderColor: string[] } {
    const result : { backgroundColor: string[], borderColor: string[] } = {
        backgroundColor: [],
        borderColor: [],
    };
    for(let i = 0; i < howMany; i++) {
        const color = randomColor();
        color.a = 0.2;
        result.backgroundColor.push(colorToString(color));
        color.a = 1;
        result.borderColor.push(colorToString(color));
    }
    return result;
}

function makeChart(data: BudgetEntry[]): ChartData<"pie", number[], string> {
    const labels = makeLabels(data);
    return {
      labels: labels,
      datasets: [
        {
          label: 'R$ ',
          data: makeData(data, labels),
          ...makeColors(labels.length),
          borderWidth: 1,
        },
      ],
    };
}

function Charts() {
    const allEntries: BudgetEntry[] = [];
    entries.forEach(entry => {
        allEntries.push(...entry.entries);
    });
    return <div style={{width:400, height: 400}}>
        <Pie data={makeChart(allEntries)} />
    </div>;
}

export default Charts;