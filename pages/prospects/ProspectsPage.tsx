import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import ProspectsHeader from './ProspectsHeader';
import ProspectsList from './ProspectsList';
import ProspectDetailView from './ProspectDetailView';
import CreateProspectModal from './CreateProspectModal';
import { useProspects } from './useProspects';
import { Prospect } from './types';

export type FilterType = 'all' | 'month' | 'active' | 'completed' | 'rejected';

const ProspectsPage: React.FC = () => {
    const { 
        prospects, 
        users, 
        loading, 
        addProspect, 
        updateProspect, 
        updateDocumentStatus,
        updateClosingDocumentStatus,
        addDocument, 
        deleteDocument,
        reopenProspect,
        rejectProspect, 
    } = useProspects();

    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // This effect ensures that the detailed view always shows the latest data
    // after any updates (like editing from a modal).
    useEffect(() => {
        if (selectedProspect) {
            const freshProspectData = prospects.find(p => p.id === selectedProspect.id);
            if (freshProspectData) {
                // To avoid re-renders if the object is identical
                if (JSON.stringify(freshProspectData) !== JSON.stringify(selectedProspect)) {
                    setSelectedProspect(freshProspectData);
                }
            } else {
                // The prospect was deleted, clear the selection
                setSelectedProspect(null);
            }
        }
    }, [prospects, selectedProspect]);

    const handleSelectProspect = (prospect: Prospect) => {
        setSelectedProspect(prospect);
    };

    return (
        <DashboardLayout>
            <Header title="Prospects" subtitle="Manage and track all loan prospects." />
            
            <div className="bg-white rounded-xl shadow-md p-6">
                <ProspectsHeader 
                    activeFilter={activeFilter} 
                    setActiveFilter={setActiveFilter}
                    onNewProspectClick={() => setIsModalOpen(true)}
                />

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                       <ProspectsList
                            prospects={prospects}
                            filter={activeFilter}
                            loading={loading}
                            onSelectProspect={handleSelectProspect}
                            selectedProspectId={selectedProspect?.id}
                       />
                    </div>
                    <div className="lg:col-span-2">
                        <ProspectDetailView 
                            prospect={selectedProspect}
                            users={users}
                            onUpdateProspect={updateProspect}
                            onUpdateDocumentStatus={updateDocumentStatus}
                            onUpdateClosingDocumentStatus={updateClosingDocumentStatus}
                            onAddDocument={addDocument}
                            onDeleteDocument={deleteDocument}
                            onReopenProspect={reopenProspect}
                            onRejectProspect={rejectProspect}
                        />
                    </div>
                </div>
            </div>

            <CreateProspectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddProspect={addProspect}
                users={users}
            />

        </DashboardLayout>
    );
};

export default ProspectsPage;
