import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { Funder, Lender, ServicingFees, Prospect } from '../../prospects/types';
import { formatNumber, parseCurrency } from '../../../utils/formatters';

interface EditFunderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (funder: Funder) => void;
    funder: Funder | null;
    lenders: Lender[];
    loan: Prospect;
}

type EditFunderFormData = Partial<ServicingFees> & {
    broker_servicing_fee_percent_display?: number | string;
    lender_rate_display?: number | string;
};

const EditFunderModal: React.FC<EditFunderModalProps> = ({ isOpen, onClose, onSave, funder, lenders, loan }) => {
    const [formData, setFormData] = useState<EditFunderFormData>({});

    const lenderDetails = lenders.find(l => l.id === funder?.lender_id);

    useEffect(() => {
        if (funder) {
            setFormData({
                lender_rate_display: (funder.lender_rate ?? 0) * 100,
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
        
        const isCheckbox = type === 'checkbox';
        const isBrokerFeeCheckbox = name === 'broker_servicing_fee_enabled';
        const newFormData = { ...formData, [name]: isCheckbox ? checked : value };

        if (['broker_servicing_fee_plus_amount', 'broker_servicing_fee_minimum'].includes(name)) {
            const parsed = parseCurrency(value);
            setFormData(prev => ({ ...prev, [name]: parsed }));
        } else {
            setFormData(prev => ({...prev, [name]: isCheckbox ? checked : value}));
        }

        if (isBrokerFeeCheckbox && checked) {
            // Auto-calculate servicing fee when checkbox is enabled
            const loanNoteRate = (loan.terms?.note_rate ?? 0) * 100;
            const lenderRate = parseFloat(String(newFormData.lender_rate_display)) || 0;
            const calculatedFee = loanNoteRate - lenderRate;
            setFormData(prev => ({
                ...prev,
                broker_servicing_fee_percent_display: String(calculatedFee > 0 ? calculatedFee.toFixed(3) : 0)
            }));
        }
    };

    const handleSubmit = () => {
        if (!funder) return;

        const updatedFunder: Funder = {
            ...funder,
            lender_rate: (parseFloat(String(formData.lender_rate_display)) || 0) / 100,
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

                {/* Financials & Servicing Fees Section */}
                <div className="space-y-4 border-t pt-4">
                    {/* Lender Rate */}
                    <div>
                        <label htmlFor="lender_rate_display" className="block text-sm font-medium text-gray-700 mb-1">Lender Rate</label>
                        <div className="input-container max-w-xs">
                            <input type="number" step="0.01" id="lender_rate_display" name="lender_rate_display" value={formData.lender_rate_display || ''} onChange={handleChange} className="input-field input-field-with-adornment-right text-right" />
                            <span className="input-adornment-right">%</span>
                        </div>
                    </div>
                    {/* Broker Servicing Fee */}
                    <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center">
                            <input type="checkbox" name="broker_servicing_fee_enabled" id="broker_servicing_fee_enabled" checked={!!formData.broker_servicing_fee_enabled} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded mr-2" />
                            <label htmlFor="broker_servicing_fee_enabled" className="text-md font-semibold text-gray-800">Broker Servicing Fee</label>
                        </div>
                        {formData.broker_servicing_fee_enabled && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
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
                                        <input type="text" inputMode="decimal" name="broker_servicing_fee_plus_amount" id="broker_servicing_fee_plus_amount" value={formatNumber(formData.broker_servicing_fee_plus_amount)} onChange={handleChange} className="input-field pl-7 text-right" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="broker_servicing_fee_minimum" className="block text-sm font-medium text-gray-700 mb-1">Or Minimum</label>
                                    <div className="input-container">
                                        <span className="input-adornment">$</span>
                                        <input type="text" inputMode="decimal" name="broker_servicing_fee_minimum" id="broker_servicing_fee_minimum" value={formatNumber(formData.broker_servicing_fee_minimum)} onChange={handleChange} className="input-field pl-7 text-right" />
                                    </div>
                                </div>
                            </div>
                        )}
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
