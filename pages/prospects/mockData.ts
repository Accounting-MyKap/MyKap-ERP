import { Prospect, UserProfile } from './types';
import { generateNewProspect } from './prospectUtils';

export const MOCK_USERS: UserProfile[] = [
    { id: 'd141225c-4256-4d45-9169-bbe8b8c0f670', first_name: 'Guillermo', last_name: 'Andrés Carrasquilla Camargo' },
    { id: 'a2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7', first_name: 'Jane', last_name: 'Smith' },
];

const prospectBase1 = {
    borrower_name: 'Yireth Fonseca Mercado',
    email: 'yireth@example.com',
    phone_number: '305-111-2222',
    loan_amount: 350000,
    borrower_type: 'individual' as const,
    loan_type: 'purchase' as const,
    assigned_to: 'd141225c-4256-4d45-9169-bbe8b8c0f670',
};
const prospect1 = generateNewProspect(prospectBase1, MOCK_USERS[0]);
prospect1.id = 'prospect-1';
prospect1.prospect_code = 'HKF-ML0003';
prospect1.created_at = new Date('2025-08-28T10:00:00Z').toISOString();
prospect1.status = 'in_progress';

const prospectBase2 = {
    borrower_name: 'Jhon Escobar García',
    email: 'jhon@example.com',
    phone_number: '305-333-4444',
    loan_amount: 750000,
    borrower_type: 'company' as const,
    loan_type: 'refinance' as const,
    assigned_to: 'd141225c-4256-4d45-9169-bbe8b8c0f670',
};
const prospect2 = generateNewProspect(prospectBase2, MOCK_USERS[0]);
prospect2.id = 'prospect-2';
prospect2.prospect_code = 'HKF-ML0002';
prospect2.created_at = new Date('2025-08-22T11:00:00Z').toISOString();
prospect2.status = 'completed';
prospect2.stages = prospect2.stages.map(s => ({...s, status: 'completed' as const}));
prospect2.borrower_details = {
    salutation: 'Mr.',
    work_phone: '314-330-0764',
    mailing_address: { street: '16931 Royal Poinciana Dr', city: 'Weston', state: 'FL', zip: '33326' },
};
prospect2.terms = {
    original_amount: 750000,
    note_rate: 9.0,
    principal_balance: 750000,
    trust_balance: 0,
    closing_date: '2022-07-26',
    maturity_date: '2052-08-01',
};
prospect2.funders = [
    { id: 'funder-1', lender_account: 'HKF', lender_name: 'Home Kapital Finance LLC', pct_owned: 1, lender_rate: 0.09, original_amount: 750000, principal_balance: 0 }
];
prospect2.history = [
    { id: 'hist-1', date_created: '2024-01-23', date_received: '2024-07-24', type: 'Funding', total_amount: 750000 }
];
prospect2.properties = [
    { id: 'prop-1', is_primary: true, description: 'Condo', address: { street: '251 SE 4th Ave', city: 'Pompano Beach', state: 'US', zip: '33060' }, property_type: 'Residential Condo', occupancy: 'Tenant', appraisal_value: 222000, appraisal_date: '2024-01-23'}
];


const prospectBase3 = {
    borrower_name: 'Guillermo Andrés Carrasquilla Camargo',
    email: 'guillermo@example.com',
    phone_number: '305-555-6666',
    loan_amount: 1200000,
    borrower_type: 'both' as const,
    loan_type: 'purchase' as const,
    assigned_to: 'd141225c-4256-4d45-9169-bbe8b8c0f670',
};
const prospect3 = generateNewProspect(prospectBase3, MOCK_USERS[0]);
prospect3.id = 'prospect-3';
prospect3.prospect_code = 'HKF-ML0001';
prospect3.created_at = new Date('2025-08-22T12:00:00Z').toISOString();
prospect3.status = 'completed';
prospect3.stages = prospect3.stages.map(s => ({...s, status: 'completed' as const}));
prospect3.terms = { original_amount: 1200000, note_rate: 8.5, principal_balance: 1150000, maturity_date: '2045-09-01' };


const prospectBase4 = {
    borrower_name: 'Rejected Innovations LLC',
    email: 'rejected@example.com',
    phone_number: '305-777-8888',
    loan_amount: 150000,
    borrower_type: 'company' as const,
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