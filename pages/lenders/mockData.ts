import { Lender } from '../prospects/types';

export const MOCK_LENDERS: Lender[] = [
    {
        id: 'lender-1',
        account: 'INV-001',
        lender_name: 'Global Investment Partners',
        address: { street: '123 Finance St', city: 'New York', state: 'NY', zip: '10001' },
        portfolio_value: 5000000,
        trust_balance: 1250000,
        // FIX: Added missing updated_at property
        updated_at: new Date().toISOString(),
    },
    {
        id: 'lender-2',
        account: 'HKF',
        lender_name: 'Home Kapital Finance LLC DBA MYKAP',
        address: { street: '456 Capital Ave', city: 'Miami', state: 'FL', zip: '33101' },
        portfolio_value: 10000000,
        trust_balance: 2500000,
        // FIX: Added missing updated_at property
        updated_at: new Date().toISOString(),
    },
    {
        id: 'lender-3',
        account: 'INV-002',
        lender_name: 'Secure Funding Group',
        address: { street: '789 Money Rd', city: 'Chicago', state: 'IL', zip: '60601' },
        portfolio_value: 2500000,
        trust_balance: 750000,
        // FIX: Added missing updated_at property
        updated_at: new Date().toISOString(),
    },
];
