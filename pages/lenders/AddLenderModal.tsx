import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { Lender } from '../prospects/types';

interface AddLenderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (lenderData: Omit<Lender, 'id' | 'portfolio_value' | 'trust_balance'>) => void;
    lenderToEdit?: Lender | null;
}

const AddLenderModal: React.FC<AddLenderModalProps> = ({ isOpen, onClose, onSave, lenderToEdit }) => {
    const initialFormState = {
        account: '',
        lender_name: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: ''
        }
    };
    
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            if (lenderToEdit) {
                setFormData({
                    account: lenderToEdit.account,
                    lender_name: lenderToEdit.lender_name,
                    address: {
                        street: lenderToEdit.address?.street || '',
                        city: lenderToEdit.address?.city || '',
                        state: lenderToEdit.address?.state || '',
                        zip: lenderToEdit.address?.zip || ''
                    }
                });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [lenderToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [name]: value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={lenderToEdit ? 'Edit Lender' : 'Add New Lender'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="account" className="block text-sm font-medium text-gray-700">Account</label>
                    <input type="text" id="account" name="account" value={formData.account} onChange={handleChange} className="input-field mt-1" required />
                </div>
                 <div>
                    <label htmlFor="lender_name" className="block text-sm font-medium text-gray-700">Lender Name</label>
                    <input type="text" id="lender_name" name="lender_name" value={formData.lender_name} onChange={handleChange} className="input-field mt-1" required />
                </div>
                
                {/* Address */}
                <div className="space-y-2 pt-2">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-1">Address</h4>
                    <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                        <input type="text" id="street" name="street" value={formData.address.street} onChange={handleAddressChange} className="input-field mt-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" id="city" name="city" value={formData.address.city} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                            <input type="text" id="state" name="state" value={formData.address.state} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                        <div>
                            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Zip Code</label>
                            <input type="text" id="zip" name="zip" value={formData.address.zip} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button type="submit" className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700">
                        {lenderToEdit ? 'Save Changes' : 'Save Lender'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddLenderModal;