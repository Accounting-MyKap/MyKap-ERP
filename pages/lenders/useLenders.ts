import { useState, useEffect } from 'react';
import { Lender } from '../prospects/types';
import { MOCK_LENDERS } from './mockData';

export const useLenders = () => {
    const [lenders, setLenders] = useState<Lender[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data
        setTimeout(() => {
            setLenders(MOCK_LENDERS);
            setLoading(false);
        }, 500);
    }, []);

    const addLender = (lenderData: Omit<Lender, 'id' | 'portfolio_value' | 'trust_balance'>) => {
        const newLender: Lender = {
            id: `lender-${crypto.randomUUID()}`,
            ...lenderData,
            portfolio_value: 0,
            trust_balance: 0,
        };
        setLenders(prev => [newLender, ...prev]);
    };

    const updateLender = (lenderId: string, updatedData: Partial<Omit<Lender, 'id'>>) => {
        setLenders(prev =>
            prev.map(lender =>
                lender.id === lenderId ? { ...lender, ...updatedData } : lender
            )
        );
    };

    return { lenders, loading, addLender, updateLender };
};