import { Prospect, UserProfile, Stage } from './types';

const STAGE_NAMES = ["Pre-validation", "KYC", "Title Work", "Underwriting (UW)", "Appraisal", "Closing"];

export const getInitialDocuments = (borrower_type: Prospect['borrower_type'], loan_type: Prospect['loan_type']) => {
    const docs: Stage['documents'] = {};

    if (borrower_type === 'individual' || borrower_type === 'both') {
        docs.individual = [
            { id: 'ind-doc-1', name: 'Valid ID (Passport Driver License)', status: 'missing', is_custom: false },
            { id: 'ind-doc-2', name: 'Bank Statements (3 months)', status: 'missing', is_custom: false },
            { id: 'ind-doc-3', name: 'Proof of Residence', status: 'missing', is_custom: false },
            { id: 'ind-doc-4', name: 'Bank Information Form o Voided Check', status: 'missing', is_custom: false },
            { id: 'ind-doc-5', name: 'Tax Returns (2 years)', status: 'missing', is_custom: false },
            { id: 'ind-doc-6', name: 'Loan Application', status: 'missing', is_custom: false },
            { id: 'ind-doc-7', name: 'Customer Application', status: 'missing', is_custom: false },
        ];
    }
    if (borrower_type === 'company' || borrower_type === 'both') {
        docs.company = [
            { id: 'com-doc-1', name: 'Articles of Incorporation', status: 'missing', is_custom: false },
            { id: 'com-doc-2', name: 'Operating Agreement', status: 'missing', is_custom: false },
            { id: 'com-doc-3', name: 'EIN', status: 'missing', is_custom: false },
            { id: 'com-doc-4', name: 'W9', status: 'missing', is_custom: false },
            { id: 'com-doc-5', name: 'Bank Statements (3 months)', status: 'missing', is_custom: false },
            { id: 'com-doc-6', name: 'Bank Information Form o Voided Check', status: 'missing', is_custom: false },
            { id: 'com-doc-7', name: 'Tax Returns (2 years)', status: 'missing', is_custom: false },
            { id: 'com-doc-8', name: 'Loan Application', status: 'missing', is_custom: false },
            { id: 'com-doc-9', name: 'Customer Application', status: 'missing', is_custom: false },
        ];
    }
    
    docs.property = [];
    if (loan_type === 'purchase') {
        docs.property.push({ id: 'prop-doc-1', name: 'Purchase Agreement', status: 'missing', is_custom: false });
    } else {
        docs.property.push({ id: 'prop-doc-2', name: 'Deed', status: 'missing', is_custom: false });
        docs.property.push({ id: 'prop-doc-3', name: 'Scope of Work', status: 'missing', is_custom: false, is_optional: true });
    }


    return docs;
}

const getStageSpecificDocs = (stageName: string): Stage['documents'] => {
    switch(stageName) {
        case 'KYC':
            return { general: [{ id: 'kyc-doc-1', name: 'Risk Matrix', status: 'missing', is_custom: false }] };
        case 'Title Work':
             return { general: [{ id: 'tw-doc-1', name: 'Title Commitment', status: 'missing', is_custom: false }] };
        case 'Underwriting (UW)':
            return { general: [{ id: 'uw-doc-1', name: 'UW Report', status: 'missing', is_custom: false }] };
        case 'Appraisal':
            return { general: [{ id: 'app-doc-1', name: 'Appraisal Report', status: 'missing', is_custom: false }] };
        case 'Closing':
            return {
                general: [
                    // Disclosures
                    { id: 'cd1', name: 'Loan Estimate', status: 'missing', is_custom: false, sent: false, signed: false, filled: false, category: 'disclosures' },
                    { id: 'cd2', name: 'Term Sheet', status: 'missing', is_custom: false, sent: false, signed: false, filled: false, category: 'disclosures' },
                    { id: 'cd3', name: 'Authority to Receive', status: 'missing', is_custom: false, sent: false, signed: false, filled: false, category: 'disclosures' },
                    { id: 'cd4', name: 'Notice to Receive Copy of Appraisal', status: 'missing', is_custom: false, sent: false, signed: false, filled: false, category: 'disclosures' },
                    { id: 'cd5', name: 'Ach Form', status: 'missing', is_custom: false, sent: false, signed: false, filled: false, category: 'disclosures' },
                    { id: 'cd6', name: 'Business purpose affidavit', status: 'missing', is_custom: false, sent: false, signed: false, filled: false, category: 'disclosures' },
                    // Loan Docs
                    { id: 'cl1', name: 'Promissory Note', status: 'missing', is_custom: false, sent: false, signed: false, filled: false, category: 'loan_docs' },
                    { id: 'cl2', name: 'Guaranty Agreement', status: 'missing', is_custom: false, sent: false, signed: false, filled: false, category: 'loan_docs' },
                    { id: 'cl3', name: 'Mortgage', status: 'missing', is_custom: false, sent: false, signed: false, filled: false, category: 'loan_docs' },
                    { id: 'cl4', name: 'Wire Transfer Breakdown', status: 'missing', is_custom: false, sent: false, signed: false, filled: false, category: 'loan_docs' },
                ]
            };
        default:
            return {};
    }
}


export const generateNewProspect = (
    prospectData: Omit<Prospect, 'id' | 'prospect_code' | 'created_at' | 'status' | 'current_stage' | 'current_stage_name' | 'assigned_to_name' | 'stages' | 'rejected_at_stage'>,
    assignedUser: UserProfile
): Prospect => {
    const prospectId = `prospect-${Date.now()}`;
    const prospectCode = `HKF-ML${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;

    const initialStages: Stage[] = STAGE_NAMES.map((name, index) => {
        const stageId = index + 1;
        let documents: Stage['documents'] = {};

        if (name === 'Pre-validation') {
            documents = getInitialDocuments(prospectData.borrower_type, prospectData.loan_type);
        } else {
            documents = getStageSpecificDocs(name);
        }

        return {
            id: stageId,
            name,
            status: stageId === 1 ? 'in_progress' : 'locked',
            documents,
        };
    });

    return {
        id: prospectId,
        prospect_code: prospectCode,
        created_at: new Date().toISOString(),
        status: 'in_progress',
        current_stage: 1,
        current_stage_name: 'Pre-validation',
        assigned_to_name: `${assignedUser.first_name} ${assignedUser.last_name}`,
        stages: initialStages,
        ...prospectData,
    };
};