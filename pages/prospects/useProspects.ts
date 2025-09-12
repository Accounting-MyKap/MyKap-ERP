import { useState, useEffect } from 'react';
import { Prospect, UserProfile, DocumentStatus, ApplicantType, Stage, Document, ClosingDocStatusKey, Funder, HistoryEvent } from './types';
import { MOCK_PROSPECTS, MOCK_USERS } from './mockData';
import { generateNewProspect, getInitialDocuments } from './prospectUtils';


/**
 * Checks if all documents in the current stage of a prospect are approved.
 * If they are, it advances the prospect to the next stage.
 * @param prospect The prospect object to check and potentially update.
 * @returns A new prospect object with updated stage information, or the original object if no change was needed.
 */
const checkAndAdvanceStage = (prospect: Prospect): Prospect => {
    const currentStageIndex = prospect.stages.findIndex(s => s.status === 'in_progress');
    if (currentStageIndex === -1) {
        return prospect; // No active stage.
    }

    const currentStage = prospect.stages[currentStageIndex];
    const { borrower_type } = prospect;

    // 1. Gather all required documents for the current active stage.
    let allRequiredDocs: Document[] = [];
    if (currentStage.name.toLowerCase() === 'pre-validation') {
         if (borrower_type === 'individual' || borrower_type === 'both') {
            allRequiredDocs = allRequiredDocs.concat(currentStage.documents.individual || []);
        }
        if (borrower_type === 'company' || borrower_type === 'both') {
            allRequiredDocs = allRequiredDocs.concat(currentStage.documents.company || []);
        }
        allRequiredDocs = allRequiredDocs.concat(currentStage.documents.property || []);
    } else {
         allRequiredDocs = allRequiredDocs.concat(currentStage.documents.general || []);
    }

    if (allRequiredDocs.length === 0) {
        // Even if there are no docs, we might need to advance, but for now we require docs.
        // In a real scenario, a stage might complete on a manual action.
        // For now, let's assume auto-advance only happens if there are docs and they are approved.
        return prospect;
    }

    // 2. Check if every non-optional document is approved.
    const allRequiredApproved = allRequiredDocs
        .filter(doc => !doc.is_optional)
        .every(doc => doc.status === 'approved');

    if (!allRequiredApproved) {
        return prospect; // Not ready to advance.
    }

    // 3. All documents approved. Time to advance the stage.
    const newStages = [...prospect.stages];
    newStages[currentStageIndex] = { ...currentStage, status: 'completed' };

    const isLastStage = currentStageIndex === newStages.length - 1;

    if (isLastStage) {
        // Prospect is fully completed. This is where it becomes a "Loan".
        // Auto-assign 100% funding to the originator (HKF).
        const loanAmount = prospect.loan_amount || 0;
        const closingDate = new Date().toISOString().split('T')[0];
        
        const originatorFunder: Funder = {
            id: `funder-${crypto.randomUUID()}`,
            lender_id: 'lender-2', // Hardcoded ID for 'Home Kapital Finance LLC'
            lender_account: 'HKF',
            lender_name: 'Home Kapital Finance LLC DBA MYKAP',
            pct_owned: 1,
            lender_rate: 0.09, // Example rate, should be dynamic
            original_amount: loanAmount,
            principal_balance: loanAmount
        };

        const initialHistoryEvent = {
            id: `hist-${crypto.randomUUID()}`,
            date_created: closingDate,
            date_received: closingDate,
            type: 'Funding',
            total_amount: loanAmount,
            notes: 'Initial loan funding by originator.'
        };

        return {
            ...prospect,
            stages: newStages,
            status: 'completed',
            current_stage_name: 'Closing',
            terms: { // Initialize terms
                ...prospect.terms,
                original_amount: loanAmount,
                principal_balance: loanAmount,
                closing_date: closingDate,
            },
            funders: [originatorFunder],
            history: [initialHistoryEvent],
        };
    } else {
        // Advance to the next stage.
        const nextStageIndex = currentStageIndex + 1;
        const nextStage = newStages[nextStageIndex];
        newStages[nextStageIndex] = { ...nextStage, status: 'in_progress' };

        return {
            ...prospect,
            stages: newStages,
            current_stage: nextStage.id,
            current_stage_name: nextStage.name,
        };
    }
};


