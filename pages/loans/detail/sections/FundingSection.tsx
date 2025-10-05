import React, { useState } from 'react';
import { Prospect, Funder } from '../../../prospects/types';
import { useLenders } from '../../../../hooks/useLenders';
import AddLoanFunderModal from '../AddLoanFunderModal';
import AddFundingEventModal from '../AddFundingEventModal';
import EditFunderModal from '../EditFunderModal';
import { AddIcon, DollarCircleIcon, EditIcon, TrashIcon, PaymentIcon } from '../../../../components/icons';
import { formatCurrency, formatPercent } from '../../../../utils/formatters';

interface FundingSectionProps {
    loan: Prospect;
    onUpdate: (updatedData: Partial<Prospect>) => void;
    onRecordPaymentClick: () => void;
}

const FundingSection: React.FC<FundingSectionProps> = ({ loan, onUpdate, onRecordPaymentClick }) => {
    const [isAddFunderModalOpen, setAddFunderModalOpen] = useState(false);
    const [isFundingEventModalOpen, setFundingEventModalOpen] = useState(false);
    const [editingFunder, setEditingFunder] = useState<Funder | null>(null);
    const { lenders } = useLenders();
    
    const funders = loan.funders || [];
    const loanOriginatorId = 'a6b2b7da-ffca-422c-91ef-36e6581b50f1';


    const handleAddFunder = (newFunder: Funder) => {
        const updatedFunders = [...funders, newFunder];
        onUpdate({ funders: updatedFunders });
    };
    
    const handleUpdateFunder = (updatedFunder: Funder) => {
        const updatedFunders = funders.map(f => f.id === updatedFunder.id ? updatedFunder : f);
        onUpdate({ funders: updatedFunders });
        setEditingFunder(null);
    };

    const handleDeleteFunder = (funderId: string) => {
        if (window.confirm("Are you sure you want to remove this funder? This cannot be undone.")) {
            const updatedFunders = funders.filter(f => f.id !== funderId);
            onUpdate({ funders: updatedFunders });
        }
    };
    
    const handleSaveFundingEvent = (data: { fundingDate: string; reference: string; fundingAmount: number; distributions: { [funderId: string]: number }; }) => {
        let updatedFunders = [...funders];

        // Create the history event
        const newHistoryEvent = {
            id: `hist-${crypto.randomUUID()}`,
            date_created: new Date().toISOString().split('T')[0],
            date_received: data.fundingDate,
            type: 'Funding',
            total_amount: data.fundingAmount,
            notes: data.reference,
            distributions: Object.entries(data.distributions).map(([funderId, amount]) => ({ funderId, amount })),
        };

        // Update principal balances based on distribution
        updatedFunders = updatedFunders.map(funder => {
            const distributionAmount = data.distributions[funder.id] || 0;
            let newPrincipal = funder.principal_balance + distributionAmount;

            // The originator's balance decreases as they "sell" participation
            if (funder.lender_id === loanOriginatorId) {
                 const totalSold = Object.entries(data.distributions)
                    .filter(([id, _]) => updatedFunders.find(f => f.id === id)?.lender_id !== loanOriginatorId)
                    .reduce((sum, [_, amount]) => sum + amount, 0);
                newPrincipal -= totalSold;
            }

            return {
                ...funder,
                principal_balance: newPrincipal,
            };
        });

        // Recalculate PCT owned based on new balances
        const totalPrincipal = updatedFunders.reduce((sum, f) => sum + f.principal_balance, 0);
        if (totalPrincipal > 0) {
            updatedFunders = updatedFunders.map(funder => ({
                ...funder,
                pct_owned: funder.principal_balance / totalPrincipal
            }));
        }


        onUpdate({
            funders: updatedFunders,
            history: [...(loan.history || []), newHistoryEvent],
            terms: {
                ...loan.terms,
                principal_balance: totalPrincipal,
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Loan Funding</h3>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setAddFunderModalOpen(true)} className="p-2 bg-gray-100 rounded-md hover:bg-gray-200" title="Add Funder"><AddIcon className="h-5 w-5 text-gray-600" /></button>
                    <button onClick={() => setFundingEventModalOpen(true)} className="p-2 bg-gray-100 rounded-md hover:bg-gray-200" title="Record Funding Event"><DollarCircleIcon className="h-5 w-5 text-gray-600" /></button>
                    <button onClick={onRecordPaymentClick} className="p-2 bg-gray-100 rounded-md hover:bg-gray-200" title="Record Payment"><PaymentIcon className="h-5 w-5 text-gray-600" /></button>
                </div>
            </div>

            {funders.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lender Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PCT Owned</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lender Rate</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal Balance</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {funders.map((funder) => (
                                <tr key={funder.id} onDoubleClick={() => setEditingFunder(funder)} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{funder.lender_name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatPercent(funder.pct_owned)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatPercent(funder.lender_rate)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(funder.principal_balance)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 space-x-2">
                                        <button onClick={() => setEditingFunder(funder)} className="text-blue-500 hover:text-blue-700" title="Edit Funder Servicing">
                                            <EditIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDeleteFunder(funder.id)} className="text-red-500 hover:text-red-700" title="Delete Funder">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                         <tfoot className="bg-gray-50">
                            <tr>
                                <td className="px-4 py-3 text-left text-sm font-bold text-gray-800">Total</td>
                                <td className="px-4 py-3 text-left text-sm font-bold text-gray-800">{formatPercent(funders.reduce((acc, f) => acc + f.pct_owned, 0))}</td>
                                <td></td>
                                <td className="px-4 py-3 text-left text-sm font-bold text-gray-800">{formatCurrency(funders.reduce((acc, f) => acc + f.principal_balance, 0))}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ) : (
                <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                    No funding sources have been added for this loan.
                </div>
            )}
            
            <AddLoanFunderModal 
                isOpen={isAddFunderModalOpen}
                onClose={() => setAddFunderModalOpen(false)}
                onSave={handleAddFunder}
                lenders={lenders}
                existingFunderIds={funders.map(f => f.lender_id)}
            />

            <AddFundingEventModal
                isOpen={isFundingEventModalOpen}
                onClose={() => setFundingEventModalOpen(false)}
                onSave={handleSaveFundingEvent}
                loan={loan}
            />

            <EditFunderModal
                isOpen={!!editingFunder}
                onClose={() => setEditingFunder(null)}
                onSave={handleUpdateFunder}
                funder={editingFunder}
                lenders={lenders}
            />

        </div>
    );
};

export default FundingSection;