import React, { useState, useEffect } from 'react';
import { Lender, Address } from '../../../prospects/types';
import { useToast } from '../../../../hooks/useToast';

interface LenderInfoSectionProps {
    lender: Lender;
    onUpdate: (lenderId: string, updatedData: Partial<Lender>) => Promise<void>;
}

const LenderInfoSection: React.FC<LenderInfoSectionProps> = ({ lender, onUpdate }) => {
    const [formData, setFormData] = useState({
        account: lender.account || '',
        lender_name: lender.lender_name || '',
        address: lender.address || {},
    });
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        setFormData({
            account: lender.account || '',
            lender_name: lender.lender_name || '',
            address: lender.address || {},
        });
    }, [lender]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            address: {
                ...prev.address,
                [name]: value
            } as Address
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(lender.id, formData);
            showToast('Lender information saved successfully!', 'success');
        } catch (error: any) {
            showToast(`Error: ${error.message || 'Could not save changes.'}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Lender Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="account" className="block text-sm font-medium text-gray-700">Account</label>
                    <input type="text" id="account" name="account" value={formData.account} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="lender_name" className="block text-sm font-medium text-gray-700">Lender Name</label>
                    <input type="text" id="lender_name" name="lender_name" value={formData.lender_name} onChange={handleChange} className="input-field mt-1" />
                </div>
            </div>
             <div className="md:col-span-2 space-y-4">
                <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Address</h4>
                <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                    <input type="text" id="street" name="street" value={formData.address?.street || ''} onChange={handleAddressChange} className="input-field mt-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" id="city" name="city" value={formData.address?.city || ''} onChange={handleAddressChange} className="input-field mt-1" />
                    </div>
                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                        <input type="text" id="state" name="state" value={formData.address?.state || ''} onChange={handleAddressChange} className="input-field mt-1" />
                    </div>
                    <div>
                        <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Zip Code</label>
                        <input type="text" id="zip" name="zip" value={formData.address?.zip || ''} onChange={handleAddressChange} className="input-field mt-1" />
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

export default LenderInfoSection;
