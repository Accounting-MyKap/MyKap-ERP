import { useState, useEffect } from 'react';
import { Prospect, UserProfile, DocumentStatus, ApplicantType, Stage, Document, ClosingDocStatusKey } from './types';
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
    const { client_type } = prospect;

    // 1. Gather all required documents for the current active stage.
    let allRequiredDocs: Document[] = [];
    if (currentStage.name.toLowerCase() === 'pre-validation') {
         if (client_type === 'individual' || client_type === 'both') {
            allRequiredDocs = allRequiredDocs.concat(currentStage.documents.individual || []);
        }
        if (client_type === 'company' || client_type === 'both') {
            allRequiredDocs = allRequiredDocs.concat(currentStage.documents.company || []);
        }
        allRequiredDocs = allRequiredDocs.concat(currentStage.documents.property || []);
    } else {
         allRequiredDocs = allRequiredDocs.concat(currentStage.documents.general || []);
    }

    if (allRequiredDocs.length === 0) {
        return prospect; // Stage has no documents to check.
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
        // Prospect is fully completed.
        return {
            ...prospect,
            stages: newStages,
            status: 'completed',
            current_stage_name: 'Closing',
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
            
            // Logic to regenerate Pre-validation documents if client or loan type changes
            const clientTypeChanged = updatedData.client_type && updatedData.client_type !== originalProspect.client_type;
            const loanTypeChanged = updatedData.loan_type && updatedData.loan_type !== originalProspect.loan_type;

            if (clientTypeChanged || loanTypeChanged) {
                const newPreValidationDocs = getInitialDocuments(newProspect.client_type, newProspect.loan_type);

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

    return { prospects, users, loading, addProspect, updateProspect, updateDocumentStatus, updateClosingDocumentStatus, addDocument, deleteDocument, reopenProspect, rejectProspect };
};
