// pages/prospects/GenerateDocumentModal.tsx
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Modal from '../../components/ui/Modal';
import { Prospect } from './types';
import { MORTGAGE_TEMPLATE, GUARANTY_AGREEMENT_TEMPLATE, PROMISSORY_NOTE_TEMPLATE } from './documentTemplates';

interface GenerateDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    prospect: Prospect;
}

const documentOptions = {
    mortgage: { name: 'Mortgage', template: MORTGAGE_TEMPLATE },
    guaranty: { name: 'Guaranty Agreement', template: GUARANTY_AGREEMENT_TEMPLATE },
    promissory_note: { name: 'Secured Promissory Note', template: PROMISSORY_NOTE_TEMPLATE },
};

type DocumentKey = keyof typeof documentOptions;

const GenerateDocumentModal: React.FC<GenerateDocumentModalProps> = ({ isOpen, onClose, prospect }) => {
    const [selectedDoc, setSelectedDoc] = useState<DocumentKey>('mortgage');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const generatePrompt = () => {
        const template = documentOptions[selectedDoc].template;
        // Stringify all prospect data to include in the prompt
        const prospectDataString = JSON.stringify(prospect, null, 2);

        return `
            You are a legal document assistant for a mortgage company. Your task is to take a document template and fill in the placeholders with the provided data.
            - The placeholders are in all caps (e.g., COMPANY NAME, AMOUNT).
            - Use the JSON data provided below to find the correct values.
            - If a value is not available in the data, leave the placeholder as is.
            - Format numbers and dates appropriately for a legal document.
            - Be precise and do not add any extra information or commentary. Only output the filled-in document text.

            DOCUMENT TEMPLATE:
            ---
            ${template}
            ---

            JSON DATA:
            ---
            ${prospectDataString}
            ---
        `;
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedText('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const prompt = generatePrompt();
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            setGeneratedText(response.text);
        } catch (err) {
            console.error(err);
            setError('Failed to generate document. Please check the API key and try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedText)
            .then(() => alert('Document text copied to clipboard!'))
            .catch(err => console.error('Failed to copy text: ', err));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate Closing Document">
            <div className="space-y-4">
                <div>
                    <label htmlFor="docType" className="block text-sm font-medium text-gray-700">Select Document Type</label>
                    <select
                        id="docType"
                        value={selectedDoc}
                        onChange={(e) => setSelectedDoc(e.target.value as DocumentKey)}
                        className="input-field mt-1"
                    >
                        {Object.entries(documentOptions).map(([key, { name }]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isLoading ? 'Generating...' : 'Generate Document'}
                    </button>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                
                {generatedText && (
                    <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between items-center">
                             <h4 className="text-lg font-semibold text-gray-800">Generated Document</h4>
                             <button
                                onClick={handleCopyToClipboard}
                                className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
                            >
                                Copy to Clipboard
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={generatedText}
                            className="w-full h-64 p-2 border rounded-md bg-gray-50 font-mono text-xs"
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default GenerateDocumentModal;

// Note: documentTemplates.ts would be created to store the large template strings
// to keep this file clean. I've added a placeholder import for it.
