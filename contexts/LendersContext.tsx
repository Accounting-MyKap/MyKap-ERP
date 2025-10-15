import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Lender, TrustAccountEvent } from '../pages/prospects/types';
import { supabase } from '../services/supabase';

interface LendersContextType {
    lenders: Lender[];
    loading: boolean;
    error: string | null;
    addLender: (lenderData: Omit<Lender, 'id' | 'portfolio_value' | 'trust_balance' | 'updated_at' | 'trust_account_events'>) => Promise<void>;
    updateLender: (lenderId: string, updatedData: Partial<Omit<Lender, 'trust_account_events'>>) => Promise<void>;
    addFundsToLenderTrust: (lenderId: string, amount: number, description: string) => Promise<void>;
    withdrawFromLenderTrust: (lenderId: string, eventData: Omit<TrustAccountEvent, 'id' | 'event_type'>) => Promise<void>;
}

export const LendersContext = createContext<LendersContextType | undefined>(undefined);

export const LendersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lenders, setLenders] = useState<Lender[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleLenderUpdate = useCallback(async (lenderId: string, updateFunction: (lender: Lender) => Partial<Lender>) => {
        const originalLender = lenders.find(l => l.id === lenderId);
        if (!originalLender) {
            throw new Error("Lender not found for update.");
        }

        const updates = updateFunction(originalLender);
        const updatedLender = { ...originalLender, ...updates };

        // Optimistic update
        setLenders(prevLenders => prevLenders.map(l => (l.id === lenderId ? updatedLender : l)));
        
        const newUpdatedAt = new Date().toISOString();
        
        // Implement optimistic locking by checking updated_at
        const { data, error } = await supabase
            .from('lenders')
            .update({ ...updates, updated_at: newUpdatedAt })
            .eq('id', lenderId)
            .eq('updated_at', originalLender.updated_at)
            .select('*, trust_account_events(*)')
            .single();

        if (error) {
            console.error('Failed to update lender:', error.message);
            // Revert on error
            setLenders(prevLenders => prevLenders.map(l => (l.id === lenderId ? originalLender : l)));
            throw new Error(`Update failed: ${error.message}`);
        }

        if (!data) {
            // Concurrency conflict
            console.warn('Concurrency conflict detected. Reverting optimistic update.');
            setLenders(prevLenders => prevLenders.map(l => (l.id === lenderId ? originalLender : l)));
            throw new Error("This lender was updated by someone else. Please refresh and try again.");
        }
        
        // Sync with the database state
        setLenders(prevLenders => prevLenders.map(l => (l.id === lenderId ? data as Lender : l)));
    }, [lenders]);


    useEffect(() => {
        const fetchLenders = async () => {
            setLoading(true);
            setError(null);
            const { data, error: fetchError } = await supabase
                .from('lenders')
                .select('*, trust_account_events(*)') // Fetch lenders and their related events
                .order('created_at', { ascending: false });
            
            if (fetchError) {
                console.error("Error fetching lenders:", fetchError);
                setError("Failed to load lenders. Please check your connection and try again.");
            } else {
                setLenders(data as Lender[]);
            }
            setLoading(false);
        };
        fetchLenders();
    }, []);

    const addLender = async (lenderData: Omit<Lender, 'id' | 'portfolio_value' | 'trust_balance' | 'updated_at' | 'trust_account_events'>) => {
        const newLender: Omit<Lender, 'id' | 'created_at' | 'updated_at' | 'trust_account_events'> = {
            portfolio_value: 0,
            trust_balance: 0,
            ...lenderData,
        };

        const { data, error } = await supabase
            .from('lenders')
            .insert(newLender)
            .select('*, trust_account_events(*)') // Also fetch events for the new lender
            .single();

        if (error) {
            console.error("Error adding lender:", error);
            throw new Error(error.message || "Could not add lender.");
        } else if (data) {
            setLenders(prev => [data as Lender, ...prev]);
        }
    };

    const updateLender = async (lenderId: string, updatedData: Partial<Omit<Lender, 'trust_account_events'>>) => {
        await handleLenderUpdate(lenderId, () => updatedData);
    };

    // Generic function to handle a new trust transaction via RPC
    const addTrustTransaction = async (
        lenderId: string,
        type: 'deposit' | 'withdrawal',
        eventData: { event_date: string; description: string; amount: number }
    ) => {
        const originalLender = lenders.find(l => l.id === lenderId);
        if (!originalLender) throw new Error("Lender not found.");

        if (eventData.amount <= 0 || !Number.isFinite(eventData.amount)) {
            throw new Error("Transaction amount must be a positive number.");
        }
        if (!eventData.description || eventData.description.trim() === '') {
            throw new Error("A description is required for the transaction.");
        }
        if (type === 'withdrawal' && originalLender.trust_balance < eventData.amount) {
            throw new Error("Insufficient funds for withdrawal.");
        }

        // Optimistic Update
        const amountChange = type === 'deposit' ? eventData.amount : -eventData.amount;
        const newEvent: TrustAccountEvent = {
            id: `temp-${crypto.randomUUID()}`,
            ...eventData,
            event_type: type,
        };
        const optimisticallyUpdatedLender = {
            ...originalLender,
            trust_balance: originalLender.trust_balance + amountChange,
            trust_account_events: [...(originalLender.trust_account_events || []), newEvent].sort((a,b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()),
        };
        setLenders(prev => prev.map(l => l.id === lenderId ? optimisticallyUpdatedLender : l));

        // Call RPC
        const { error } = await supabase.rpc('add_trust_transaction', {
            p_lender_id: lenderId,
            p_event_type: type,
            p_event_date: eventData.event_date,
            p_description: eventData.description,
            p_amount: eventData.amount
        });

        if (error) {
            console.error(`Error during ${type}:`, error);
            // Revert on failure
            setLenders(prev => prev.map(l => l.id === lenderId ? originalLender : l));
            throw new Error(`Failed to record ${type}.`);
        }

        // Fetch fresh data to re-sync state after successful RPC
        const { data: updatedLender, error: fetchError } = await supabase
            .from('lenders')
            .select('*, trust_account_events(*)')
            .eq('id', lenderId)
            .single();

        if (fetchError) {
             console.error("Failed to re-sync lender state:", fetchError);
             // Revert if re-sync fails
             setLenders(prev => prev.map(l => l.id === lenderId ? originalLender : l));
        } else if (updatedLender) {
            setLenders(prev => prev.map(l => l.id === lenderId ? updatedLender as Lender : l));
        }
    };


    const addFundsToLenderTrust = async (lenderId: string, amount: number, description: string): Promise<void> => {
        await addTrustTransaction(lenderId, 'deposit', {
            event_date: new Date().toISOString().split('T')[0],
            description,
            amount
        });
    };

    const withdrawFromLenderTrust = async (lenderId: string, eventData: Omit<TrustAccountEvent, 'id' | 'event_type'>): Promise<void> => {
        await addTrustTransaction(lenderId, 'withdrawal', eventData);
    };

    const value = { lenders, loading, error, addLender, updateLender, addFundsToLenderTrust, withdrawFromLenderTrust };

    return (
        <LendersContext.Provider value={value}>
            {children}
        </LendersContext.Provider>
    );
};