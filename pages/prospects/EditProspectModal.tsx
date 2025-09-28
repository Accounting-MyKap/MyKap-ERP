import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { Prospect, UserProfile } from './types';
import { useToast } from '../../hooks/useToast';

interface EditProspectModalProps {
    isOpen: boolean;
    onClose: () => void;
    prospect: Prospect | null;
    onUpdate: (prospectData: Partial<Prospect> & { id: string }) => Promise<void>;
    users: UserProfile[];
}

const EditProspectModal: React.FC<EditProspectModalProps> = ({ isOpen, onClose, prospect, onUpdate, users }) => {
    const [formData, setFormData] = useState<Partial<Prospect>>({});
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (prospect && isOpen) {
            setFormData({
                borrower_name: prospect.borrower_name,
                prospect_code: prospect.prospect_code,
                email: prospect.email,
                phone_number: prospect.phone_number,
                borrower_type: prospect.borrower_type,
                loan_type: prospect.loan_type,
                assigned_to: prospect.assigned_to,
                county: prospect.county,
                state: prospect.state,
            });
        }
    }, [prospect, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleRadioChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prospect) return;

        setIsSaving(true);
        try {
            await onUpdate({ id: prospect.id, ...formData });
            showToast('Prospect updated successfully!', 'success');
            onClose();
        } catch (error: any) {
            showToast(`Error updating prospect: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Prospect Information">
            <form onSubmit={handleSave} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="borrower_name" className="block text-sm font-medium text-gray-700">Borrower Name</label>
                        <input type="text" id="borrower_name" name="borrower_name" value={formData.borrower_name || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                    <div>
                        <label htmlFor="prospect_code" className="block text-sm font-medium text-gray-700">Account</label>
                        <input type="text" id="prospect_code" name="prospect_code" value={formData.prospect_code || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                    <div>
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" id="phone_number" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                     <div>
                        <label htmlFor="county" className="block text-sm font-medium text-gray-700">County</label>
                        <input type="text" id="county" name="county" value={formData.county || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                     <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                        <input type="text" id="state" name="state" value={formData.state || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">Assigned to</label>
                    <select id="assigned_to" name="assigned_to" value={formData.assigned_to || ''} onChange={handleChange} className="input-field mt-1">
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                        ))}
                    </select>
                </div>
                 {/* Borrower Type Radio */}
                <div>
                    <span className="block text-sm font-medium text-gray-700">Borrower Type</span>
                    <div className="mt-2 flex space-x-4">
                        <label className="flex items-center"><input type="radio" name="borrower_type" value="individual" checked={formData.borrower_type === 'individual'} onChange={() => handleRadioChange('borrower_type', 'individual')} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Individual</span></label>
                        <label className="flex items-center"><input type="radio" name="borrower_type" value="company" checked={formData.borrower_type === 'company'} onChange={() => handleRadioChange('borrower_type', 'company')} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Company</span></label>
                        {/* FIX: Removed stray closing parenthesis in checked prop */}
                        <label className="flex items-center"><input type="radio" name="borrower_type" value="both" checked={formData.borrower_type === 'both'} onChange={() => handleRadioChange('borrower_type', 'both')} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Both</span></label>
                    </div>
                </div>

                {/* Loan Type Radio */}
                 <div>
                    <span className="block text-sm font-medium text-gray-700">Loan Type</span>
                    <div className="mt-2 flex space-x-4">
                        <label className="flex items-center"><input type="radio" name="loan_type" value="purchase" checked={formData.loan_type === 'purchase'} onChange={() => handleRadioChange('loan_type', 'purchase')} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Purchase</span></label>
                        {/* FIX: Removed stray closing parenthesis in checked prop */}
                        <label className="flex items-center"><input type="radio" name="loan_type" value="refinance" checked={formData.loan_type === 'refinance'} onChange={() => handleRadioChange('loan_type', 'refinance')} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Refinance</span></label>
                    </div>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProspectModal;