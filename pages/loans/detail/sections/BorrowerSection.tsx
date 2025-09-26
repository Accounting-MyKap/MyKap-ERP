import React, { useState, useEffect } from 'react';
import { Prospect, BorrowerDetails } from '../../../prospects/types';
import { useToast } from '../../../../hooks/useToast';

interface BorrowerSectionProps {
    loan: Prospect;
    onUpdate: (updatedData: { borrower_details: BorrowerDetails }) => Promise<void>;
}

const BorrowerSection: React.FC<BorrowerSectionProps> = ({ loan, onUpdate }) => {
    const [details, setDetails] = useState<BorrowerDetails>(loan.borrower_details || {});
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        setDetails(loan.borrower_details || {});
    }, [loan]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ 
            ...prev, 
            mailing_address: {
                ...prev.mailing_address,
                [name]: value
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate({ borrower_details: details });
            showToast('Borrower details saved successfully!', 'success');
        } catch (error: any) {
            showToast(`Error: ${error.message || 'Could not save changes.'}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Borrower Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name & Salutation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" value={loan.borrower_name} readOnly className="input-field mt-1 bg-gray-100" />
                </div>
                <div>
                    <label htmlFor="salutation" className="block text-sm font-medium text-gray-700">Salutation</label>
                    <input type="text" id="salutation" name="salutation" value={details.salutation || ''} onChange={handleChange} className="input-field mt-1" />
                </div>
                {/* Phone Numbers */}
                <div className="md:col-span-2 space-y-4">
                     <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Phone Numbers</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="work_phone" className="block text-sm font-medium text-gray-700">Work</label>
                            <input type="tel" id="work_phone" name="work_phone" value={details.work_phone || ''} onChange={handleChange} className="input-field mt-1" />
                        </div>
                        <div>
                            <label htmlFor="mobile_phone" className="block text-sm font-medium text-gray-700">Mobile</label>
                            <input type="tel" id="mobile_phone" name="mobile_phone" value={details.mobile_phone || ''} onChange={handleChange} className="input-field mt-1" />
                        </div>
                     </div>
                </div>
                {/* Mailing Address */}
                <div className="md:col-span-2 space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Mailing Address</h4>
                    <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                        <input type="text" id="street" name="street" value={details.mailing_address?.street || ''} onChange={handleAddressChange} className="input-field mt-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" id="city" name="city" value={details.mailing_address?.city || ''} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                         <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                            <input type="text" id="state" name="state" value={details.mailing_address?.state || ''} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                         <div>
                            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Zip Code</label>
                            <input type="text" id="zip" name="zip" value={details.mailing_address?.zip || ''} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                    </div>
                </div>
                 {/* Email Options */}
                <div className="md:col-span-2 space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Email Options</h4>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" name="email" value={loan.email || ''} readOnly className="input-field mt-1 bg-gray-100" />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
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

export default BorrowerSection;
