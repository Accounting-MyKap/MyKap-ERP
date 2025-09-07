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


// --- New Detailed Types for Loans ---

export interface Address {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
}

export interface BorrowerDetails {
    salutation?: string;
    first_name?: string;
    middle_initial?: string;
    last_name?: string;
    work_phone?: string;
    mobile_phone?: string;
    mailing_address?: Address;
    legal_structure?: string;
    dob?: string;
    tin?: string;
    ein?: string;
}

export interface LoanTerms {
    original_amount?: number;
    note_rate?: number;
    sold_rate?: number;
    principal_balance?: number;
    trust_balance?: number;
    unpaid_late_charges?: number;
    payment_frequency?: 'monthly' | 'quarterly' | 'yearly';
    closing_date?: string;
    first_payment_date?: string;
    maturity_date?: string;
    regular_payment?: number;
}

export interface Funder {
    id: string;
    lender_account: string;
    lender_name: string;
    pct_owned: number;
    lender_rate: number;
    principal_balance: number;
    original_amount: number;
}

export interface Property {
    id: string;
    is_primary: boolean;
    description: string;
    address: Address;
    property_type: string;
    occupancy: string;
    appraisal_value: number;
    appraisal_date: string;
}

export interface HistoryEvent {
    id: string;
    date_created: string;
    date_received: string;
    type: string; // e.g., 'Funding'
    total_amount: number;
    notes?: string;
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

    // Detailed loan information
    borrower_details?: BorrowerDetails;
    terms?: LoanTerms;
    funders?: Funder[];
    properties?: Property[];
    history?: HistoryEvent[];
}

export interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
}