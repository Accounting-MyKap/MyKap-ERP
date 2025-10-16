import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import { useProspects } from '../../hooks/useProspects';
import { Prospect } from '../prospects/types';
import LoansTable from './LoansTable';

const LoansPage: React.FC = () => {
    const { prospects, loading } = useProspects();
    const navigate = useNavigate();

    const loans = useMemo(() => {
        return prospects.filter(p => p.status === 'completed');
    }, [prospects]);

    const handleEditLoan = (loan: Prospect) => {
        navigate(`/loans/${loan.id}`);
    };

    return (
        <DashboardLayout>
            <Header title="Loans" subtitle="View and manage all disbursed loans." />
            <div className="bg-white rounded-xl shadow-md p-6">
                <LoansTable 
                    loans={loans}
                    loading={loading}
                    onEditLoan={handleEditLoan}
                />
            </div>
        </DashboardLayout>
    );
};

export default LoansPage;