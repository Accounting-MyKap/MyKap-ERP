import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { Lender, Funder } from '../../prospects/types';
import { formatNumber, parseCurrency } from '../../../utils/formatters';

interface AddLoanFunderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (funder: Funder) => void;
    lenders: Lender[];
    existingFunderIds: string[];
}

const AddLoanFunderModal: React.FC<AddLoanFunderModalProps> = ({ isOpen, onClose, onSave, lenders, existingFunderIds }) => {
    const [selectedLenderId, setSelectedLenderId] = useState('');
    const [originalAmount, setOriginalAmount] = useState(0);
    const [lenderRate, setLenderRate] = useState(0);

    const availableLenders = lenders.filter(l => !existingFunderIds.includes(l.id));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedLender = lenders.find(l => l.id === selectedLenderId);
        if (!selectedLender) return;

        const newFunder: Funder = {
            id: `funder-${crypto.randomUUID()}`,
            lender_id: selectedLender.id,
            lender_account: selectedLender.account,
            lender_name: selectedLender.lender_name,
            original_amount: originalAmount,
            lender_rate: lenderRate / 100, // Convert percentage to decimal
            principal_balance: 0, // Initially 0, funded via events
            pct_owned: 0, // This will be calculated based on funding
        };
        onSave(newFunder);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Funding Lender">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="lender" className="block text-sm font-medium text-gray-700">Lender Account</label>
                    <select id="lender" value={selectedLenderId} onChange={e => setSelectedLenderId(e.target.value)} className="input-field mt-1" required>
                        <option value="" disabled>Select a lender...</option>
                        {availableLenders.map(lender => (
                            <option key={lender.id} value={lender.id}>{lender.lender_name} ({lender.account})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="originalAmount" className="block text-sm font-medium text-gray-700">Original Amount</label>
                    <div className="input-container mt-1">
                        <span className="input-adornment">$</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            id="originalAmount"
                            value={formatNumber(originalAmount)}
                            onChange={e => setOriginalAmount(parseCurrency(e.target.value))}
                            className="input-field input-field-with-adornment-left text-right" />
                    </div>
                </div>
                <div>
                    <label htmlFor="lenderRate" className="block text-sm font-medium text-gray-700">Lender Rate</label>
                    <div className="input-container mt-1">
                        <input type="number" step="0.01" id="lenderRate" value={lenderRate} onChange={e => setLenderRate(parseFloat(e.target.value) || 0)} className="input-field input-field-with-adornment-right text-right" />
                        <span className="input-adornment-right">%</span>
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700">OK</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddLoanFunderModal;
