// pages/templates/TemplateEditor.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Quill from 'quill';
import { Template } from '../../contexts/TemplatesContext';
import { useToast } from '../../hooks/useToast';

// FIX: The type for the imported Font class is not properly exposed by `@types/quill`,
// resulting in 'unknown'. Casting to `any` allows us to modify the static `whitelist`
// property and re-register the format correctly.
const Font: any = Quill.import('formats/font');
Font.whitelist = ['sans-serif', 'times-new-roman'];
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
    <button 
        onClick={onInsert} 
        className="w-full text-left bg-blue-50 text-blue-800 text-xs font-medium p-2 rounded hover:bg-blue-100 transition-colors"
    >
        {children}
    </button>
);

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave }) => {
    const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
    const { showToast } = useToast();

    const quillRef = useRef<Quill | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const originalContentRef = useRef<string>('');
    
    // This ref helps prevent the initial 'text-change' event from firing on content load
    const isContentLoadedRef = useRef(false);

    // --- Save Logic (with race condition fix and memoization) ---
    const handleSave = useCallback(async () => {
        if (!template || !quillRef.current || template.isReadOnly) return;
        
        // Capture ID and content at the moment of saving
        const templateIdToSave = template.id;
        const contentToSave = quillRef.current.root.innerHTML;
        
        setSaveStatus('saving');
        try {
            await onSave(templateIdToSave, contentToSave);
            
            // Only show success and reset status if the user is still on the same template
            if (quillRef.current && template && template.id === templateIdToSave) {
                showToast('Template saved successfully!', 'success');
                originalContentRef.current = contentToSave;
                setSaveStatus('saved');
            }
        } catch (error: unknown) {
            // ✅ MEJORA: Manejo de errores tipo-seguro
            const message = error instanceof Error 
                ? error.message 
                : 'An unexpected error occurred while saving';
            showToast(`Error saving template: ${message}`, 'error');
            setSaveStatus('unsaved');
        }
    }, [template, onSave, showToast]);

    // --- Quill Initialization (runs only once on component mount) ---
    useEffect(() => {
        if (editorContainerRef.current && !quillRef.current) {
            const handlers = {
                'align': function(value: string | boolean) {
                    const quill = (this as any).quill;
                    const range = quill.getSelection();
                    if (range) {
                        const currentFormats = quill.getFormat(range.index, 1);
                        const newValue = currentFormats.align === value ? false : value;
                        quill.formatLine(range.index, range.length, 'align', newValue, Quill.sources.USER);
                    }
                },
                'list': function(value: string | boolean) {
                    const quill = (this as any).quill;
                    const range = quill.getSelection();
                    if (range) {
                        const currentFormats = quill.getFormat(range.index, 1);
                        const newValue = currentFormats.list === value ? false : value;
                        quill.formatLine(range.index, range.length, 'list', newValue, Quill.sources.USER);
                    }
                }
            };
            
            const editor = new Quill(editorContainerRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: '#toolbar-container',
                        handlers: handlers
                    },
                },
                formats: ['font', 'size', 'bold', 'italic', 'underline', 'align', 'list'],
            });
            
            quillRef.current = editor;

            // Setup a single text-change listener
            const textChangeHandler = (delta: any, oldDelta: any, source: string) => {
                if (source === Quill.sources.USER && isContentLoadedRef.current) {
                    const currentContent = quillRef.current?.root.innerHTML || '';
                    setSaveStatus(currentContent !== originalContentRef.current ? 'unsaved' : 'saved');
                }
            };
            
            editor.on('text-change', textChangeHandler);
            
            // ✅ MEJORA: Mejor limpieza
            return () => {
                if (quillRef.current) {
                    quillRef.current.off('text-change', textChangeHandler);
                    if (editorContainerRef.current) {
                        editorContainerRef.current.innerHTML = '';
                    }
                    quillRef.current = null;
                }
            };
        }
    }, []);

    // --- Content and State Management (runs when selected template changes) ---
    useEffect(() => {
        const quill = quillRef.current;
        if (quill) {
            isContentLoadedRef.current = false;

            if (template) {
                originalContentRef.current = template.content;
                if (quill.root.innerHTML !== template.content) {
                    quill.root.innerHTML = template.content;
                }
                quill.enable(!template.isReadOnly);
            } else {
                originalContentRef.current = '';
                quill.root.innerHTML = '';
                quill.enable(false);
            }

            setSaveStatus('saved');
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    isContentLoadedRef.current = true;
                });
            });
        }
    }, [template]);

    // --- Data Loss Prevention on Tab/Browser Close ---
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (saveStatus === 'unsaved') {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [saveStatus]);

    // --- Keyboard Shortcut for Saving (Ctrl+S / Cmd+S) ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (saveStatus === 'unsaved' && template && !template.isReadOnly) {
                    handleSave();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [saveStatus, template, handleSave]);
    
    // Function to insert text into the editor
    const insertPlaceholder = (text: string) => {
        if (!quillRef.current) return;
        const range = quillRef.current.getSelection(true);
        quillRef.current.insertText(range.index, text, Quill.sources.USER);
        quillRef.current.setSelection(range.index + text.length, 0);
        quillRef.current.focus();
    };
    
    const insertBlock = (startTag: string, endTag: string) => {
        if (!quillRef.current) return;
        const range = quillRef.current.getSelection(true);
        const textToInsert = `${startTag}\n\n${endTag}`;
        quillRef.current.insertText(range.index, textToInsert, Quill.sources.USER);
        quillRef.current.setSelection(range.index + startTag.length + 1, 0);
        quillRef.current.focus();
    };

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
                <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">Select a template to start editing</p>
                    <p className="text-sm text-gray-400 mt-2">Choose a document from the list on the left</p>
                </div>
            </div>
        );
    }
    
    const renderSaveStatus = () => {
        switch (saveStatus) {
            case 'saving': 
                return (
                    <span className="text-sm text-gray-500 italic flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                    </span>
                );
            case 'unsaved': 
                return (
                    <span className="text-sm text-yellow-600 font-semibold flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Unsaved changes
                    </span>
                );
            case 'saved': 
                return (
                    <span className="text-sm text-green-600 flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        All changes saved
                    </span>
                );
            default: 
                return null;
        }
    };

    const canSave = saveStatus === 'unsaved' && !template.isReadOnly;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0 bg-white">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">
                        Last updated: {new Date(template.updated_at).toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    {renderSaveStatus()}
                    <button
                        onClick={handleSave}
                        disabled={!canSave}
                        className={`font-medium py-2 px-4 rounded-md transition-colors ${
                            canSave 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        title={template.isReadOnly ? "This is a default template and cannot be edited." : "Save changes (Ctrl+S)"}
                    >
                        {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
            
            {/* ✅ MEJORA: Estructura más clara del layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Toolbar */}
                    <div id="toolbar-container" className="border-b bg-gray-50">
                        <span className="ql-formats">
                            <select className="ql-font" defaultValue="sans-serif" aria-label="Font">
                                <option value="sans-serif">Sans Serif</option>
                                <option value="times-new-roman">Times Roman</option>
                            </select>
                            <select className="ql-size" aria-label="Font size">
                                <option value="small"></option>
                                <option defaultValue=""></option>
                                <option value="large"></option>
                                <option value="huge"></option>
                            </select>
                        </span>
                        <span className="ql-formats">
                            <button className="ql-bold" aria-label="Bold"></button>
                            <button className="ql-italic" aria-label="Italic"></button>
                            <button className="ql-underline" aria-label="Underline"></button>
                        </span>
                        <span className="ql-formats">
                            <button className="ql-align" value="" aria-label="Align left"></button>
                            <button className="ql-align" value="center" aria-label="Align center"></button>
                            <button className="ql-align" value="right" aria-label="Align right"></button>
                            <button className="ql-align" value="justify" aria-label="Justify"></button>
                        </span>
                        <span className="ql-formats">
                            <button className="ql-list" value="ordered" aria-label="Ordered list"></button>
                            <button className="ql-list" value="bullet" aria-label="Bulleted list"></button>
                        </span>
                        <span className="ql-formats">
                            <button className="ql-clean" aria-label="Clear formatting"></button>
                        </span>
                    </div>
                    
                    {/* ✅ MEJORA CRÍTICA: Contenedor con altura definida */}
                    <div className="flex-1 overflow-auto">
                        <div 
                            ref={editorContainerRef} 
                            className="h-full"
                        />
                    </div>
                </div>
                
                {/* Sidebar with Placeholders */}
                <aside className="w-80 flex-shrink-0 border-l p-4 space-y-4 overflow-y-auto bg-gray-50">
                    <h3 className="text-base font-bold text-gray-800">Assets & Logic Blocks</h3>
                    
                    <PlaceholderSection title="Assets">
                        <PlaceholderButton onInsert={() => insertPlaceholder('{{COMPANY_LOGO}}')}>
                            Insert Logo
                        </PlaceholderButton>
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
                                <div>
                                    <code className="bg-gray-200 p-1 rounded font-mono text-gray-800">
                                        {'{{this.full_name}}'}
                                    </code>
                                    <p className="text-gray-500 text-[10px] mt-0.5">
                                        The full name of the co-borrower.
                                    </p>
                                </div>
                                <div>
                                    <code className="bg-gray-200 p-1 rounded font-mono text-gray-800">
                                        {'{{this.relation_type}}'}
                                    </code>
                                    <p className="text-gray-500 text-[10px] mt-0.5">
                                        Their relation to the loan (e.g., Co-Borrower, Guarantor).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </PlaceholderSection>

                    <PlaceholderSection title="Placeholders">
                        {placeholders.map(p => (
                            <div key={p.value}>
                                <button 
                                    onClick={() => insertPlaceholder(p.value)} 
                                    className="w-full text-left text-blue-800 text-xs font-mono p-1 rounded hover:bg-blue-100 transition-colors"
                                >
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
