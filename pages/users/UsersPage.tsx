// pages/users/UsersPage.tsx
import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import { useUsers } from './useUsers';
import { useToast } from '../../hooks/useToast';
import { AddIcon, EditIcon } from '../../components/icons';
import InviteUserModal from './InviteUserModal';
import EditUserRoleModal from './EditUserRoleModal';
import { UserWithRole, UserRole } from './types';

const roleDisplay: Record<UserRole, string> = {
    admin: 'Admin',
    loan_officer: 'Loan Officer',
    financial_officer: 'Financial Officer',
};

const roleColors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800',
    loan_officer: 'bg-blue-100 text-blue-800',
    financial_officer: 'bg-green-100 text-green-800',
};

const UsersPage: React.FC = () => {
    const { users, loading, error, inviteUser, updateUserRole, refetch } = useUsers();
    const { showToast } = useToast();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
    
    const handleInviteUser = async (email: string, role: UserRole) => {
        try {
            await inviteUser(email, role);
            showToast('User invited successfully!', 'success');
            // The modal is responsible for closing itself on success.
        } catch (error: unknown) {
            // The modal is responsible for showing the error, but we can re-throw
            // to ensure the promise is rejected correctly for the modal's catch block.
            throw error;
        }
    };
    
    const handleSaveRole = async (userId: string, newRole: UserRole) => {
        try {
            await updateUserRole(userId, newRole);
            showToast('User role updated successfully!', 'success');
            // The modal is responsible for closing itself on success.
        } catch (error: unknown) {
            throw error;
        }
    };

    return (
        <DashboardLayout>
            <Header title="User Management" subtitle="Invite and manage user roles and permissions." />
            
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
                    <button
                        onClick={() => setInviteModalOpen(true)}
                        className="flex items-center justify-center bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <AddIcon className="h-5 w-5 mr-2" />
                        Invite User
                    </button>
                </div>

                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center justify-between" role="alert">
                        <span>{error}</span>
                        <button 
                            onClick={refetch}
                            className="ml-4 text-sm underline hover:text-red-900 font-medium"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-8 text-gray-500">
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Loading users...
                                        </div>
                                    </td>
                                </tr>
                            ) : !error && users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-8 text-gray-500">
                                        No users found.{' '}
                                        <button 
                                            onClick={() => setInviteModalOpen(true)} 
                                            className="text-blue-600 underline hover:text-blue-800 font-medium"
                                        >
                                            Invite your first user
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {user.first_name} {user.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {user.email || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {user.role ? (
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
                                                    {roleDisplay[user.role]}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    No Role Assigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => setEditingUser(user)}
                                                disabled={loading}
                                                className={`transition-colors ${
                                                    loading 
                                                        ? 'text-gray-400 cursor-not-allowed' 
                                                        : 'text-blue-600 hover:text-blue-900'
                                                }`}
                                                title="Edit user role"
                                                aria-label={`Edit role for ${user.first_name} ${user.last_name}`}
                                            >
                                                <EditIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onInvite={handleInviteUser}
            />

            <EditUserRoleModal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                onSave={handleSaveRole}
            />
        </DashboardLayout>
    );
};

export default UsersPage;