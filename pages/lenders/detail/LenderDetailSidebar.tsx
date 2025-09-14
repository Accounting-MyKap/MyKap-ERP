import React from 'react';
import { BorrowerIcon, FundingIcon, CreditsIcon } from '../../../components/icons';

export type Section = 'info' | 'trust_account' | 'portfolio';

interface LenderDetailSidebarProps {
    activeSection: Section;
    onSelect: (section: Section) => void;
}

const NavItem: React.FC<{
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200 ${
                isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            <Icon className="h-5 w-5 mr-3" />
            <span>{label}</span>
        </button>
    );
};


const LenderDetailSidebar: React.FC<LenderDetailSidebarProps> = ({ activeSection, onSelect }) => {
    
    const navItems = [
        { name: 'info' as Section, label: 'Lender Info', icon: BorrowerIcon },
        { name: 'trust_account' as Section, label: 'Trust Account', icon: FundingIcon },
        { name: 'portfolio' as Section, label: 'Portfolio', icon: CreditsIcon },
    ];

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <nav className="space-y-1">
                {navItems.map(item => (
                    <NavItem
                        key={item.name}
                        label={item.label}
                        icon={item.icon}
                        isActive={activeSection === item.name}
                        onClick={() => onSelect(item.name)}
                    />
                ))}
            </nav>
        </div>
    );
};

export default LenderDetailSidebar;