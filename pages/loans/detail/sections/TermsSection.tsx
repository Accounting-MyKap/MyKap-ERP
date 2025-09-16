import React, { useState, useEffect } from 'react';
import { Prospect, LoanTerms } from '../../../prospects/types';
import { formatNumber, parseCurrency } from '../../../../utils/formatters';

interface TermsSectionProps {
    loan: Prospect;
    onUpdate: (updatedData: { terms: LoanTerms }) => void;
}

const TermsSection: React.FC<TermsSectionProps> = ({ loan, onUpdate }) => {
    const [terms, setTerms] = useState<Partial<LoanTerms & { note_rate: number | '' }>>({});

     useEffect(() => {
        if (loan.terms) {
            setTerms({
                ...loan.terms,
                // Convert decimal to percentage for display in input
                note_rate: (loan.terms.note_rate || 0) * 100,
            });
        } else {
            setTerms({})
        }
    }, [loan]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (['original_amount', 'principal_balance', 'trust_balance'].includes(name)) {
            const parsedValue = parseCurrency(value);
            setTerms(prev => ({ ...prev, [name]: parsedValue === 0 ? undefined : parsedValue }));
        } else {
            const parsedValue = value === '' ? '' : parseFloat(value) || 0;
            setTerms(prev => ({ ...prev, [name]: parsedValue }));
        }
    };

    const handleSave = () => {
        const termsToSave: Partial<LoanTerms> = {
            ...terms,
            // Convert percentage from input back to decimal for saving
            note_rate: (Number(terms.note_rate) || 0) / 100,
        };
        onUpdate({ terms: termsToSave as LoanTerms });
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
                        <div className="input-container mt-1">
                            <span className="input-adornment">$</span>
                            <input type="text" inputMode="decimal" id="original_amount" name="original_amount" value={formatNumber(terms.original_amount)} onChange={handleChange} className="input-field input-field-with-adornment-left text-right" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="note_rate" className="block text-sm font-medium text-gray-700">Note Rate</label>
                         <div className="input-container mt-1">
                            <input type="number" id="note_rate" name="note_rate" value={terms.note_rate || ''} onChange={handleChange} className="input-field input-field-with-adornment-right text-right" />
                            <span className="input-adornment-right">%</span>
                        </div>
                    </div>
                </div>
                {/* Loan Balances */}
                 <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Loan Balances</h4>
                    <div>
                        <label htmlFor="principal_balance" className="block text-sm font-medium text-gray-700">Principal Balance</label>
                        <div className="input-container mt-1">
                            <span className="input-adornment">$</span>
                            <input type="text" inputMode="decimal" id="principal_balance" name="principal_balance" value={formatNumber(terms.principal_balance)} onChange={handleChange} className="input-field input-field-with-adornment-left text-right" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="trust_balance" className="block text-sm font-medium text-gray-700">Trust Balance</label>
                        <div className="input-container mt-1">
                            <span className="input-adornment">$</span>
                            <input type="text" inputMode="decimal" id="trust_balance" name="trust_balance" value={formatNumber(terms.trust_balance)} onChange={handleChange} className="input-field input-field-with-adornment-left text-right" />
                        </div>
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
