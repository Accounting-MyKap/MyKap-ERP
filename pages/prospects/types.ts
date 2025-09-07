export type DocumentStatus = 'missing' | 'ready_for_review' | 'approved' | 'rejected';

export type ApplicantType = 'individual' | 'company' | 'property' | 'general';

export type ClosingDocStatusKey = 'sent' | 'signed' | 'filled';

export interface Document {
    id: string;
    name: string;
    status: DocumentStatus;
    is_custom: boolean;
    is_optional?: boolean;
    // Closing doc specific properties
    sent?: boolean;
    signed?: boolean;
    filled?: boolean;
    category?: 'disclosures' | 'loan_docs';
}

export interface Stage {
    id: number;
    name: string;
    status: 'completed' | 'in_progress' | 'locked';
    documents: {
        individual?: Document[];
        company?: Document[];
        property?: Document[];
        general?: Document[];
    };
}

export interface Prospect {
    id: string;
    created_at: string;
    borrower_name: string;
    email: string;
    phone_number: string;
    loan_amount: number;
    borrower_type: 'individual' | 'company' | 'both';
    loan_type: 'purchase' | 'refinance';
    assigned_to: string; // user id
    assigned_to_name: string;
    status: 'in_progress' | 'completed' | 'rejected';
    current_stage: number;
    current_stage_name: string;
    prospect_code: string;
    stages: Stage[];
    rejected_at_stage?: number | null;
}

export interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
}