/**
 * {
        "day": 1,
        "month": 5,
        "value": 550,
        "account": "Bank Account",
        "category": "home",
        "year": 2024,
        "description": "",
        "subcategory": "rent"
    }
 */

const expenses: {
    day: number,
    month: number,
    year: number,
    value: number,
    account: string,
    category: string,
    subcategory: string,
    description?: string,
}[] = [];
const categories = ['Rent', 'Education', 'Meals', 'Supermarket', 'Entertainment', 'Insurance', 'Maintenance', 'Tax', 'Transportation'];
const subCategories = ['a', 'b', 'c'];

function getRandom(min: number): number {
    let random: number = Math.random();
    while (random < min) {
        random = Math.random();
    }
    return random;
}

for (let year = 2015; year < 2025; year++) {
    for (let month = 1; month < 13; month++) {
        const canSpend = 3000 + year - 2015;
        const willSpend = Math.floor(Math.random() * ((year - 2015) * 2000)) + 2000;
        const expenseCount = Math.floor(10 * getRandom(0.1));
        console.log(willSpend, expenseCount, Math.floor(willSpend / expenseCount))
        let ex = 0
        for(let expense = 0; expense < expenseCount; expense++) {
            ex += Math.floor(willSpend / expenseCount);
            expenses.push({
                day: Math.floor(28 * Math.random()),
                month,
                value: Math.floor(willSpend / expenseCount),
                account: 'Bank Account',
                category: categories[Math.floor(Math.random() * categories.length)],
                year,
                description: '',
                subcategory: subCategories[Math.floor(Math.random() * subCategories.length)],
            });
        }
        console.log(ex)
    }
}

export default expenses;