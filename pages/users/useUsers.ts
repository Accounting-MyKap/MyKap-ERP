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
        
        // WORKAROUND: The RPC 'get_all_users_with_roles' is returning a 400 error.
        // As a fallback, this queries the 'profiles' table directly.
        // This assumes RLS is configured to allow the logged-in user (e.g., an admin)
        // to view all profiles. This query will not include 'last_sign_in_at'
        // as that data is in the protected 'auth.users' table.
        const { data, error: fetchError } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name, role');

        if (fetchError) {
            console.error('Error fetching users from profiles table:', fetchError);
            setError('Failed to load users. Please try again.');
            setUsers([]);
        } else {
            // The data from 'profiles' maps to UserWithRole, minus optional fields.
            setUsers(data as UserWithRole[]);
        }
        
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

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
