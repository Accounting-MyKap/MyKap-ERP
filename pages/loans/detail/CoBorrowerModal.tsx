import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { CoBorrower } from '../../prospects/types';

interface CoBorrowerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (coBorrower: CoBorrower) => void;
    coBorrower: CoBorrower | null;
}

const CoBorrowerModal: React.FC<CoBorrowerModalProps> = ({ isOpen, onClose, onSave, coBorrower }) => {
    const [formData, setFormData] = useState<Partial<CoBorrower>>({});

    useEffect(() => {
        if (coBorrower) {
            setFormData(coBorrower);
        } else {
            setFormData({ id: crypto.randomUUID(), relation_type: 'Co-Borrower' });
        }
    }, [coBorrower, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev,
            phone_numbers: { ...prev.phone_numbers, [name]: value }
        }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev,
            mailing_address: { ...prev.mailing_address, [name]: value }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as CoBorrower);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={coBorrower ? 'Edit Co-Borrower' : 'New Co-Borrower / Other Parties'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Salutation */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="full_name" name="full_name" value={formData.full_name || ''} onChange={handleChange} className="input-field mt-1" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="salutation" className="block text-sm font-medium text-gray-700">Salutation</label>
                            <input type="text" id="salutation" name="salutation" value={formData.salutation || ''} onChange={handleChange} className="input-field mt-1" />
                        </div>
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" id="first_name" name="first_name" value={formData.first_name || ''} onChange={handleChange} className="input-field mt-1" />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" id="last_name" name="last_name" value={formData.last_name || ''} onChange={handleChange} className="input-field mt-1" />
                        </div>
                    </div>
                </div>

                {/* Mailing Address */}
                <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-1">Mailing Address</h4>
                     <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                        <input type="text" id="street" name="street" value={formData.mailing_address?.street || ''} onChange={handleAddressChange} className="input-field mt-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" id="city" name="city" value={formData.mailing_address?.city || ''} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                         <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                            <input type="text" id="state" name="state" value={formData.mailing_address?.state || ''} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                         <div>
                            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Zip Code</label>
                            <input type="text" id="zip" name="zip" value={formData.mailing_address?.zip || ''} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                    </div>
                </div>

                 {/* Phone Numbers */}
                <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-1">Phone Numbers</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="home" className="block text-sm font-medium text-gray-700">Home</label>
                            <input type="tel" id="home" name="home" value={formData.phone_numbers?.home || ''} onChange={handlePhoneChange} className="input-field mt-1" />
                        </div>
                        <div>
                            <label htmlFor="work" className="block text-sm font-medium text-gray-700">Work</label>
                            <input type="tel" id="work" name="work" value={formData.phone_numbers?.work || ''} onChange={handlePhoneChange} className="input-field mt-1" />
                        </div>
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile</label>
                            <input type="tel" id="mobile" name="mobile" value={formData.phone_numbers?.mobile || ''} onChange={handlePhoneChange} className="input-field mt-1" />
                        </div>
                     </div>
                </div>
                
                {/* Email */}
                <div className="space-y-4">
                     <h4 className="text-md font-semibold text-gray-700 border-b pb-1">E-mail & Delivery Options</h4>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                </div>


                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button type="submit" className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700">
                        OK
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CoBorrowerModal;