import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { UserProfile, Prospect } from './types';

interface EditProspectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateProspect: (prospectData: Partial<Prospect> & { id: string }) => void;
    prospect: Prospect | null;
    users: UserProfile[];
}

const EditProspectModal: React.FC<EditProspectModalProps> = ({ isOpen, onClose, onUpdateProspect, prospect, users }) => {
    const [formData, setFormData] = useState({
        client_name: '',
        email: '',
        phone_number: '',
        loan_amount: '',
        client_type: 'individual' as Prospect['client_type'],
        loan_type: 'purchase' as Prospect['loan_type'],
        assigned_to: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (prospect) {
            setFormData({
                client_name: prospect.client_name || '',
                email: prospect.email || '',
                phone_number: prospect.phone_number || '',
                loan_amount: prospect.loan_amount?.toString() || '',
                client_type: prospect.client_type || 'individual',
                loan_type: prospect.loan_type || 'purchase',
                assigned_to: prospect.assigned_to || '',
            });
        }
    }, [prospect, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prospect || !formData.client_name || !formData.assigned_to) {
            setError('Client Name and Assigned To are required.');
            return;
        }
        
        onUpdateProspect({
            id: prospect.id,
            client_name: formData.client_name,
            email: formData.email,
            phone_number: formData.phone_number,
            loan_amount: parseFloat(formData.loan_amount) || 0,
            client_type: formData.client_type,
            loan_type: formData.loan_type,
            assigned_to: formData.assigned_to,
        });

        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Prospect">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="client_name" className="block text-sm font-medium text-gray-700">Client Name</label>
                    <input type="text" name="client_name" id="client_name" value={formData.client_name} onChange={handleChange} className="input-field mt-1" required/>
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="input-field mt-1" />
                </div>
                 <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" name="phone_number" id="phone_number" value={formData.phone_number} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="loan_amount" className="block text-sm font-medium text-gray-700">Loan Amount</label>
                    <input type="number" name="loan_amount" id="loan_amount" value={formData.loan_amount} onChange={handleChange} className="input-field mt-1" />
                </div>
                
                <div>
                    <span className="block text-sm font-medium text-gray-700">Client Type</span>
                    <div className="mt-2 flex space-x-4">
                        <label className="flex items-center"><input type="radio" name="client_type" value="individual" checked={formData.client_type === 'individual'} onChange={handleRadioChange} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Individual</span></label>
                        <label className="flex items-center"><input type="radio" name="client_type" value="company" checked={formData.client_type === 'company'} onChange={handleRadioChange} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Company</span></label>
                        <label className="flex items-center"><input type="radio" name="client_type" value="both" checked={formData.client_type === 'both'} onChange={handleRadioChange} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Both</span></label>
                    </div>
                </div>

                 <div>
                    <span className="block text-sm font-medium text-gray-700">Loan Type</span>
                    <div className="mt-2 flex space-x-4">
                        <label className="flex items-center"><input type="radio" name="loan_type" value="purchase" checked={formData.loan_type === 'purchase'} onChange={handleRadioChange} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Purchase</span></label>
                        <label className="flex items-center"><input type="radio" name="loan_type" value="refinance" checked={formData.loan_type === 'refinance'} onChange={handleRadioChange} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Refinance</span></label>
                    </div>
                </div>

                <div>
                    <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">Assigned to</label>
                    <select name="assigned_to" id="assigned_to" value={formData.assigned_to} onChange={handleChange} className="input-field mt-1" required>
                        <option value="" disabled>Select user...</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                        ))}
                    </select>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button type="submit" className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700">
                        Save
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProspectModal;