import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import { useProspects } from '../prospects/useProspects';
import { Prospect } from '../prospects/types';
import LoansTable from './LoansTable';
import EditProspectModal from '../prospects/EditProspectModal';

const LoansPage: React.FC = () => {
    const { prospects, users, loading, updateProspect } = useProspects();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Prospect | null>(null);

    const loans = useMemo(() => {
        return prospects.filter(p => p.status === 'completed');
    }, [prospects]);

    const handleEditLoan = (loan: Prospect) => {
        setSelectedLoan(loan);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedLoan(null);
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
            <EditProspectModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                prospect={selectedLoan}
                users={users}
                onUpdateProspect={updateProspect}
            />
        </DashboardLayout>
    );
};

export default LoansPage;