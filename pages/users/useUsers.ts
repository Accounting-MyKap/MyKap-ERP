// pages/users/useUsers.ts
import { useState, useEffect } from 'react';
import { UserWithRole, UserRole } from './types';
import { supabase } from '../../services/supabase';

export const useUsers = () => {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            // In a real app, you would need a secure way to get all users.
            // This is often done via an RPC call to a Supabase function that can join
            // auth.users with public.profiles.
            // For simplicity here, we'll query the public profiles table,
            // assuming it has all the necessary info like an email column.
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, role'); // Assuming 'email' is not in 'profiles' based on screenshot.
            
            if (error) {
                console.error('Error fetching users:', error);
            } else {
                 // The 'email' and 'last_sign_in_at' are not available here.
                 // The UI must be adapted to handle this.
                setUsers(data as UserWithRole[]);
            }
            setLoading(false);
        };

        fetchUsers();
    }, []);

    const inviteUser = async (email: string, role: UserRole) => {
        console.log(`Inviting user ${email} with role ${role}`);
        // NOTE: Inviting a user is an admin-level action that requires the service_role key.
        // This CANNOT be safely done from the client-side. In a real production app,
        // you MUST move this logic to a Supabase Edge Function and call it from the client.
        alert("This is a demo action. In a real app, an Edge Function would handle the secure invitation.");
        
        // Example Edge Function call:
        // const { data, error } = await supabase.functions.invoke('invite-user', {
        //     body: { email, role },
        // });
        // if (error) { ... } else { ... }
    };

    const updateUserRole = async (userId: string, newRole: UserRole | null) => {
        // Optimistic update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);
            
        if (error) {
            console.error("Update Role Error:", error);
            alert(`Failed to update role: ${error.message}`);
            // Re-fetch to revert state on error
            // This could be improved by storing original state and reverting.
            const { data } = await supabase.from('profiles').select('*');
            if (data) setUsers(data as UserWithRole[]);
        }
    };

    return { users, loading, inviteUser, updateUserRole };
};
