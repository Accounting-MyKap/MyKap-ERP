// pages/users/mockUserData.ts
import { UserWithRole } from './types';

export const MOCK_APP_USERS: UserWithRole[] = [
    {
        id: 'd141225c-4256-4d45-9169-bbe8b8c0f670',
        email: 'admin@mykap.com',
        first_name: 'Guillermo',
        last_name: 'Carrasquilla',
        role: 'admin',
        last_sign_in_at: new Date('2024-05-20T10:00:00Z').toISOString(),
    },
    {
        id: 'a2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7',
        email: 'loanofficer@mykap.com',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'loan_officer',
        last_sign_in_at: new Date('2024-05-21T11:30:00Z').toISOString(),
    },
    {
        id: 'b3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8',
        email: 'finance@mykap.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'financial_officer',
        last_sign_in_at: new Date('2024-05-19T15:00:00Z').toISOString(),
    },
    {
        id: 'c4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9',
        email: 'newuser@mykap.com',
        first_name: 'New',
        last_name: 'User',
        role: null,
        last_sign_in_at: new Date().toISOString(),
    }
];