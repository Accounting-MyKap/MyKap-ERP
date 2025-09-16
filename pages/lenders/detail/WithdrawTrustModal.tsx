import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { TrustAccountEvent } from '../../prospects/types';
import { formatCurrency, formatNumber, parseCurrency } from '../../../utils/formatters';

interface WithdrawTrustModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<TrustAccountEvent, 'id' | 'balance' | 'type'>) => void;
    currentBalance: number;
}

const WithdrawTrustModal: React.FC<WithdrawTrustModalProps> = ({ isOpen, onClose, onSave, currentBalance }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');

    useEffect(() => {
        if (!isOpen) {
            setDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setAmount('');
        }
    }, [isOpen]);
    
    const withdrawalAmount = Number(amount) || 0;
    const isAmountValid = withdrawalAmount > 0 && withdrawalAmount <= currentBalance;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAmountValid) return;
        
        onSave({
            date,
            description,
            amount: withdrawalAmount,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Trust Account Withdrawal">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="w-date" className="block text-sm font-medium text-gray-700">Withdrawal Date</label>
                    <input type="date" id="w-date" value={date} onChange={e => setDate(e.target.value)} className="input-field mt-1" required />
                </div>
                <div>
                    <label htmlFor="w-description" className="block text-sm font-medium text-gray-700">Description / Reference</label>
                    <input type="text" id="w-description" value={description} onChange={e => setDescription(e.target.value)} className="input-field mt-1" required placeholder="E.g., Return of funds to investor" />
                </div>
                <div>
                    <label htmlFor="w-amount" className="block text-sm font-medium text-gray-700">Withdrawal Amount</label>
                    <div className="input-container mt-1">
                        <span className="input-adornment">$</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            id="w-amount"
                            value={amount === '' ? '' : formatNumber(amount)}
                            onChange={e => setAmount(parseCurrency(e.target.value) || '')}
                            className="input-field input-field-with-adornment-left text-right"
                            required
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Available Trust Balance: {formatCurrency(currentBalance)}</p>
                    {!isAmountValid && amount !== '' && (
                        <p className="text-xs text-red-600 mt-1">Amount must be greater than 0 and no more than the available balance.</p>
                    )}
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button type="submit" disabled={!isAmountValid} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        Confirm Withdrawal
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default WithdrawTrustModal;
