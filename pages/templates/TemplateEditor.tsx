import React, { useState, useEffect, useRef, useCallback } from 'react';
import Quill from 'quill';
import { Template } from '../../contexts/TemplatesContext';
import { useToast } from '../../hooks/useToast';
import { InformationCircleIcon, MyKapLogo } from '../../components/icons';

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

// A dedicated component for the Quill toolbar.
// This allows for a sticky layout and prevents focus stealing.
const CustomToolbar = () => (
  <div id="custom-toolbar" className="ql-toolbar ql-snow border-t-0 border-x-0" onMouseDown={e => e.preventDefault()}>
    <span className="ql-formats">
      <select className="ql-header" defaultValue="">
        <option value="1"></option>
        <option value="2"></option>
        <option value="3"></option>
        <option value=""></option>
      </select>
    </span>
    <span className="ql-formats">
      <button className="ql-bold"></button>
      <button className="ql-italic"></button>
      <button className="ql-underline"></button>
    </span>
    <span className="ql-formats">
      <select className="ql-align"></select>
    </span>
    <span className="ql-formats">
      <button className="ql-list" value="ordered"></button>
      <button className="ql-list" value="bullet"></button>
    </span>
    <span className="ql-formats">
      <button className="ql-indent" value="-1"></button>
      <button className="ql-indent" value="+1"></button>
    </span>
    <span className="ql-formats">
      <button className="ql-clean"></button>
    </span>
  </div>
);


const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave }) => {
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();
    const quillRef = useRef<Quill | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const isResizingRef = useRef(false);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizingRef.current) return;
        const newWidth = window.innerWidth - e.clientX;
        const minWidth = 280;
        const maxWidth = 640;
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            setSidebarWidth(newWidth);
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isResizingRef.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isResizingRef.current = true;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


    useEffect(() => {
        if (editorRef.current && !quillRef.current && template) {
            const quill = new Quill(editorRef.current, {
                modules: {
                    toolbar: '#custom-toolbar',
                },
                theme: 'snow',
            });
            quillRef.current = quill;
            
            // Get the toolbar module to add custom handlers
            const toolbar = quill.getModule('toolbar');
            if (toolbar) {
                 // Override the alignment handler to correctly format only the selected lines.
                (toolbar as any).addHandler('align', function(value: string | boolean) {
                    const quillInstance = (this as any).quill;
                    const range = quillInstance.getSelection();
                    if (range) {
                        quillInstance.formatLine(range.index, range.length, 'align', value);
                    }
                });
                
                // Override the list handler to fix insertion point and toggle behavior.
                (toolbar as any).addHandler('list', function(value: 'bullet' | 'ordered') {
                    const quillInstance = (this as any).quill;
                    const range = quillInstance.getSelection(true); // `true` to ensure focus
                    if (range) {
                        const [line, ] = quillInstance.getLine(range.index);
                        const format = line.formats();
                        
                        // If the line already has the same list format, remove it (toggle off).
                        // Otherwise, apply the new list format.
                        if (format.list === value) {
                            quillInstance.formatLine(range.index, range.length, 'list', false);
                        } else {
                            quillInstance.formatLine(range.index, range.length, 'list', value);
                        }
                    }
                });
            }
        }

        if (quillRef.current && template) {
            quillRef.current.root.innerHTML = template.content;
            quillRef.current.enable(!template.isReadOnly);
        } else if (quillRef.current) {
             quillRef.current.root.innerHTML = '';
        }

    }, [template]);

    const handleSave = async () => {
        if (!template || !quillRef.current) return;
        setIsSaving(true);
        try {
            const content = quillRef.current.root.innerHTML;
            await onSave(template.id, content);
            showToast('Template saved successfully!', 'success');
        } catch (error: any) {
            showToast(`Error saving template: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInsertText = (textToInsert: string) => {
        const quill = quillRef.current;
        if (quill) {
            const range = quill.getSelection(true);
            quill.insertText(range.index, textToInsert, 'user');
            quill.setSelection(range.index + textToInsert.length, 0, 'silent');
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
        <div className="flex flex-col h-full bg-white rounded-r-lg">
            <div className="p-4 border-b">
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
                {/* Editor container with STICKY TOOLBAR */}
                <div className="flex-grow flex flex-col min-h-0">
                    {/* Toolbar - doesn't scroll */}
                    <CustomToolbar />
                    {/* Scrollable editor area */}
                    <div className={`flex-grow overflow-y-auto ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}>
                         <div ref={editorRef} className={isReadOnly ? 'bg-gray-100' : ''} />
                    </div>
                </div>

                {/* Resize Handle */}
                <div
                    onMouseDown={handleMouseDown}
                    className="w-1.5 flex-shrink-0 cursor-col-resize bg-gray-200 hover:bg-blue-400 active:bg-blue-500 transition-colors duration-200"
                    title="Resize sidebar"
                />
                
                <aside 
                    style={{ width: `${sidebarWidth}px` }}
                    className="flex-shrink-0 border-l bg-gray-50 p-4 overflow-y-auto"
                >
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
                                <button onClick={() => handleInsertText('{{#if co_borrowers}}\\n  <!-- Content for when co-borrowers exist -->\\n{{/if}}')} className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">Insert Co-Borrower Block</button>
                            </div>
                        </div>
                        
                        {/* Looping Logic */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Looping Blocks</h4>
                             <div className="p-2 bg-white border rounded-md space-y-3">
                                <p className="text-xs text-gray-500">Repeat content for each co-borrower.</p>
                                <button onClick={() => handleInsertText('{{#each co_borrowers}}\\n  <p>{{this.full_name}}, {{this.relation_type}}</p>\\n{{/each}}')} className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">Insert Co-Borrower Loop</button>
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