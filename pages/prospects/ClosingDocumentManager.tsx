// This file was missing. It defines the component for managing documents in the 'Closing' stage.
import React from 'react';
import { Document, ClosingDocStatusKey } from './types';

interface ClosingDocumentManagerProps {
    documents: Document[];
    onUpdateStatus: (docId: string, key: ClosingDocStatusKey, value: boolean) => void;
}

const ClosingDocumentManager: React.FC<ClosingDocumentManagerProps> = ({ documents, onUpdateStatus }) => {
    
    const disclosures = documents.filter(doc => doc.category === 'disclosures');
    const loanDocs = documents.filter(doc => doc.category === 'loan_docs');

    const renderTable = (title: string, docs: Document[]) => (
        <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">{title}</h4>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Document Name
                            </th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sent
                            </th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Signed
                            </th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Filled
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {docs.map((doc) => (
                            <tr key={doc.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{doc.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                    <input
                                        type="checkbox"
                                        checked={!!doc.sent}
                                        onChange={(e) => onUpdateStatus(doc.id, 'sent', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                    <input
                                        type="checkbox"
                                        checked={!!doc.signed}
                                        onChange={(e) => onUpdateStatus(doc.id, 'signed', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                    <input
                                        type="checkbox"
                                        checked={!!doc.filled}
                                        onChange={(e) => onUpdateStatus(doc.id, 'filled', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {disclosures.length > 0 && renderTable('Disclosures', disclosures)}
            {loanDocs.length > 0 && renderTable('Loan Docs', loanDocs)}
        </div>
    );
};

export default ClosingDocumentManager;
