import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { TrustAccountEvent } from '../../prospects/types';
import { formatNumber, parseCurrency } from '../../../utils/formatters';

interface AddDepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<TrustAccountEvent, 'id' | 'event_type'>) => Promise<void>;
}

const AddDepositModal: React.FC<AddDepositModalProps> = ({ isOpen, onClose, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Reset form when modal opens or closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setDate(new Date().toISOString().split('T')[0]);
                setDescription('');
                setAmount(0);
                setIsSaving(false);
            }, 150);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving || amount <= 0) return;

        setIsSaving(true);
        try {
            await onSave({
                event_date: date,
                description,
                amount,
            });
            // The parent component shows success toast.
            onClose(); // Close only on success
        } catch (error) {
            // Error toast is shown by the parent component that called onSave.
            // The modal remains open for the user to see the context of the error.
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Trust Account Transaction">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="input-field mt-1" required disabled={isSaving} />
                </div>
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="input-field mt-1" required disabled={isSaving} />
                </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <div className="input-container mt-1">
                        <span className="input-adornment">$</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            id="amount"
                            value={formatNumber(amount)}
                            onChange={e => setAmount(parseCurrency(e.target.value))}
                            className="input-field input-field-with-adornment-left text-right"
                            required
                            disabled={isSaving} />
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} disabled={isSaving} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={isSaving || amount <= 0} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddDepositModal;