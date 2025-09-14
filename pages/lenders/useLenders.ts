import { useState, useEffect } from 'react';
import { Lender, TrustAccountEvent } from '../prospects/types';
import { supabase } from '../../services/supabase';

export const useLenders = () => {
    const [lenders, setLenders] = useState<Lender[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLenders = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('lenders')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error fetching lenders:", error);
            } else {
                setLenders(data as Lender[]);
            }
            setLoading(false);
        };
        fetchLenders();
    }, []);

    const addLender = async (lenderData: Omit<Lender, 'id' | 'portfolio_value' | 'trust_balance'>) => {
        const newLender: Omit<Lender, 'id' | 'created_at'> = {
            portfolio_value: 0,
            trust_balance: 0,
            ...lenderData,
        };

        const { data, error } = await supabase
            .from('lenders')
            .insert([newLender])
            .select()
            .single();

        if (error) {
            console.error("Error adding lender:", error);
        } else if (data) {
            setLenders(prev => [data, ...prev]);
        }
    };

    const updateLender = async (lenderId: string, updatedData: Partial<Lender>) => {
        const originalLender = lenders.find(l => l.id === lenderId);
        if (!originalLender) return;

        // Optimistic update
        setLenders(prev => prev.map(l => l.id === lenderId ? { ...l, ...updatedData } : l));

        const { data, error } = await supabase
            .from('lenders')
            .update(updatedData)
            .eq('id', lenderId)
            .select()
            .single();
        
        if (error) {
            console.error("Error updating lender:", error);
            // Revert on error
            setLenders(prev => prev.map(l => l.id === lenderId ? originalLender : l));
        } else if(data) {
            // Sync with DB state
            setLenders(prev => prev.map(l => l.id === lenderId ? data : l));
        }
    };
    
    const syncLender = (updatedLender: Lender) => {
        setLenders(prev => prev.map(l => l.id === updatedLender.id ? updatedLender : l));
    };

    const handleLenderUpdate = async (lenderId: string, updateFunction: (lender: Lender) => Lender) => {
        const lenderToUpdate = lenders.find(p => p.id === lenderId);
        if (!lenderToUpdate) return;

        const updatedLender = updateFunction(lenderToUpdate);
        syncLender(updatedLender); // Optimistic update

        const { data, error } = await supabase
            .from('lenders')
            .update(updatedLender)
            .eq('id', lenderId)
            .select()
            .single();

        if (error) {
            console.error('Failed to update lender:', error.message);
            syncLender(lenderToUpdate); // Revert
        } else if (data) {
            syncLender(data); // Sync with DB
        }
    };


    const addFundsToLenderTrust = (lenderId: string, amount: number, description: string) => {
        handleLenderUpdate(lenderId, (lender) => {
            const newTrustBalance = lender.trust_balance + amount;
            const newHistoryEvent: TrustAccountEvent = {
                id: `evt-${crypto.randomUUID()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'deposit',
                description,
                amount,
                balance: newTrustBalance
            };
            const updatedHistory = [...(lender.trust_account_history || []), newHistoryEvent];
            return {
                ...lender,
                trust_balance: newTrustBalance,
                trust_account_history: updatedHistory,
            };
        });
    };

    const withdrawFromLenderTrust = (lenderId: string, eventData: Omit<TrustAccountEvent, 'id' | 'balance' | 'type'>) => {
         handleLenderUpdate(lenderId, (lender) => {
            const newEvent: TrustAccountEvent = {
                id: `evt-${crypto.randomUUID()}`,
                ...eventData,
                type: 'withdrawal',
                balance: 0, // Recalculated below
            };
            const newHistory = [...(lender.trust_account_history || []), newEvent].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            let currentBalance = 0;
            const updatedHistory = newHistory.map(event => {
                const amountChange = event.type === 'deposit' ? event.amount : -event.amount;
                currentBalance += amountChange;
                return { ...event, balance: currentBalance };
            });

            return {
                ...lender,
                trust_balance: currentBalance,
                trust_account_history: updatedHistory,
            };
        });
    };


    return { lenders, loading, addLender, updateLender, addFundsToLenderTrust, withdrawFromLenderTrust };
};
