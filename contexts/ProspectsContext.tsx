import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Prospect, UserProfile, DocumentStatus, ApplicantType, Stage, Document, ClosingDocStatusKey, Funder, HistoryEvent, PropertyPhoto } from '../pages/prospects/types';
import { supabase } from '../services/supabase';
import { generateNewProspect } from '../pages/prospects/prospectUtils';
import { useAuth } from '../hooks/useAuth';

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
         allRequiredDocs = allRequiredDocs.concat(currentStage.documents.closing_final_approval || []);
    }

    if (allRequiredDocs.length === 0) {
        // If a stage has no documents, it can't be auto-advanced.
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
            notes: 'Initial loan funding by originator.',
            distributions: [{ funderId: originatorFunder.id, amount: loanAmount }]
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


interface ProspectsContextType {
    prospects: Prospect[];
    users: UserProfile[];
    loading: boolean;
    addProspect: (prospectData: Omit<Prospect, 'id' | 'created_at' | 'status' | 'current_stage' | 'current_stage_name' | 'assigned_to_name' | 'stages' | 'rejected_at_stage'>) => Promise<void>;
    updateProspect: (updatedData: Partial<Prospect> & { id: string }) => Promise<void>;
    updateDocumentStatus: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType, newStatus: DocumentStatus) => void;
    updateClosingDocumentStatus: (prospectId: string, stageId: number, docId: string, key: ClosingDocStatusKey, value: boolean) => void;
    addDocument: (prospectId: string, stageId: number, applicantType: ApplicantType, docName: string) => void;
    deleteDocument: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType) => void;
    uploadDocument: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType, file: File) => Promise<void>;
    removeDocumentLink: (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType) => void;
    reopenProspect: (prospectId: string) => void;
    rejectProspect: (prospectId: string, stageId: number) => void;
    recordLoanPayment: (loanId: string, payment: { date: string; amount: number; notes?: string; distributions: { funderId: string; amount: number }[] }) => void;
    uploadPropertyPhoto: (prospectId: string, propertyId: string, file: File) => Promise<void>;
    deletePropertyPhoto: (prospectId: string, propertyId: string, photo: PropertyPhoto) => Promise<void>;
}

export const ProspectsContext = createContext<ProspectsContextType | undefined>(undefined);

