import { useContext } from 'react';
import { ProspectsContext } from '../../contexts/ProspectsContext';

export const useProspects = () => {
    const context = useContext(ProspectsContext);
    if (context === undefined) {
        throw new Error('useProspects must be used within a ProspectsProvider');
    }
    return context;
};
