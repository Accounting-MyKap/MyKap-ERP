import React from 'react';
import { Prospect } from '../../../prospects/types';
import { formatCurrency } from '../../../../utils/formatters';
import { TrashIcon } from '../../../../components/icons';

interface HistorySectionProps {
    loan: Prospect;
    onDeleteEvent: (eventId: string) => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({ loan, onDeleteEvent }) => {
    const history = loan.history || [];

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Loan History</h3>
             {history.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Received</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.map((event) => (
                                <tr key={event.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(event.date_created)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(event.date_received)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.type}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(event.total_amount)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this transaction? This will reverse its financial impact and cannot be undone.')) {
                                                    onDeleteEvent(event.id)
                                                }
                                            }}
                                            className="text-gray-400 hover:text-red-600 p-1"
                                            title="Delete Transaction"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                    No history events for this loan.
                </div>
            )}
        </div>
    );
};

export default HistorySection;