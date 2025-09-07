import React from 'react';
import { Prospect } from '../prospects/types';
import { EditIcon } from '../../components/icons';

interface LoansTableProps {
    loans: Prospect[];
    loading: boolean;
    onEditLoan: (loan: Prospect) => void;
}

const LoansTable: React.FC<LoansTableProps> = ({ loans, loading, onEditLoan }) => {
    if (loading) {
        return <div className="text-center p-8 text-gray-500">Loading loans...</div>;
    }

    if (loans.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                No completed loans to display.
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Edit</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loans.map((loan) => (
                        <tr 
                            key={loan.id} 
                            onDoubleClick={() => onEditLoan(loan)}
                            className="hover:bg-gray-50 cursor-pointer"
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{loan.prospect_code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.borrower_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(loan.loan_amount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{loan.loan_type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{loan.assigned_to_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(loan.created_at)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onEditLoan(loan)} className="text-blue-600 hover:text-blue-900">
                                    <EditIcon className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LoansTable;