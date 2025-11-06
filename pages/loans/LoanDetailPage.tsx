import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useProspects } from '../../hooks/useProspects';
import { useLenders } from '../../hooks/useLenders';
import { Prospect } from '../prospects/types';
import LoanDetailSidebar, { Section, SubSection } from './detail/LoanDetailSidebar';
import LoanDetailHeader from './detail/LoanDetailHeader';
import BorrowerSection from './detail/sections/BorrowerSection';
import TermsSection from './detail/sections/TermsSection';
import FundingSection from './detail/sections/FundingSection';
import PropertiesSection from './detail/sections/PropertiesSection';
import HistorySection from './detail/sections/HistorySection';
import CoBorrowersSection from './detail/sections/CoBorrowersSection';
import DocumentsSection from './detail/sections/DocumentsSection';
import RecordPaymentModal from './detail/RecordPaymentModal';

const LoanDetailPage: React.FC = () => {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();
    const { prospects, loading, updateProspect, recordLoanPayment, uploadPropertyPhoto, deletePropertyPhoto } = useProspects();
    const { addFundsToLenderTrust, withdrawFromLenderTrust } = useLenders();
    
    // DERIVED STATE: The loan object is now derived directly from the master list.
    // This is the core of the fix, preventing re-render loops by eliminating local state synchronization.
    const loan = useMemo(() => 
        prospects.find(p => p.id === loanId && p.status === 'completed'),
        [prospects, loanId]
    );

    const [activeSection, setActiveSection] = useState<Section>('borrower');
    const [activeSubSection, setActiveSubSection] = useState<SubSection | null>(null);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

    // This effect now safely handles the case where a loan is not found after loading is complete.
    useEffect(() => {
        if (!loading && !loan) {
            console.warn(`Loan with ID ${loanId} not found or not completed. Redirecting.`);
            navigate('/loans');
        }
    }, [loanId, loan, loading, navigate]);
    
    const handleUpdateLoan = async (updatedData: Partial<Prospect>) => {
        if (loan) {
            // Correctly deduct from lender trust balance when a new funding event occurs
            const oldHistory = loan.history || [];
            const newHistory = updatedData.history || [];

            // Check if a new funding event was added
            if (newHistory.length > oldHistory.length) {
                const newEvent = newHistory.find(h => !oldHistory.some(oh => oh.id === h.id));
                if (newEvent && newEvent.type === 'Funding' && newEvent.distributions) {
                    // Create a corresponding trust account event for each funder
                    for (const dist of newEvent.distributions) {
                         const funder = loan.funders?.find(f => f.id === dist.funderId);
                         if (funder) {
                            await withdrawFromLenderTrust(funder.lender_id, {
                                event_date: newEvent.date_received,
                                amount: dist.amount,
                                description: `Funding for loan: ${loan.prospect_code}`,
                                event_type: 'Funding Disbursement',
                                related_loan_id: loan.id,
                                related_loan_code: loan.prospect_code || undefined,
                            });
                        }
                    }
                }
            }
            // The component will automatically re-render with the updated data from the context.
            // No local state update (`setLoan`) is needed.
            await updateProspect({ id: loan.id, ...updatedData });
        }
    };
    
    const handleSavePayment = (paymentData: { date: string; amount: number; notes?: string; distributions: { funderId: string; lender_id: string; amount: number }[] }) => {
        if (!loan) return;

        recordLoanPayment(loan.id, {
            date: paymentData.date,
            amount: paymentData.amount,
            notes: paymentData.notes,
            distributions: paymentData.distributions,
        });

        // For each distribution, create a corresponding deposit event in the lender's trust account.
        paymentData.distributions.forEach(dist => {
            if (dist.amount > 0) {
                 addFundsToLenderTrust(dist.lender_id, {
                    event_date: paymentData.date,
                    amount: dist.amount,
                    description: `Payment distribution from loan: ${loan.prospect_code}`,
                    event_type: 'Payment Receipt',
                    related_loan_id: loan.id,
                    related_loan_code: loan.prospect_code || undefined,
                 });
            }
        });

        setPaymentModalOpen(false);
    };

    const handleDeleteHistoryEvent = (eventId: string) => {
        if (!loan) return;

        const eventToDelete = loan.history?.find(h => h.id === eventId);
        if (!eventToDelete) return;

        let newPrincipalBalance = loan.terms?.principal_balance || 0;
        let updatedFunders = JSON.parse(JSON.stringify(loan.funders || []));

        if (eventToDelete.type === 'Payment') {
            newPrincipalBalance += eventToDelete.total_amount;
            if (eventToDelete.distributions) {
                eventToDelete.distributions.forEach(dist => {
                    const funder = updatedFunders.find(f => f.id === dist.funderId);
                    if (funder) {
                        funder.principal_balance += dist.amount;
                        const lenderToUpdate = loan.funders?.find(f => f.id === dist.funderId);
                        if(lenderToUpdate) {
                            withdrawFromLenderTrust(lenderToUpdate.lender_id, {
                                event_date: eventToDelete.date_received,
                                amount: dist.amount,
                                description: `Reversal of payment from loan: ${loan.prospect_code}`,
                                event_type: 'Payment Reversal',
                                related_loan_id: loan.id,
                                related_loan_code: loan.prospect_code || undefined,
                            });
                        }
                    }
                });
            }
        } else if (eventToDelete.type === 'Funding') {
            newPrincipalBalance -= eventToDelete.total_amount;
             if (eventToDelete.distributions) {
                eventToDelete.distributions.forEach(dist => {
                    const funder = updatedFunders.find(f => f.id === dist.funderId);
                    if (funder) {
                        funder.principal_balance -= dist.amount;
                        const lenderToUpdate = loan.funders?.find(f => f.id === dist.funderId);
                        if(lenderToUpdate) {
                             addFundsToLenderTrust(lenderToUpdate.lender_id, {
                                event_date: eventToDelete.date_received,
                                amount: dist.amount,
                                description: `Reversal of funding for loan: ${loan.prospect_code}`,
                                event_type: 'Funding Reversal',
                                related_loan_id: loan.id,
                                related_loan_code: loan.prospect_code || undefined,
                             });
                        }
                    }
                });
            }
        }

        const totalPrincipal = updatedFunders.reduce((sum, f) => sum + f.principal_balance, 0);
        updatedFunders = totalPrincipal > 0
            ? updatedFunders.map(f => ({ ...f, pct_owned: f.principal_balance / totalPrincipal }))
            : updatedFunders.map(f => ({ ...f, pct_owned: 0 }));

        const newHistory = loan.history?.filter(h => h.id !== eventId) || [];
        
        updateProspect({
            id: loan.id,
            history: newHistory,
            terms: { ...loan.terms, principal_balance: newPrincipalBalance },
            funders: updatedFunders,
        });
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
                return <PropertiesSection 
                            loan={loan} 
                            onUpdate={handleUpdateLoan}
                            onUploadPhoto={uploadPropertyPhoto}
                            onDeletePhoto={deletePropertyPhoto}
                        />;
            case 'history':
                return <HistorySection loan={loan} onDeleteEvent={handleDeleteHistoryEvent} />;
            case 'documents':
                return <DocumentsSection loan={loan} />;
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