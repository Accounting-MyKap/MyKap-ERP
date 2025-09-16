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
        // Remove everything that is not a digit or a decimal point.
        const numericString = value.replace(/[^0-9.]/g, '');
        const number = parseFloat(numericString);
        return isNaN(number) ? 0 : number;
    }
    return 0;
};
