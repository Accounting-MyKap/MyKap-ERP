import React, { useState, useEffect } from 'react';
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
    const [lender, setLender] = useState<Lender | null>(null);
    const [activeSection, setActiveSection] = useState<Section>('info');

    const loading = lendersLoading || loansLoading;

    useEffect(() => {
        if (!loading && lenderId) {
            const foundLender = lenders.find(l => l.id === lenderId);
            if (foundLender) {
                setLender(foundLender);
            } else {
                navigate('/lenders');
            }
        }
    }, [lenderId, lenders, loading, navigate]);

    useEffect(() => {
        if(lender) {
            const freshData = lenders.find(l => l.id === lender.id);
            if (freshData && JSON.stringify(freshData) !== JSON.stringify(lender)) {
                setLender(freshData);
            }
        }
    }, [lenders, lender]);

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