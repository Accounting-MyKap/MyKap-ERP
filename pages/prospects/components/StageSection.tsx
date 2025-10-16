// This file was missing. It defines the collapsible section for each prospect stage.
import React from 'react';
import { Stage, Prospect, DocumentStatus, ApplicantType, ClosingDocStatusKey } from '../types';
import DocumentManager from './DocumentManager';
import ClosingDocumentManager from './ClosingDocumentManager';
import { ChevronDownIcon, ChevronUpIcon } from '../../../components/icons';

interface StageSectionProps {
    stage: Stage;
    prospect: Prospect;
    onUpdateDocumentStatus: (docId: string, applicantType: ApplicantType, newStatus: DocumentStatus) => void;
    onUpdateClosingDocumentStatus: (docId: string, key: ClosingDocStatusKey, value: boolean) => void;
    onAddDocument: (applicantType: ApplicantType, docName: string) => void;
    onDeleteDocument: (docId: string, applicantType: ApplicantType) => void;
    onUploadDocument: (docId: string, applicantType: ApplicantType, file: File) => Promise<void>;
    onRemoveDocumentLink: (docId: string, applicantType: ApplicantType) => void;
}

const StageSection: React.FC<StageSectionProps> = ({ 
    stage,
    prospect,
    onUpdateDocumentStatus,
    onUpdateClosingDocumentStatus,
    onAddDocument,
    onDeleteDocument,
    onUploadDocument,
    onRemoveDocumentLink
}) => {
    const isCurrentStage = stage.status === 'in_progress';
    const isCompleted = stage.status === 'completed';
    const [isOpen, setIsOpen] = React.useState(isCurrentStage);

    const toggleOpen = () => {
        if (stage.status !== 'locked') {
            setIsOpen(!isOpen);
        }
    };

    const isClosingStage = stage.name.toLowerCase() === 'closing';

    const getApplicantTypesWithDocs = (): ApplicantType[] => {
        return Object.keys(stage.documents) as ApplicantType[];
    };
    
    const applicantTypesWithDocs = getApplicantTypesWithDocs();

    return (
        <div className="border border-gray-200 rounded-lg">
            <button
                onClick={toggleOpen}
                disabled={stage.status === 'locked'}
                className={`w-full flex justify-between items-center p-3 text-left ${
                    isCurrentStage ? 'bg-blue-50' : isCompleted ? 'bg-green-50' : 'bg-gray-50'
                } ${stage.status !== 'locked' ? 'hover:bg-gray-100' : 'cursor-default'}`}
            >
                <div className="flex items-center">
                    <span className={`font-semibold ${
                        isCurrentStage ? 'text-blue-800' : isCompleted ? 'text-green-800' : 'text-gray-800'
                    }`}>{stage.id}. {stage.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        isCurrentStage ? 'bg-blue-200 text-blue-800' :
                        isCompleted ? 'bg-green-200 text-green-800' :
                        'bg-gray-200 text-gray-600'
                    }`}>{stage.status.replace('_', ' ')}</span>
                    {stage.status !== 'locked' && (isOpen ? <ChevronUpIcon className="h-5 w-5"/> : <ChevronDownIcon className="h-5 w-5"/>)}
                </div>
            </button>
            {isOpen && stage.status !== 'locked' && (
                <div className="p-4 space-y-6">
                    {isClosingStage ? (
                        <>
                            {stage.documents.general && stage.documents.general.length > 0 && (
                                <ClosingDocumentManager
                                    documents={stage.documents.general}
                                    onUpdateStatus={onUpdateClosingDocumentStatus}
                                    onUploadDocument={(docId, file) => onUploadDocument(docId, 'general', file)}
                                    onRemoveDocumentLink={(docId) => onRemoveDocumentLink(docId, 'general')}
                                />
                            )}
                             {stage.documents.closing_final_approval && stage.documents.closing_final_approval.length > 0 && (
                                <DocumentManager
                                    title="Final Approval Documents"
                                    documents={stage.documents.closing_final_approval}
                                    onUpdateStatus={(docId, newStatus) => onUpdateDocumentStatus(docId, 'closing_final_approval', newStatus)}
                                    onAddDocument={(docName) => onAddDocument('closing_final_approval', docName)}
                                    onDeleteDocument={(docId) => onDeleteDocument(docId, 'closing_final_approval')}
                                    onUploadDocument={(docId, file) => onUploadDocument(docId, 'closing_final_approval', file)}
                                    onRemoveDocumentLink={(docId) => onRemoveDocumentLink(docId, 'closing_final_approval')}
                                />
                            )}
                        </>
                    ) : (
                        applicantTypesWithDocs.map(type => 
                            (stage.documents[type] && stage.documents[type]!.length > 0) && (
                                <DocumentManager 
                                    key={type}
                                    title={`${type.charAt(0).toUpperCase() + type.slice(1)} Documents`}
                                    documents={stage.documents[type] || []}
                                    onUpdateStatus={(docId, newStatus) => onUpdateDocumentStatus(docId, type, newStatus)}
                                    onAddDocument={(docName) => onAddDocument(type, docName)}
                                    onDeleteDocument={(docId) => onDeleteDocument(docId, type)}
                                    onUploadDocument={(docId, file) => onUploadDocument(docId, type, file)}
                                    onRemoveDocumentLink={(docId) => onRemoveDocumentLink(docId, type)}
                                />
                            )
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default StageSection;