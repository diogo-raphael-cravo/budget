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

type FixedGoalType = {
    categories: GoalCriteriaType,
    subcategories: GoalCriteriaType,
    goal: number
};
type VariableGoalType = {
    categories: GoalCriteriaType,
    subcategories: GoalCriteriaType,
    percent: number
};

type Budget = {
    budget: number,
    fixedGoals: FixedGoalType[],
    variableGoals: VariableGoalType[]
}

type RowType = {
    categories: string[],
    subcategories: string[],
    goal: number,
    actual: number,
};

function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function round(n: number) {
    return Math.round(n * 100) / 100;
}

function Goals() {
    const [budget, setBudget] = useState<Budget>({
        budget: 0,
        fixedGoals: [],
        variableGoals: [],
    });
    const year = useAppSelector(selectYear);
    const month = useAppSelector(selectMonth);
    const expenseEntries = useAppSelector(selectExpenseEntries);
    const incomeEntries = useAppSelector(selectIncomeEntries);

    const timeFilteredExpenseEntries = filterExpenseEntries(expenseEntries, year, month);
    const timeFilteredIncomeEntries = filterIncomeEntries(incomeEntries, year, month);

    const fixedRows: RowType[] = [];
    const variableRows: (RowType & { percent: number })[] = [];

    budget.fixedGoals.forEach(g => {
        const expenses = timeFilteredExpenseEntries.filter(e => e.fixed);

        const categories: string[] = [];
        if (g.categories.include) {
            categories.push(...g.categories.include);
        } else if (g.categories.exclude) {
            const s = new Set<string>();
            expenses.forEach(e => {
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
            expenses.forEach(e => {
                if (categories.find(category => e.category === category)
                    && !g.subcategories.exclude?.find(excluded => e.subcategory === excluded)) {
                    s.add(e.subcategory);
                }
            });
            subcategories.push(...Array.from(s));
        }

        const actual: number = expenses.reduce((prev, curr) => {
            if (!categories.find(category => category === curr.category)) {
                return prev;
            }
            if (!subcategories.find(subcategory => subcategory === curr.subcategory)) {
                return prev;
            }
            return prev + curr.value;
        }, 0);

        fixedRows.push({
            categories,
            subcategories,
            goal: g.goal,
            actual: round(actual),
        });
    });

    const totalFixedGoals = round(budget.fixedGoals.reduce((prev, curr) => prev + curr.goal, 0));
    const totalFixedGoalsActual = fixedRows.reduce((prev, curr) => prev + curr.actual, 0);
    const totalFixedExpenses = round(timeFilteredExpenseEntries.filter(e => e.fixed).reduce((prev, curr) => prev + curr.value, 0));
    const fixedExpensesNotListed = round(totalFixedExpenses - totalFixedGoalsActual);
    const budgetAfterFixedExpenses = round(budget.budget - totalFixedExpenses);
    const budgetAfterFixedGoals = round(budget.budget - totalFixedGoals);

    budget.variableGoals.forEach(g => {
        const expenses = timeFilteredExpenseEntries.filter(e => !e.fixed);

        const categories: string[] = [];
        if (g.categories.include) {
            categories.push(...g.categories.include);
        } else if (g.categories.exclude) {
            const s = new Set<string>();
            expenses.forEach(e => {
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
            expenses.forEach(e => {
                if (categories.find(category => e.category === category)
                    && !g.subcategories.exclude?.find(excluded => e.subcategory === excluded)) {
                    s.add(e.subcategory);
                }
            });
            subcategories.push(...Array.from(s));
        }

        const actual: number = expenses.reduce((prev, curr) => {
            if (!categories.find(category => category === curr.category)) {
                return prev;
            }
            if (!subcategories.find(subcategory => subcategory === curr.subcategory)
                && '' !== curr.subcategory) {
                return prev;
            }
            return prev + curr.value;
        }, 0);

        variableRows.push({
            categories,
            subcategories,
            percent: g.percent,
            goal: round((g.percent / 100) * budgetAfterFixedGoals),
            actual: round(actual),
        });
    });

    const totalVariableGoals = round(variableRows.reduce((prev, curr) => prev + curr.goal, 0));
    const totalVariableGoalsActual = round(variableRows.reduce((prev, curr) => prev + curr.actual, 0));
    const totalVariableExpenses = round(timeFilteredExpenseEntries.filter(e => !e.fixed).reduce((prev, curr) => prev + curr.value, 0));
    const variableExpensesNotListed = round(totalVariableExpenses - totalVariableGoalsActual);

    const finalGoalBalance = round(budgetAfterFixedGoals - totalVariableGoals);
    const finalBalance = round(budget.budget - totalFixedExpenses - totalVariableExpenses);

    const totalIncome = round(timeFilteredIncomeEntries.reduce((prev, curr) => prev + curr.value, 0));

    return <div>
        <SelectDate/>
        <DragAndDropFile onDroppedFile={(contents) => setBudget(JSON.parse(contents) as unknown as Budget)}/>
        Entrada: {totalIncome}<br/>
        Orçamento: {budget.budget}<br/><br/>
        Metas Fixas
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
                {fixedRows.map((row, index) => (
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
                    <PaintedTd isGood={0 === fixedExpensesNotListed}>{fixedExpensesNotListed}</PaintedTd>
                </FinalTr>
                <FinalTr key={'Todas'}>
                    <Td>Todas</Td>
                    <Td>Todas</Td>
                    <Td>{totalFixedGoals}</Td>
                    <PaintedTd isGood={totalFixedExpenses < totalFixedGoals}>{totalFixedExpenses}</PaintedTd>
                </FinalTr>
            </tbody>
        </Table>

        Resumo Metas Fixas
        <Table>
            <Thead style={{ display: 'none' }}>
                <tr>
                    <Th>will not show</Th>
                    <Th>will not show</Th>
                </tr>
            </Thead>
            <tbody>
                <FinalTr key={'Outros'}>
                    <Td>Orçamento</Td>
                    <Td>{budget.budget}</Td>
                </FinalTr>
                <FinalTr key={'Todas'}>
                    <Td>Gastos fixos</Td>
                    <Td>{totalFixedExpenses}</Td>
                </FinalTr>
                <FinalTr key={'Todas'}>
                    <Td>Meta saldo remanescente</Td>
                    <Td>{budgetAfterFixedGoals}</Td>
                </FinalTr>
                <FinalTr key={'Todas'}>
                    <Td>Saldo remanescente</Td>
                    <PaintedTd isGood={budgetAfterFixedGoals <= budgetAfterFixedExpenses}>{budgetAfterFixedExpenses}</PaintedTd>
                </FinalTr>
            </tbody>
        </Table>

        Metas Variáveis
        <Table>
            <Thead>
                <tr>
                    <Th>Categoria</Th>
                    <Th>Subcategorias</Th>
                    <Th>Meta (%)</Th>
                    <Th>Meta</Th>
                    <Th>Realizado</Th>
                </tr>
            </Thead>
            <tbody>
                {variableRows.map((row, index) => (
                    <Tr key={JSON.stringify([...row.categories, ...row.subcategories])} isEven={index % 2 === 0}>
                        <Td>{row.categories.map(capitalize).join(', ')}</Td>
                        <Td>{JSON.stringify(row.subcategories.map(capitalize))}</Td>
                        <Td>{row.percent}</Td>
                        <Td>{row.goal}</Td>
                        <PaintedTd isGood={row.actual <= row.goal}>{row.actual}</PaintedTd>
                    </Tr>
                ))}
                <FinalTr key={'Outros'}>
                    <Td>Não listadas</Td>
                    <Td></Td>
                    <Td></Td>
                    <Td>{0}</Td>
                    <PaintedTd isGood={0 === variableExpensesNotListed}>{variableExpensesNotListed}</PaintedTd>
                </FinalTr>
                <FinalTr key={'Todas'}>
                    <Td>Todas</Td>
                    <Td>Todas</Td>
                    <Td>{variableRows.reduce((prev, curr) => prev + curr.percent, 0)}</Td>
                    <Td>{totalVariableGoals}</Td>
                    <PaintedTd isGood={totalVariableExpenses < totalVariableGoals}>{totalVariableExpenses}</PaintedTd>
                </FinalTr>
            </tbody>
        </Table>

        
        Resumo Metas Variáveis
        <Table>
            <Thead style={{ display: 'none' }}>
                <tr>
                    <Th>will not show</Th>
                    <Th>will not show</Th>
                </tr>
            </Thead>
            <tbody>
                <FinalTr key={'Outros'}>
                    <Td>Meta orçamento remanescente</Td>
                    <Td>{budgetAfterFixedGoals}</Td>
                </FinalTr>
                <FinalTr key={'Outros'}>
                    <Td>Orçamento remanescente</Td>
                    <Td>{budgetAfterFixedExpenses}</Td>
                </FinalTr>
                <FinalTr key={'Todas'}>
                    <Td>Gastos variáveis</Td>
                    <Td>{totalVariableExpenses}</Td>
                </FinalTr>
                <FinalTr key={'Todas'}>
                    <Td>Meta gastos variáveis</Td>
                    <Td>{totalVariableGoals}</Td>
                </FinalTr>
                <FinalTr key={'Todas'}>
                    <Td>Meta saldo remanescente</Td>
                    <Td>{finalGoalBalance}</Td>
                </FinalTr>
                <FinalTr key={'Todas'}>
                    <Td>Saldo remanescente</Td>
                    <PaintedTd isGood={finalGoalBalance <= finalBalance}>{finalBalance}</PaintedTd>
                </FinalTr>
            </tbody>
        </Table>
    </div>;
}

export default Goals;