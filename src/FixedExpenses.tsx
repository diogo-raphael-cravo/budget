import { useState } from 'react';
import { useAppSelector } from './Hooks';
import { selectExpenseEntries, filterExpenseEntries } from './slices/expenseEntriesSlice';
import { selectIncomeEntries, filterIncomeEntries } from './slices/incomeEntriesSlice';
import { selectYear, selectMonth } from './slices/selectDateSlice';
import SelectDate from './SelectDate';
import styled from 'styled-components';
import DragAndDropFile from './DragAndDropFile';

const Table = styled.table`
  border-collapse: collapse;
  width: 95%;
  margin: 2rem auto;
  font-family: sans-serif;
`;

const Thead = styled.thead`
  background-color: #444; /* strong grey */
  color: white;
`;

const Th = styled.th`
  padding: 12px;
  border: 1px solid #ccc;
  text-align: left;
`;

const Td = styled.td`
  padding: 12px;
  border: 1px solid #ccc;
`;

const PaintedTd = styled.td<{ isGood?: boolean }>`
  padding: 12px;
  border: 1px solid #ccc;
  background-color: ${({ isGood }) => isGood? '#90EE90' : '#FF6666'};
  color: black;
`;

const Tr = styled.tr<{ isEven?: boolean }>`
  background-color: ${({ isEven }) => (isEven ? '#f9f9f9' : 'white')};
`;

const FinalTr = styled.tr`
  background-color: #444; /* strong grey */
  color: white;
`;

type GoalCriteriaIncludeType = {
    include: string[],
    exclude?: never,
}
type GoalCriteriaExcludeType = {
    include?: never,
    exclude: string[],
}

type GoalCriteriaType = 
    // if provided, include only the ones provided
    GoalCriteriaIncludeType
    // if provided, include all but the ones excluded
    | GoalCriteriaExcludeType;

type GoalType = {
    categories: GoalCriteriaType,
    subcategories: GoalCriteriaType,
    goal: number
};

function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function Goals() {
    const [goals, setGoals] = useState<GoalType[]>([]);
    const year = useAppSelector(selectYear);
    const month = useAppSelector(selectMonth);
    const expenseEntries = useAppSelector(selectExpenseEntries);
    const incomeEntries = useAppSelector(selectIncomeEntries);

    const timeFilteredExpenseEntries = filterExpenseEntries(expenseEntries, year, month);
    const timeFilteredIncomeEntries = filterIncomeEntries(incomeEntries, year, month);

    let fixedRows: {
        category: string,
        subcategories: Set<string>,
        amount: number;
    }[] = [];
    
    let variableRows: {
        category: string,
        subcategories: Set<string>,
        amount: number;
    }[] = [];

    timeFilteredExpenseEntries.forEach(e => {
        if (e.fixed) {
            let thisCategory = fixedRows.find(x => x.category === e.category);
            if (!thisCategory) {
                thisCategory = {
                    category: e.category,
                    subcategories: new Set<string>(),
                    amount: 0,
                };
                fixedRows.push(thisCategory);
            }
            thisCategory.subcategories.add(e.subcategory);
            thisCategory.amount += e.value;
        } else {
            let thisCategory = variableRows.find(x => x.category === e.category);
            if (!thisCategory) {
                thisCategory = {
                    category: e.category,
                    subcategories: new Set<string>(),
                    amount: 0,
                };
                variableRows.push(thisCategory);
            }
            thisCategory.subcategories.add(e.subcategory);
            thisCategory.amount += e.value;
        }
    });

    fixedRows = fixedRows.map(x => ({
        ...x,
        amount: Math.round(x.amount * 100) / 100
    }));
    variableRows = variableRows.map(x => ({
        ...x,
        amount: Math.round(x.amount * 100) / 100
    }));
    let totalFixed = fixedRows.reduce((prev, curr) => prev + curr.amount, 0);
    totalFixed = Math.round(totalFixed * 100) / 100;
    let totalVariable = variableRows.reduce((prev, curr) => prev + curr.amount, 0);
    totalVariable = Math.round(totalVariable * 100) / 100;

    return <div>
        <SelectDate/>
        Gastos fixos
        <Table>
            <Thead>
                <tr>
                    <Th>Categoria</Th>
                    <Th>Subcategorias</Th>
                    <Th>Gastos</Th>
                </tr>
            </Thead>
            <tbody>
                {fixedRows.map((row, index) => (
                    <Tr key={JSON.stringify([row.category, ...Array.from(row.subcategories)])} isEven={index % 2 === 0}>
                        <Td>{capitalize(row.category)}</Td>
                        <Td>{JSON.stringify(Array.from(row.subcategories).map(capitalize))}</Td>
                        <Td>{row.amount}</Td>
                    </Tr>
                ))}
                <FinalTr key={'Todas'}>
                    <Td>Todas</Td>
                    <Td>Todas</Td>
                    <Td>{totalFixed}</Td>
                </FinalTr>
            </tbody>
        </Table>
        Gastos Variáveis
        <Table>
            <Thead>
                <tr>
                    <Th>Categoria</Th>
                    <Th>Subcategorias</Th>
                    <Th>Gastos</Th>
                </tr>
            </Thead>
            <tbody>
                {variableRows.map((row, index) => (
                    <Tr key={JSON.stringify([row.category, ...Array.from(row.subcategories)])} isEven={index % 2 === 0}>
                        <Td>{capitalize(row.category)}</Td>
                        <Td>{JSON.stringify(Array.from(row.subcategories).map(capitalize))}</Td>
                        <Td>{row.amount}</Td>
                    </Tr>
                ))}
                <FinalTr key={'Todas'}>
                    <Td>Todas</Td>
                    <Td>Todas</Td>
                    <Td>{totalVariable}</Td>
                </FinalTr>
            </tbody>
        </Table>
    </div>;
}

export default Goals;