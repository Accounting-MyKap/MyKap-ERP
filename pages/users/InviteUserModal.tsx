// pages/users/InviteUserModal.tsx
import React, { useState, useEffect } from 'react';
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
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setEmail('');
            setRole('loan_officer');
            setError(null);
            setEmailError(null);
        }
    }, [isOpen]);

    const validateEmail = (email: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email.trim());
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        
        if (value && !validateEmail(value)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setError(null);
        setIsInviting(true);
        
        try {
            await onInvite(email.trim(), role);
            // On success, the parent component (`UsersPage`) is responsible for closing the modal and showing a toast.
        } catch (error: unknown) {
            const message = error instanceof Error 
                ? error.message 
                : 'Failed to send invitation. Please try again.';
            setError(message);
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invite New User">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        className={`input-field mt-1 ${emailError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="name@example.com"
                        required
                        disabled={isInviting}
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? 'email-error' : undefined}
                    />
                    {emailError && (
                        <p id="email-error" className="mt-1 text-sm text-red-600">
                            {emailError}
                        </p>
                    )}
                </div>
                
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Assign Role
                    </label>
                    <select
                        id="role"
                        value={role}
                        onChange={e => setRole(e.target.value as UserRole)}
                        className="input-field mt-1"
                        required
                        disabled={isInviting}
                    >
                        <option value="loan_officer">Loan Officer</option>
                        <option value="financial_officer">Financial Officer</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm" role="alert">
                        {error}
                    </div>
                )}

                <div className="pt-4 flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isInviting}
                        className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isInviting || !!emailError}
                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isInviting ? 'Sending...' : 'Send Invitation'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default InviteUserModal;