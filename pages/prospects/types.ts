// pages/prospects/types.ts

export type DocumentStatus = 'missing' | 'ready_for_review' | 'approved' | 'rejected';
export type StageStatus = 'completed' | 'in_progress' | 'locked';
export type ApplicantType = 'individual' | 'company' | 'property' | 'general' | 'closing_final_approval';
export type ClosingDocStatusKey = 'sent' | 'signed' | 'filled';

export interface Document {
    id: string;
    name: string;
    status: DocumentStatus;
    is_custom: boolean;
    is_optional?: boolean;
    gdrive_link?: string;
    // For closing docs
    sent?: boolean;
    signed?: boolean;
    filled?: boolean;
    category?: 'disclosures' | 'loan_docs';
}

export interface Stage {
    id: number;
    name: string;
    status: StageStatus;
    documents: {
        individual?: Document[];
        company?: Document[];
        property?: Document[];
        general?: Document[];
        closing_final_approval?: Document[];
    };
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
}

// Sub-types for loan details
export interface Address {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    county?: string;
    country?: string;
}
export interface BorrowerDetails {
    salutation?: string;
    work_phone?: string;
    mobile_phone?: string;
    mailing_address?: Address;
}

export interface LoanTerms {
    original_amount?: number;
    note_rate?: number;
    principal_balance?: number;
    trust_balance?: number;
    closing_date?: string; // YYYY-MM-DD
    maturity_date?: string; // YYYY-MM-DD
    loan_term_months?: number;
    monthly_payment?: number;
}

export interface ServicingFees {
    rounding_adjustment?: boolean;
    broker_servicing_fee_enabled?: boolean;
    broker_servicing_fee_percent?: number; // e.g., 0.0165 for 1.650%
    broker_servicing_fee_plus_amount?: number;
    broker_servicing_fee_minimum?: number;
}


export interface Funder {
    id: string;
    lender_id: string;
    lender_account: string;
    lender_name: string;
    pct_owned: number;
    lender_rate: number;
    original_amount: number;
    principal_balance: number;
    servicing_fees?: ServicingFees;
}

export interface HistoryEvent {
    id: string;
    date_created: string; // YYYY-MM-DD
    date_received: string; // YYYY-MM-DD
    type: string;
    total_amount: number;
    notes?: string;
    distributions?: { funderId: string; amount: number }[];
}

export interface PropertyPhoto {
    id: string;
    url: string;
    storage_path: string;
}


export interface Property {
    id:string;
    is_primary: boolean;
    is_reo?: boolean;
    description: string;
    address: Address;
    property_type: string;
    occupancy: string;
    appraisal_value: number;
    appraisal_date: string; // YYYY-MM-DD
    ltv?: number;
    purchase_price?: number;
    thomas_map?: string;
    pledged_equity?: number;
    apn?: string;
    priority?: string;
    flood_zone?: string;
    zoning?: string;
    photos?: PropertyPhoto[];
}

export interface CoBorrower {
    id: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    salutation?: string;
    phone_numbers?: {
        home?: string;
        work?: string;
        mobile?: string;
    };
    mailing_address?: Address;
    email?: string;
    relation_type?: string;
}

export interface TrustAccountEvent {
    id: string;
    event_date: string; // YYYY-MM-DD
    event_type: 'deposit' | 'withdrawal';
    description: string;
    amount: number;
    // FIX: Add optional balance property to align with its use in calculating running balances.
    balance?: number;
}


export interface Lender {
    id: string;
    account: string;
    lender_name: string;
    address?: Address;
    portfolio_value: number;
    trust_balance: number;
    trust_account_events?: TrustAccountEvent[];
    updated_at: string; // Added for optimistic locking
}




export interface Prospect {
    id: string;
    prospect_code: string | null;
    created_at: string;
    status: 'in_progress' | 'completed' | 'rejected';
    current_stage: number;
    current_stage_name: string;
    assigned_to: string; // user id
    assigned_to_name: string;
    borrower_name: string;
    email: string;
    phone_number: string;
    loan_amount: number;
    borrower_type: 'individual' | 'company' | 'both';
    loan_type: 'purchase' | 'refinance';
    county?: string;
    state?: string;
    stages: Stage[];
    rejected_at_stage?: number | null;
    
    // Fields for completed loans
    borrower_details?: BorrowerDetails;
    terms?: LoanTerms;
    funders?: Funder[];
    history?: HistoryEvent[];
    properties?: Property[];
    co_borrowers?: CoBorrower[];
}