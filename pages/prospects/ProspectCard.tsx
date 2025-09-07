import React from 'react';
import { Prospect } from './types';

interface ProspectCardProps {
    prospect: Prospect;
    onSelect: () => void;
    isSelected: boolean;
}

const statusStyles: { [key: string]: string } = {
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

const ProspectCard: React.FC<ProspectCardProps> = ({ prospect, onSelect, isSelected }) => {
    const { client_name, prospect_code, current_stage_name, assigned_to_name, status, created_at } = prospect;

    const formattedDate = new Date(created_at).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <div
            onClick={onSelect}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected 
                ? 'bg-blue-50 border-blue-500 shadow-md' 
                : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm'
            }`}
        >
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900">{client_name}</h3>
                <span className="text-xs font-mono text-gray-500">{prospect_code}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">Stage:</span> {current_stage_name} | <span className="font-semibold">Assigned to:</span> {assigned_to_name}
            </p>
            <div className="flex justify-between items-center mt-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
                    {status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">Created: {formattedDate}</span>
            </div>
        </div>
    );
};

export default ProspectCard;