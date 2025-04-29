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

    const rows: {
        categories: string[],
        subcategories: string[],
        goal: number,
        actual: number,
    }[] = [];

    goals.forEach(g => {
        const categories: string[] = [];
        if (g.categories.include) {
            categories.push(...g.categories.include);
        } else if (g.categories.exclude) {
            const s = new Set<string>();
            timeFilteredExpenseEntries.forEach(e => {
                if (!g.categories.exclude?.find(excluded => e.category === excluded)) {
                    s.add(e.category);
                }
            });
            categories.push(...Array.from(s));
        }

        const subcategories: string[] = [];
        if (g.subcategories.include) {
            subcategories.push(...g.subcategories.include);
        } else if (g.subcategories.exclude) {
            const s = new Set<string>();
            timeFilteredExpenseEntries.forEach(e => {
                if (categories.find(category => e.category === category)
                    && !g.subcategories.exclude?.find(excluded => e.subcategory === excluded)) {
                    s.add(e.subcategory);
                }
            });
            subcategories.push(...Array.from(s));
        }

        const actual: number = timeFilteredExpenseEntries.reduce((prev, curr) => {
            if (!categories.find(category => category === curr.category)) {
                return prev;
            }
            if (!subcategories.find(subcategory => subcategory === curr.subcategory)) {
                return prev;
            }
            return prev + curr.value;
        }, 0);

        rows.push({
            categories,
            subcategories,
            goal: g.goal,
            actual: Math.round(actual * 100) / 100,
        });
    });

    const totalGoals = goals.reduce((prev, curr) => prev + curr.goal, 0);
    let totalExpenses = timeFilteredExpenseEntries.reduce((prev, curr) => prev + curr.value, 0);
    totalExpenses = Math.round(totalExpenses * 100) / 100;
    let totalExpensesWithGoals = totalExpenses - rows.reduce((prev, curr) => prev + curr.actual, 0);
    totalExpensesWithGoals = Math.round(totalExpensesWithGoals * 100) / 100;

    return <div>
        <SelectDate/>
        <DragAndDropFile onDroppedFile={(contents) => setGoals(JSON.parse(contents) as unknown as GoalType[])}/>
        Entrada: {timeFilteredIncomeEntries.reduce((prev, curr) => prev + curr.value, 0)}
        <Table>
            <Thead>
                <tr>
                    <Th>Categoria</Th>
                    <Th>Subcategorias</Th>
                    <Th>Meta</Th>
                    <Th>Realizado</Th>
                </tr>
            </Thead>
            <tbody>
                {rows.map((row, index) => (
                    <Tr key={JSON.stringify([...row.categories, ...row.subcategories])} isEven={index % 2 === 0}>
                        <Td>{row.categories.map(capitalize).join(', ')}</Td>
                        <Td>{JSON.stringify(row.subcategories.map(capitalize))}</Td>
                        <Td>{row.goal}</Td>
                        <PaintedTd isGood={row.actual <= row.goal}>{row.actual}</PaintedTd>
                    </Tr>
                ))}
                <FinalTr key={'Outros'}>
                    <Td>Não listadas</Td>
                    <Td></Td>
                    <Td>{0}</Td>
                    <PaintedTd isGood={0 === totalExpensesWithGoals}>{totalExpensesWithGoals}</PaintedTd>
                </FinalTr>
                <FinalTr key={'Todas'}>
                    <Td>Todas</Td>
                    <Td>Todas</Td>
                    <Td>{totalGoals}</Td>
                    <PaintedTd isGood={totalExpenses < totalGoals}>{totalExpenses}</PaintedTd>
                </FinalTr>
            </tbody>
        </Table>
    </div>;
}

export default Goals;