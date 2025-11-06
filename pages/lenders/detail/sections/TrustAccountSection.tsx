import React, { useState } from 'react';
import { Lender, TrustAccountEvent } from '../../../prospects/types';
import AddDepositModal from '../AddDepositModal';
import WithdrawTrustModal from '../WithdrawTrustModal';
import { AddIcon, WithdrawalIcon } from '../../../../components/icons';
import { formatCurrency } from '../../../../utils/formatters';
import { useLenders } from '../../../../hooks/useLenders';
import { useToast } from '../../../../hooks/useToast';

interface TrustAccountSectionProps {
    lender: Lender;
}

const TrustAccountSection: React.FC<TrustAccountSectionProps> = ({ lender }) => {
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const { addFundsToLenderTrust, withdrawFromLenderTrust } = useLenders();
    const { showToast } = useToast();
    
    const history = (lender.trust_account_events || []).sort((a,b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

    const handleSaveDeposit = async (eventData: Omit<TrustAccountEvent, 'id' | 'event_type'>) => {
        try {
            await addFundsToLenderTrust(lender.id, { ...eventData, event_type: 'Deposit' });
            showToast('Deposit recorded successfully!', 'success');
            setIsDepositModalOpen(false);
        } catch (error: any) {
            showToast(`Error: ${error.message}`, 'error');
        }
    };
    
    const handleSaveWithdrawal = async (eventData: Omit<TrustAccountEvent, 'id' | 'event_type'>) => {
        try {
            await withdrawFromLenderTrust(lender.id, { ...eventData, event_type: 'Withdrawal' });
            showToast('Withdrawal recorded successfully!', 'success');
            setIsWithdrawModalOpen(false);
        } catch (error: any) {
            showToast(`Error: ${error.message}`, 'error');
        }
    };
    
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

    const isWithdrawalType = (type: string) => 
        ['Withdrawal', 'Funding Disbursement', 'Payment Reversal'].includes(type);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Trust Account History</h3>
                 <div className="flex items-center space-x-2">
                    <button onClick={() => setIsDepositModalOpen(true)} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 text-sm flex items-center">
                        <AddIcon className="h-4 w-4 mr-1" /> Deposit
                    </button>
                     <button onClick={() => setIsWithdrawModalOpen(true)} className="bg-yellow-500 text-white font-medium py-2 px-4 rounded-md hover:bg-yellow-600 text-sm flex items-center">
                        <WithdrawalIcon className="h-4 w-4 mr-1" /> Withdrawal
                    </button>
                </div>
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
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.map(event => (
                                <tr key={event.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(event.event_date)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{event.event_type}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {event.description}
                                        {event.related_loan_code && (
                                            <span className="block text-xs font-mono text-gray-500">{event.related_loan_code}</span>
                                        )}
                                    </td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-right ${isWithdrawalType(event.event_type) ? 'text-red-600' : 'text-green-600'}`}>
                                        {isWithdrawalType(event.event_type) ? '-' : '+'}{formatCurrency(event.amount)}
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
                isOpen={isDepositModalOpen}
                onClose={() => setIsDepositModalOpen(false)}
                onSave={handleSaveDeposit}
            />
            <WithdrawTrustModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                onSave={handleSaveWithdrawal}
                currentBalance={lender.trust_balance}
            />
        </div>
    );
};

export default TrustAccountSection;