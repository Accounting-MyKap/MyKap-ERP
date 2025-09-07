import React from 'react';
import { Prospect } from '../../../prospects/types';

interface FundingSectionProps {
    loan: Prospect;
    onUpdate: (updatedData: Partial<Prospect>) => void;
}

const FundingSection: React.FC<FundingSectionProps> = ({ loan, onUpdate }) => {
    // This is a placeholder for a more complex implementation
    // that would involve adding, editing, and deleting funders.
    const funders = loan.funders || [];

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    const formatPercent = (amount: number) => `${(amount * 100).toFixed(2)}%`;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Loan Funding</h3>
                 <button className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 text-sm">
                    Add Funder
                </button>
            </div>

            {funders.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lender Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PCT Owned</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lender Rate</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {funders.map((funder) => (
                                <tr key={funder.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{funder.lender_name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatPercent(funder.pct_owned)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatPercent(funder.lender_rate)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(funder.original_amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                    No funding sources have been added for this loan.
                </div>
            )}
        </div>
    );
};

export default FundingSection;