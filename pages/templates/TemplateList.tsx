import React from 'react';
import { Template } from '../../contexts/TemplatesContext';
import { AddIcon } from '../../components/icons';

interface TemplateListProps {
    templates: Template[];
    selectedTemplateId: string | null;
    onSelectTemplate: (id: string) => void;
    onNewTemplate: () => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ templates, selectedTemplateId, onSelectTemplate, onNewTemplate }) => {
    return (
        <div className="h-full border-r bg-white flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
                <button
                    onClick={onNewTemplate}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                    title="Create New Template"
                >
                    <AddIcon className="h-5 w-5" />
                </button>
            </div>
            <nav className="p-2 space-y-1 flex-grow overflow-y-auto">
                {templates.map(template => (
                    <button
                        key={template.id}
                        onClick={() => onSelectTemplate(template.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            selectedTemplateId === template.id
                                ? 'bg-blue-100 text-blue-700 font-semibold'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {template.name}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default TemplateList;
