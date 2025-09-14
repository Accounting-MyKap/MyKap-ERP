// pages/users/useUsers.ts
import { useState, useEffect } from 'react';
import { UserWithRole, UserRole } from './types';
import { MOCK_APP_USERS } from './mockUserData';
// import { supabase } from '../../services/supabase';

export const useUsers = () => {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            // MOCK IMPLEMENTATION
            setTimeout(() => {
                setUsers(MOCK_APP_USERS);
                setLoading(false);
            }, 500);

            // REAL IMPLEMENTATION
            // const { data, error } = await supabase.from('profiles').select('id, email, first_name, last_name, role');
            // if (error) {
            //     console.error('Error fetching users:', error);
            // } else {
            //     // We would need to join with auth.users to get email and last_sign_in_at
            //     // This is a simplified example.
            //     setUsers(data as UserWithRole[]);
            // }
            // setLoading(false);
        };

        fetchUsers();
    }, []);

    const inviteUser = async (email: string, role: UserRole) => {
        console.log(`Inviting user ${email} with role ${role}`);
        // MOCK IMPLEMENTATION
        const newUser: UserWithRole = {
            id: crypto.randomUUID(),
            email,
            first_name: 'Invited',
            last_name: 'User',
            role,
        };
        setUsers(prev => [...prev, newUser]);
        alert(`Invitation sent to ${email}!`);
        
        // REAL SUPABASE IMPLEMENTATION
        // const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        //     data: { role: role } // This assumes you have a way to set role on invite
        // });
        // if (error) {
        //     console.error("Invitation Error:", error);
        //     alert(`Failed to invite user: ${error.message}`);
        // } else {
        //     alert(`Invitation sent to ${email}!`);
        //     // You would probably re-fetch users here
        // }
    };

    const updateUserRole = async (userId: string, newRole: UserRole) => {
        console.log(`Updating user ${userId} to role ${newRole}`);
        // MOCK IMPLEMENTATION
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        
        // REAL SUPABASE IMPLEMENTATION
        // const { data, error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        // if (error) {
        //     console.error("Update Role Error:", error);
        //     alert(`Failed to update role: ${error.message}`);
        // } else {
        //     // Re-fetch or update state
        // }
    };

    return { users, loading, inviteUser, updateUserRole };
};
