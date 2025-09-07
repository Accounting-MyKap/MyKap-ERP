import React, { useState, useMemo } from 'react';
import Modal from '../../../components/ui/Modal';
import { Prospect, Funder } from '../../prospects/types';

interface FundingEventData {
    fundingDate: string;
    reference: string;
    fundingAmount: number;
    distributions: { [funderId: string]: number };
}

interface AddFundingEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FundingEventData) => void;
    loan: Prospect;
}

const AddFundingEventModal: React.FC<AddFundingEventModalProps> = ({ isOpen, onClose, onSave, loan }) => {
    const [step, setStep] = useState(1);
    const [fundingDate, setFundingDate] = useState(new Date().toISOString().split('T')[0]);
    const [reference, setReference] = useState('');
    const [fundingAmount, setFundingAmount] = useState(0);
    const [distributions, setDistributions] = useState<{ [funderId: string]: number }>({});
    
    const funders = loan.funders || [];

    const handleDistributionChange = (funderId: string, amount: number) => {
        setDistributions(prev => ({
            ...prev,
            [funderId]: amount
        }));
    };

    const totalDistributed = useMemo(() => {
        return Object.values(distributions).reduce((sum, amount) => sum + (amount || 0), 0);
    }, [distributions]);
    
    const remainingAmount = useMemo(() => {
        return fundingAmount - totalDistributed;
    }, [fundingAmount, totalDistributed]);

    const handleNext = () => {
        if (fundingAmount > 0) {
            setStep(2);
        }
    };
    
    const handleSave = () => {
        if (Math.abs(remainingAmount) > 0.01) { // Allow for small floating point inaccuracies
            alert('The total distributed amount must equal the funding amount.');
            return;
        }
        onSave({ fundingDate, reference, fundingAmount, distributions });
        onClose();
    };

    const renderStepOne = () => (
        <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-700">Funding Details</h4>
            <div>
                <label htmlFor="fundingDate" className="block text-sm font-medium text-gray-700">Funding Date</label>
                <input type="date" id="fundingDate" value={fundingDate} onChange={e => setFundingDate(e.target.value)} className="input-field mt-1" />
            </div>
            <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700">Reference</label>
                <input type="text" id="reference" value={reference} onChange={e => setReference(e.target.value)} className="input-field mt-1" />
            </div>
            <div>
                <label htmlFor="fundingAmount" className="block text-sm font-medium text-gray-700">Funding Amount</label>
                <input type="number" id="fundingAmount" value={fundingAmount} onChange={e => setFundingAmount(parseFloat(e.target.value) || 0)} className="input-field mt-1" />
            </div>
            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="button" onClick={handleNext} disabled={fundingAmount <= 0} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300">Next</button>
            </div>
        </div>
    );

    const renderStepTwo = () => (
        <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-700">Distribute Funding Amount</h4>
            <div className="space-y-2">
                {funders.map(funder => (
                    <div key={funder.id} className="grid grid-cols-2 gap-4 items-center">
                        <label htmlFor={`dist-${funder.id}`} className="text-sm font-medium text-gray-800">{funder.lender_name}</label>
                        <input
                            type="number"
                            id={`dist-${funder.id}`}
                            value={distributions[funder.id] || ''}
                            onChange={e => handleDistributionChange(funder.id, parseFloat(e.target.value) || 0)}
                            className="input-field text-right"
                            placeholder="0.00"
                        />
                    </div>
                ))}
            </div>
            <div className="pt-2 border-t text-right">
                <p className="text-sm">Total Distributed: <span className="font-semibold">{totalDistributed.toFixed(2)}</span></p>
                <p className={`text-sm ${remainingAmount !== 0 ? 'text-red-600' : 'text-green-600'}`}>Remaining: <span className="font-semibold">{remainingAmount.toFixed(2)}</span></p>
            </div>
            <div className="pt-4 flex justify-between space-x-3">
                <button type="button" onClick={() => setStep(1)} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">Back</button>
                <div>
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300 mr-2">Cancel</button>
                    <button type="button" onClick={handleSave} disabled={remainingAmount !== 0} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300">Apply</button>
                </div>
            </div>
        </div>
    );


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Funding">
            {step === 1 ? renderStepOne() : renderStepTwo()}
        </Modal>
    );
};

export default AddFundingEventModal;
