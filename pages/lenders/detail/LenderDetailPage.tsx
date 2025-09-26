import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { useLenders } from '../useLenders';
import { useProspects } from '../../prospects/useProspects';
import { Lender } from '../../prospects/types';
import LenderDetailSidebar, { Section } from './LenderDetailSidebar';
import LenderDetailHeader from './LenderDetailHeader';
import LenderInfoSection from './sections/LenderInfoSection';
import TrustAccountSection from './sections/TrustAccountSection';
import PortfolioSection from './sections/PortfolioSection';


const LenderDetailPage: React.FC = () => {
    const { lenderId } = useParams<{ lenderId: string }>();
    const navigate = useNavigate();
    const { lenders, loading: lendersLoading, updateLender } = useLenders();
    const { prospects: allLoans, loading: loansLoading } = useProspects();
    
    // DERIVED STATE: The lender object is now derived directly from the master list.
    // This is the core of the fix, preventing re-render loops by eliminating local state synchronization.
    const lender = useMemo(() => 
        lenders.find(l => l.id === lenderId),
        [lenders, lenderId]
    );

    const [activeSection, setActiveSection] = useState<Section>('info');
    const loading = lendersLoading || loansLoading;

    // This effect now safely handles the case where a lender is not found after loading is complete.
    useEffect(() => {
        if (!loading && !lender && lenderId) {
            console.warn(`Lender with ID ${lenderId} not found. Redirecting.`);
            navigate('/lenders');
        }
    }, [lenderId, lender, loading, navigate]);


    if (loading || !lender) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Loading lender details...</p>
                </div>
            </DashboardLayout>
        );
    }

    const renderSection = () => {
        switch (activeSection) {
            case 'info':
                return <LenderInfoSection lender={lender} onUpdate={updateLender} />;
            case 'trust_account':
                return <TrustAccountSection lender={lender} onUpdate={updateLender} />;
            case 'portfolio':
                return <PortfolioSection lender={lender} allLoans={allLoans} />;
            default:
                return <div>Select a section</div>;
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <LenderDetailHeader lender={lender} />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                        <LenderDetailSidebar 
                            activeSection={activeSection} 
                            onSelect={setActiveSection} 
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

export default LenderDetailPage;