import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import ProspectsHeader from './components/ProspectsHeader';
import ProspectsList from './components/ProspectsList';
import ProspectDetailView from './ProspectDetailView';
import CreateProspectModal from './components/CreateProspectModal';
import { useProspects } from '../../hooks/useProspects';
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
        uploadDocument,
        removeDocumentLink,
        reopenProspect,
        rejectProspect, 
        uploadPropertyPhoto,
        deletePropertyPhoto
    } = useProspects();

    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    // CRITICAL FIX: Store only the ID of the selected prospect, not the whole object.
    // This prevents the re-render loop caused by object reference changes.
    const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // DERIVED STATE: The full selected prospect object is now derived directly from the
    // master prospects list and the selected ID on every render. This ensures the data
    // is always fresh without needing a problematic useEffect for synchronization.
    const selectedProspect = prospects.find(p => p.id === selectedProspectId) || null;

    console.log(`%c[LOG 11 - ProspectsPage]`, 'color: #ff9800; font-weight: bold;', 'Component re-rendering.', { selectedProspectId, selectedProspectName: selectedProspect?.borrower_name });


    const handleSelectProspect = (prospect: Prospect) => {
        console.log(`%c[LOG 12 - ProspectsPage]`, 'color: #ff9800; font-weight: bold;', 'handleSelectProspect called.', { prospectId: prospect.id, prospectName: prospect.borrower_name });
        setSelectedProspectId(prospect.id);
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
                            selectedProspectId={selectedProspectId}
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
                            onUploadDocument={uploadDocument}
                            onRemoveDocumentLink={removeDocumentLink}
                            onReopenProspect={reopenProspect}
                            onRejectProspect={rejectProspect}
                            onUploadPropertyPhoto={uploadPropertyPhoto}
                            onDeletePropertyPhoto={deletePropertyPhoto}
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