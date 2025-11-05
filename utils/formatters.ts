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

// FIX: Add and export the missing 'numberToWords' function.
// This function converts a number to its English word representation, as required by the document generation feature.
export const numberToWords = (num: number | null | undefined): string => {
    if (num === null || num === undefined) {
        return '';
    }
    const integerPart = Math.floor(num);

    const belowTwenty = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const thousands = ['', 'thousand', 'million', 'billion', 'trillion'];

    const toWords = (n: number): string => {
        if (n === 0) return '';
        if (n < 20) {
            return belowTwenty[n];
        }
        if (n < 100) {
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + belowTwenty[n % 10] : '');
        }
        if (n < 1000) {
            return belowTwenty[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' ' + toWords(n % 100) : '');
        }
        return '';
    };

    if (integerPart === 0) {
        return 'Zero';
    }

    let n = integerPart;
    let words = [];
    let i = 0;

    while (n > 0) {
        if (n % 1000 !== 0) {
            words.unshift(toWords(n % 1000) + (i > 0 ? ' ' + thousands[i] : ''));
        }
        n = Math.floor(n / 1000);
        i++;
    }

    let result = words.join(' ');
    result = result.replace(/\s+/g, ' ').trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
};