import React from 'react';
import { Link } from 'react-router-dom';
import { Lender } from '../../prospects/types';
import { formatCurrency } from '../../../utils/formatters';

interface LenderDetailHeaderProps {
    lender: Lender;
}

const InfoCard: React.FC<{ title: string; value: string | number | undefined }> = ({ title, value }) => (
    <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-sm font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
);

const LenderDetailHeader: React.FC<LenderDetailHeaderProps> = ({ lender }) => {

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{lender.lender_name}</h1>
                <p className="text-sm font-mono text-gray-500">{lender.account}</p>
                <Link to="/lenders" className="text-sm text-blue-600 hover:underline mt-2 inline-block">&larr; Back to all lenders</Link>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InfoCard title="Portfolio Value" value={formatCurrency(lender.portfolio_value)} />
                <InfoCard title="Trust Balance" value={formatCurrency(lender.trust_balance)} />
            </div>
        </div>
    );
};

export default LenderDetailHeader;