// pages/users/EditUserRoleModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { UserRole, UserWithRole } from './types';
import { InformationCircleIcon } from '../../components/icons';

interface EditUserRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserWithRole | null;
    onSave: (userId: string, newRole: UserRole) => Promise<void>;
}

const EditUserRoleModal: React.FC<EditUserRoleModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole>('loan_officer');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialRole, setInitialRole] = useState<UserRole | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            const userRole = user.role || 'loan_officer';
            setSelectedRole(userRole);
            setInitialRole(userRole);
            setError(null);
        }
    }, [isOpen, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError(null);
        setIsSaving(true);
        
        try {
            await onSave(user.id, selectedRole);
            // The parent component will show a success toast. The modal can now close itself.
        } catch (error: unknown) {
            const message = error instanceof Error 
                ? error.message 
                : 'Failed to update role. Please try again.';
            setError(message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    const hasChanges = selectedRole !== initialRole;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Role for ${user.first_name} ${user.last_name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {user.email || 'N/A'}
                    </p>
                    {initialRole && (
                        <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Current Role:</span>{' '}
                            <span className="capitalize">{initialRole.replace('_', ' ')}</span>
                        </p>
                    )}
                </div>
                
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Assign Role
                    </label>
                    <select
                        id="role"
                        value={selectedRole}
                        onChange={e => setSelectedRole(e.target.value as UserRole)}
                        className="input-field mt-1"
                        disabled={isSaving}
                        required
                    >
                        <option value="loan_officer">Loan Officer</option>
                        <option value="financial_officer">Financial Officer</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {!hasChanges && !error && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
                        <p className="flex items-center">
                            <InformationCircleIcon className="w-5 h-5 mr-2" />
                            Select a different role to enable saving
                        </p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm" role="alert">
                        {error}
                    </div>
                )}

                <div className="pt-4 flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isSaving}
                        className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving || !hasChanges}
                        className={`font-medium py-2 px-4 rounded-md transition-colors ${
                            isSaving || !hasChanges
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        title={!hasChanges ? 'No changes to save' : 'Save changes'}
                    >
                        {isSaving ? 'Saving...' : 'Save Role'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditUserRoleModal;