// This custom hook simulates fetching and manipulating prospect data.
// In a real application, the functions inside would make API calls to Supabase.
export const useProspects = () => {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // Simulate fetching initial data
    useEffect(() => {
        setTimeout(() => {
            setProspects(MOCK_PROSPECTS);
            setUsers(MOCK_USERS);
            setLoading(false);
        }, 1000); // Simulate network delay
    }, []);

    const addProspect = (prospectData: Omit<Prospect, 'id' | 'prospect_code' | 'created_at' | 'status' | 'current_stage' | 'current_stage_name' | 'assigned_to_name' | 'stages' | 'rejected_at_stage'>) => {
        const assignedUser = users.find(u => u.id === prospectData.assigned_to);
        if (!assignedUser) return;

        const newProspect = generateNewProspect(prospectData, assignedUser);

        setProspects(prev => [newProspect, ...prev]);
        // In real app: const { data, error } = await supabase.from('prospects').insert([newProspect]).select();
    };

    const updateProspect = (updatedData: Partial<Prospect> & { id: string }) => {
        setProspects(prev => prev.map(p => {
            if (p.id !== updatedData.id) {
                return p;
            }

            const originalProspect = p;
            let newProspect = { ...originalProspect, ...updatedData };

            // Logic to update assigned_to_name if assigned_to ID changes
            if (updatedData.assigned_to && updatedData.assigned_to !== originalProspect.assigned_to) {
                const assignedUser = users.find(u => u.id === updatedData.assigned_to);
                if (assignedUser) {
                    newProspect.assigned_to_name = `${assignedUser.first_name} ${assignedUser.last_name}`;
                }
            }
            
            // Logic to regenerate Pre-validation documents if borrower or loan type changes
            const borrowerTypeChanged = updatedData.borrower_type && updatedData.borrower_type !== originalProspect.borrower_type;
            const loanTypeChanged = updatedData.loan_type && updatedData.loan_type !== originalProspect.loan_type;

            if (borrowerTypeChanged || loanTypeChanged) {
                const newPreValidationDocs = getInitialDocuments(newProspect.borrower_type, newProspect.loan_type);

                newProspect.stages = newProspect.stages.map(stage => {
                    if (stage.id === 1) { // Pre-validation is stage 1
                        // This is a simple replacement. It will reset the status of all pre-validation docs.
                        // For a real-world app, a more sophisticated merge would be needed to preserve statuses.
                        return { ...stage, documents: newPreValidationDocs };
                    }
                    return stage;
                });
            }

            return newProspect;
        }));
        // In real app: This would be a complex transaction in Supabase, likely a stored procedure.
    };

    const updateLoan = (loanId: string, updatedData: Partial<Prospect>) => {
        setProspects(prev => prev.map(p => 
            p.id === loanId ? { ...p, ...updatedData } : p
        ));
        // In a real app:
        // const { data, error } = await supabase.from('prospects').update(updatedData).eq('id', loanId);
    };

    const updateDocumentStatus = (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType, newStatus: DocumentStatus) => {
        setProspects(prev => prev.map(p => {
            if (p.id !== prospectId) return p;

            const newStages = p.stages.map(s => {
                if (s.id !== stageId) return s;

                const newDocs = s.documents[applicantType]?.map(d => 
                    d.id === docId ? { ...d, status: newStatus } : d
                ) || [];
                
                return { ...s, documents: { ...s.documents, [applicantType]: newDocs } };
            });

            let updatedProspect = { ...p, stages: newStages };

            // If a document was approved, check if the stage is now complete.
            if (newStatus === 'approved') {
                updatedProspect = checkAndAdvanceStage(updatedProspect);
            }

            return updatedProspect;
        }));
    };

    const updateClosingDocumentStatus = (prospectId: string, stageId: number, docId: string, key: ClosingDocStatusKey, value: boolean) => {
        setProspects(prev => prev.map(p => {
            if (p.id !== prospectId) return p;

            let docStatusChangedToApproved = false;

            const newStages = p.stages.map(s => {
                if (s.id !== stageId) return s;

                const newDocs = s.documents.general?.map(d => {
                    if (d.id !== docId) return d;

                    const updatedDoc = { ...d, [key]: value };

                    // Check if this update completes the document
                    const isNowComplete = updatedDoc.sent && updatedDoc.signed && updatedDoc.filled;
                    
                    if (isNowComplete && updatedDoc.status !== 'approved') {
                        updatedDoc.status = 'approved';
                        docStatusChangedToApproved = true; // Flag that we might need to check for stage advancement
                    } else if (!isNowComplete && updatedDoc.status === 'approved') {
                        // Reverting completion
                        updatedDoc.status = 'missing';
                    }

                    return updatedDoc;
                }) || [];
                
                return { ...s, documents: { ...s.documents, general: newDocs } };
            });

            let updatedProspect = { ...p, stages: newStages };

            // If a document's status was just changed to 'approved', check if the stage is now complete.
            if (docStatusChangedToApproved) {
                updatedProspect = checkAndAdvanceStage(updatedProspect);
            }

            return updatedProspect;
        }));
    };

    const addDocument = (prospectId: string, stageId: number, applicantType: ApplicantType, docName: string) => {
        setProspects(prev => prev.map(p => {
             if (p.id !== prospectId) return p;

            const newStages = p.stages.map(s => {
                if (s.id !== stageId) return s;

                const newDoc: Document = {
                    id: `doc-${Date.now()}`,
                    name: docName,
                    status: 'missing' as DocumentStatus,
                    is_custom: true,
                    is_optional: false,
                };
                const updatedDocs = [...(s.documents[applicantType] || []), newDoc];
                return { ...s, documents: { ...s.documents, [applicantType]: updatedDocs } };
            });
            return { ...p, stages: newStages };
        }));
    };
    
    const deleteDocument = (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType) => {
        setProspects(prev => prev.map(p => {
            if (p.id !== prospectId) return p;

            const newStages = p.stages.map(s => {
                if (s.id !== stageId) return s;
                const updatedDocs = s.documents[applicantType]?.filter(d => d.id !== docId) || [];
                return { ...s, documents: { ...s.documents, [applicantType]: updatedDocs } };
            });
            return { ...p, stages: newStages };
        }));
    };
    
    const rejectProspect = (prospectId: string, stageId: number) => {
        setProspects(prev => prev.map(p => 
            p.id === prospectId ? { ...p, status: 'rejected', rejected_at_stage: stageId } : p
        ));
    };
    
    const reopenProspect = (prospectId: string) => {
         setProspects(prev => prev.map(p => 
            p.id === prospectId ? { ...p, status: 'in_progress', rejected_at_stage: null } : p
        ));
    };

    const recordLoanPayment = (loanId: string, payment: { date: string; amount: number; notes?: string; distributions: { funderId: string; amount: number }[] }) => {
        setProspects(prev => prev.map(p => {
            if (p.id !== loanId) return p;
    
            // 1. Update loan's principal balance
            const newPrincipalBalance = (p.terms?.principal_balance || 0) - payment.amount;
    
            // 2. Create new history event for the payment
            const newHistoryEvent: HistoryEvent = {
                id: `hist-${crypto.randomUUID()}`,
                date_created: new Date().toISOString().split('T')[0],
                date_received: payment.date,
                type: 'Payment',
                total_amount: payment.amount,
                notes: payment.notes,
            };
    
            // 3. Update each funder's principal balance based on the specific distributions
            const updatedFunders = (p.funders || []).map(funder => {
                const distribution = payment.distributions.find(d => d.funderId === funder.id);
                const funderReduction = distribution ? distribution.amount : 0;
                return {
                    ...funder,
                    principal_balance: funder.principal_balance - funderReduction,
                };
            });
    
            // 4. Recalculate ownership percentage based on the new principal balances
            const totalPrincipal = updatedFunders.reduce((sum, f) => sum + f.principal_balance, 0);
            const finalFunders = totalPrincipal > 0 
                ? updatedFunders.map(f => ({ ...f, pct_owned: f.principal_balance / totalPrincipal }))
                : updatedFunders.map(f => ({ ...f, pct_owned: 0 })); // Handle case where loan is paid off

            return {
                ...p,
                terms: {
                    ...p.terms,
                    principal_balance: newPrincipalBalance,
                },
                funders: finalFunders,
                history: [...(p.history || []), newHistoryEvent],
            };
        }));
    };

    return { prospects, users, loading, addProspect, updateProspect, updateLoan, updateDocumentStatus, updateClosingDocumentStatus, addDocument, deleteDocument, reopenProspect, rejectProspect, recordLoanPayment };
};