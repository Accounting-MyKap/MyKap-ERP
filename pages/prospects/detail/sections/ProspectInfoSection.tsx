
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
    // State is now managed per-field to avoid complex object state and re-render loops.
    const [borrowerName, setBorrowerName] = useState('');
    const [prospectCode, setProspectCode] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loanAmount, setLoanAmount] = useState<number>(0);
    const [loanAmountDisplay, setLoanAmountDisplay] = useState('');
    const [borrowerType, setBorrowerType] = useState<'individual' | 'company' | 'both'>('individual');
    const [loanType, setLoanType] = useState<'purchase' | 'refinance'>('purchase');
    const [assignedTo, setAssignedTo] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    // CRITICAL FIX: The dependency is now prospect.id.
    // This effect now ONLY syncs the form state when the user selects a DIFFERENT prospect.
    // This breaks the re-render cycle during a save operation, preventing the application freeze.
    useEffect(() => {
        if (prospect) {
            setBorrowerName(prospect.borrower_name || '');
            setProspectCode(prospect.prospect_code || '');
            setEmail(prospect.email || '');
            setPhoneNumber(prospect.phone_number || '');
            const currentLoanAmount = prospect.loan_amount || 0;
            setLoanAmount(currentLoanAmount);
            setLoanAmountDisplay(currentLoanAmount > 0 ? formatNumber(currentLoanAmount) : '');
            setBorrowerType(prospect.borrower_type || 'individual');
            setLoanType(prospect.loan_type || 'purchase');
            setAssignedTo(prospect.assigned_to || '');
        }
    }, [prospect.id]); // The dependency is the key to the fix.

    const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const displayValue = e.target.value;
        const numericValue = parseCurrency(displayValue);
        setLoanAmountDisplay(displayValue);
        setLoanAmount(numericValue);
    };
    
    const handleLoanAmountBlur = () => {
        // Format the display value when the user clicks away.
        setLoanAmountDisplay(loanAmount > 0 ? formatNumber(loanAmount) : '');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate({
                id: prospect.id,
                borrower_name: borrowerName,
                prospect_code: prospectCode,
                email: email,
                phone_number: phoneNumber,
                loan_amount: loanAmount,
                borrower_type: borrowerType,
                loan_type: loanType,
                assigned_to: assignedTo,
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
                    <input type="text" id="borrower_name" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="prospect_code" className="block text-sm font-medium text-gray-700">Account</label>
                    <input type="text" id="prospect_code" value={prospectCode} onChange={(e) => setProspectCode(e.target.value)} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" id="phone_number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="loan_amount" className="block text-sm font-medium text-gray-700">Loan Amount</label>
                    <div className="input-container mt-1">
                        <span className="input-adornment">$</span>
                        <input 
                            type="text" 
                            inputMode="decimal" 
                            id="loan_amount" 
                            value={loanAmountDisplay} 
                            onChange={handleLoanAmountChange} 
                            onBlur={handleLoanAmountBlur}
                            className="input-field input-field-with-adornment-left text-right" 
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">Assigned to</label>
                    <select id="assigned_to" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="input-field mt-1">
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                        ))}
                    </select>
                </div>
                 <div className="md:col-span-2 space-y-2">
                    <span className="block text-sm font-medium text-gray-700">Borrower Type</span>
                    <div className="flex space-x-4">
                        <label className="flex items-center"><input type="radio" name="borrower_type" value="individual" checked={borrowerType === 'individual'} onChange={(e) => setBorrowerType(e.target.value as any)} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Individual</span></label>
                        <label className="flex items-center"><input type="radio" name="borrower_type" value="company" checked={borrowerType === 'company'} onChange={(e) => setBorrowerType(e.target.value as any)} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Company</span></label>
                        <label className="flex items-center"><input type="radio" name="borrower_type" value="both" checked={borrowerType === 'both'} onChange={(e) => setBorrowerType(e.target.value as any)} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Both</span></label>
                    </div>
                </div>
                 <div className="md:col-span-2 space-y-2">
                    <span className="block text-sm font-medium text-gray-700">Loan Type</span>
                    <div className="flex space-x-4">
                        <label className="flex items-center"><input type="radio" name="loan_type" value="purchase" checked={loanType === 'purchase'} onChange={(e) => setLoanType(e.target.value as any)} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Purchase</span></label>
                        <label className="flex items-center"><input type="radio" name="loan_type" value="refinance" checked={loanType === 'refinance'} onChange={(e) => setLoanType(e.target.value as any)} className="h-4 w-4 text-blue-600"/> <span className="ml-2">Refinance</span></label>
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
