import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { Prospect } from '../../prospects/types';
import { formatCurrency } from '../../../utils/formatters';

interface PaymentData {
    date: string;
    amount: number;
    notes?: string;
    distributions: { funderId: string; lender_id: string; amount: number }[];
}

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: PaymentData) => void;
    loan: Prospect;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, onSave, loan }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState<number | string>('');
    const [notes, setNotes] = useState('');
    // Fix: Changed state to consistently store distribution amounts as strings to prevent type errors.
    const [manualDistributions, setManualDistributions] = useState<{ [funderId: string]: string }>({});

    const paymentAmount = typeof amount === 'number' ? amount : 0;
    const principalBalance = loan.terms?.principal_balance || 0;

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setDate(new Date().toISOString().split('T')[0]);
            setAmount('');
            setNotes('');
            setManualDistributions({});
        }
    }, [isOpen]);
    
    useEffect(() => {
        // Fix: Ensure auto-populated distributions are stored as strings with fixed decimal places
        // to maintain consistent state typing.
        // Auto-populate distributions when payment amount changes
        const proportionalDistributions: { [funderId: string]: string } = {};
        if (loan.funders && paymentAmount > 0) {
            loan.funders.forEach(funder => {
                proportionalDistributions[funder.id] = (paymentAmount * funder.pct_owned).toFixed(2);
            });
        }
        setManualDistributions(proportionalDistributions);
    }, [amount, loan.funders]);


    const handleDistributionChange = (funderId: string, value: string) => {
        setManualDistributions(prev => ({
            ...prev,
            [funderId]: value,
        }));
    };

    const totalDistributed = useMemo(() => {
        // Fix: Simplified reduce function now that `item` is consistently a string. This resolves the original TypeScript error.
        return Object.values(manualDistributions).reduce((sum, item) => sum + (parseFloat(item) || 0), 0);
    }, [manualDistributions]);
    
    const remainingToDistribute = paymentAmount - totalDistributed;
    const isAmountValid = paymentAmount > 0 && paymentAmount <= principalBalance;
    const isDistributionValid = Math.abs(remainingToDistribute) < 0.01; // Allow for float inaccuracies

    const handleSave = () => {
        if (!isAmountValid || !isDistributionValid) return;
        
        onSave({
            date,
            amount: paymentAmount,
            notes,
            distributions: Object.entries(manualDistributions).map(([funderId, distAmount]) => ({
                funderId,
                lender_id: loan.funders?.find(f => f.id === funderId)?.lender_id || '',
                // Fix: Explicitly parse the string amount back to a number before saving.
                amount: parseFloat(distAmount) || 0,
            })),
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Loan Payment">
            <div className="space-y-6">
                {/* Payment Input Fields */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Payment Date</label>
                        <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="input-field mt-1" />
                    </div>
                     <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Payment Amount</label>
                        <div className="input-container mt-1">
                            <span className="input-adornment">$</span>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={e => setAmount(parseFloat(e.target.value) || '')}
                                placeholder="0.00"
                                max={principalBalance}
                                className="input-field input-field-with-adornment-left"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Current Principal Balance: {formatCurrency(principalBalance)}</p>
                         {!isAmountValid && amount !== '' && (
                             <p className="text-xs text-red-600 mt-1">Amount must be greater than 0 and no more than the principal balance.</p>
                         )}
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes / Reference</label>
                        <input type="text" id="notes" value={notes} onChange={e => setNotes(e.target.value)} className="input-field mt-1" />
                    </div>
                </div>

                {/* Distribution Preview */}
                {paymentAmount > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                        <h4 className="text-lg font-semibold text-gray-800">Payment Distribution</h4>
                        <p className="text-sm text-gray-600">
                            Distribute the payment to the lenders' trust accounts. Proportional amounts are suggested.
                        </p>
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                            {(loan.funders || []).map(funder => (
                                <div key={funder.id} className="grid grid-cols-2 gap-4 items-center">
                                    <label htmlFor={`dist-${funder.id}`} className="text-sm text-gray-800">{funder.lender_name}</label>
                                    <div className="input-container">
                                        <span className="input-adornment">$</span>
                                        <input
                                            type="number"
                                            id={`dist-${funder.id}`}
                                            value={manualDistributions[funder.id] || ''}
                                            onChange={(e) => handleDistributionChange(funder.id, e.target.value)}
                                            className="input-field input-field-with-adornment-left text-right"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between items-center text-sm font-bold border-t pt-2 mt-2">
                                <span className="text-gray-800">Total Distributed</span>
                                <span className="text-gray-900">{formatCurrency(totalDistributed)}</span>
                            </div>
                             <div className={`flex justify-between items-center text-sm font-semibold ${!isDistributionValid ? 'text-red-600' : 'text-green-600'}`}>
                                <span >Remaining to Distribute</span>
                                <span >{formatCurrency(remainingToDistribute)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSave} 
                        disabled={!isAmountValid || !isDistributionValid}
                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        Confirm Payment
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default RecordPaymentModal;