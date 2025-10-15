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
            throw error;
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
            // FIX: Changed 'date' to 'event_date' and 'type' to 'event_type' to match the TrustAccountEvent type.
            const newHistoryEvent: TrustAccountEvent = {
                id: `evt-${crypto.randomUUID()}`,
                event_date: new Date().toISOString().split('T')[0],
                event_type: 'deposit',
                description,
                amount,
                balance: newTrustBalance
            };
            // FIX: Changed 'trust_account_history' to 'trust_account_events' to match the Lender type.
            const updatedHistory = [...(lender.trust_account_events || []), newHistoryEvent];
            return {
                ...lender,
                trust_balance: newTrustBalance,
                // FIX: Changed 'trust_account_history' to 'trust_account_events' to match the Lender type.
                trust_account_events: updatedHistory,
            };
        });
    };

    // FIX: Corrected the Omit type to use 'event_type' instead of 'type'.
    const withdrawFromLenderTrust = (lenderId: string, eventData: Omit<TrustAccountEvent, 'id' | 'balance' | 'event_type'>) => {
         handleLenderUpdate(lenderId, (lender) => {
            // FIX: Changed 'type' to 'event_type' to match the TrustAccountEvent type.
            const newEvent: TrustAccountEvent = {
                id: `evt-${crypto.randomUUID()}`,
                ...eventData,
                event_type: 'withdrawal',
                balance: 0, // Recalculated below
            };
            // FIX: Changed 'trust_account_history' to 'trust_account_events' and 'a.date'/'b.date' to 'a.event_date'/'b.event_date'.
            const newHistory = [...(lender.trust_account_events || []), newEvent].sort((a,b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
            
            let currentBalance = 0;
            const updatedHistory = newHistory.map(event => {
                // FIX: Changed 'event.type' to 'event.event_type'.
                const amountChange = event.event_type === 'deposit' ? event.amount : -event.amount;
                currentBalance += amountChange;
                return { ...event, balance: currentBalance };
            });

            return {
                ...lender,
                trust_balance: currentBalance,
                // FIX: Changed 'trust_account_history' to 'trust_account_events' to match the Lender type.
                trust_account_events: updatedHistory,
            };
        });
    };


    return { lenders, loading, addLender, updateLender, addFundsToLenderTrust, withdrawFromLenderTrust };
};