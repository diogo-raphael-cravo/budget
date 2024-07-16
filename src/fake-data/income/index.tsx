/**
 * {
        "day": 26,
        "month": 1,
        "year": 2024,
        "value": 10,
        "source": "Paycheck"
    }
 */

const income: {
    day: number,
    month: number,
    year: number,
    value: number,
    source: string,
}[] = [];

for (let year = 2015; year < 2025; year++) {
    for (let month = 1; month < 13; month++) {
        income.push({
            day: 1,
            month,
            year,
            value: 3000 + (year - 2015) * 1000,
            source: 'Paycheck',
        });
    }
}

export default income;