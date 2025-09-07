import React, { useMemo } from 'react';
import { Prospect } from './types';
import { FilterType } from './ProspectsPage';
import ProspectCard from './ProspectCard';
import ProspectsByMonth from './ProspectsByMonth';

interface ProspectsListProps {
    prospects: Prospect[];
    filter: FilterType;
    loading: boolean;
    onSelectProspect: (prospect: Prospect) => void;
    selectedProspectId?: string | null;
}

const ProspectsList: React.FC<ProspectsListProps> = ({ prospects, filter, loading, onSelectProspect, selectedProspectId }) => {

    const filteredProspects = useMemo(() => {
        switch (filter) {
            case 'active':
                return prospects.filter(p => p.status === 'in_progress');
            case 'completed':
                return prospects.filter(p => p.status === 'completed');
            case 'rejected':
                return prospects.filter(p => p.status === 'rejected');
            case 'all':
            case 'month':
            default:
                return prospects;
        }
    }, [prospects, filter]);

    if (loading) {
        return <div className="text-center p-4 text-gray-500">Loading prospects...</div>;
    }

    if (filter === 'month') {
        return <ProspectsByMonth 
                    prospects={filteredProspects} 
                    onSelectProspect={onSelectProspect} 
                    selectedProspectId={selectedProspectId}
                />;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 capitalize">{filter} Prospects</h2>
            {filteredProspects.length > 0 ? (
                filteredProspects.map(prospect => (
                    <ProspectCard
                        key={prospect.id}
                        prospect={prospect}
                        onSelect={() => onSelectProspect(prospect)}
                        isSelected={prospect.id === selectedProspectId}
                    />
                ))
            ) : (
                <div className="text-center p-4 text-gray-500 border-2 border-dashed rounded-lg">
                    No prospects found for this filter.
                </div>
            )}
        </div>
    );
};

export default ProspectsList;