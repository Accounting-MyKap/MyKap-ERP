// pages/loans/detail/sections/BorrowerSection.tsx
// a part of my-kap-erp, a modern ERP application for managing prospects, credits, and lenders, built with React and Supabase.
import React, { useState, useEffect } from 'react';
import { Prospect, Address, BorrowerDetails } from '../../../prospects/types';
import { useToast } from '../../../../hooks/useToast';

interface BorrowerSectionProps {
    loan: Prospect;
    onUpdate: (updatedData: { borrower_details: BorrowerDetails }) => Promise<void>;
}

const BorrowerSection: React.FC<BorrowerSectionProps> = ({ loan, onUpdate }) => {
    // State is now managed per-field to prevent unstable re-render cycles.
    const [salutation, setSalutation] = useState('');
    const [workPhone, setWorkPhone] = useState('');
    const [mobilePhone, setMobilePhone] = useState('');
    const [address, setAddress] = useState<Partial<Address>>({});
    
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    // This effect now syncs the form state ONLY when the selected loan changes.
    useEffect(() => {
        const details = loan.borrower_details || {};
        setSalutation(details.salutation || '');
        setWorkPhone(details.work_phone || '');
        setMobilePhone(details.mobile_phone || '');
        setAddress(details.mailing_address || {});
    }, [loan]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedDetails: BorrowerDetails = {
                salutation,
                work_phone: workPhone,
                mobile_phone: mobilePhone,
                mailing_address: address,
            };
            await onUpdate({ borrower_details: updatedDetails });
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
                    <input type="text" id="salutation" name="salutation" value={salutation} onChange={(e) => setSalutation(e.target.value)} className="input-field mt-1" />
                </div>
                {/* Phone Numbers */}
                <div className="md:col-span-2 space-y-4">
                     <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Phone Numbers</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="work_phone" className="block text-sm font-medium text-gray-700">Work</label>
                            <input type="tel" id="work_phone" name="work_phone" value={workPhone} onChange={(e) => setWorkPhone(e.target.value)} className="input-field mt-1" />
                        </div>
                        <div>
                            <label htmlFor="mobile_phone" className="block text-sm font-medium text-gray-700">Mobile</label>
                            <input type="tel" id="mobile_phone" name="mobile_phone" value={mobilePhone} onChange={(e) => setMobilePhone(e.target.value)} className="input-field mt-1" />
                        </div>
                     </div>
                </div>
                {/* Mailing Address */}
                <div className="md:col-span-2 space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Mailing Address</h4>
                    <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                        <input type="text" id="street" name="street" value={address.street || ''} onChange={handleAddressChange} className="input-field mt-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" id="city" name="city" value={address.city || ''} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                         <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                            <input type="text" id="state" name="state" value={address.state || ''} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                         <div>
                            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Zip Code</label>
                            <input type="text" id="zip" name="zip" value={address.zip || ''} onChange={handleAddressChange} className="input-field mt-1" />
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