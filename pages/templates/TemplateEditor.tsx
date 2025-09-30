// pages/templates/TemplateEditor.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Quill from 'quill';
import { Template } from '../../contexts/TemplatesContext';
import { useToast } from '../../hooks/useToast';

// Quill's font registration
// FIX: Cast Quill.import result to 'any' to access properties like 'whitelist'.
const Font = Quill.import('formats/font') as any;
Font.whitelist = ['sans-serif', 'times-new-roman'];
// FIX: The above cast also resolves the type error for Quill.register.
Quill.register(Font, true);

interface TemplateEditorProps {
    template: Template | null;
    onSave: (templateId: string, newContent: string) => Promise<void>;
}

// Reusable component for placeholder sections in the sidebar
const PlaceholderSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="border rounded-md p-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
        <div className="space-y-2">{children}</div>
    </div>
);

// Reusable component for a placeholder button
const PlaceholderButton: React.FC<{ onInsert: () => void, children: React.ReactNode }> = ({ onInsert, children }) => (
    <button onClick={onInsert} className="w-full text-left bg-blue-50 text-blue-800 text-xs font-medium p-2 rounded hover:bg-blue-100">
        {children}
    </button>
);

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave }) => {
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    const quillRef = useRef<Quill | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorContentRef = useRef<string>(template?.content || '');

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

    // Callback to initialize Quill
    const initializeQuill = useCallback(() => {
        if (editorContainerRef.current && !quillRef.current) {
            const editor = new Quill(editorContainerRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: '#toolbar-container',
                },
                formats: ['font', 'size', 'bold', 'italic', 'underline', 'align', 'list'],
            });
            
            // Custom handler for alignment to fix the bug where it affects the whole document
            // FIX: Cast the result of getModule('toolbar') to 'any' to access 'addHandler'.
            (editor.getModule('toolbar') as any).addHandler('align', function(value: any) {
                const range = editor.getSelection();
                if (range) {
                    // If the user has the same format, unset it. Otherwise, set it.
                    const currentFormat = editor.getFormat(range);
                    editor.formatLine(range.index, range.length, 'align', currentFormat.align === value ? false : value);
                }
            });

            editor.on('text-change', () => {
                editorContentRef.current = editor.root.innerHTML;
            });
            
            quillRef.current = editor;
        }

        if (quillRef.current && template) {
            if (quillRef.current.root.innerHTML !== template.content) {
                quillRef.current.root.innerHTML = template.content;
            }
        } else if (quillRef.current) {
             quillRef.current.root.innerHTML = '';
        }

    }, [template]);

    useEffect(() => {
        initializeQuill();
    }, [initializeQuill]);
    
    // Function to insert text into the editor
    const insertPlaceholder = (text: string) => {
        if (!quillRef.current) return;
        const range = quillRef.current.getSelection(true);
        quillRef.current.insertText(range.index, text, 'user');
        quillRef.current.setSelection(range.index + text.length, 0);
        quillRef.current.focus();
    }
    
    const insertBlock = (startTag: string, endTag: string) => {
        if (!quillRef.current) return;
        const range = quillRef.current.getSelection(true);
        const textToInsert = `${startTag}\n\n${endTag}`;
        quillRef.current.insertText(range.index, textToInsert, 'user');
        // Place cursor in the middle
        quillRef.current.setSelection(range.index + startTag.length + 1, 0);
        quillRef.current.focus();
    }

    const placeholders = [
        { name: 'Borrower Name', value: '{{BORROWER_NAME}}' },
        { name: 'Company Name', value: '{{COMPANY_NAME}}' },
        { name: 'Loan Amount', value: '{{AMOUNT}}' },
        { name: 'Amount in Words', value: '{{AMOUNT_IN_WORDS}}' },
        { name: 'Note Rate (%)', value: '{{NOTE_RATE}}' },
        { name: 'Closing Date', value: '{{CLOSING_DATE}}' },
        { name: 'Maturity Date', value: '{{MATURITY_DATE}}' },
        { name: 'Effective Date', value: '{{EFFECTIVE_DATE}}' },
        { name: 'Property Address', value: '{{PROPERTY_ADDRESS}}' },
        { name: 'Guarantor Name', value: '{{GUARANTOR_NAME_INDIVIDUALLY}}' },
        { name: 'Borrower Entity Description', value: '{{BORROWER_ENTITY_DESCRIPTION}}' },
        { name: 'Monthly Payment', value: '{{MONTHLY_INSTALLMENT}}' },
    ];


    if (!template) {
        return (
            <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center bg-white">
                <p>Select a template from the list to start editing.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">
                        Last updated: {new Date(template.updated_at).toLocaleString()}
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || template.isReadOnly}
                    className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    title={template.isReadOnly ? "This is a default template and cannot be edited." : "Save changes"}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            
            <div className="flex-grow flex min-h-0">
                {/* Editor Area */}
                <div className="flex-grow flex flex-col h-full">
                    <div id="toolbar-container" className="border-b">
                         <span className="ql-formats">
                            <select className="ql-font" defaultValue="sans-serif">
                                <option value="sans-serif">Sans Serif</option>
                                <option value="times-new-roman">Times Roman</option>
                            </select>
                            <select className="ql-size">
                                <option value="small"></option>
                                <option selected></option>
                                <option value="large"></option>
                                <option value="huge"></option>
                            </select>
                        </span>
                        <span className="ql-formats">
                            <button className="ql-bold"></button>
                            <button className="ql-italic"></button>
                            <button className="ql-underline"></button>
                        </span>
                        <span className="ql-formats">
                            <button className="ql-align" value=""></button>
                            <button className="ql-align" value="center"></button>
                            <button className="ql-align" value="right"></button>
                            <button className="ql-align" value="justify"></button>
                        </span>
                        <span className="ql-formats">
                            <button className="ql-list" value="ordered"></button>
                            <button className="ql-list" value="bullet"></button>
                        </span>
                         <span className="ql-formats">
                            <button className="ql-clean"></button>
                        </span>
                    </div>
                    <div ref={editorContainerRef} className="flex-grow h-full overflow-y-auto"></div>
                </div>
                
                {/* Sidebar with Placeholders */}
                <aside className="w-80 flex-shrink-0 border-l p-4 space-y-4 overflow-y-auto bg-gray-50">
                    <h3 className="text-base font-bold text-gray-800">Assets & Logic Blocks</h3>
                    
                     <PlaceholderSection title="Assets">
                        <PlaceholderButton onInsert={() => insertPlaceholder('{{COMPANY_LOGO}}')}>Insert Logo</PlaceholderButton>
                    </PlaceholderSection>

                    <PlaceholderSection title="Conditional Blocks">
                        <p className="text-xs text-gray-600">Show content only if co-borrowers exist.</p>
                        <PlaceholderButton onInsert={() => insertBlock('{{#if co_borrowers}}', '{{/if}}')}>
                            Insert Co-Borrower Block
                        </PlaceholderButton>
                    </PlaceholderSection>
                    
                     <PlaceholderSection title="Looping Blocks">
                        <p className="text-xs text-gray-600">Repeat content for each co-borrower.</p>
                        <PlaceholderButton onInsert={() => insertBlock('{{#each co_borrowers}}', '{{/each}}')}>
                            Insert Co-Borrower Loop
                        </PlaceholderButton>
                         <div className="text-xs text-gray-600 mt-2">
                             <p>Available fields inside loop:</p>
                             <div className="pl-2 mt-1 space-y-1">
                                <div><code className="bg-gray-200 p-1 rounded font-mono text-gray-800">{'{{this.full_name}}'}</code><p className="text-gray-500 text-[10px] mt-0.5">The full name of the co-borrower.</p></div>
                                <div><code className="bg-gray-200 p-1 rounded font-mono text-gray-800">{'{{this.relation_type}}'}</code><p className="text-gray-500 text-[10px] mt-0.5">Their relation to the loan (e.g., Co-Borrower, Guarantor).</p></div>
                             </div>
                         </div>
                    </PlaceholderSection>

                    <PlaceholderSection title="Placeholders">
                        {placeholders.map(p => (
                             <div key={p.value}>
                                 <button onClick={() => insertPlaceholder(p.value)} className="w-full text-left text-blue-800 text-xs font-mono p-1 rounded hover:bg-blue-100">
                                     {p.value}
                                 </button>
                                 <p className="text-gray-500 text-[10px] pl-1">{p.name}</p>
                            </div>
                        ))}
                    </PlaceholderSection>
                </aside>
            </div>
        </div>
    );
};

export default TemplateEditor;
