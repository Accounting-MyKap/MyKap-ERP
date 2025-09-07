import React, { useState } from 'react';
import { Lender, TrustAccountEvent } from '../../../prospects/types';
import AddDepositModal from '../AddDepositModal';
import { AddIcon } from '../../../../components/icons';
import { formatCurrency } from '../../../../utils/formatters';

interface TrustAccountSectionProps {
    lender: Lender;
    onUpdate: (lenderId: string, updatedData: Partial<Lender>) => void;
}

const TrustAccountSection: React.FC<TrustAccountSectionProps> = ({ lender, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const history = lender.trust_account_history || [];

    const handleSaveTransaction = (eventData: Omit<TrustAccountEvent, 'id' | 'balance'>) => {
        const newHistory = [...history];
        const newEvent: TrustAccountEvent = {
            id: `evt-${Date.now()}`,
            ...eventData,
            balance: 0, // Will be recalculated
        };
        newHistory.push(newEvent);

        // Recalculate balances
        let currentBalance = 0;
        const updatedHistory = newHistory.map(event => {
            const amount = event.type === 'deposit' ? event.amount : -event.amount;
            currentBalance += amount;
            return { ...event, balance: currentBalance };
        });
        
        onUpdate(lender.id, { trust_account_history: updatedHistory, trust_balance: currentBalance });
    };
    
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Trust Account History</h3>
                 <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 text-sm flex items-center">
                    <AddIcon className="h-4 w-4 mr-1" /> Add Transaction
                </button>
            </div>
            {history.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.map(event => (
                                <tr key={event.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(event.date)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm capitalize text-gray-600">{event.type}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.description}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-right ${event.type !== 'deposit' ? 'text-red-600' : ''}`}>
                                        {formatCurrency(event.amount)}
                                    </td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-right ${event.balance < 0 ? 'text-red-600' : ''}`}>
                                        {formatCurrency(event.balance)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                    No transactions for this trust account.
                </div>
            )}
             <AddDepositModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTransaction}
            />
        </div>
    );
};

export default TrustAccountSection;