import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lender, Prospect } from '../../../prospects/types';
import { formatCurrency, formatPercent } from '../../../../utils/formatters';

interface PortfolioSectionProps {
    lender: Lender;
    allLoans: Prospect[];
}

// Create a combined type for easier rendering
interface PortfolioLoan {
    loanId: string;
    account: string;
    borrowerName: string;
    closingDate?: string;
    funderPrincipal: number;
    funderPctOwned: number;
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({ lender, allLoans }) => {
    const navigate = useNavigate();

    const portfolioLoans = useMemo((): PortfolioLoan[] => {
        if (!lender || !allLoans) return [];
        
        const loans: PortfolioLoan[] = [];

        allLoans.forEach(loan => {
            if (loan.status === 'completed' && loan.funders) {
                const funderInfo = loan.funders.find(f => f.lender_id === lender.id);
                if (funderInfo) {
                    loans.push({
                        loanId: loan.id,
                        account: loan.prospect_code,
                        borrowerName: loan.borrower_name,
                        closingDate: loan.terms?.closing_date,
                        funderPrincipal: funderInfo.principal_balance,
                        funderPctOwned: funderInfo.pct_owned,
                    });
                }
            }
        });
        
        return loans;
    }, [lender, allLoans]);
    
    const handleRowClick = (loanId: string) => {
        navigate(`/loans/${loanId}`);
    };
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Lender Portfolio</h3>
            {portfolioLoans.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower Name</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Principal Balance</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% Owned</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {portfolioLoans.map((item) => (
                                <tr key={item.loanId} onClick={() => handleRowClick(item.loanId)} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{item.account}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.borrowerName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{formatCurrency(item.funderPrincipal)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{formatPercent(item.funderPctOwned)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(item.closingDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                    This lender is not participating in any active loans.
                </div>
            )}
        </div>
    );
};

export default PortfolioSection;
