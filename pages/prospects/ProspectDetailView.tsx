import React, { useState } from 'react';
import { Prospect, Stage, Document, DocumentStatus, ApplicantType, UserProfile, ClosingDocStatusKey } from './types';
import StageStepper from './StageStepper';
import StageSection from './StageSection';
import { EditIcon, ReopenIcon } from '../../components/icons';
import EditProspectModal from './EditProspectModal';

interface ProspectDetailViewProps {
    prospect: Prospect | null;
    users: UserProfile[];
    onUpdateProspect: (prospectData: Partial<Prospect> & { id: string }) => void;
    onUpdateDocumentStatus: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType, newStatus: DocumentStatus) => void;
    onUpdateClosingDocumentStatus: (prospectId: string, stageId: number, docId: string, key: ClosingDocStatusKey, value: boolean) => void;
    onAddDocument: (prospectId: string, stageId: number, applicantType: ApplicantType, docName: string) => void;
    onDeleteDocument: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType) => void;
    onReopenProspect: (prospectId: string) => void;
    onRejectProspect: (prospectId: string, stageId: number) => void;
}

const ProspectDetailView: React.FC<ProspectDetailViewProps> = ({ 
    prospect,
    users,
    onUpdateProspect, 
    onUpdateDocumentStatus,
    onUpdateClosingDocumentStatus,
    onAddDocument,
    onDeleteDocument,
    onReopenProspect,
    onRejectProspect,
}) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (!prospect) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed">
                <p className="text-gray-500">Select a prospect from the list to see their details.</p>
            </div>
        );
    }
    
    const { client_name, client_type, loan_type, assigned_to_name, prospect_code, stages, status, rejected_at_stage, current_stage_name } = prospect;
    const currentStage = stages.find(s => s.status === 'in_progress') || stages[stages.length - 1];

    return (
        <div className="p-6 bg-white rounded-lg border border-gray-200">
            {/* Header */}
            <div className="pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">{client_name}</h2>
                    {status !== 'rejected' && (
                        <div className="flex space-x-2">
                             <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                                <EditIcon className="h-4 w-4 mr-1" /> Edit
                            </button>
                            <button 
                                onClick={() => onRejectProspect(prospect.id, currentStage.id)}
                                disabled={status === 'completed'}
                                className="text-sm font-medium text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Reject Prospect
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-500 mt-1 capitalize">
                    Type: {client_type} | Loan: {loan_type}
                </p>
                <p className="text-sm text-gray-500">Assigned to: {assigned_to_name}</p>
                <p className="text-sm font-mono text-gray-500 mt-1">Code: {prospect_code}</p>
            </div>
            
            {status === 'rejected' && (
                <div className="my-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-lg">
                    <p className="font-bold">This prospect was rejected at stage: {stages.find(s => s.id === rejected_at_stage)?.name}</p>
                    <button 
                        onClick={() => onReopenProspect(prospect.id)}
                        className="mt-2 flex items-center bg-blue-600 text-white text-sm font-medium py-1 px-3 rounded-md hover:bg-blue-700"
                    >
                        <ReopenIcon className="h-4 w-4 mr-1"/> Reopen
                    </button>
                </div>
            )}


            {/* Stages Stepper */}
            <div className="my-6">
                <StageStepper stages={stages} />
            </div>

            {/* Stages Accordion */}
            <div className="space-y-2">
                {stages.map(stage => (
                    <StageSection 
                        key={stage.id}
                        stage={stage}
                        prospect={prospect}
                        onUpdateDocumentStatus={(docId, applicantType, newStatus) => onUpdateDocumentStatus(prospect.id, stage.id, docId, applicantType, newStatus)}
                        onUpdateClosingDocumentStatus={(docId, key, value) => onUpdateClosingDocumentStatus(prospect.id, stage.id, docId, key, value)}
                        onAddDocument={(applicantType, docName) => onAddDocument(prospect.id, stage.id, applicantType, docName)}
                        onDeleteDocument={(docId, applicantType) => onDeleteDocument(prospect.id, stage.id, docId, applicantType)}
                    />
                ))}
            </div>

             <EditProspectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                prospect={prospect}
                users={users}
                onUpdateProspect={onUpdateProspect}
            />
        </div>
    );
};

export default ProspectDetailView;
