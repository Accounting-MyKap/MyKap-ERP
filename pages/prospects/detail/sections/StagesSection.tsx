// pages/prospects/detail/sections/StagesSection.tsx
import React from 'react';
import { Prospect, ApplicantType, DocumentStatus, ClosingDocStatusKey } from '../../types';
import StageStepper from '../../components/StageStepper';
import StageSection from '../../components/StageSection';

interface StagesSectionProps {
    prospect: Prospect;
    onUpdateDocumentStatus: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType, newStatus: DocumentStatus) => void;
    onUpdateClosingDocumentStatus: (prospectId: string, stageId: number, docId: string, key: ClosingDocStatusKey, value: boolean) => void;
    onAddDocument: (prospectId: string, stageId: number, applicantType: ApplicantType, docName: string) => void;
    onDeleteDocument: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType) => void;
    onUploadDocument: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType, file: File) => Promise<void>;
    onRemoveDocumentLink: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType) => void;
}


const StagesSection: React.FC<StagesSectionProps> = (props) => {
    const { 
        prospect, 
        onUpdateDocumentStatus, 
        onUpdateClosingDocumentStatus,
        onAddDocument,
        onDeleteDocument,
        onUploadDocument,
        onRemoveDocumentLink
    } = props;

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto pb-4">
                <StageStepper stages={prospect.stages} />
            </div>

            <div className="space-y-4">
                {prospect.stages.map(stage => (
                    <StageSection
                        key={stage.id}
                        stage={stage}
                        prospect={prospect}
                        onUpdateDocumentStatus={(docId, appType, newStatus) => onUpdateDocumentStatus(prospect.id, stage.id, docId, appType, newStatus)}
                        onUpdateClosingDocumentStatus={(docId, key, value) => onUpdateClosingDocumentStatus(prospect.id, stage.id, docId, key, value)}
                        onAddDocument={(appType, docName) => onAddDocument(prospect.id, stage.id, appType, docName)}
                        onDeleteDocument={(docId, appType) => onDeleteDocument(prospect.id, stage.id, docId, appType)}
                        onUploadDocument={(docId, appType, file) => onUploadDocument(prospect.id, stage.id, docId, appType, file)}
                        onRemoveDocumentLink={(docId, appType) => onRemoveDocumentLink(prospect.id, stage.id, docId, appType)}
                    />
                ))}
            </div>
        </div>
    );
}

export default StagesSection;