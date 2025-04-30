import { XMLParser } from 'fast-xml-parser';
import { IncomeEntry } from '../slices/incomeEntriesSlice';
import { ExpenseEntry } from '../slices/expenseEntriesSlice';
import { v4 } from 'uuid';

function fixOfxToXml(ofx: string): string {
    // OFX headers usually end at </OFX> or <OFX> start
    const lines = ofx.split('\n').map((line) => line.trim());
    const bodyStart = lines.findIndex((line) => line.startsWith('<OFX'));
    const xmlLines = lines.slice(bodyStart);
  
    return xmlLines
      .map((line) => {
        if (line.startsWith('<') && !line.includes('</') && !line.endsWith('>')) {
          const tagMatch = line.match(/^<(\w+?)>(.*)$/);
          if (tagMatch) {
            const [, tag, value] = tagMatch;
            return `<${tag}>${value}</${tag}>`;
          }
        }
        return line;
      })
      .join('\n');
}

function parseOfxDate(ofxDate: string): Date {
    const match = ofxDate.match(
      /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\[([-+]\d{2}):(\d{2})[^\]]*\])?/
    );
  
    if (!match) {
      throw new Error("Invalid OFX date format");
    }
  
    const [
      ,
      year,
      month,
      day,
      hour,
      minute,
      second,
      ,
      tzOffsetHour,
      tzOffsetMinute,
    ] = match;
  
    // Build a UTC ISO string first
    const baseDate = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      )
    );
  
    // Apply timezone offset if present
    if (tzOffsetHour && tzOffsetMinute) {
      const offsetMinutes =
        Number(tzOffsetHour) * 60 + Number(tzOffsetMinute) * Math.sign(Number(tzOffsetHour));
      baseDate.setUTCMinutes(baseDate.getUTCMinutes() - offsetMinutes);
    }
  
    return baseDate;
}

type BankTranListType = {
  DTEND: string,
  DTSTART: string,
  STMTTRN: OfxTransationType[],
}

type OfxType = {
    OFX: {
      CREDITCARDMSGSRSV1?: {
        CCSTMTTRNRS: {
          CCSTMTRS: {
            BANKTRANLIST: BankTranListType
          }
        }
      },
      BANKMSGSRSV1?: {
        STMTTRNRS: {
          STMTRS: {
            BANKTRANLIST: BankTranListType
          }
        }
      },
    }
}

type OfxTransationType = {
    DTPOSTED: string,
    MEMO: string,
    TRNAMT: number,
    TRNTYPE: TransactionTypesEnum,
}

enum TransactionTypesEnum {
    CREDIT = 'CREDIT',
    DEBIT =  'DEBIT'
}

export type ParsedType = {
    incomes: IncomeEntry[],
    expenses: ExpenseEntry[],
};

export default (toParse: string): ParsedType => {
    const res: ParsedType = {
        incomes: [],
        expenses: [],
    };
    const parser = new XMLParser();
    try {
        const parsed: OfxType = parser.parse(fixOfxToXml(toParse));
        console.log(parsed)
        let bankTranList: BankTranListType;
        if (parsed.OFX.BANKMSGSRSV1) {
          bankTranList = parsed.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST;
        } else if (parsed.OFX.CREDITCARDMSGSRSV1) {
          bankTranList = parsed.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST
        } else {
          throw new Error(`could not parse ${JSON.stringify(parsed, null, 2)}`);
        }
        bankTranList.STMTTRN.forEach(x => {
            const date = parseOfxDate(x.DTPOSTED);
            if (TransactionTypesEnum.CREDIT === x.TRNTYPE) {
                res.incomes.push({
                    id: v4(),
                    day: date.getDate(),
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                    source: x.MEMO,
                    value: x.TRNAMT,
                });
            } else if (TransactionTypesEnum.DEBIT === x.TRNTYPE) {
                res.expenses.push({
                    id: v4(),
                    day: date.getDate(),
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                    account: 'to-evaluate',
                    category: 'to-evaluate',
                    subcategory: 'to-evaluate',
                    value: -x.TRNAMT,
                    description: x.MEMO,
                    fixed: false,
                })
            } else {
                throw new Error(`unknown transaction type ${x.TRNTYPE}`);
            }
        })
    } catch (error) {
        console.error('error parsing ofx: ', error);
    }
    return res;
}