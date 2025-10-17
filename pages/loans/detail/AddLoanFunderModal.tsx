import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { Lender, Funder } from '../../prospects/types';

interface AddLoanFunderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (funder: Funder) => void;
    lenders: Lender[];
    existingFunderIds: string[];
}

const AddLoanFunderModal: React.FC<AddLoanFunderModalProps> = ({ isOpen, onClose, onSave, lenders, existingFunderIds }) => {
    const [selectedLenderId, setSelectedLenderId] = useState('');

    const availableLenders = lenders.filter(l => !existingFunderIds.includes(l.id));

    useEffect(() => {
        if (isOpen) {
            setSelectedLenderId('');
        }
    }, [isOpen]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedLender = lenders.find(l => l.id === selectedLenderId);
        if (!selectedLender) return;

        const newFunder: Funder = {
            id: `funder-${crypto.randomUUID()}`,
            lender_id: selectedLender.id,
            lender_account: selectedLender.account,
            lender_name: selectedLender.lender_name,
            original_amount: 0,
            lender_rate: 0,
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

                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700">OK</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddLoanFunderModal;