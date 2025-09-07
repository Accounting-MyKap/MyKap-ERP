import React from 'react';
import { Prospect } from '../../../prospects/types';
import { formatCurrency } from '../../../../utils/formatters';

interface PropertiesSectionProps {
    loan: Prospect;
    onUpdate: (updatedData: Partial<Prospect>) => void;
}

const PropertiesSection: React.FC<PropertiesSectionProps> = ({ loan, onUpdate }) => {
    const properties = loan.properties || [];
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Properties</h3>
                 <button className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 text-sm">
                    Add Property
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appraisal Value</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {properties.map((prop) => (
                                <tr key={prop.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prop.is_primary ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{prop.description}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {`${prop.address.street}, ${prop.address.city}, ${prop.address.state} ${prop.address.zip}`}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(prop.appraisal_value)}</td>
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
        </div>
    );
};

export default PropertiesSection;