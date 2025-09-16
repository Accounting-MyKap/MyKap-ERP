// pages/users/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { UserWithRole, UserRole } from './types';
import { supabase } from '../../services/supabase';

export const useUsers = () => {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        // This RPC function must be created in your Supabase project's SQL editor.
        // It securely joins `auth.users` and `public.profiles` to return all user data,
        // which is necessary because client-side code cannot directly query the `auth.users` table.
        //
        // Example SQL for the function:
        // CREATE OR REPLACE FUNCTION get_all_users_with_roles()
        // RETURNS TABLE(id uuid, email text, first_name text, last_name text, role text) -- Use 'text' for role to match JS
        // LANGUAGE sql SECURITY DEFINER AS $$
        //   SELECT u.id, u.email, p.first_name, p.last_name, p.role
        //   FROM auth.users u JOIN public.profiles p ON u.id = p.id;
        // $$;
        const { data, error } = await supabase.rpc('get_all_users_with_roles');
        
        if (error) {
            console.error('Error fetching users:', error);
            alert('Could not fetch user data. Please ensure the `get_all_users_with_roles` RPC function is correctly set up in Supabase.');
        } else {
            setUsers(data as UserWithRole[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const inviteUser = async (email: string, role: UserRole) => {
        // Inviting a user is an admin-level action requiring elevated privileges (service_role key).
        // This MUST be handled by a Supabase Edge Function for security.
        // The following code assumes you have created an Edge Function named 'invite-user'.
        const { error } = await supabase.functions.invoke('invite-user', {
            body: { email, role },
        });

        if (error) {
            console.error("Invite User Error:", error);
            alert(`Failed to invite user: ${error.message}. Make sure the 'invite-user' Edge Function is deployed and configured.`);
            throw error; // Re-throw to be caught in the modal if needed
        }
        
        alert('Invitation sent successfully!');
    };

    const updateUserRole = async (userId: string, newRole: UserRole | null) => {
        const originalUsers = users;
        // Optimistic update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);
            
        if (error) {
            console.error("Update Role Error:", error);
            alert(`Failed to update role: ${error.message}`);
            // Revert state on error
            setUsers(originalUsers);
        }
    };

    return { users, loading, inviteUser, updateUserRole };
};
