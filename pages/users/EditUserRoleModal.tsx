// pages/users/EditUserRoleModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { UserRole, UserWithRole } from './types';

interface EditUserRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserWithRole | null;
    onSave: (userId: string, newRole: UserRole) => Promise<void>;
}

const EditUserRoleModal: React.FC<EditUserRoleModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole>('loan_officer');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setSelectedRole(user.role || 'loan_officer');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
            await onSave(user.id, selectedRole);
        } catch (error) {
            console.error("Failed to update role", error);
            // Optionally show an error message to the user
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Role for ${user.first_name} ${user.last_name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">User:</span> {user.email}
                    </p>
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Assign Role</label>
                    <select
                        id="role"
                        value={selectedRole}
                        onChange={e => setSelectedRole(e.target.value as UserRole)}
                        className="input-field mt-1"
                        required
                    >
                        <option value="loan_officer">Loan Officer</option>
                        <option value="financial_officer">Financial Officer</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isSaving ? 'Saving...' : 'Save Role'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditUserRoleModal;