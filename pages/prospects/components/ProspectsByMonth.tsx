import React, { useState, useMemo } from 'react';
import { Prospect } from '../types';
import ProspectCard from './ProspectCard';
import { ChevronDownIcon, ChevronRightIcon } from '../../../components/icons';

interface ProspectsByMonthProps {
    prospects: Prospect[];
    onSelectProspect: (prospect: Prospect) => void;
    selectedProspectId?: string | null;
}

const ProspectsByMonth: React.FC<ProspectsByMonthProps> = ({ prospects, onSelectProspect, selectedProspectId }) => {
    const [openMonths, setOpenMonths] = useState<{ [key: string]: boolean }>({});

    const groupedByMonth = useMemo(() => {
        const groups: { [key: string]: Prospect[] } = {};
        prospects.forEach(p => {
            const date = new Date(p.created_at);
            const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(p);
        });
        return groups;
    }, [prospects]);

    const toggleMonth = (monthYear: string) => {
        setOpenMonths(prev => ({ ...prev, [monthYear]: !prev[monthYear] }));
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Prospects by Month</h2>
            {Object.keys(groupedByMonth).length > 0 ? (
                // FIX: Used Object.keys().map() to ensure monthProspects is correctly typed as Prospect[]
                Object.keys(groupedByMonth).map((monthYear) => {
                    const monthProspects = groupedByMonth[monthYear];
                    return (
                        <div key={monthYear} className="border border-gray-200 rounded-lg">
                            <button
                                onClick={() => toggleMonth(monthYear)}
                                className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg"
                            >
                                <div className="flex items-center">
                                    {openMonths[monthYear] ? <ChevronDownIcon className="h-5 w-5 mr-2"/> : <ChevronRightIcon className="h-5 w-5 mr-2"/>}
                                    <span className="font-semibold text-gray-800">{monthYear}</span>
                                </div>
                                <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                                    {monthProspects.length} prospect{monthProspects.length !== 1 ? 's' : ''}
                                </span>
                            </button>
                            {openMonths[monthYear] && (
                                <div className="p-3 space-y-3">
                                    {monthProspects.map(prospect => (
                                        <ProspectCard
                                            key={prospect.id}
                                            prospect={prospect}
                                            onSelect={() => onSelectProspect(prospect)}
                                            isSelected={prospect.id === selectedProspectId}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="text-center p-4 text-gray-500 border-2 border-dashed rounded-lg">
                    No prospects to display.
                </div>
            )}
        </div>
    );
};

export default ProspectsByMonth;