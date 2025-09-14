import React, { useState } from 'react';
import { Prospect, Document } from '../../../prospects/types';
import { ChevronDownIcon, ChevronUpIcon } from '../../../../components/icons';

interface StageWithDocuments {
    id: number;
    name: string;
    documents: Document[];
}

const StageAccordion: React.FC<{ stage: StageWithDocuments }> = ({ stage }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border border-gray-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left bg-gray-50 hover:bg-gray-100"
            >
                <span className="font-semibold text-gray-800">{stage.name}</span>
                <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                        {stage.documents.length} document{stage.documents.length !== 1 ? 's' : ''}
                    </span>
                    {isOpen ? <ChevronUpIcon className="h-5 w-5"/> : <ChevronDownIcon className="h-5 w-5"/>}
                </div>
            </button>
            {isOpen && (
                <div className="p-4">
                    <ul className="space-y-2">
                        {stage.documents.map(doc => (
                            <li key={doc.id} className="text-sm">
                                <a
                                    href={doc.gdrive_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                                >
                                    {doc.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const DocumentsSection: React.FC<{ loan: Prospect }> = ({ loan }) => {
    
    const stagesWithDocuments: StageWithDocuments[] = loan.stages
        .map(stage => {
            const allDocs = [
                ...(stage.documents.individual || []),
                ...(stage.documents.company || []),
                ...(stage.documents.property || []),
                ...(stage.documents.general || []),
            ];
            const uploadedDocs = allDocs.filter(doc => doc.gdrive_link);

            return {
                id: stage.id,
                name: stage.name,
                documents: uploadedDocs,
            };
        })
        .filter(stage => stage.documents.length > 0);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Loan Documents</h3>
            {stagesWithDocuments.length > 0 ? (
                <div className="space-y-3">
                    {stagesWithDocuments.map(stage => (
                        <StageAccordion key={stage.id} stage={stage} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                    No documents have been uploaded for this loan.
                </div>
            )}
        </div>
    );
};

export default DocumentsSection;