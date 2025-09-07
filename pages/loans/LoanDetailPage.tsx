import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useProspects } from '../prospects/useProspects';
import { Prospect } from '../prospects/types';
import LoanDetailSidebar, { Section, SubSection } from './detail/LoanDetailSidebar';
import LoanDetailHeader from './detail/LoanDetailHeader';
import BorrowerSection from './detail/sections/BorrowerSection';
import TermsSection from './detail/sections/TermsSection';
import FundingSection from './detail/sections/FundingSection';
import PropertiesSection from './detail/sections/PropertiesSection';
import HistorySection from './detail/sections/HistorySection';
import CoBorrowersSection from './detail/sections/CoBorrowersSection';

const LoanDetailPage: React.FC = () => {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();
    const { prospects, loading, updateLoan } = useProspects();
    const [loan, setLoan] = useState<Prospect | null>(null);
    const [activeSection, setActiveSection] = useState<Section>('borrower');
    const [activeSubSection, setActiveSubSection] = useState<SubSection | null>(null);

    useEffect(() => {
        if (!loading) {
            const foundLoan = prospects.find(p => p.id === loanId && p.status === 'completed');
            if (foundLoan) {
                setLoan(foundLoan);
            } else {
                // Loan not found or not completed, redirect
                navigate('/loans');
            }
        }
    }, [loanId, prospects, loading, navigate]);

    const handleUpdateLoan = (updatedData: Partial<Prospect>) => {
        if (loan) {
            const updatedLoan = { ...loan, ...updatedData };
            setLoan(updatedLoan); // Optimistic update
            updateLoan(loan.id, updatedData);
        }
    };

    const handleSelect = (section: Section, subSection?: SubSection | null) => {
        setActiveSection(section);
        setActiveSubSection(subSection || null);
    };

    if (loading || !loan) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Loading loan details...</p>
                </div>
            </DashboardLayout>
        );
    }

    const renderSection = () => {
        switch (activeSection) {
            case 'borrower':
                if (activeSubSection === 'co-borrowers') {
                    return <CoBorrowersSection loan={loan} onUpdate={handleUpdateLoan} />;
                }
                return <BorrowerSection loan={loan} onUpdate={handleUpdateLoan} />;
            case 'terms':
                return <TermsSection loan={loan} onUpdate={handleUpdateLoan} />;
            case 'funding':
                return <FundingSection loan={loan} onUpdate={handleUpdateLoan} />;
            case 'properties':
                return <PropertiesSection loan={loan} onUpdate={handleUpdateLoan} />;
            case 'history':
                return <HistorySection loan={loan} />;
            default:
                return <div>Select a section</div>;
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <LoanDetailHeader loan={loan} />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                        <LoanDetailSidebar 
                            activeSection={activeSection} 
                            activeSubSection={activeSubSection}
                            onSelect={handleSelect} 
                        />
                    </div>
                    <div className="md:col-span-3">
                        <div className="bg-white rounded-lg shadow-md p-6 min-h-[400px]">
                           {renderSection()}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LoanDetailPage;