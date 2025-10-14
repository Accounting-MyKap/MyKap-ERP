// pages/templates/TemplatesPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import { useTemplates } from '../../hooks/useTemplates';
import TemplateList from './TemplateList';
import TemplateEditor from './TemplateEditor';
import NewTemplateModal from './NewTemplateModal';
import { ExclamationTriangleIcon } from '../../components/icons';

const TemplatesPage: React.FC = () => {
    const { templates, loading, updateTemplate, createTemplate } = useTemplates();
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);

    const selectedTemplate = useMemo(() => {
        return templates.find(t => t.id === selectedTemplateId) || null;
    }, [templates, selectedTemplateId]);
    
    // Select the first template by default once loaded
     useEffect(() => {
        if (!loading && templates.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(templates[0].id);
        }
    }, [loading, templates, selectedTemplateId]);

    const handleCreateTemplate = async (name: string, key: string) => {
        try {
            const newTemplate = await createTemplate(name, key);
            if (newTemplate) {
                // Automatically select the new template for editing
                setSelectedTemplateId(newTemplate.id);
            }
        } catch (error) {
            // Re-throw the error to be handled by the modal's catch block
            throw error;
        }
    };

    return (
        <DashboardLayout>
            <Header title="Document Templates" subtitle="Edit the content and placeholders for generated documents." />
            
             <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg" role="alert">
                <div className="flex">
                    <div className="py-1">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-3" />
                    </div>
                    <div>
                        <p className="font-bold text-yellow-800">Legal Disclaimer</p>
                        <p className="text-sm text-yellow-700">
                            The document templates provided are for illustrative purposes only and are not a substitute for professional legal advice. Always consult with a qualified attorney before using or modifying any legal document.
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md h-[calc(100vh-220px)] flex">
                <div className="w-64 flex-shrink-0">
                    {loading ? (
                        <div className="p-4 text-gray-500">Loading...</div>
                    ) : (
                        <TemplateList
                            templates={templates}
                            selectedTemplateId={selectedTemplateId}
                            onSelectTemplate={setSelectedTemplateId}
                            onNewTemplate={() => setIsNewTemplateModalOpen(true)}
                        />
                    )}
                </div>
                <div className="flex-grow min-w-0">
                    <TemplateEditor
                        template={selectedTemplate}
                        onSave={updateTemplate}
                    />
                </div>
            </div>

            <NewTemplateModal
                isOpen={isNewTemplateModalOpen}
                onClose={() => setIsNewTemplateModalOpen(false)}
                onSave={handleCreateTemplate}
            />

        </DashboardLayout>
    );
};

export default TemplatesPage;
