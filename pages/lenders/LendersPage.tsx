import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import { useLenders } from './useLenders';
import { Lender } from '../prospects/types';

const LendersTable: React.FC<{ lenders: Lender[], loading: boolean }> = ({ lenders, loading }) => {
    if (loading) {
        return <div className="text-center p-8 text-gray-500">Loading lenders...</div>;
    }

    if (lenders.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                No lenders found.
            </div>
        );
    }

    const formatCurrency = (amount?: number) => {
        if (amount === undefined) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatAddress = (address: Lender['address']) => {
        return `${address.street || ''}, ${address.city || ''}, ${address.state || ''} ${address.zip || ''}`.trim();
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lender Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio Value</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Balance</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {lenders.map((lender) => (
                        <tr key={lender.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{lender.account}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lender.lender_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(lender.portfolio_value)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(lender.trust_balance)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatAddress(lender.address)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const LendersPage: React.FC = () => {
    const { lenders, loading } = useLenders();

    return (
        <DashboardLayout>
            <Header title="All Lenders" subtitle="Manage and track third-party funding sources." />
            <div className="bg-white rounded-xl shadow-md p-6">
                <LendersTable lenders={lenders} loading={loading} />
            </div>
        </DashboardLayout>
    );
};

export default LendersPage;