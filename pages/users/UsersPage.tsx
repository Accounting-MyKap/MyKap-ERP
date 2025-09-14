// pages/users/UsersPage.tsx
import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import { useUsers } from './useUsers';
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
    const { users, loading, inviteUser, updateUserRole } = useUsers();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const handleSaveRole = async (userId: string, newRole: UserRole) => {
        await updateUserRole(userId, newRole);
        setEditingUser(null);
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

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sign In</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-4 text-gray-500">Loading users...</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(user.last_sign_in_at)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => setEditingUser(user)}
                                                className="text-blue-600 hover:text-blue-900" 
                                                title="Edit user role"
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
                onInvite={inviteUser}
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