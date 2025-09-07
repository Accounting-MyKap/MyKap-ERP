import React, { useState, useEffect } from 'react';
import { Stage, Prospect, DocumentStatus, ApplicantType, ClosingDocStatusKey } from './types';
import { ChevronDownIcon, ChevronRightIcon } from '../../components/icons';
import DocumentManager from './DocumentManager';
import ClosingDocumentManager from './ClosingDocumentManager';

interface StageSectionProps {
    stage: Stage;
    prospect: Prospect;
    onUpdateDocumentStatus: (docId: string, applicantType: ApplicantType, newStatus: DocumentStatus) => void;
    onUpdateClosingDocumentStatus: (docId: string, key: ClosingDocStatusKey, value: boolean) => void;
    onAddDocument: (applicantType: ApplicantType, docName: string) => void;
    onDeleteDocument: (docId: string, applicantType: ApplicantType) => void;
}

const StageSection: React.FC<StageSectionProps> = ({ 
    stage, 
    prospect, 
    onUpdateDocumentStatus,
    onUpdateClosingDocumentStatus,
    onAddDocument,
    onDeleteDocument
}) => {
    const isCurrentStage = stage.status === 'in_progress';
    const [isOpen, setIsOpen] = useState(isCurrentStage);

    // This effect ensures that the accordion section automatically opens
    // when its corresponding stage becomes active.
    useEffect(() => {
        if (stage.status === 'in_progress') {
            setIsOpen(true);
        }
    }, [stage.status]);

    const { client_type } = prospect;

    const renderDocumentManagers = () => {
        if (stage.name.toLowerCase() === 'closing') {
            return <ClosingDocumentManager 
                documents={stage.documents.general || []}
                onUpdateStatus={onUpdateClosingDocumentStatus}
            />;
        }

        if (stage.name.toLowerCase() !== 'pre-validation') {
            // For stages like KYC, Title Work, etc.
            const documents = stage.documents.general || [];
            return (
                <DocumentManager 
                    title="Required Documents"
                    documents={documents}
                    applicantType="general"
                    onUpdateStatus={(docId, status) => onUpdateDocumentStatus(docId, "general", status)}
                    onAddDocument={(docName) => onAddDocument("general", docName)}
                    onDeleteDocument={(docId) => onDeleteDocument(docId, "general")}
                />
            );
        }

        // --- Logic for Pre-validation Stage ---
        const showIndividual = client_type === 'individual' || client_type === 'both';
        const showCompany = client_type === 'company' || client_type === 'both';

        return (
            <div className="space-y-4">
                {showIndividual && (
                    <DocumentManager 
                        title="Individual Documents"
                        documents={stage.documents.individual || []}
                        applicantType="individual"
                        onUpdateStatus={(docId, status) => onUpdateDocumentStatus(docId, "individual", status)}
                        onAddDocument={(docName) => onAddDocument("individual", docName)}
                        onDeleteDocument={(docId) => onDeleteDocument(docId, "individual")}
                    />
                )}
                {showCompany && (
                    <DocumentManager 
                        title="Company Documents"
                        documents={stage.documents.company || []}
                        applicantType="company"
                        onUpdateStatus={(docId, status) => onUpdateDocumentStatus(docId, "company", status)}
                        onAddDocument={(docName) => onAddDocument("company", docName)}
                        onDeleteDocument={(docId) => onDeleteDocument(docId, "company")}
                    />
                )}
                {/* Property documents are always part of pre-validation */}
                {(stage.documents.property && stage.documents.property.length > 0) && (
                     <DocumentManager 
                        title="Property Documents"
                        documents={stage.documents.property}
                        applicantType="property"
                        onUpdateStatus={(docId, status) => onUpdateDocumentStatus(docId, "property", status)}
                        onAddDocument={(docName) => onAddDocument("property", docName)}
                        onDeleteDocument={(docId) => onDeleteDocument(docId, "property")}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="border border-gray-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={stage.status === 'locked'}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
                <h3 className={`font-semibold ${stage.status === 'locked' ? 'text-gray-400' : 'text-gray-800'}`}>{stage.id}. {stage.name}</h3>
                {stage.status !== 'locked' && (
                    isOpen ? <ChevronDownIcon className="h-5 w-5 text-gray-600"/> : <ChevronRightIcon className="h-5 w-5 text-gray-600"/>
                )}
            </button>
            {isOpen && stage.status !== 'locked' && (
                <div className="p-4">
                    {renderDocumentManagers()}
                </div>
            )}
        </div>
    );
};

export default StageSection;
