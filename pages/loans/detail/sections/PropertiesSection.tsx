import React, { useState } from 'react';
import { Prospect, Property, PropertyPhoto } from '../../../prospects/types';
import { formatCurrency } from '../../../../utils/formatters';
import { AddIcon, EditIcon, TrashIcon, CameraIcon } from '../../../../components/icons';
import PropertyModal from '../PropertyModal';
import PropertyPhotosModal from '../PropertyPhotosModal';


interface PropertiesSectionProps {
    loan: Prospect;
    onUpdate: (updatedData: Partial<Prospect>) => void;
    onUploadPhoto: (prospectId: string, propertyId: string, file: File) => Promise<void>;
    onDeletePhoto: (prospectId: string, propertyId: string, photo: PropertyPhoto) => Promise<void>;
}

const PropertiesSection: React.FC<PropertiesSectionProps> = ({ loan, onUpdate, onUploadPhoto, onDeletePhoto }) => {
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [viewingPhotosFor, setViewingPhotosFor] = useState<Property | null>(null);

    const properties = loan.properties || [];

    const handleAddClick = () => {
        setEditingProperty(null);
        setIsPropertyModalOpen(true);
    };

    const handleEditClick = (prop: Property) => {
        setEditingProperty(prop);
        setIsPropertyModalOpen(true);
    };
    
    const handlePhotosClick = (prop: Property) => {
        setViewingPhotosFor(prop);
        setIsPhotosModalOpen(true);
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
        setIsPropertyModalOpen(false);
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
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
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
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <button onClick={() => handlePhotosClick(prop)} className="text-gray-500 hover:text-blue-600" title="View Photos">
                                            <CameraIcon className="h-5 w-5 mx-auto"/>
                                        </button>
                                    </td>
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
                isOpen={isPropertyModalOpen}
                onClose={() => setIsPropertyModalOpen(false)}
                onSave={handleSave}
                property={editingProperty}
                loan={loan}
            />
            {viewingPhotosFor && (
                 <PropertyPhotosModal
                    isOpen={isPhotosModalOpen}
                    onClose={() => setIsPhotosModalOpen(false)}
                    property={viewingPhotosFor}
                    loan={loan}
                    onUpload={onUploadPhoto}
                    onDelete={onDeletePhoto}
                />
            )}
        </div>
    );
};

export default PropertiesSection;