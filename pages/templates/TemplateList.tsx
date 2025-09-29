import React from 'react';
import { Template } from '../../contexts/TemplatesContext';

interface TemplateListProps {
    templates: Template[];
    selectedTemplateId: string | null;
    onSelectTemplate: (id: string) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ templates, selectedTemplateId, onSelectTemplate }) => {
    return (
        <div className="h-full border-r bg-white">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Document Templates</h2>
            </div>
            <nav className="p-2 space-y-1">
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
