import { Prospect, UserProfile } from './types';
import { generateNewProspect } from './prospectUtils';

export const MOCK_USERS: UserProfile[] = [
    { id: 'd141225c-4256-4d45-9169-bbe8b8c0f670', first_name: 'Guillermo', last_name: 'Andrés Carrasquilla Camargo' },
    { id: 'a2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7', first_name: 'Jane', last_name: 'Smith' },
];

const prospectBase1 = {
    client_name: 'Yireth Fonseca Mercado',
    email: 'yireth@example.com',
    phone_number: '305-111-2222',
    loan_amount: 350000,
    client_type: 'individual' as const,
    loan_type: 'purchase' as const,
    assigned_to: 'd141225c-4256-4d45-9169-bbe8b8c0f670',
};
const prospect1 = generateNewProspect(prospectBase1, MOCK_USERS[0]);
prospect1.id = 'prospect-1';
prospect1.prospect_code = 'HKF-ML0003';
prospect1.created_at = new Date('2025-08-28T10:00:00Z').toISOString();
prospect1.status = 'in_progress';

const prospectBase2 = {
    client_name: 'Jhon Escobar García',
    email: 'jhon@example.com',
    phone_number: '305-333-4444',
    loan_amount: 750000,
    client_type: 'company' as const,
    loan_type: 'refinance' as const,
    assigned_to: 'd141225c-4256-4d45-9169-bbe8b8c0f670',
};
const prospect2 = generateNewProspect(prospectBase2, MOCK_USERS[0]);
prospect2.id = 'prospect-2';
prospect2.prospect_code = 'HKF-ML0002';
prospect2.created_at = new Date('2025-08-22T11:00:00Z').toISOString();
prospect2.status = 'completed';
prospect2.stages = prospect2.stages.map(s => ({...s, status: 'completed' as const}));

const prospectBase3 = {
    client_name: 'Guillermo Andrés Carrasquilla Camargo',
    email: 'guillermo@example.com',
    phone_number: '305-555-6666',
    loan_amount: 1200000,
    client_type: 'both' as const,
    loan_type: 'purchase' as const,
    assigned_to: 'd141225c-4256-4d45-9169-bbe8b8c0f670',
};
const prospect3 = generateNewProspect(prospectBase3, MOCK_USERS[0]);
prospect3.id = 'prospect-3';
prospect3.prospect_code = 'HKF-ML0001';
prospect3.created_at = new Date('2025-08-22T12:00:00Z').toISOString();
prospect3.status = 'completed';
prospect3.stages = prospect3.stages.map(s => ({...s, status: 'completed' as const}));


const prospectBase4 = {
    client_name: 'Rejected Innovations LLC',
    email: 'rejected@example.com',
    phone_number: '305-777-8888',
    loan_amount: 150000,
    client_type: 'company' as const,
    loan_type: 'purchase' as const,
    assigned_to: 'a2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7',
};
const prospect4 = generateNewProspect(prospectBase4, MOCK_USERS[1]);
prospect4.id = 'prospect-4';
prospect4.prospect_code = 'HKF-ML0004';
prospect4.created_at = new Date('2025-07-15T09:00:00Z').toISOString();
prospect4.status = 'rejected';
prospect4.rejected_at_stage = 1;

export const MOCK_PROSPECTS: Prospect[] = [prospect1, prospect2, prospect3, prospect4];
