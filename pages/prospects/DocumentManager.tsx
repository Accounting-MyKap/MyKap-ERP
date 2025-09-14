import React, { useState, useRef } from 'react';
import { Document, DocumentStatus } from './types';
import { AddIcon, TrashIcon, UploadIcon, CloseIcon } from '../../components/icons';

interface DocumentManagerProps {
    title: string;
    documents: Document[];
    onUpdateStatus: (docId: string, newStatus: DocumentStatus) => void;
    onAddDocument: (docName: string) => void;
    onDeleteDocument: (docId: string) => void;
    onUploadDocument: (docId: string, file: File) => Promise<void>;
    onRemoveDocumentLink: (docId: string) => void;
}

const statusColors: { [key in DocumentStatus]: string } = {
    missing: 'text-red-600',
    ready_for_review: 'text-yellow-600',
    approved: 'text-green-600',
    rejected: 'text-red-800 font-bold',
};

const DocumentManager: React.FC<DocumentManagerProps> = ({ title, documents, onUpdateStatus, onAddDocument, onDeleteDocument, onUploadDocument, onRemoveDocumentLink }) => {
    const [newDocName, setNewDocName] = useState('');
    const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [docIdForUpload, setDocIdForUpload] = useState<string | null>(null);

    const handleToggleReview = (doc: Document) => {
        if (doc.status === 'missing' || doc.status === 'rejected') {
            onUpdateStatus(doc.id, 'ready_for_review');
        } else if (doc.status === 'ready_for_review') {
            onUpdateStatus(doc.id, 'missing');
        }
    };

    const handleAddNewDocument = () => {
        if (newDocName.trim()) {
            onAddDocument(newDocName.trim());
            setNewDocName('');
        }
    };
    
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
                if(fileInputRef.current) {
                    fileInputRef.current.value = ''; // Reset file input
                }
            }
        }
    };
    
    return (
        <div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <h4 className="font-semibold text-gray-700 mb-2">{title}</h4>
            <div className="space-y-3">
                {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input 
                                type="checkbox"
                                checked={doc.status === 'approved' || doc.status === 'ready_for_review'}
                                onChange={() => handleToggleReview(doc)}
                                disabled={doc.status === 'approved'}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                             {doc.gdrive_link ? (
                                <a href={doc.gdrive_link} target="_blank" rel="noopener noreferrer" className="ml-3 text-sm text-blue-600 hover:underline">{doc.name}</a>
                            ) : (
                                <span className="ml-3 text-sm text-gray-800">{doc.name}</span>
                            )}
                            {doc.is_optional && <span className="ml-2 text-xs text-gray-500 italic">(Optional)</span>}
                             {doc.is_custom && (
                                <button onClick={() => onDeleteDocument(doc.id)} className="ml-2 text-gray-400 hover:text-red-500">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                           {doc.gdrive_link ? (
                                <button onClick={() => onRemoveDocumentLink(doc.id)} className="text-gray-400 hover:text-red-500" title="Remove uploaded document">
                                    <CloseIcon className="h-4 w-4"/>
                                </button>
                           ) : (
                                <>
                                    {uploadingDocId === doc.id ? (
                                        <span className="text-xs text-gray-500 italic">Uploading...</span>
                                    ) : (
                                        <button onClick={() => handleUploadClick(doc.id)} className="flex items-center text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300" title="Upload document">
                                           <UploadIcon className="h-3 w-3 mr-1" /> Upload
                                        </button>
                                    )}
                                </>
                           )}
                           
                           {doc.status === 'ready_for_review' && (
                                <>
                                    <button onClick={() => onUpdateStatus(doc.id, 'approved')} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Approve</button>
                                    <button onClick={() => onUpdateStatus(doc.id, 'rejected')} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Reject</button>
                                </>
                            )}
                            {doc.status === 'rejected' && (
                                 <button onClick={() => handleToggleReview(doc)} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300">Re-evaluate</button>
                            )}
                            <span className={`text-sm font-medium capitalize ${statusColors[doc.status]}`}>{doc.status.replace(/_/g, ' ')}</span>
                        </div>
                    </div>
                ))}

                {/* Add New Document */}
                <div className="flex items-center pt-2">
                    <input
                        type="text"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        placeholder="New document name..."
                        className="flex-grow input-field text-sm"
                    />
                    <button
                        onClick={handleAddNewDocument}
                        className="ml-2 flex items-center bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-700"
                    >
                        <AddIcon className="h-4 w-4 mr-1" /> Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentManager;