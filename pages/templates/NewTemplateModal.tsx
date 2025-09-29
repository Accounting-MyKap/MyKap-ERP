import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';

interface NewTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, key: string) => Promise<void>;
}

const NewTemplateModal: React.FC<NewTemplateModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    // Auto-generate key from name
    useEffect(() => {
        const generatedKey = name
            .toLowerCase()
            .replace(/\s+/g, '_')       // Replace spaces with underscores
            .replace(/[^a-z0-9_]/g, ''); // Remove invalid characters
        setKey(generatedKey);
    }, [name]);
    
    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal closes
            setName('');
            setKey('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !key) {
            showToast('Both Name and Key are required.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            await onSave(name, key);
            showToast('Template created successfully!', 'success');
            onClose();
        } catch (error: any) {
            showToast(`Error: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Document Template">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="template-name" className="block text-sm font-medium text-gray-700">Template Name</label>
                    <input
                        type="text"
                        id="template-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field mt-1"
                        placeholder="e.g., Client Welcome Letter"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="template-key" className="block text-sm font-medium text-gray-700">Template Key</label>
                    <input
                        type="text"
                        id="template-key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="input-field mt-1 font-mono"
                        placeholder="e.g., client_welcome_letter"
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        A unique identifier for the template. Should be lowercase with underscores.
                    </p>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isSaving ? 'Creating...' : 'Create Template'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default NewTemplateModal;
