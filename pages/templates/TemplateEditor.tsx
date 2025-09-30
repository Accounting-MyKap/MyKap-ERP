// pages/templates/TemplateEditor.tsx
// This file was missing or empty. Its content has been created based on its usage in other parts of the application.
import React, { useState, useEffect } from 'react';
import { Template } from '../../contexts/TemplatesContext';
import { useToast } from '../../hooks/useToast';

interface TemplateEditorProps {
    template: Template | null;
    onSave: (templateId: string, newContent: string) => Promise<void>;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave }) => {
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

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

    if (!template) {
        return (
            <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
                <p>Select a template from the list to start editing.</p>
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500 font-mono">Key: {template.key}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || template.isReadOnly}
                    className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    title={template.isReadOnly ? "This is a default template and cannot be edited." : "Save changes"}
                >
                    {isSaving ? 'Saving...' : 'Save Template'}
                </button>
            </div>
            {template.isReadOnly && (
                <div className="p-2 bg-yellow-50 text-yellow-800 text-sm text-center flex-shrink-0">
                    This is a read-only default template. To make changes, create a new template.
                </div>
            )}
            <div className="flex-grow p-4 min-h-0">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    readOnly={template.isReadOnly}
                    className="w-full h-full p-2 border rounded-md font-mono text-sm resize-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter template content here..."
                />
            </div>
        </div>
    );
};

export default TemplateEditor;
