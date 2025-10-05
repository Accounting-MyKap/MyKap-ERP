// pages/users/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { UserWithRole, UserRole } from './types';
import { supabase } from '../../services/supabase';

export const useUsers = () => {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        // Calls Supabase RPC 'get_all_users_with_roles' to fetch user data.
        // This RPC must be created in your Supabase project's SQL editor.
        const { data, error: fetchError } = await supabase.rpc('get_all_users_with_roles');
        
        if (fetchError) {
            console.error('Error fetching users:', fetchError);
            setError('Failed to load users. Please try again.');
            setUsers([]);
        } else {
            setUsers(data as UserWithRole[]);
        }
        
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    // The dependency array is empty because fetchUsers is stable (memoized with an empty
    // dependency array itself), so this effect only needs to run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const inviteUser = async (email: string, role: UserRole) => {
        // Calls the 'invite-user' Edge Function which requires service_role privileges on the backend.
        const { error } = await supabase.functions.invoke('invite-user', {
            body: { email, role },
        });

        if (error) {
            console.error("Invite User Error:", error);
            throw new Error(error.message || 'Failed to invite user. Make sure the Edge Function is configured.');
        }
        
        // Success is handled by the calling component.
    };

    const updateUserRole = async (userId: string, newRole: UserRole | null) => {
        const originalUsers = users;
        
        // Optimistic update for immediate UI feedback
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);
            
        if (error) {
            console.error("Update Role Error:", error);
            // Revert on error
            setUsers(originalUsers);
            throw new Error(error.message || 'Failed to update role');
        }
        
        // Success - optimistic update is confirmed.
    };

    return { 
        users, 
        loading, 
        error,
        inviteUser, 
        updateUserRole,
        refetch: fetchUsers 
    };
};