import { ParsedType } from './ofxReader';
import { IncomeEntry } from '../slices/incomeEntriesSlice';
import { ExpenseEntry } from '../slices/expenseEntriesSlice';

type ExpenseTranslationType = {
    from: {
        description: string[],
    },
    to: {
        account: string,
        category: string,
        subcategory: string,
    }
};

type IncomeTranslationType = {
    from: {
        source: string[],
    },
    to: {
        source: string,
    }
}

export type EvaluatorType = {
    expenseTranslations: ExpenseTranslationType[],
    ignoredExpenses: string[],
    incomeTranslations: IncomeTranslationType[],
    ignoredIncomes: string[],
};

function sort (obj: Record<string, any>) {
    const array = Object.keys(obj).map(k => ({
        name: k,
        ...obj[k],
    }));
    array.sort((a, b) => b.hits - a.hits);
    return array;
}

export type EvaluationType = {
    result: ParsedType,
    unknownIncomes: number,
    unknownExpenses: number
}

export default (parsed: ParsedType, evaluator: EvaluatorType): EvaluationType => {
    const res: EvaluationType = {
        result: {
            incomes: [],
            expenses: []
        },
        unknownIncomes: 0,
        unknownExpenses: 0
    };
    let unknownsToPrint: Record<string, any> = {};
    parsed.incomes.filter(i => !evaluator.ignoredIncomes.includes(i.source.toLowerCase())).forEach(i => {
        const translationRule = evaluator.incomeTranslations.find(t => t.from.source.find(s => i.source.toLowerCase().includes(s)));
        if (!translationRule) {
            if (unknownsToPrint[i.source]) {
                unknownsToPrint[i.source].hits++;
                unknownsToPrint[i.source].values.push(i.value);
            } else {
                unknownsToPrint[i.source] = {
                    hits: 1,
                    values: [i.value],
                };
            }
            res.unknownIncomes++;
            res.result.incomes.push(i);
            return;
        }
        res.result.incomes.push({
            ...i,
            source: translationRule.to.source,
        });
    });
    console.log('Income unknowns: ', sort(unknownsToPrint));

    unknownsToPrint = {} as Record<string, number>;
    parsed.expenses.filter(e => !evaluator.ignoredExpenses.includes(e.description?.toLowerCase() || 'undefined')).forEach(e => {
        const translationRule = evaluator.expenseTranslations.find(t => t.from.description.find(d => e.description?.toLowerCase().includes(d)));
        if (!translationRule) {
            if (!e.description) {
                throw new Error(`description not found for entry ${e}`);
            }
            if (unknownsToPrint[e.description]) {
                unknownsToPrint[e.description].hits++;
                unknownsToPrint[e.description].values.push(e.value);
            } else {
                unknownsToPrint[e.description] = {
                    hits: 1,
                    values: [e.value],
                };
            }
            res.unknownExpenses++;
            res.result.expenses.push(e);
            return;
        }
        res.result.expenses.push({
            ...e,
            account: translationRule.to.account,
            category: translationRule.to.category,
            subcategory: translationRule.to.subcategory,
        });
    });
    console.log('Expense unknowns: ', sort(unknownsToPrint));

    return res;
}
