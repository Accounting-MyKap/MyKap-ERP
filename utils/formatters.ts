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
