import React, { useState } from 'react';
import { Prospect, Property } from '../../../prospects/types';
import { formatCurrency } from '../../../../utils/formatters';
import { AddIcon, EditIcon, TrashIcon } from '../../../../components/icons';
import PropertyModal from '../PropertyModal';

interface PropertiesSectionProps {
    loan: Prospect;
    onUpdate: (updatedData: Partial<Prospect>) => void;
}

const PropertiesSection: React.FC<PropertiesSectionProps> = ({ loan, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);

    const properties = loan.properties || [];

    const handleAddClick = () => {
        setEditingProperty(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (prop: Property) => {
        setEditingProperty(prop);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (propId: string) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            const updatedProperties = properties.filter(p => p.id !== propId);
            onUpdate({ properties: updatedProperties });
        }
    };

    const handleSave = (property: Property) => {
        let updatedProperties;
        if (properties.some(p => p.id === property.id)) {
            // It's an edit
            updatedProperties = properties.map(p => p.id === property.id ? property : p);
        } else {
            // It's a new addition
            updatedProperties = [...properties, property];
        }

        // If this property is marked as primary, ensure no others are.
        if (property.is_primary) {
            updatedProperties = updatedProperties.map(p => 
                p.id === property.id ? p : { ...p, is_primary: false }
            );
        }

        onUpdate({ properties: updatedProperties });
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Properties</h3>
                <button onClick={handleAddClick} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 text-sm flex items-center">
                    <AddIcon className="h-4 w-4 mr-1" /> Add Property
                </button>
            </div>
            {properties.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Appraisal Value</th>
                                <th className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {properties.map((prop) => (
                                <tr key={prop.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prop.is_primary ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{prop.description}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {`${prop.address.street || ''}, ${prop.address.city || ''}, ${prop.address.state || ''} ${prop.address.zip || ''}`.trim().replace(/^,|,$/g, '') || 'N/A'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{formatCurrency(prop.appraisal_value)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button onClick={() => handleEditClick(prop)} className="text-blue-600 hover:text-blue-900" title="Edit Property"><EditIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDeleteClick(prop.id)} className="text-red-600 hover:text-red-900" title="Delete Property"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                    No properties have been added for this loan.
                </div>
            )}
            <PropertyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                property={editingProperty}
                loan={loan}
            />
        </div>
    );
};

export default PropertiesSection;