import { useContext } from 'react';
import { LendersContext } from '../contexts/LendersContext';

export const useLenders = () => {
    const context = useContext(LendersContext);
    if (context === undefined) {
        throw new Error('useLenders must be used within a LendersProvider');
    }
    return context;
};
