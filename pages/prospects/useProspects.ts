// hooks/useProspects.ts
import { useState, useEffect, useCallback } from 'react';
import { Prospect, UserProfile, DocumentStatus, ApplicantType, Stage, Document, ClosingDocStatusKey, Funder, HistoryEvent } from './types';
import { supabase } from '../../services/supabase';
import { generateNewProspect } from './prospectUtils';


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
        // Edge case: If a stage has no required documents, it should be completable by a manual action,
        // not automatically. For now, we assume auto-advance only happens if there are docs and they are approved.
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
        const loanAmount = prospect.loan_amount || 0;
        const closingDate = new Date().toISOString().split('T')[0];
        
        const originatorFunder: Funder = {
            id: `funder-${crypto.randomUUID()}`,
            lender_id: 'a6b2b7da-ffca-422c-91ef-36e6581b50f1', // Hardcoded ID for 'Home Kapital Finance LLC'
            lender_account: 'HKF',
            lender_name: 'Home Kapital Finance LLC',
            pct_owned: 1,
            lender_rate: 0.09,
            original_amount: loanAmount,
            principal_balance: loanAmount
        };

        const initialHistoryEvent: HistoryEvent = {
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
            current_stage: newStages.length,
            terms: {
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

export const useProspects = () => {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProspects = useCallback(async () => {
        const { data, error } = await supabase
            .from('prospects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching prospects:', error);
            return [];
        }
        return data as Prospect[];
    }, []);

    const fetchUsers = useCallback(async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name');
        
        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }
        return data as UserProfile[];
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            const [prospectsData, usersData] = await Promise.all([
                fetchProspects(),
                fetchUsers(),
            ]);
            setProspects(prospectsData);
            setUsers(usersData);
            setLoading(false);
        };
        loadInitialData();
    }, [fetchProspects, fetchUsers]);
    
    const syncProspect = (updatedProspect: Prospect) => {
        setProspects(prev => prev.map(p => p.id === updatedProspect.id ? updatedProspect : p));
    }

    const addProspect = async (prospectData: Omit<Prospect, 'id' | 'prospect_code' | 'created_at' | 'status' | 'current_stage' | 'current_stage_name' | 'assigned_to_name' | 'stages' | 'rejected_at_stage'>) => {
        const assignedUser = users.find(u => u.id === prospectData.assigned_to);
        if (!assignedUser) return;

        const newProspect = generateNewProspect(prospectData, assignedUser);

        const { data, error } = await supabase
            .from('prospects')
            .insert([newProspect])
            .select()
            .single();

        if (error) {
            console.error('Error adding prospect:', error);
        } else if (data) {
            setProspects(prev => [data, ...prev]);
        }
    };

    const updateProspect = async (updatedData: Partial<Prospect> & { id: string }) => {
        const { id, ...updateFields } = updatedData;
        const originalProspect = prospects.find(p => p.id === id);
        if (!originalProspect) return;
        
        // Optimistic update for responsiveness
        const optimisticallyUpdated = { ...originalProspect, ...updateFields };
        syncProspect(optimisticallyUpdated);

        const { data, error } = await supabase
            .from('prospects')
            .update(updateFields)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating prospect:', error);
            syncProspect(originalProspect); // Revert on error
        } else if (data) {
            syncProspect(data); // Sync with final DB state
        }
    };
    
    // Generic function to handle updates to a prospect's state
    const handleProspectUpdate = async (prospectId: string, updateFunction: (prospect: Prospect) => Prospect) => {
        const prospectToUpdate = prospects.find(p => p.id === prospectId);
        if (!prospectToUpdate) return;

        const updatedProspect = updateFunction(prospectToUpdate);

        // Optimistic UI update
        syncProspect(updatedProspect);

        // FIX: Destructure out immutable/server-set fields before sending the update payload.
        // This prevents sending the entire object and ensures a clean update.
        const { id, created_at, prospect_code, ...updatePayload } = updatedProspect;


        const { data, error } = await supabase
            .from('prospects')
            .update(updatePayload)
            .eq('id', prospectId)
            .select()
            .single();

        if (error) {
            console.error('Failed to update prospect:', error.message);
            // Revert optimistic update on failure
            syncProspect(prospectToUpdate);
        } else if (data) {
            // Re-sync with the confirmed state from the DB
            syncProspect(data);
        }
    };


    const updateDocumentStatus = (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType, newStatus: DocumentStatus) => {
        handleProspectUpdate(prospectId, (p) => {
            const newStages = p.stages.map(s => {
                if (s.id !== stageId) return s;
                const newDocs = s.documents[applicantType]?.map(d => 
                    d.id === docId ? { ...d, status: newStatus } : d
                ) || [];
                return { ...s, documents: { ...s.documents, [applicantType]: newDocs } };
            });

            let updatedProspect = { ...p, stages: newStages };
            if (newStatus === 'approved') {
                updatedProspect = checkAndAdvanceStage(updatedProspect);
            }
            return updatedProspect;
        });
    };

    const updateClosingDocumentStatus = (prospectId: string, stageId: number, docId: string, key: ClosingDocStatusKey, value: boolean) => {
        handleProspectUpdate(prospectId, p => {
             let docStatusChangedToApproved = false;
             const newStages = p.stages.map(s => {
                if (s.id !== stageId) return s;
                const newDocs = s.documents.general?.map(d => {
                    if (d.id !== docId) return d;
                    const updatedDoc = { ...d, [key]: value };
                    const isNowComplete = updatedDoc.sent && updatedDoc.signed && updatedDoc.filled;
                    if (isNowComplete && updatedDoc.status !== 'approved') {
                        updatedDoc.status = 'approved';
                        docStatusChangedToApproved = true;
                    } else if (!isNowComplete && updatedDoc.status === 'approved') {
                        updatedDoc.status = 'missing';
                    }
                    return updatedDoc;
                }) || [];
                return { ...s, documents: { ...s.documents, general: newDocs } };
            });
            let updatedProspect = { ...p, stages: newStages };
            if (docStatusChangedToApproved) {
                updatedProspect = checkAndAdvanceStage(updatedProspect);
            }
            return updatedProspect;
        });
    };

    const addDocument = (prospectId: string, stageId: number, applicantType: ApplicantType, docName: string) => {
        handleProspectUpdate(prospectId, p => {
            const newStages = p.stages.map(s => {
                if (s.id !== stageId) return s;
                const newDoc: Document = {
                    id: `doc-${crypto.randomUUID()}`, name: docName, status: 'missing', is_custom: true,
                };
                const updatedDocs = [...(s.documents[applicantType] || []), newDoc];
                return { ...s, documents: { ...s.documents, [applicantType]: updatedDocs } };
            });
            return { ...p, stages: newStages };
        });
    };

    const deleteDocument = (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType) => {
        handleProspectUpdate(prospectId, p => {
            const newStages = p.stages.map(s => {
                if (s.id !== stageId) return s;
                const updatedDocs = s.documents[applicantType]?.filter(d => d.id !== docId) || [];
                return { ...s, documents: { ...s.documents, [applicantType]: updatedDocs } };
            });
            return { ...p, stages: newStages };
        });
    };

    const uploadDocument = async (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType, file: File): Promise<void> => {
        const prospectToUpdate = prospects.find(p => p.id === prospectId);
        if (!prospectToUpdate) throw new Error("Prospect not found");

        const targetStage = prospectToUpdate.stages.find(s => s.id === stageId);
        if (!targetStage) throw new Error("Stage not found");

        // FIX: Use prospect ID as a fallback for the folder path if prospect_code is missing.
        // This prevents crashes when uploading documents for newly created prospects.
        const prospectFolder = (prospectToUpdate.prospect_code || prospectToUpdate.id).replace(/\s+/g, '_');
        const stageFolder = targetStage.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
        const filePath = `${prospectFolder}/${stageFolder}/${docId}-${file.name}`;

        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
        }

        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;

        handleProspectUpdate(prospectId, p => {
            const newStages = p.stages.map(s => {
                if (s.id !== stageId) return s;
                const newDocs = s.documents[applicantType]?.map(d =>
                    d.id === docId ? { ...d, gdrive_link: publicUrl, status: 'ready_for_review' as DocumentStatus } : d
                ) || [];
                return { ...s, documents: { ...s.documents, [applicantType]: newDocs } };
            });
            return { ...p, stages: newStages };
        });
    };

    const removeDocumentLink = (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType) => {
        handleProspectUpdate(prospectId, p => {
            const newStages = p.stages.map(s => {
                if (s.id !== stageId) return s;
                const newDocs = s.documents[applicantType]?.map(d => {
                    if (d.id === docId) {
                        const { gdrive_link, ...rest } = d;
                        // TODO: Delete from Supabase Storage here if needed
                        return { ...rest, status: 'missing' as DocumentStatus };
                    }
                    return d;
                }) || [];
                return { ...s, documents: { ...s.documents, [applicantType]: newDocs } };
            });
            return { ...p, stages: newStages };
        });
    };
    
    const rejectProspect = (prospectId: string, stageId: number) => {
        updateProspect({ id: prospectId, status: 'rejected', rejected_at_stage: stageId });
    };

    const reopenProspect = (prospectId: string) => {
        updateProspect({ id: prospectId, status: 'in_progress', rejected_at_stage: null });
    };

    const recordLoanPayment = (loanId: string, payment: { date: string; amount: number; notes?: string; distributions: { funderId: string; amount: number }[] }) => {
        handleProspectUpdate(loanId, p => {
            const newPrincipalBalance = (p.terms?.principal_balance || 0) - payment.amount;
            const newHistoryEvent: HistoryEvent = {
                id: `hist-${crypto.randomUUID()}`,
                date_created: new Date().toISOString().split('T')[0],
                date_received: payment.date,
                type: 'Payment',
                total_amount: payment.amount,
                notes: payment.notes,
            };
            const updatedFunders = (p.funders || []).map(funder => {
                const distribution = payment.distributions.find(d => d.funderId === funder.id);
                const funderReduction = distribution ? distribution.amount : 0;
                return { ...funder, principal_balance: funder.principal_balance - funderReduction };
            });
            const totalPrincipal = updatedFunders.reduce((sum, f) => sum + f.principal_balance, 0);
            const finalFunders = totalPrincipal > 0
                ? updatedFunders.map(f => ({ ...f, pct_owned: f.principal_balance / totalPrincipal }))
                : updatedFunders.map(f => ({ ...f, pct_owned: 0 }));

            return {
                ...p,
                terms: { ...p.terms, principal_balance: newPrincipalBalance },
                funders: finalFunders,
                history: [...(p.history || []), newHistoryEvent],
            };
        });
    };
    
    return { 
        prospects, users, loading, addProspect, updateProspect, updateDocumentStatus, 
        updateClosingDocumentStatus, addDocument, deleteDocument, uploadDocument, 
        removeDocumentLink, reopenProspect, rejectProspect, recordLoanPayment 
    };
};