import React from 'react';
import { Document, ClosingDocStatusKey } from './types';

interface ClosingDocumentManagerProps {
    documents: Document[];
    onUpdateStatus: (docId: string, key: ClosingDocStatusKey, value: boolean) => void;
}

const ClosingDocumentManager: React.FC<ClosingDocumentManagerProps> = ({ documents, onUpdateStatus }) => {
    
    const disclosures = documents.filter(d => d.category === 'disclosures');
    const loanDocs = documents.filter(d => d.category === 'loan_docs');

    const renderDocList = (title: string, items: Document[]) => (
        <div>
            <h4 className="font-semibold text-gray-700 mb-2">{title}</h4>
            <div className="space-y-3">
                {items.map(doc => (
                     <div key={doc.id} className="grid grid-cols-2 gap-4 items-center">
                        <span className="text-sm text-gray-800">{doc.name}</span>
                        <div className="flex items-center justify-end space-x-4">
                            {(['Sent', 'Signed', 'Filled'] as const).map(label => {
                                const key = label.toLowerCase() as ClosingDocStatusKey;
                                const isChecked = doc[key] || false;
                                return (
                                    <label key={key} className="flex items-center text-sm">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => onUpdateStatus(doc.id, key, !isChecked)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2">{label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {renderDocList('Disclosures', disclosures)}
            {renderDocList('Loan Docs', loanDocs)}
        </div>
    );
};

export default ClosingDocumentManager;
