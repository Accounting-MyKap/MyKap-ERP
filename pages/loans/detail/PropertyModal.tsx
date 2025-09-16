import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { Property, Prospect } from '../../prospects/types';

interface PropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (property: Property) => void;
    property: Property | null;
    loan: Prospect;
}

const getInitialState = (): Partial<Property> => ({
    id: crypto.randomUUID(),
    is_primary: false,
    is_reo: false,
    description: '',
    address: { country: 'United States', state: 'FL' },
    property_type: 'SFR',
    occupancy: 'Tenant',
    appraisal_value: 0,
    appraisal_date: new Date().toISOString().split('T')[0],
    ltv: 60,
    purchase_price: 0,
    thomas_map: '',
    pledged_equity: 0,
    apn: '',
    priority: 'Other',
    flood_zone: '',
    zoning: ''
});


const PropertyModal: React.FC<PropertyModalProps> => ({ isOpen, onClose, onSave, property, loan }) => {
    const [formData, setFormData] = useState<Partial<Property>>(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(property ? { ...property } : getInitialState());
        }
    }, [property, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            const parsedValue = type === 'number' && value !== '' ? parseFloat(value) : value;
            setFormData(prev => ({ ...prev, [name]: parsedValue }));
        }
    };
    
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            address: {
                ...prev.address,
                [name]: value
            }
        }));
    };
    
    const copyBorrowerAddress = () => {
         if (loan.borrower_details?.mailing_address) {
            setFormData(prev => ({
                ...prev,
                address: { ...loan.borrower_details.mailing_address }
            }))
         } else {
            alert('No borrower mailing address available to copy.');
         }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Property);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={property ? 'Edit Property' : 'Add Property'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Left Column: Property Description & Address */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Property Description & Address</h4>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <input type="text" id="description" name="description" value={formData.description || ''} onChange={handleChange} className="input-field mt-1" />
                        </div>
                         <div>
                            <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                            <input type="text" id="street" name="street" value={formData.address?.street || ''} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" id="city" name="city" value={formData.address?.city || ''} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                                <input type="text" id="state" name="state" value={formData.address?.state || ''} onChange={handleAddressChange} className="input-field mt-1" />
                            </div>
                            <div>
                                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Zip Code</label>
                                <input type="text" id="zip" name="zip" value={formData.address?.zip || ''} onChange={handleAddressChange} className="input-field mt-1" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="county" className="block text-sm font-medium text-gray-700">County</label>
                            <input type="text" id="county" name="county" value={formData.address?.county || ''} onChange={handleAddressChange} className="input-field mt-1" />
                        </div>
                         <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                            <select id="country" name="country" value={formData.address?.country || 'United States'} onChange={handleAddressChange} className="input-field mt-1">
                                <option>United States</option>
                                <option>Canada</option>
                                <option>Mexico</option>
                            </select>
                        </div>
                        <div className="pt-2 space-y-2">
                             <button type="button" onClick={copyBorrowerAddress} className="text-sm text-blue-600 hover:underline">Copy Borrower's Address</button>
                             <label className="flex items-center text-sm"><input type="checkbox" name="is_reo" checked={!!formData.is_reo} onChange={handleChange} className="h-4 w-4 mr-2" /> Real Estate Owned (REO)</label>
                             <label className="flex items-center text-sm"><input type="checkbox" name="is_primary" checked={!!formData.is_primary} onChange={handleChange} className="h-4 w-4 mr-2" /> Primary Property</label>
                        </div>
                    </div>

                    {/* Right Column: Appraisal Information */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Appraisal Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700">Property Type</label>
                                <select id="property_type" name="property_type" value={formData.property_type || ''} onChange={handleChange} className="input-field mt-1">
                                    <option>SFR</option>
                                    <option>Condo</option>
                                    <option>Townhouse</option>
                                    <option>Multi-Family</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="occupancy" className="block text-sm font-medium text-gray-700">Occupancy</label>
                                <select id="occupancy" name="occupancy" value={formData.occupancy || ''} onChange={handleChange} className="input-field mt-1">
                                    <option>Owner Occupied</option>
                                    <option>Tenant</option>
                                    <option>Vacant</option>
                                </select>
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="flex-grow">
                                    <label htmlFor="ltv" className="block text-sm font-medium text-gray-700">LTV</label>
                                    <input type="number" id="ltv" name="ltv" value={formData.ltv || ''} onChange={handleChange} className="input-field mt-1 text-right" />
                                </div>
                                <span className="pb-2 text-gray-500">%</span>
                            </div>
                            <div>
                                <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">Purchase Price</label>
                                <div className="input-container mt-1">
                                    <span className="input-adornment">$</span>
                                    <input type="number" id="purchase_price" name="purchase_price" value={formData.purchase_price || ''} onChange={handleChange} className="input-field input-field-with-adornment-left text-right" />
                                </div>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="appraisal_value" className="block text-sm font-medium text-gray-700">Appraised Value</label>
                            <div className="input-container mt-1">
                                <span className="input-adornment">$</span>
                                <input type="number" id="appraisal_value" name="appraisal_value" value={formData.appraisal_value || ''} onChange={handleChange} className="input-field input-field-with-adornment-left text-right" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="appraisal_date" className="block text-sm font-medium text-gray-700">Appraised Date</label>
                                <input type="date" id="appraisal_date" name="appraisal_date" value={formData.appraisal_date || ''} onChange={handleChange} className="input-field mt-1" />
                            </div>
                             <div>
                                <label htmlFor="apn" className="block text-sm font-medium text-gray-700">APN</label>
                                <input type="text" id="apn" name="apn" value={formData.apn || ''} onChange={handleChange} className="input-field mt-1" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="thomas_map" className="block text-sm font-medium text-gray-700">Thomas Map</label>
                                <input type="text" id="thomas_map" name="thomas_map" value={formData.thomas_map || ''} onChange={handleChange} className="input-field mt-1" />
                            </div>
                             <div>
                                <label htmlFor="pledged_equity" className="block text-sm font-medium text-gray-700">Pledged Equity</label>
                                <div className="input-container mt-1">
                                    <span className="input-adornment">$</span>
                                    <input type="number" id="pledged_equity" name="pledged_equity" value={formData.pledged_equity || ''} onChange={handleChange} className="input-field input-field-with-adornment-left text-right" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                                <select id="priority" name="priority" value={formData.priority || ''} onChange={handleChange} className="input-field mt-1">
                                    <option>Other</option>
                                    <option>1st</option>
                                    <option>2nd</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="zoning" className="block text-sm font-medium text-gray-700">Zoning</label>
                                <input type="text" id="zoning" name="zoning" value={formData.zoning || ''} onChange={handleChange} className="input-field mt-1" />
                            </div>
                        </div>
                        <div>
                           <label htmlFor="flood_zone" className="block text-sm font-medium text-gray-700">Flood Zone</label>
                           <input type="text" id="flood_zone" name="flood_zone" value={formData.flood_zone || ''} onChange={handleChange} className="input-field mt-1" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t">
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

export default PropertyModal;
