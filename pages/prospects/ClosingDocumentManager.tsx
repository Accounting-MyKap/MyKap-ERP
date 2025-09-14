// This file was missing. It defines the component for managing documents in the 'Closing' stage.
import React, { useState, useRef } from 'react';
import { Document, ClosingDocStatusKey } from './types';
import { UploadIcon, CloseIcon } from '../../components/icons';

interface ClosingDocumentManagerProps {
    documents: Document[];
    onUpdateStatus: (docId: string, key: ClosingDocStatusKey, value: boolean) => void;
    onUploadDocument: (docId: string, file: File) => Promise<void>;
    onRemoveDocumentLink: (docId: string) => void;
}

const ClosingDocumentManager: React.FC<ClosingDocumentManagerProps> = ({ documents, onUpdateStatus, onUploadDocument, onRemoveDocumentLink }) => {
    
    const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
    const [docIdForUpload, setDocIdForUpload] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const disclosures = documents.filter(doc => doc.category === 'disclosures');
    const loanDocs = documents.filter(doc => doc.category === 'loan_docs');

    const handleUploadClick = (docId: string) => {
        setDocIdForUpload(docId);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && docIdForUpload) {
            setUploadingDocId(docIdForUpload);
            try {
                await onUploadDocument(docIdForUpload, file);
            } catch (error) {
                console.error("Upload failed", error);
                alert("File upload failed. Please try again.");
            } finally {
                setUploadingDocId(null);
                setDocIdForUpload(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Reset file input
                }
            }
        }
    };

    const renderTable = (title: string, docs: Document[]) => (
        <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">{title}</h4>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
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
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {docs.map((doc) => (
                            <tr key={doc.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {doc.gdrive_link ? (
                                        <a href={doc.gdrive_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{doc.name}</a>
                                    ) : (
                                        <span className="text-gray-800">{doc.name}</span>
                                    )}
                                </td>
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
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                    {doc.gdrive_link ? (
                                        <button onClick={() => onRemoveDocumentLink(doc.id)} className="text-gray-400 hover:text-red-500 p-1" title="Remove uploaded document">
                                            <CloseIcon className="h-4 w-4"/>
                                        </button>
                                    ) : (
                                        <>
                                            {uploadingDocId === doc.id ? (
                                                <span className="text-xs text-gray-500 italic">Uploading...</span>
                                            ) : (
                                                <button onClick={() => handleUploadClick(doc.id)} className="flex items-center text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 mx-auto" title="Upload document">
                                                   <UploadIcon className="h-3 w-3 mr-1" /> Upload
                                                </button>
                                            )}
                                        </>
                                    )}
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
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            {disclosures.length > 0 && renderTable('Disclosures', disclosures)}
            {loanDocs.length > 0 && renderTable('Loan Docs', loanDocs)}
        </div>
    );
};

export default ClosingDocumentManager;