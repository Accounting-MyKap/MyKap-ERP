// pages/users/InviteUserModal.tsx
import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { UserRole } from './types';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string, role: UserRole) => Promise<void>;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>('loan_officer');
    const [isInviting, setIsInviting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            await onInvite(email, role);
            onClose();
            setEmail('');
            setRole('loan_officer');
        } catch (error) {
            console.error("Failed to invite user", error);
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invite New User">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="input-field mt-1"
                        placeholder="name@example.com"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Assign Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={e => setRole(e.target.value as UserRole)}
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
                        disabled={isInviting}
                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isInviting ? 'Sending...' : 'Send Invitation'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default InviteUserModal;
