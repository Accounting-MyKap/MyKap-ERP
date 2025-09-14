import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useProspects } from '../prospects/useProspects';
import { useLenders } from '../lenders/useLenders';
import { Prospect } from '../prospects/types';
import LoanDetailSidebar, { Section, SubSection } from './detail/LoanDetailSidebar';
import LoanDetailHeader from './detail/LoanDetailHeader';
import BorrowerSection from './detail/sections/BorrowerSection';
import TermsSection from './detail/sections/TermsSection';
import FundingSection from './detail/sections/FundingSection';
import PropertiesSection from './detail/sections/PropertiesSection';
import HistorySection from './detail/sections/HistorySection';
import CoBorrowersSection from './detail/sections/CoBorrowersSection';
import RecordPaymentModal from './detail/RecordPaymentModal';

const LoanDetailPage: React.FC = () => {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();
    // FIX: Destructure 'updateProspect' instead of non-existent 'updateLoan'
    const { prospects, loading, updateProspect, recordLoanPayment } = useProspects();
    const { addFundsToLenderTrust } = useLenders();
    const [loan, setLoan] = useState<Prospect | null>(null);
    const [activeSection, setActiveSection] = useState<Section>('borrower');
    const [activeSubSection, setActiveSubSection] = useState<SubSection | null>(null);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

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
    
    // This effect ensures the local `loan` state is always in sync with the global `prospects` state.
    useEffect(() => {
        if (loan) {
            const freshLoanData = prospects.find(p => p.id === loan.id);
            if (freshLoanData && JSON.stringify(freshLoanData) !== JSON.stringify(loan)) {
                setLoan(freshLoanData);
            }
        }
    }, [prospects, loan]);


    const handleUpdateLoan = (updatedData: Partial<Prospect>) => {
        if (loan) {
            const updatedLoan = { ...loan, ...updatedData };
            setLoan(updatedLoan); // Optimistic update
            // FIX: Call 'updateProspect' with the correct single-object argument signature
            updateProspect({ id: loan.id, ...updatedData });
        }
    };
    
    const handleSavePayment = (paymentData: { date: string; amount: number; notes?: string; distributions: { funderId: string; lender_id: string; amount: number }[] }) => {
        if (!loan) return;

        // Step 1: Update the loan itself (reduce principal, update funder balances, add history)
        recordLoanPayment(loan.id, {
            date: paymentData.date,
            amount: paymentData.amount,
            notes: paymentData.notes,
            distributions: paymentData.distributions,
        });

        // Step 2: Distribute funds to each lender's trust account
        paymentData.distributions.forEach(dist => {
            if (dist.amount > 0) {
                 addFundsToLenderTrust(dist.lender_id, dist.amount, `Payment distribution from loan ${loan.prospect_code}`);
            }
        });

        setPaymentModalOpen(false);
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
                return <FundingSection loan={loan} onUpdate={handleUpdateLoan} onRecordPaymentClick={() => setPaymentModalOpen(true)} />;
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
             <RecordPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                loan={loan}
                onSave={handleSavePayment}
            />
        </DashboardLayout>
    );
};

export default LoanDetailPage;