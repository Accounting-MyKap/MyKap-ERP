import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header';
import { useTemplates } from '../../hooks/useTemplates';
import TemplateList from './TemplateList';
import TemplateEditor from './TemplateEditor';
import NewTemplateModal from './NewTemplateModal';

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
        const newTemplate = await createTemplate(name, key);
        if (newTemplate) {
            // Automatically select the new template for editing
            setSelectedTemplateId(newTemplate.id);
        }
    };

    return (
        <DashboardLayout>
            <Header title="Document Templates" subtitle="Edit the content and placeholders for generated documents." />
            
            <div className="bg-white rounded-xl shadow-md h-[calc(100vh-150px)] flex">
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
