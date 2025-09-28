// utils/formatters.ts
export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const formatPercent = (rate: number | null | undefined, fractionDigits: number = 2): string => {
    if (rate === null || rate === undefined || isNaN(rate)) {
        return 'N/A';
    }
    // Assumes rate is a decimal, e.g., 0.09 for 9%
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(rate);
};

export const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(num)) {
        return '';
    }
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};

export const parseCurrency = (value: string | number): number => {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        // 1. Remove any character that is not a digit, a comma, or a period.
        const sanitized = value.replace(/[^0-9.,]/g, '');
        
        // 2. Remove commas used for thousand separators.
        const withoutCommas = sanitized.replace(/,/g, '');

        // 3. Robustly handle multiple decimal points.
        //    - Split the string by the period.
        //    - The first part is the integer part.
        //    - Join all subsequent parts to form the decimal part.
        const parts = withoutCommas.split('.');
        const numericString = parts.length > 1
            ? parts[0] + '.' + parts.slice(1).join('')
            : parts[0];
            
        const number = parseFloat(numericString);
        return isNaN(number) ? 0 : number;
    }
    return 0;
};


// --- New Function for converting numbers to words ---

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const thousands = ['', 'Thousand', 'Million', 'Billion'];

function convertChunk(n: number): string {
    if (n === 0) return '';
    let word = '';

    if (n >= 100) {
        word += ones[Math.floor(n / 100)] + ' Hundred';
        n %= 100;
        if (n > 0) word += ' ';
    }
    if (n >= 20) {
        word += tens[Math.floor(n / 10)];
        n %= 10;
        if (n > 0) word += ' ';
    }
    if (n >= 10) {
        return word + teens[n - 10];
    }
    if (n > 0) {
        word += ones[n];
    }
    return word;
}

export const numberToWords = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '';
    if (num === 0) return 'Zero';

    const numStr = Math.floor(num).toString();
    const chunks = [];
    for (let i = numStr.length; i > 0; i -= 3) {
        chunks.push(numStr.substring(Math.max(0, i - 3), i));
    }
    
    if (chunks.length === 0) return '';

    let words = chunks.map((chunk, i) => {
        const chunkNum = parseInt(chunk);
        if (chunkNum === 0) return '';
        const chunkWords = convertChunk(chunkNum);
        return chunkWords + (i > 0 ? ' ' + thousands[i] : '');
    }).reverse().join(' ').trim().replace(/\s+/g, ' ');

    return words.charAt(0).toUpperCase() + words.slice(1);
};
