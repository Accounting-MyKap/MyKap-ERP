import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import { useLenders } from '../../hooks/useLenders';
import { Lender } from '../prospects/types';
import LendersHeader from './LendersHeader';
import AddLenderModal from './AddLenderModal';
import { formatCurrency } from '../../utils/formatters';
import { ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon } from '../../components/icons';

type SortKey = keyof Lender;

const LendersPage: React.FC = () => {
    const { lenders, loading, addLender } = useLenders();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);

    const handleRowClick = (lenderId: string) => {
        navigate(`/lenders/${lenderId}`);
    };
    
    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedLenders = useMemo(() => {
        let sortableItems = [...lenders];

        // Filtering
        if (searchTerm) {
            sortableItems = sortableItems.filter(lender =>
                lender.lender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lender.account.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sorting
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                     if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                     if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' 
                        ? aValue.localeCompare(bValue) 
                        : bValue.localeCompare(aValue);
                }
                return 0;
            });
        }
        return sortableItems;
    }, [lenders, searchTerm, sortConfig]);

    const SortableHeader: React.FC<{ sortKey: SortKey, children: React.ReactNode }> = ({ sortKey, children }) => {
        const isSorting = sortConfig?.key === sortKey;
        return (
            <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort(sortKey)}
            >
                <div className="flex items-center">
                    <span>{children}</span>
                    <span className="ml-1 w-4 h-4">
                        {isSorting ? (
                            sortConfig?.direction === 'ascending' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                            <ChevronUpDownIcon className="h-4 w-4 text-gray-300" />
                        )}
                    </span>
                </div>
            </th>
        );
    };

    return (
        <DashboardLayout>
            <Header title="Lenders" subtitle="Manage and track third-party funding sources." />
            <div className="bg-white rounded-xl shadow-md p-6">
                <LendersHeader 
                    onNewLenderClick={() => setIsModalOpen(true)}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <SortableHeader sortKey="account">Account</SortableHeader>
                                <SortableHeader sortKey="lender_name">Lender Name</SortableHeader>
                                <SortableHeader sortKey="portfolio_value">Portfolio Value</SortableHeader>
                                <SortableHeader sortKey="trust_balance">Trust Balance</SortableHeader>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center p-4">
                                     <div className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Loading...
                                    </div>
                                </td></tr>
                            ) : (
                                filteredAndSortedLenders.map((lender) => (
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