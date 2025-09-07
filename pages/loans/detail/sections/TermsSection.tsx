import React, { useState, useEffect } from 'react';
import { Prospect, LoanTerms } from '../../../prospects/types';

interface TermsSectionProps {
    loan: Prospect;
    onUpdate: (updatedData: { terms: LoanTerms }) => void;
}

const TermsSection: React.FC<TermsSectionProps> = ({ loan, onUpdate }) => {
    const [terms, setTerms] = useState<LoanTerms>(loan.terms || {});

     useEffect(() => {
        setTerms(loan.terms || {});
    }, [loan]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
        setTerms(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleSave = () => {
        onUpdate({ terms });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Loan Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* General */}
                <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2">General</h4>
                    <div>
                        <label htmlFor="original_amount" className="block text-sm font-medium text-gray-700">Original Amount</label>
                        <input type="number" id="original_amount" name="original_amount" value={terms.original_amount || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                    <div>
                        <label htmlFor="note_rate" className="block text-sm font-medium text-gray-700">Note Rate (%)</label>
                        <input type="number" id="note_rate" name="note_rate" value={terms.note_rate || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                </div>
                {/* Loan Balances */}
                 <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Loan Balances</h4>
                    <div>
                        <label htmlFor="principal_balance" className="block text-sm font-medium text-gray-700">Principal Balance</label>
                        <input type="number" id="principal_balance" name="principal_balance" value={terms.principal_balance || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                     <div>
                        <label htmlFor="trust_balance" className="block text-sm font-medium text-gray-700">Trust Balance</label>
                        <input type="number" id="trust_balance" name="trust_balance" value={terms.trust_balance || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                </div>
                {/* Important Dates */}
                 <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Important Dates</h4>
                    <div>
                        <label htmlFor="closing_date" className="block text-sm font-medium text-gray-700">Closing Date</label>
                        <input type="date" id="closing_date" name="closing_date" value={terms.closing_date || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                     <div>
                        <label htmlFor="maturity_date" className="block text-sm font-medium text-gray-700">Maturity</label>
                        <input type="date" id="maturity_date" name="maturity_date" value={terms.maturity_date || ''} onChange={handleChange} className="input-field mt-1" />
                    </div>
                </div>
            </div>
             <div className="pt-4 flex justify-end">
                <button onClick={handleSave} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default TermsSection;