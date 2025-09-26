// pages/prospects/detail/sections/ProspectInfoSection.tsx
import React, { useState, useEffect } from 'react';
import { Prospect, UserProfile } from '../../types';
import { formatNumber, parseCurrency } from '../../../../utils/formatters';
import { useToast } from '../../../../hooks/useToast';

interface ProspectInfoSectionProps {
    prospect: Prospect;
    users: UserProfile[];
    onUpdate: (prospectData: Partial<Prospect> & { id: string }) => Promise<void>;
}

const ProspectInfoSection: React.FC<ProspectInfoSectionProps> = ({ prospect, users, onUpdate }) => {
    const [formData, setFormData] = useState({ ...prospect });
    const [loanAmountDisplay, setLoanAmountDisplay] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        setFormData({ ...prospect });
        setLoanAmountDisplay(formatNumber(prospect.loan_amount));
    }, [prospect]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const displayValue = e.target.value;
        const numericValue = parseCurrency(displayValue);
        setLoanAmountDisplay(displayValue);
        setFormData(prev => ({ ...prev, loan_amount: numericValue }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate({
                id: prospect.id,
                borrower_name: formData.borrower_name,
                prospect_code: formData.prospect_code,
                email: formData.email,
                phone_number: formData.phone_number,
                loan_amount: formData.loan_amount,
                borrower_type: formData.borrower_type,
                loan_type: formData.loan_type,
                assigned_to: formData.assigned_to,
            });
            showToast('Changes saved successfully!', 'success');
        } catch (error: any) {
            showToast(`Error: ${error.message || 'Could not save changes.'}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Prospect Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="borrower_name" className="block text-sm font-medium text-gray-700">Borrower Name</label>
                    <input type="text" id="borrower_name" name="borrower_name" value={formData.borrower_name} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="prospect_code" className="block text-sm font-medium text-gray-700">Account</label>
                    <input type="text" id="prospect_code" name="prospect_code" value={formData.prospect_code || ''} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="loan_amount" className="block text-sm font-medium text-gray-700">Loan Amount</label>
                    <div className="input-container mt-1">
                        <span className="input-adornment">$</span>
                        <input type="text" inputMode="decimal" id="loan_amount" name="loan_amount" value={loanAmountDisplay} onChange={handleLoanAmountChange} className="input-field input-field-with-adornment-left text-right" />
                    </div>
                </div>
                <div>
                    <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">Assigned to</label>
                    <select id="assigned_to" name="assigned_to" value={formData.assigned_to} onChange={handleChange} className="input-field mt-1">
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                        ))}
                    </select>
                </div>
                 <div className="md:col-span-2 space-y-2">
                    <span className="block text-sm font-medium text-gray-700">Borrower Type</span>
                    <div className="flex space-x-4">
                        <label className="flex items-center"><input type="radio" name="borrower_type" value="individual" checked={formData.borrower_type === 'individual'} onChange={handleChange} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Individual</span></label>
                        <label className="flex items-center"><input type="radio" name="borrower_type" value="company" checked={formData.borrower_type === 'company'} onChange={handleChange} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Company</span></label>
                        <label className="flex items-center"><input type="radio" name="borrower_type" value="both" checked={formData.borrower_type === 'both'} onChange={handleChange} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Both</span></label>
                    </div>
                </div>
                 <div className="md:col-span-2 space-y-2">
                    <span className="block text-sm font-medium text-gray-700">Loan Type</span>
                    <div className="flex space-x-4">
                        <label className="flex items-center"><input type="radio" name="loan_type" value="purchase" checked={formData.loan_type === 'purchase'} onChange={handleChange} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Purchase</span></label>
                        <label className="flex items-center"><input type="radio" name="loan_type" value="refinance" checked={formData.loan_type === 'refinance'} onChange={handleChange} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Refinance</span></label>
                    </div>
                </div>
            </div>
            <div className="pt-4 flex justify-end items-center">
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default ProspectInfoSection;
