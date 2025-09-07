import React from 'react';
import { Link } from 'react-router-dom';
import { Prospect } from '../../prospects/types';
import { formatCurrency, formatPercent } from '../../../utils/formatters';

interface LoanDetailHeaderProps {
    loan: Prospect;
}

const InfoCard: React.FC<{ title: string; value: string | number | undefined }> = ({ title, value }) => (
    <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-sm font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
);

const LoanDetailHeader: React.FC<LoanDetailHeaderProps> = ({ loan }) => {
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{loan.borrower_name}</h1>
                    <p className="text-sm font-mono text-gray-500">{loan.prospect_code}</p>
                    <Link to="/loans" className="text-sm text-blue-600 hover:underline mt-2 inline-block">&larr; Back to all loans</Link>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <InfoCard title="Original Balance" value={formatCurrency(loan.terms?.original_amount)} />
                <InfoCard title="Principal Balance" value={formatCurrency(loan.terms?.principal_balance)} />
                <InfoCard title="Maturity Date" value={formatDate(loan.terms?.maturity_date)} />
                <InfoCard title="Loan Type" value={loan.loan_type} />
                <InfoCard title="Note Rate" value={formatPercent(loan.terms?.note_rate)} />
            </div>
        </div>
    );
};

export default LoanDetailHeader;