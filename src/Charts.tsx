import './Charts.css'
import { useRef, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';
import { Pie, getDatasetAtEvent, getElementAtEvent } from 'react-chartjs-2';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types'
import SelectDate from './SelectDate';
import { selectExpenseEntries, ExpenseEntry, filterExpenseEntries } from './slices/expenseEntriesSlice';
import { colorToString, randomColor } from './helpers';
import { useAppSelector } from './Hooks';
import { selectYear, selectMonth } from './slices/selectDateSlice';

ChartJS.register(ArcElement, Tooltip, Legend);

function makeLabelsByCategory(data: ExpenseEntry[]) {
    const labels: string[] = [];
    data.forEach(entry => {
        if (undefined === labels.find(label => label === entry.category)) {
            labels.push(entry.category);
        }
    });
    return labels;
}

function makeDataByCategory(rawData: ExpenseEntry[], labels: string[]): number[] {
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

function makeMainChart(data: ExpenseEntry[], labels: string[]): ChartData<"pie", number[], string> {
    return {
      labels,
      datasets: [
        {
          label: 'R$ ',
          data: makeDataByCategory(data, labels),
          ...makeColors(labels.length),
          borderWidth: 1,
        },
      ],
    };
}

function makeDataBySubcategory(rawData: ExpenseEntry[], labels: string[]): number[] {
    const data: Record<string, number> = {};
    labels.forEach(label => {
        data[label] = 0;
    });
    rawData.forEach(entry => {
        if (entry.subcategory) {
            data[entry.subcategory] += entry.value;
        } else {
            data['sem descrição'] += entry.value;
        }
    });
    const dataSortedByLabel: number[] = [];
    labels.forEach(label => {
        dataSortedByLabel.push(data[label]);
    });
    return dataSortedByLabel;
}

function makeSubChart(data: ExpenseEntry[], category: string): ChartData<"pie", number[], string> {
    const labels: string[] = ['sem descrição'];
    const dataThisCategory = data.filter(entry => entry.category === category);
    dataThisCategory.forEach(entry => {
        if (entry.subcategory && undefined === labels.find(label => label === entry.subcategory)) {
            labels.push(entry.subcategory);
        }
    });
    return {
      labels,
      datasets: [
        {
          label: 'R$ ',
          data: makeDataBySubcategory(dataThisCategory, labels),
          ...makeColors(labels.length),
          borderWidth: 1,
        },
      ],
    };
}

function Charts() {
    const pieRef = useRef(null);
    const [currentLabel, setCurrentLabel] = useState<string | null | undefined>(null);
    const year = useAppSelector(selectYear);
    const month = useAppSelector(selectMonth);
    const entries = useAppSelector(selectExpenseEntries);
    let filteredEntries = filterExpenseEntries(entries, year, month);
    const labels = makeLabelsByCategory(filteredEntries);
    {filteredEntries.reduce((prev, x) => prev + x.value, 0)}
    return <div className='charts-grid'>
        <div style={{ gridColumn: '1 / 3' }}>
            <SelectDate/>
        </div>
        <div>
            <Pie ref={pieRef} data={makeMainChart(filteredEntries, labels)} onClick={(event) => {
                // TODO: fix types
                // @ts-ignore
                const index = getElementAtEvent(pieRef.current, event)[0].index;
                setCurrentLabel(labels[index]);
            }}/>
        </div>
        {   
            !currentLabel ? <div/> :
            <div><Pie data={makeSubChart(filteredEntries, currentLabel)}/></div>
        }
    </div>;
}

export default Charts;