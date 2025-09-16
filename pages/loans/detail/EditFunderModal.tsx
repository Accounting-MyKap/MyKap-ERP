import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { Funder, Lender, ServicingFees } from '../../prospects/types';

interface EditFunderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (funder: Funder) => void;
    funder: Funder | null;
    lenders: Lender[];
}

const EditFunderModal: React.FC<EditFunderModalProps> = ({ isOpen, onClose, onSave, funder, lenders }) => {
    const [formData, setFormData] = useState<Partial<ServicingFees & { broker_servicing_fee_percent_display: number | string }>>({});

    const lenderDetails = lenders.find(l => l.id === funder?.lender_id);

    useEffect(() => {
        if (funder) {
            setFormData({
                rounding_adjustment: funder.servicing_fees?.rounding_adjustment ?? false,
                broker_servicing_fee_enabled: funder.servicing_fees?.broker_servicing_fee_enabled ?? false,
                broker_servicing_fee_percent_display: (funder.servicing_fees?.broker_servicing_fee_percent ?? 0) * 100,
                broker_servicing_fee_plus_amount: funder.servicing_fees?.broker_servicing_fee_plus_amount ?? 0,
                broker_servicing_fee_minimum: funder.servicing_fees?.broker_servicing_fee_minimum ?? 0,
            });
        }
    }, [funder, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = () => {
        if (!funder) return;

        const updatedFunder: Funder = {
            ...funder,
            servicing_fees: {
                ...funder.servicing_fees,
                rounding_adjustment: formData.rounding_adjustment,
                broker_servicing_fee_enabled: formData.broker_servicing_fee_enabled,
                broker_servicing_fee_percent: (parseFloat(String(formData.broker_servicing_fee_percent_display)) || 0) / 100,
                broker_servicing_fee_plus_amount: Number(formData.broker_servicing_fee_plus_amount) || 0,
                broker_servicing_fee_minimum: Number(formData.broker_servicing_fee_minimum) || 0,
            }
        };

        onSave(updatedFunder);
    };

    if (!funder) return null;

    const lenderAddress = [
        lenderDetails?.address?.street,
        lenderDetails?.address?.city,
        lenderDetails?.address?.state,
    ].filter(Boolean).join(', ');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Funding Lender">
            <div className="space-y-6">
                {/* Lender Info */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800">Lender Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Account</label>
                            <div className="bg-white px-3 py-1 rounded text-sm text-gray-800 w-2/3 border border-gray-300">{funder.lender_account}</div>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" name="rounding_adjustment" checked={!!formData.rounding_adjustment} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded mr-2" />
                            <label className="text-sm font-medium text-gray-700">Rounding Adjustment</label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lender Name & Address</label>
                            <div className="bg-white p-2 rounded text-sm text-gray-800 min-h-[60px] border border-gray-300">
                                <div className="font-semibold">{funder.lender_name}</div>
                                <div>{lenderAddress}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Servicing Fees Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border-t pt-4">
                    {/* Broker Servicing Fee */}
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <input type="checkbox" name="broker_servicing_fee_enabled" id="broker_servicing_fee_enabled" checked={!!formData.broker_servicing_fee_enabled} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded mr-2" />
                            <label htmlFor="broker_servicing_fee_enabled" className="text-md font-semibold text-gray-800">Broker Servicing Fee</label>
                        </div>
                        <div>
                            <label htmlFor="broker_servicing_fee_percent_display" className="block text-sm font-medium text-gray-700 mb-1">% of Principal Bal</label>
                            <div className="input-container">
                                <input type="number" step="0.001" name="broker_servicing_fee_percent_display" id="broker_servicing_fee_percent_display" value={formData.broker_servicing_fee_percent_display || ''} onChange={handleChange} className="input-field text-right pr-10" />
                                <span className="input-adornment-right">%</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="broker_servicing_fee_plus_amount" className="block text-sm font-medium text-gray-700 mb-1">Plus Amount</label>
                            <div className="input-container">
                                <span className="input-adornment">$</span>
                                <input type="number" name="broker_servicing_fee_plus_amount" id="broker_servicing_fee_plus_amount" value={formData.broker_servicing_fee_plus_amount || ''} onChange={handleChange} className="input-field pl-7 text-right" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="broker_servicing_fee_minimum" className="block text-sm font-medium text-gray-700 mb-1">Or Minimum</label>
                            <div className="input-container">
                                <span className="input-adornment">$</span>
                                <input type="number" name="broker_servicing_fee_minimum" id="broker_servicing_fee_minimum" value={formData.broker_servicing_fee_minimum || ''} onChange={handleChange} className="input-field pl-7 text-right" />
                            </div>
                        </div>
                    </div>

                    {/* Vendor Servicing Fee (disabled placeholder) */}
                    <div className="space-y-3 opacity-50">
                         <div className="flex items-center">
                            <input type="checkbox" disabled className="h-4 w-4 rounded mr-2" />
                            <label className="text-md font-semibold text-gray-800">Vendor Servicing Fee</label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">% of Principal Bal</label>
                            <div className="input-container">
                                <input type="text" disabled defaultValue="0.000" className="input-field bg-gray-100 text-right pr-10" />
                                 <span className="input-adornment-right">%</span>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plus Amount</label>
                            <div className="input-container">
                                <span className="input-adornment">$</span>
                                <input type="text" disabled defaultValue="0.00" className="input-field bg-gray-100 pl-7 text-right" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Or Minimum</label>
                            <div className="input-container">
                                <span className="input-adornment">$</span>
                                <input type="text" disabled defaultValue="0.00" className="input-field bg-gray-100 pl-7 text-right" />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Account</label>
                            <input type="text" disabled className="input-field bg-gray-100" />
                        </div>
                    </div>
                </div>

                 {/* Action Buttons */}
                <div className="pt-4 flex justify-end space-x-3 border-t">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700">
                        OK
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditFunderModal;