// pages/loans/detail/sections/TermsSection.tsx
import React, { useState, useEffect } from 'react';
import { Prospect, LoanTerms } from '../../../prospects/types';
import { formatNumber, parseCurrency } from '../../../../utils/formatters';
import { useToast } from '../../../../hooks/useToast';

interface TermsSectionProps {
    loan: Prospect;
    onUpdate: (updatedData: { terms: LoanTerms }) => Promise<void>;
}

const TermsSection: React.FC<TermsSectionProps> = ({ loan, onUpdate }) => {
    // State is now managed per-field to prevent unstable re-render cycles.
    const [originalAmount, setOriginalAmount] = useState<number | undefined>();
    const [noteRate, setNoteRate] = useState<number | ''>('');
    const [loanTermMonths, setLoanTermMonths] = useState<number | undefined>();
    const [principalBalance, setPrincipalBalance] = useState<number | undefined>();
    const [trustBalance, setTrustBalance] = useState<number | undefined>();
    const [monthlyPayment, setMonthlyPayment] = useState<number | undefined>();
    const [closingDate, setClosingDate] = useState<string | undefined>();
    const [maturityDate, setMaturityDate] = useState<string | undefined>();

    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

     // CRITICAL FIX: The dependency is now loan.id.
     // This effect now ONLY syncs the form state when the user selects a DIFFERENT loan.
     // This breaks the re-render cycle during a save operation, preventing the application freeze.
     useEffect(() => {
        const terms = loan.terms || {};
        setOriginalAmount(terms.original_amount);
        setNoteRate((terms.note_rate || 0) * 100);
        setLoanTermMonths(terms.loan_term_months);
        setPrincipalBalance(terms.principal_balance);
        setTrustBalance(terms.trust_balance);
        setMonthlyPayment(terms.monthly_payment);
        setClosingDate(terms.closing_date);
        setMaturityDate(terms.maturity_date);
    }, [loan.id]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const termsToSave: Partial<LoanTerms> = {
                original_amount: originalAmount,
                note_rate: (Number(noteRate) || 0) / 100, // Convert percentage back to decimal
                loan_term_months: loanTermMonths,
                principal_balance: principalBalance,
                trust_balance: trustBalance,
                monthly_payment: monthlyPayment,
                closing_date: closingDate,
                maturity_date: maturityDate,
            };
            await onUpdate({ terms: termsToSave as LoanTerms });
            showToast('Loan terms saved successfully!', 'success');
        } catch (error: any) {
            showToast(`Error: ${error.message || 'Could not save changes.'}`, 'error');
        } finally {
            setIsSaving(false);
        }
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
                            <input type="text" inputMode="decimal" id="original_amount" name="original_amount" value={formatNumber(originalAmount)} onChange={(e) => setOriginalAmount(parseCurrency(e.target.value))} className="input-field input-field-with-adornment-left text-right" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="note_rate" className="block text-sm font-medium text-gray-700">Note Rate</label>
                         <div className="input-container mt-1">
                            <input type="number" id="note_rate" name="note_rate" value={noteRate} onChange={(e) => setNoteRate(e.target.value === '' ? '' : parseFloat(e.target.value))} className="input-field input-field-with-adornment-right text-right" />
                            <span className="input-adornment-right">%</span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="loan_term_months" className="block text-sm font-medium text-gray-700">Loan Term (months)</label>
                        <input type="number" id="loan_term_months" name="loan_term_months" value={loanTermMonths || ''} onChange={(e) => setLoanTermMonths(parseInt(e.target.value))} className="input-field mt-1 text-right" />
                    </div>
                </div>
                {/* Loan Balances */}
                 <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Loan Balances</h4>
                    <div>
                        <label htmlFor="principal_balance" className="block text-sm font-medium text-gray-700">Principal Balance</label>
                        <div className="input-container mt-1">
                            <span className="input-adornment">$</span>
                            <input type="text" inputMode="decimal" id="principal_balance" name="principal_balance" value={formatNumber(principalBalance)} onChange={(e) => setPrincipalBalance(parseCurrency(e.target.value))} className="input-field input-field-with-adornment-left text-right" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="trust_balance" className="block text-sm font-medium text-gray-700">Trust Balance</label>
                        <div className="input-container mt-1">
                            <span className="input-adornment">$</span>
                            <input type="text" inputMode="decimal" id="trust_balance" name="trust_balance" value={formatNumber(trustBalance)} onChange={(e) => setTrustBalance(parseCurrency(e.target.value))} className="input-field input-field-with-adornment-left text-right" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="monthly_payment" className="block text-sm font-medium text-gray-700">Monthly Payment</label>
                        <div className="input-container mt-1">
                            <span className="input-adornment">$</span>
                            <input type="text" inputMode="decimal" id="monthly_payment" name="monthly_payment" value={formatNumber(monthlyPayment)} onChange={(e) => setMonthlyPayment(parseCurrency(e.target.value))} className="input-field input-field-with-adornment-left text-right" />
                        </div>
                    </div>
                </div>
                {/* Important Dates */}
                 <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2">Important Dates</h4>
                    <div>
                        <label htmlFor="closing_date" className="block text-sm font-medium text-gray-700">Closing Date</label>
                        <input type="date" id="closing_date" name="closing_date" value={closingDate || ''} onChange={(e) => setClosingDate(e.target.value)} className="input-field mt-1" />
                    </div>
                     <div>
                        <label htmlFor="maturity_date" className="block text-sm font-medium text-gray-700">Maturity</label>
                        <input type="date" id="maturity_date" name="maturity_date" value={maturityDate || ''} onChange={(e) => setMaturityDate(e.target.value)} className="input-field mt-1" />
                    </div>
                </div>
            </div>
             <div className="pt-4 flex justify-end">
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default TermsSection;
