import React, { useState, useEffect, useRef } from 'react';
import { Template } from '../../contexts/TemplatesContext';
import { useToast } from '../../hooks/useToast';
import { InformationCircleIcon, MyKapLogo, ImagePlaceholderIcon } from '../../components/icons';

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
];

const CO_BORROWER_LOOP_PLACEHOLDERS = [
    { placeholder: '{{this.full_name}}', description: 'The full name of the co-borrower.' },
    { placeholder: '{{this.relation_type}}', description: 'Their relation to the loan (e.g., Co-Borrower, Guarantor).' }
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

    const handleInsertText = (textToInsert: string) => {
        const textarea = textAreaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const newText = text.substring(0, start) + textToInsert + text.substring(end);
            setContent(newText);
            textarea.focus();
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
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
    
    const isReadOnly = template.isReadOnly;

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-white rounded-t-lg">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{template.name}</h2>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isReadOnly}
                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        title={isReadOnly ? "Cannot save default templates. Please configure your database." : ""}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Last updated: {new Date(template.updated_at).toLocaleString()}</p>
            </div>
             {isReadOnly && (
                <div className="p-4 bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-sm">
                    <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="font-semibold">Read-Only Mode:</span> This is a default template preview. To enable editing, please ensure the <code>document_templates</code> table is correctly set up in your database.
                        </div>
                    </div>
                </div>
            )}
            <div className="flex-grow flex min-h-0">
                <div className="flex-grow p-4">
                    <textarea
                        ref={textAreaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        readOnly={isReadOnly}
                        className={`w-full h-full p-4 border rounded-md font-mono text-sm resize-none focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-100' : ''}`}
                        placeholder="Enter template content here..."
                    />
                </div>
                <aside className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
                    <h3 className="font-semibold text-gray-700 mb-3">Assets & Logic Blocks</h3>
                    <div className="space-y-4">
                        {/* Assets Section */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Assets</h4>
                             <div className="flex items-center space-x-3 p-2 bg-white border rounded-md">
                                <MyKapLogo className="h-8 w-auto flex-shrink-0" />
                                <button onClick={() => handleInsertText('{{COMPANY_LOGO}}')} className="text-sm text-blue-600 hover:underline">Insert Logo</button>
                            </div>
                        </div>

                        {/* Conditional Logic */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Conditional Blocks</h4>
                            <div className="p-2 bg-white border rounded-md">
                                <p className="text-xs text-gray-500 mb-2">Show content only if co-borrowers exist.</p>
                                <button onClick={() => handleInsertText('{{#if co_borrowers}}\n  <!-- Content for when co-borrowers exist -->\n{{/if}}')} className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">Insert Co-Borrower Block</button>
                            </div>
                        </div>
                        
                        {/* Looping Logic */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Looping Blocks</h4>
                             <div className="p-2 bg-white border rounded-md space-y-3">
                                <p className="text-xs text-gray-500">Repeat content for each co-borrower.</p>
                                <button onClick={() => handleInsertText('{{#each co_borrowers}}\n  <p>{{this.full_name}}, {{this.relation_type}}</p>\n{{/each}}')} className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">Insert Co-Borrower Loop</button>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 mb-1">Available fields inside loop:</p>
                                    {CO_BORROWER_LOOP_PLACEHOLDERS.map(({ placeholder, description }) => (
                                         <div key={placeholder}>
                                            <button onClick={() => handleInsertText(placeholder)} className="font-mono text-xs text-blue-600 hover:underline" title="Click to insert">{placeholder}</button>
                                            <p className="text-xs text-gray-500">{description}</p>
                                         </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Placeholders */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Placeholders</h4>
                            <div className="space-y-3">
                                {PLACEHOLDERS.map(({ placeholder, description }) => (
                                    <div key={placeholder}>
                                        <button 
                                            onClick={() => handleInsertText(placeholder)}
                                            className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
                                            title="Click to insert"
                                        >
                                            {placeholder}
                                        </button>
                                        <p className="text-xs text-gray-500 mt-1">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default TemplateEditor;
