import React from 'react';
import { BorrowerIcon, TermsIcon, FundingIcon, PropertiesIcon, HistoryIcon, ChevronRightIcon } from '../../../components/icons';

export type Section = 'borrower' | 'terms' | 'funding' | 'properties' | 'history';

interface LoanDetailSidebarProps {
    activeSection: Section;
    setActiveSection: (section: Section) => void;
}

const NavItem: React.FC<{
    icon: React.ElementType;
    label: string;
    section: Section;
    isActive: boolean;
    onClick: () => void;
    hasSubsections?: boolean;
}> = ({ icon: Icon, label, section, isActive, onClick, hasSubsections }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200 ${
                isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            <Icon className="h-5 w-5 mr-3" />
            <span>{label}</span>
            {hasSubsections && <ChevronRightIcon className="h-4 w-4 ml-auto text-gray-400" />}
        </button>
    );
};

const SubNavItem: React.FC<{ label: string; }> = ({ label }) => {
    return (
         <button
            className={`w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200 text-gray-500 hover:bg-gray-100 pl-11`}
        >
            <span>{label}</span>
        </button>
    )
}

const LoanDetailSidebar: React.FC<LoanDetailSidebarProps> = ({ activeSection, setActiveSection }) => {
    const navItems: { name: Section, label: string, icon: React.ElementType, subsections?: { label: string }[] }[] = [
        { name: 'borrower', label: 'Borrower', icon: BorrowerIcon, subsections: [{ label: 'Co-Borrowers'}] },
        { name: 'terms', label: 'Terms', icon: TermsIcon },
        { name: 'funding', label: 'Funding', icon: FundingIcon },
        { name: 'properties', label: 'Properties', icon: PropertiesIcon },
        { name: 'history', label: 'History', icon: HistoryIcon },
    ];

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <nav className="space-y-1">
                {navItems.map(item => (
                    <div key={item.name}>
                        <NavItem
                            section={item.name}
                            label={item.label}
                            icon={item.icon}
                            isActive={activeSection === item.name}
                            onClick={() => setActiveSection(item.name)}
                            hasSubsections={!!item.subsections}
                        />
                        {activeSection === item.name && item.subsections && (
                            <div className="mt-1 space-y-1">
                                {item.subsections.map(sub => <SubNavItem key={sub.label} label={sub.label} />)}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default LoanDetailSidebar;