// pages/prospects/detail/ProspectDetailSidebar.tsx
import React from 'react';
import { BorrowerIcon, TermsIcon, FundingIcon, PropertiesIcon, HistoryIcon, DocumentsIcon } from '../../../components/icons';

export type Section = 'borrower' | 'terms' | 'funding' | 'properties' | 'history' | 'stages';
export type SubSection = 'co-borrowers';

interface ProspectDetailSidebarProps {
    activeSection: Section;
    activeSubSection: SubSection | null;
    onSelect: (section: Section, subSection?: SubSection | null) => void;
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

const SubNavItem: React.FC<{ 
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => {
    return (
         <button
            onClick={onClick}
            className={`w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200 text-gray-500 hover:bg-gray-100 pl-11 ${
                isActive ? 'bg-blue-50 text-blue-600 font-medium' : ''
            }`}
        >
            <span>{label}</span>
        </button>
    )
}

const ProspectDetailSidebar: React.FC<ProspectDetailSidebarProps> = ({ activeSection, activeSubSection, onSelect }) => {
    
    const navItems: { name: Section, label: string, icon: React.ElementType, subsections?: { name: SubSection, label: string }[] }[] = [
        { name: 'borrower', label: 'Borrower', icon: BorrowerIcon, subsections: [{ name: 'co-borrowers', label: 'Co-Borrowers' }] },
        { name: 'terms', label: 'Terms', icon: TermsIcon },
        { name: 'properties', label: 'Properties', icon: PropertiesIcon },
        { name: 'stages', label: 'Stages', icon: DocumentsIcon },
    ];

    return (
        <div className="bg-gray-50 p-3 rounded-lg border-r border-gray-200 h-full">
            <nav className="space-y-1">
                {navItems.map(item => (
                    <div key={item.name}>
                        <NavItem
                            label={item.label}
                            icon={item.icon}
                            isActive={activeSection === item.name && !activeSubSection}
                            onClick={() => onSelect(item.name)}
                        />
                        {/* Show subsections if the main section is active */}
                        {item.subsections && (activeSection === item.name) && (
                            <div className="mt-1 space-y-1">
                                {item.subsections.map(sub => 
                                    <SubNavItem 
                                        key={sub.name} 
                                        label={sub.label}
                                        isActive={activeSubSection === sub.name}
                                        onClick={() => onSelect(item.name, sub.name)}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default ProspectDetailSidebar;