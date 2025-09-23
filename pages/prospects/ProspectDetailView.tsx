import React, { useState } from 'react';
import { Prospect, Stage, Document, DocumentStatus, ApplicantType, UserProfile, ClosingDocStatusKey, PropertyPhoto } from './types';
import ProspectDetailSidebar, { Section, SubSection } from './detail/ProspectDetailSidebar';
import ProspectInfoSection from './detail/sections/ProspectInfoSection';
import StagesSection from './detail/sections/StagesSection';
import CoBorrowersSection from '../loans/detail/sections/CoBorrowersSection';
import PropertiesSection from '../loans/detail/sections/PropertiesSection';
import TermsSection from '../loans/detail/sections/TermsSection';
import GenerateDocumentModal from './GenerateDocumentModal';
import { ReopenIcon, GenerateDocsIcon } from '../../components/icons';

interface ProspectDetailViewProps {
    prospect: Prospect | null;
    users: UserProfile[];
    onUpdateProspect: (prospectData: Partial<Prospect> & { id: string }) => void;
    onUpdateDocumentStatus: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType, newStatus: DocumentStatus) => void;
    onUpdateClosingDocumentStatus: (prospectId: string, stageId: number, docId: string, key: ClosingDocStatusKey, value: boolean) => void;
    onAddDocument: (prospectId: string, stageId: number, applicantType: ApplicantType, docName: string) => void;
    onDeleteDocument: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType) => void;
    onUploadDocument: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType, file: File) => Promise<void>;
    onRemoveDocumentLink: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType) => void;
    onReopenProspect: (prospectId: string) => void;
    onRejectProspect: (prospectId: string, stageId: number) => void;
    onUploadPropertyPhoto: (prospectId: string, propertyId: string, file: File) => Promise<void>;
    onDeletePropertyPhoto: (prospectId: string, propertyId: string, photo: PropertyPhoto) => Promise<void>;
}

const ProspectDetailView: React.FC<ProspectDetailViewProps> = (props) => {
    const { prospect, onRejectProspect, onReopenProspect, onUpdateProspect } = props;
    const [activeSection, setActiveSection] = useState<Section>('stages');
    const [activeSubSection, setActiveSubSection] = useState<SubSection | null>(null);
    const [isGenerateDocsModalOpen, setGenerateDocsModalOpen] = useState(false);

    if (!prospect) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed">
                <p className="text-gray-500">Select a prospect from the list to see their details.</p>
            </div>
        );
    }
    
    const { status, stages, rejected_at_stage } = prospect;
    const currentStage = stages.find(s => s.status === 'in_progress') || stages[stages.length - 1];
    
    const handleSelectSection = (section: Section, subSection?: SubSection) => {
        setActiveSection(section);
        setActiveSubSection(subSection || null);
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'info':
                return <ProspectInfoSection prospect={prospect} users={props.users} onUpdate={onUpdateProspect} />;
            case 'terms':
                return <TermsSection loan={prospect} onUpdate={(data) => onUpdateProspect({ id: prospect.id, ...data })} />;
            case 'properties':
                return <PropertiesSection 
                            loan={prospect} 
                            onUpdate={(data) => onUpdateProspect({ id: prospect.id, ...data })}
                            onUploadPhoto={props.onUploadPropertyPhoto}
                            onDeletePhoto={props.onDeletePropertyPhoto}
                        />;
            case 'borrower':
                 if (activeSubSection === 'co-borrowers') {
                    return <CoBorrowersSection loan={prospect} onUpdate={(data) => onUpdateProspect({ id: prospect.id, ...data })} />;
                }
                return <ProspectInfoSection prospect={prospect} users={props.users} onUpdate={onUpdateProspect} />;
            case 'stages':
            default:
                return <StagesSection {...props} />;
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{prospect.borrower_name}</h2>
                        <p className="text-sm font-mono text-gray-500">{prospect.prospect_code}</p>
                    </div>
                     {status !== 'rejected' && (
                        <div className="flex space-x-2">
                             <button 
                                onClick={() => setGenerateDocsModalOpen(true)}
                                className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-2 rounded-md">
                                <GenerateDocsIcon className="h-4 w-4 mr-2" /> Generate Closing Docs
                            </button>
                            <button 
                                onClick={() => onRejectProspect(prospect.id, currentStage.id)}
                                disabled={status === 'completed'}
                                className="text-sm font-medium text-red-600 hover:text-red-900 bg-red-100 px-3 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Reject
                            </button>
                        </div>
                    )}
                </div>
                 {status === 'rejected' && (
                    <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-lg flex justify-between items-center">
                        <p className="font-bold text-sm">Rejected at stage: {stages.find(s => s.id === rejected_at_stage)?.name}</p>
                        <button 
                            onClick={() => onReopenProspect(prospect.id)}
                            className="flex items-center bg-blue-600 text-white text-xs font-medium py-1 px-2 rounded-md hover:bg-blue-700"
                        >
                            <ReopenIcon className="h-4 w-4 mr-1"/> Reopen
                        </button>
                    </div>
                )}
            </div>
            
            <div className="flex">
                <ProspectDetailSidebar 
                    activeSection={activeSection}
                    activeSubSection={activeSubSection}
                    onSelect={handleSelectSection}
                />
                <div className="flex-1 p-4 min-w-0">
                    {renderSection()}
                </div>
            </div>

            <GenerateDocumentModal 
                isOpen={isGenerateDocsModalOpen}
                onClose={() => setGenerateDocsModalOpen(false)}
                prospect={prospect}
            />
        </div>
    );
};

export default ProspectDetailView;