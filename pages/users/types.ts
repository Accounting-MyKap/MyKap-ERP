// pages/users/types.ts

export type UserRole = 'admin' | 'loan_officer' | 'financial_officer';

export interface UserWithRole {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole | null;
    last_sign_in_at?: string;
}