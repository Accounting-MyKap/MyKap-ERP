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

    // In a real app, you would have functions here to add, update, and delete lenders
    // that make API calls to your backend (e.g., Supabase).

    return { lenders, loading };
};