export const ProspectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const { profile } = useAuth();

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
    
    /**
     * The single, authoritative function for updating any prospect data.
     * It handles optimistic updates, error rollbacks, and ensures only changed data is sent.
     */
    const updateProspectData = useCallback(async (prospectId: string, updatePayload: Partial<Prospect>) => {
        console.log(`%c[LOG 4 - ProspectsContext]`, 'color: #007bff; font-weight: bold;', 'updateProspectData called.', { prospectId, updatePayload });

        const originalProspect = prospects.find(p => p.id === prospectId);
        if (!originalProspect) {
            throw new Error(`[updateProspect] Prospect with ID ${prospectId} not found.`);
        }

        // Inject user info into any new history events before updating state
        if (updatePayload.history && profile) {
            const originalHistoryLength = originalProspect.history?.length || 0;
            if (updatePayload.history.length > originalHistoryLength) {
                // Find the new event that doesn't exist in the original history
                const newEvent = updatePayload.history.find(h => !(originalProspect.history || []).some(oh => oh.id === h.id));
                if (newEvent && !newEvent.created_by_user_id) {
                    newEvent.created_by_user_id = profile.id;
                    newEvent.created_by_user_name = `${profile.first_name} ${profile.last_name}`;
                }
            }
        }


        // If the assigned user is changing, find the new name and add it to the payload.
        if (updatePayload.assigned_to && users) {
            const assignedUser = users.find(u => u.id === updatePayload.assigned_to);
            if (assignedUser) {
                updatePayload.assigned_to_name = `${assignedUser.first_name} ${assignedUser.last_name}`;
            }
        }

        // If loan_amount is being updated on an active prospect, sync the principal_balance.
        if (updatePayload.loan_amount !== undefined && originalProspect.status === 'in_progress') {
            updatePayload.terms = {
                ...originalProspect.terms,
                principal_balance: updatePayload.loan_amount,
            };
        }


        // Optimistically update the UI for a responsive feel.
        const optimisticallyUpdated = { ...originalProspect, ...updatePayload };
        console.log(`%c[LOG 5 - ProspectsContext]`, 'color: #007bff; font-weight: bold;', 'Performing optimistic update on UI state.');
        setProspects(prev => prev.map(p => p.id === prospectId ? optimisticallyUpdated : p));
        console.log(`%c[LOG 6 - ProspectsContext]`, 'color: #007bff; font-weight: bold;', 'Optimistic update complete.');


        // Send only the changed fields to Supabase.
        console.log(`%c[LOG 7 - ProspectsContext]`, 'color: #007bff; font-weight: bold;', 'Sending update to Supabase...');
        const { data, error } = await supabase
            .from('prospects')
            .update(updatePayload)
            .eq('id', prospectId)
            .select()
            .single();

        if (error) {
            console.error(`%c[LOG 8 FAILED - ProspectsContext]`, 'color: #f44336; font-weight: bold;', 'Supabase update failed. Reverting optimistic update.', error);
            // If the update fails, revert the UI to the original state.
            setProspects(prev => prev.map(p => p.id === prospectId ? originalProspect : p));
            throw error; // Propagate the error to the calling component.
        }

        if (data) {
            console.log(`%c[LOG 8 SUCCESS - ProspectsContext]`, 'color: #28a745; font-weight: bold;', 'Supabase update successful. Received data:', data);
            console.log(`%c[LOG 9 - ProspectsContext]`, 'color: #007bff; font-weight: bold;', 'Syncing final state from database.');
            // Sync the UI with the final, confirmed state from the database.
            setProspects(prev => prev.map(p => p.id === prospectId ? data : p));
            console.log(`%c[LOG 10 - ProspectsContext]`, 'color: #007bff; font-weight: bold;', 'Final state sync complete.');
        }
    }, [prospects, users, profile]);

    const addProspect = useCallback(async (prospectData: Omit<Prospect, 'id' | 'created_at' | 'status' | 'current_stage' | 'current_stage_name' | 'assigned_to_name' | 'stages' | 'rejected_at_stage'>) => {
        const assignedUser = users.find(u => u.id === prospectData.assigned_to);
        if (!assignedUser) {
            console.error("Cannot add prospect: Assigned user not found.");
            return;
        }

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
    }, [users]);

    const updateProspect = useCallback(async (updatedData: Partial<Prospect> & { id: string }) => {
        const { id, ...updateFields } = updatedData;
        await updateProspectData(id, updateFields);
    }, [updateProspectData]);
    
    const updateDocumentStatus = useCallback((prospectId: string, stageId: number, docId: string, applicantType: ApplicantType, newStatus: DocumentStatus) => {
        const prospect = prospects.find(p => p.id === prospectId);
        if (!prospect) return;

        const newStages = prospect.stages.map(s => {
            if (s.id !== stageId) return s;
            const newDocs = s.documents[applicantType]?.map(d => 
                d.id === docId ? { ...d, status: newStatus } : d
            ) || [];
            return { ...s, documents: { ...s.documents, [applicantType]: newDocs } };
        });

        let updatedProspect = { ...prospect, stages: newStages };
        if (newStatus === 'approved') {
            updatedProspect = checkAndAdvanceStage(updatedProspect);
        }
        
        // Construct a payload of only the fields that could have changed.
        const { stages, status, current_stage, current_stage_name, terms, funders, history } = updatedProspect;
        updateProspectData(prospectId, { stages, status, current_stage, current_stage_name, terms, funders, history });
    }, [prospects, updateProspectData]);

    const updateClosingDocumentStatus = useCallback((prospectId: string, stageId: number, docId: string, key: ClosingDocStatusKey, value: boolean) => {
        const prospect = prospects.find(p => p.id === prospectId);
        if (!prospect) return;
        
        let docStatusChangedToApproved = false;
        const newStages = prospect.stages.map(s => {
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

        let updatedProspect = { ...prospect, stages: newStages };
        if (docStatusChangedToApproved) {
            updatedProspect = checkAndAdvanceStage(updatedProspect);
        }

        const { stages, status, current_stage, current_stage_name, terms, funders, history } = updatedProspect;
        updateProspectData(prospectId, { stages, status, current_stage, current_stage_name, terms, funders, history });
    }, [prospects, updateProspectData]);

    const addDocument = useCallback((prospectId: string, stageId: number, applicantType: ApplicantType, docName: string) => {
        const prospect = prospects.find(p => p.id === prospectId);
        if (!prospect) return;
        
        const newStages = prospect.stages.map(s => {
            if (s.id !== stageId) return s;
            const newDoc: Document = {
                id: `doc-${crypto.randomUUID()}`, name: docName, status: 'missing', is_custom: true,
            };
            const updatedDocs = [...(s.documents[applicantType] || []), newDoc];
            return { ...s, documents: { ...s.documents, [applicantType]: updatedDocs } };
        });
        updateProspectData(prospectId, { stages: newStages });
    }, [prospects, updateProspectData]);

    const deleteDocument = useCallback((prospectId: string, stageId: number, docId: string, applicantType: ApplicantType) => {
        const prospect = prospects.find(p => p.id === prospectId);
        if (!prospect) return;

        const newStages = prospect.stages.map(s => {
            if (s.id !== stageId) return s;
            const updatedDocs = s.documents[applicantType]?.filter(d => d.id !== docId) || [];
            return { ...s, documents: { ...s.documents, [applicantType]: updatedDocs } };
        });
        updateProspectData(prospectId, { stages: newStages });
    }, [prospects, updateProspectData]);

    const uploadDocument = async (prospectId: string, stageId: number, docId: string, applicantType: ApplicantType, file: File): Promise<void> => {
        const prospect = prospects.find(p => p.id === prospectId);
        if (!prospect) throw new Error("Prospect not found");

        const targetStage = prospect.stages.find(s => s.id === stageId);
        if (!targetStage) throw new Error("Stage not found");

        const prospectFolder = (prospect.prospect_code || prospect.id).replace(/\s+/g, '_');
        const stageFolder = targetStage.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
        const filePath = `${prospectFolder}/${stageFolder}/${docId}-${file.name}`;

        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
        }

        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
        
        const newStages = prospect.stages.map(s => {
            if (s.id !== stageId) return s;
            const newDocs = s.documents[applicantType]?.map(d =>
                d.id === docId ? { ...d, gdrive_link: urlData.publicUrl, status: 'ready_for_review' as DocumentStatus } : d
            ) || [];
            return { ...s, documents: { ...s.documents, [applicantType]: newDocs } };
        });
        await updateProspectData(prospectId, { stages: newStages });
    };

    const removeDocumentLink = useCallback((prospectId: string, stageId: number, docId: string, applicantType: ApplicantType) => {
        const prospect = prospects.find(p => p.id === prospectId);
        if (!prospect) return;

        const newStages = prospect.stages.map(s => {
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
        updateProspectData(prospectId, { stages: newStages });
    }, [prospects, updateProspectData]);
    
    const rejectProspect = useCallback((prospectId: string, stageId: number) => {
        updateProspectData(prospectId, { status: 'rejected', rejected_at_stage: stageId });
    }, [updateProspectData]);

    const reopenProspect = useCallback((prospectId: string) => {
        updateProspectData(prospectId, { status: 'in_progress', rejected_at_stage: null });
    }, [updateProspectData]);

    const recordLoanPayment = useCallback((loanId: string, payment: { date: string; amount: number; notes?: string; distributions: { funderId: string; amount: number }[] }) => {
        const loan = prospects.find(p => p.id === loanId);
        if (!loan) return;

        const newPrincipalBalance = (loan.terms?.principal_balance || 0) - payment.amount;
        
        const newHistoryEvent: HistoryEvent = {
            id: `hist-${crypto.randomUUID()}`,
            date_created: new Date().toISOString().split('T')[0],
            date_received: payment.date,
            type: 'Payment',
            total_amount: payment.amount,
            notes: payment.notes,
            distributions: payment.distributions,
        };
        
        const updatedFunders = (loan.funders || []).map(funder => {
            const distribution = payment.distributions.find(d => d.funderId === funder.id);
            const funderReduction = distribution ? distribution.amount : 0;
            return { ...funder, principal_balance: funder.principal_balance - funderReduction };
        });

        const totalPrincipal = updatedFunders.reduce((sum, f) => sum + f.principal_balance, 0);
        
        const finalFunders = totalPrincipal > 0
            ? updatedFunders.map(f => ({ ...f, pct_owned: f.principal_balance / totalPrincipal }))
            : updatedFunders.map(f => ({ ...f, pct_owned: 0 }));

        updateProspectData(loanId, {
            terms: { ...loan.terms, principal_balance: newPrincipalBalance },
            funders: finalFunders,
            history: [...(loan.history || []), newHistoryEvent],
        });
    }, [prospects, updateProspectData]);

    const uploadPropertyPhoto = async (prospectId: string, propertyId: string, file: File): Promise<void> => {
        const prospect = prospects.find(p => p.id === prospectId);
        if (!prospect) throw new Error("Prospect not found");

        const prospectFolder = (prospect.prospect_code || prospect.id).replace(/\s+/g, '_');
        const filePath = `${prospectFolder}/properties/${propertyId}/${crypto.randomUUID()}-${file.name}`;

        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
        if (uploadError) {
            console.error("Error uploading photo:", uploadError);
            throw uploadError;
        }

        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
        const newPhoto: PropertyPhoto = {
            id: crypto.randomUUID(),
            url: urlData.publicUrl,
            storage_path: filePath,
        };

        const updatedProperties = prospect.properties?.map(prop => {
            if (prop.id === propertyId) {
                return { ...prop, photos: [...(prop.photos || []), newPhoto] };
            }
            return prop;
        });
        await updateProspectData(prospectId, { properties: updatedProperties });
    };

    const deletePropertyPhoto = async (prospectId: string, propertyId: string, photo: PropertyPhoto): Promise<void> => {
        const { error: deleteError } = await supabase.storage.from('documents').remove([photo.storage_path]);
        if (deleteError) {
            console.error("Error deleting photo:", deleteError);
            throw deleteError;
        }

        const prospect = prospects.find(p => p.id === prospectId);
        if (!prospect) return;

        const updatedProperties = prospect.properties?.map(prop => {
            if (prop.id === propertyId) {
                return { ...prop, photos: (prop.photos || []).filter(ph => ph.id !== photo.id) };
            }
            return prop;
        });
        await updateProspectData(prospectId, { properties: updatedProperties });
    };
    
    const value = { 
        prospects, users, loading, addProspect, updateProspect, updateDocumentStatus, 
        updateClosingDocumentStatus, addDocument, deleteDocument, uploadDocument, 
        removeDocumentLink, reopenProspect, rejectProspect, recordLoanPayment,
        uploadPropertyPhoto, deletePropertyPhoto
    };

    return (
        <ProspectsContext.Provider value={value}>
            {children}
        </ProspectsContext.Provider>
    );
};