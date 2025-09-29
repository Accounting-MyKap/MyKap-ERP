import React, { useState, useEffect, useRef } from 'react';
import { Template } from '../../contexts/TemplatesContext';
import { useToast } from '../../hooks/useToast';

interface TemplateEditorProps {
    template: Template | null;
    onSave: (templateId: string, newContent: string) => Promise<void>;
}

const PLACEHOLDERS: { placeholder: string; description: string }[] = [
    { placeholder: '{{AMOUNT}}', description: 'Total loan amount, formatted as currency (e.g., $565,000.00)' },
    { placeholder: '{{AMOUNT_IN_WORDS}}', description: 'Total loan amount written in words (e.g., Five Hundred Sixty Five Thousand)' },
    { placeholder: '{{BORROWER_NAME}}', description: 'The primary name of the borrower or borrowing company' },
    { placeholder: '{{BORROWER_ENTITY_DESCRIPTION}}', description: 'Full legal description of the borrower, including individual and company names' },
    { placeholder: '{{BORROWER_NOTICE_ADDRESS}}', description: 'The specific borrower name/entity for the "Notices" section' },
    { placeholder: '{{CLOSING_DATE}}', description: 'The official closing date of the loan' },
    { placeholder: '{{COMPANY_NAME}}', description: 'Your company name (e.g., Home Kapital Finance, LLC)' },
    { placeholder: '{{EFFECTIVE_DATE}}', description: 'The effective date of the document, typically the closing date' },
    { placeholder: '{{GUARANTOR_NAME_INDIVIDUALLY}}', description: 'Full name of the primary guarantor' },
    { placeholder: '{{INTEREST_RATE_IN_WORDS}}', description: 'The loan interest rate, written in words' },
    { placeholder: '{{INTEREST_RATE_NUMBER}}', description: 'The loan interest rate as a number (e.g., 12.000)' },
    { placeholder: '{{MATURITY_DATE}}', description: 'The date the loan is due in full' },
    { placeholder: '{{MONTHLY_INSTALLMENT}}', description: 'The calculated monthly payment amount, formatted as currency' },
    { placeholder: '{{NOTE_RATE}}', description: 'The loan interest rate, formatted as a percentage (e.g., 12.000%)' },
    { placeholder: '{{NUMBER_OF_MONTHS}}', description: 'The term of the loan in months (e.g., 12)' },
    { placeholder: '{{NUMBER_OF_MONTHS_IN_WORDS}}', description: 'The term of the loan in months, written in words (e.g., Twelve)' },
    { placeholder: '{{PROPERTY_ADDRESS}}', description: 'The full address of the primary property securing the loan' },
    { placeholder: '{{SIGNATORY_NAME_FOR_NOTARY}}', description: 'The name of the individual signing on behalf of the borrower/guarantor for notary blocks' },
    { placeholder: '{{STATE}}', description: "The borrower's state (e.g., FL)" },
    { placeholder: '{{ADDITIONAL_SIGNATURES}}', description: 'A block for all additional co-borrower/guarantor signature lines' },
];


const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave }) => {
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (template) {
            setContent(template.content);
        } else {
            setContent('');
        }
    }, [template]);

    const handleSave = async () => {
        if (!template) return;
        setIsSaving(true);
        try {
            await onSave(template.id, content);
            showToast('Template saved successfully!', 'success');
        } catch (error: any) {
            showToast(`Error saving template: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInsertPlaceholder = (placeholder: string) => {
        const textarea = textAreaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const newText = text.substring(0, start) + placeholder + text.substring(end);
            setContent(newText);
            textarea.focus();
            // Move cursor to after the inserted placeholder
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
            }, 0);
        }
    };

    if (!template) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed">
                <p className="text-gray-500">Select a template from the list to begin editing.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-white rounded-t-lg">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{template.name}</h2>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Last updated: {new Date(template.updated_at).toLocaleString()}</p>
            </div>
            <div className="flex-grow flex min-h-0">
                <div className="flex-grow p-4">
                    <textarea
                        ref={textAreaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full p-4 border rounded-md font-mono text-sm resize-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter template content here..."
                    />
                </div>
                <aside className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
                    <h3 className="font-semibold text-gray-700 mb-3">Available Placeholders</h3>
                    <div className="space-y-3">
                        {PLACEHOLDERS.map(({ placeholder, description }) => (
                            <div key={placeholder}>
                                <button 
                                    onClick={() => handleInsertPlaceholder(placeholder)}
                                    className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
                                    title="Click to insert"
                                >
                                    {placeholder}
                                </button>
                                <p className="text-xs text-gray-500 mt-1">{description}</p>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default TemplateEditor;
