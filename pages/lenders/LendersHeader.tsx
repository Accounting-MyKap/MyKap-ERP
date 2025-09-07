import React from 'react';
import { AddIcon } from '../../components/icons';

interface LendersHeaderProps {
    onNewLenderClick: () => void;
}

const LendersHeader: React.FC<LendersHeaderProps> = ({ onNewLenderClick }) => {
    return (
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <div>
                {/* Search or filter could go here */}
            </div>
            <button
                onClick={onNewLenderClick}
                className="flex items-center justify-center bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
                <AddIcon className="h-5 w-5 mr-2" />
                Add New Lender
            </button>
        </div>
    );
};

export default LendersHeader;
