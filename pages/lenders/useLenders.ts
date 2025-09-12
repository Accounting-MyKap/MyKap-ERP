import { useState, useEffect } from 'react';
import { Lender, TrustAccountEvent } from '../prospects/types';
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

    const addFundsToLenderTrust = (lenderId: string, amount: number, description: string) => {
        setLenders(prev => prev.map(lender => {
            if (lender.id !== lenderId) {
                return lender;
            }

            const newTrustBalance = lender.trust_balance + amount;
            const newHistoryEvent: TrustAccountEvent = {
                id: `evt-${Date.now()}-${Math.random()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'deposit',
                description,
                amount,
                balance: newTrustBalance // Note: This assumes serial processing. Recalculation logic may be needed.
            };
            
            // For simplicity, we just append. A real implementation should re-calculate all balances.
            const updatedHistory = [...(lender.trust_account_history || []), newHistoryEvent];

            return {
                ...lender,
                trust_balance: newTrustBalance,
                trust_account_history: updatedHistory,
            };
        }));
    };
    
    const withdrawFromLenderTrust = (lenderId: string, eventData: Omit<TrustAccountEvent, 'id' | 'balance' | 'type'>) => {
        setLenders(prev => prev.map(lender => {
            if (lender.id !== lenderId) {
                return lender;
            }

            const newEvent: TrustAccountEvent = {
                id: `evt-${Date.now()}`,
                ...eventData,
                type: 'withdrawal',
                balance: 0, // Will be recalculated
            };
            
            const newHistory = [...(lender.trust_account_history || []), newEvent].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            // Recalculate balances from the start
            let currentBalance = 0;
            const updatedHistory = newHistory.map(event => {
                const amount = event.type === 'deposit' ? event.amount : -event.amount;
                currentBalance += amount;
                return { ...event, balance: currentBalance };
            });

            return {
                ...lender,
                trust_balance: currentBalance,
                trust_account_history: updatedHistory,
            };
        }));
    };

    return { lenders, loading, addLender, updateLender, addFundsToLenderTrust, withdrawFromLenderTrust };
};