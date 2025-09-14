import React from 'react';
import { FilterType } from './ProspectsPage';
import { AddIcon } from '../../components/icons';
import { useAuth } from '../../hooks/useAuth';

interface ProspectsHeaderProps {
    activeFilter: FilterType;
    setActiveFilter: (filter: FilterType) => void;
    onNewProspectClick: () => void;
}

const FILTERS: { key: FilterType, label: string }[] = [
    { key: 'all', label: 'All Prospects' },
    { key: 'month', label: 'By Month' },
    { key: 'active', label: 'Active Prospects' },
    { key: 'completed', label: 'Completed Prospects' },
    { key: 'rejected', label: 'Rejected Prospects' },
];

const ProspectsHeader: React.FC<ProspectsHeaderProps> = ({ activeFilter, setActiveFilter, onNewProspectClick }) => {
    const { profile } = useAuth();
    const canCreateProspects = profile?.role !== 'financial_officer';

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
                {FILTERS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveFilter(key)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                            activeFilter === key 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <button
                onClick={onNewProspectClick}
                disabled={!canCreateProspects}
                className="mt-4 sm:mt-0 w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                title={!canCreateProspects ? "You do not have permission to create prospects" : "Create a new prospect"}
            >
                <AddIcon className="h-5 w-5 mr-2" />
                Create New Prospect
            </button>
        </div>
    );
};

export default ProspectsHeader;
