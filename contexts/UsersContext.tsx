import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserWithRole, UserRole } from '../pages/users/types';
import { supabase } from '../services/supabase';

interface UsersContextType {
    users: UserWithRole[];
    loading: boolean;
    error: string | null;
    inviteUser: (email: string, role: UserRole) => Promise<void>;
    updateUserRole: (userId: string, newRole: UserRole | null) => Promise<void>;
    refetch: () => void;
}

export const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name, role');

        if (fetchError) {
            console.error('Error fetching users from profiles table:', fetchError);
            setError('Failed to load users. Please try again.');
            setUsers([]);
        } else {
            setUsers(data as UserWithRole[]);
        }
        
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const inviteUser = async (email: string, role: UserRole) => {
        const { error } = await supabase.functions.invoke('invite-user', {
            body: { email, role },
        });

        if (error) {
            console.error("Invite User Error:", error);
            throw new Error(error.message || 'Failed to invite user.');
        }
    };

    const updateUserRole = async (userId: string, newRole: UserRole | null) => {
        const originalUsers = users;
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);
            
        if (error) {
            console.error("Update Role Error:", error);
            setUsers(originalUsers);
            throw new Error(error.message || 'Failed to update role');
        }
    };

    const value = { 
        users, 
        loading, 
        error,
        inviteUser, 
        updateUserRole,
        refetch: fetchUsers 
    };

    return (
        <UsersContext.Provider value={value}>
            {children}
        </UsersContext.Provider>
    );
};
