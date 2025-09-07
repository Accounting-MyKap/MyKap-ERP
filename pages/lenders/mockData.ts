import { Lender } from '../prospects/types';

export const MOCK_LENDERS: Lender[] = [
    { id: 'lender-1', account: 'AMERICAS', lender_name: 'Americas Real Estate Investment Group LLC', portfolio_value: 330000, trust_balance: 247580.47, address: { street: '175 SW 7th St STE 1817', city: 'Miami', state: 'FL', zip: '33130' } },
    { id: 'lender-2', account: 'HKF', lender_name: 'Home Kapital Finance LLC DBA MYKAP', portfolio_value: 0, trust_balance: 0, address: { street: '19432 Dinah Harvests', city: 'Riverview', state: 'FL', zip: '33578' } },
    { id: 'lender-3', account: 'LEONARDOIO', lender_name: 'Leonardo Ivan Garcia', portfolio_value: 0, trust_balance: 0, address: {} },
    { id: 'lender-4', account: 'LEPAL', lender_name: 'Lepal Investments Inc', portfolio_value: 98000, trust_balance: 86470.76, address: {} },
    { id: 'lender-5', account: 'MARIGARCIA', lender_name: 'Maria Claudia Garcia Navarro', portfolio_value: 100000, trust_balance: 0, address: {} },
    { id: 'lender-6', account: 'MERCEDES', lender_name: 'Maria Mercedes Botero', portfolio_value: 100000, trust_balance: 0, address: {} },
];
