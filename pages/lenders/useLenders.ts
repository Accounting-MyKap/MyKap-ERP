import { useState, useEffect } from 'react';
import { Lender } from '../prospects/types';
import { MOCK_LENDERS } from './mockData';

export const useLenders = () => {
    const [lenders, setLenders] = useState<Lender[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLenders(MOCK_LENDERS);
            setLoading(false);
        }, 500); // Simulate network delay
    }, []);

    const addLender = (lenderData: Omit<Lender, 'id' | 'portfolio_value' | 'trust_balance'>) => {
        const newLender: Lender = {
            id: `lender-${Date.now()}`,
            portfolio_value: 0,
            trust_balance: 0,
            ...lenderData,
        };
        setLenders(prev => [newLender, ...prev]);
    };

    const updateLender = (lenderId: string, updatedData: Partial<Lender>) => {
        setLenders(prev => prev.map(l => l.id === lenderId ? { ...l, ...updatedData } : l));
    };

    return { lenders, loading, addLender, updateLender };
};
