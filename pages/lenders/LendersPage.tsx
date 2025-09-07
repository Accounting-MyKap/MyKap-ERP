import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import { useLenders } from './useLenders';
import { Lender } from '../prospects/types';
import LendersHeader from './LendersHeader';
import AddLenderModal from './AddLenderModal';
import { formatCurrency } from '../../utils/formatters';

const LendersPage: React.FC = () => {
    const { lenders, loading, addLender, updateLender } = useLenders();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRowClick = (lenderId: string) => {
        navigate(`/lenders/${lenderId}`);
    };

    return (
        <DashboardLayout>
            <Header title="Lenders" subtitle="Manage and track third-party funding sources." />
            <div className="bg-white rounded-xl shadow-md p-6">
                <LendersHeader onNewLenderClick={() => setIsModalOpen(true)} />

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lender Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Balance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center p-4">Loading...</td></tr>
                            ) : (
                                lenders.map((lender) => (
                                    <tr key={lender.id} onClick={() => handleRowClick(lender.id)} className="hover:bg-gray-50 cursor-pointer">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{lender.account}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lender.lender_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(lender.portfolio_value)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(lender.trust_balance)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddLenderModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={addLender}
            />
        </DashboardLayout>
    );
};

export default LendersPage;