import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { TrustAccountEvent } from '../../prospects/types';

interface AddDepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<TrustAccountEvent, 'id' | 'balance'>) => void;
}

const AddDepositModal: React.FC<AddDepositModalProps> = ({ isOpen, onClose, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            date,
            type,
            description,
            amount,
        });
        onClose();
        // Reset form
        setDate(new Date().toISOString().split('T')[0]);
        setType('deposit');
        setDescription('');
        setAmount(0);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Trust Account Transaction">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="input-field mt-1" required />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                    <select id="type" value={type} onChange={e => setType(e.target.value as any)} className="input-field mt-1" required>
                        <option value="deposit">Deposit</option>
                        <option value="withdrawal">Withdrawal</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="input-field mt-1" required />
                </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input type="number" id="amount" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className="input-field mt-1" required />
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700">Save</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddDepositModal;
