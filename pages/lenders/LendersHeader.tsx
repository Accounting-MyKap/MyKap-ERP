import React from 'react';
import { AddIcon } from '../../components/icons';

interface LendersHeaderProps {
    onNewLenderClick: () => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

const LendersHeader: React.FC<LendersHeaderProps> = ({ onNewLenderClick, searchTerm, onSearchChange }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-200 gap-4">
            <div className="w-full sm:w-auto">
                <input
                    type="search"
                    placeholder="Search by name or account..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="input-field w-full sm:w-64"
                />
            </div>
            <button
                onClick={onNewLenderClick}
                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
                <AddIcon className="h-5 w-5 mr-2" />
                Add New Lender
            </button>
        </div>
    );
};

export default LendersHeader;