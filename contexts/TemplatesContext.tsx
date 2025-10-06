import React, { createContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { supabase } from '../services/supabase';
import { getReadOnlyDefaultTemplates } from '../pages/templates/documentTemplates';

export interface Template {
    id: string;
    name: string;
    key: string;
    content: string;
    updated_at: string;
    isReadOnly?: boolean;
}

interface TemplatesContextType {
    templates: Template[];
    loading: boolean;
    error: string | null;
    updateTemplate: (template: Template, newContent: string) => Promise<void>;
    createTemplate: (name: string, key: string) => Promise<Template | null>;
}

export const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined);

export const TemplatesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const seedingRef = useRef(false);

    const fetchTemplates = useCallback(async () => {
        if (seedingRef.current) return;

        setLoading(true);
        setError(null);
        let finalTemplates: Template[] = [];
        let errorMessage: string | null = null;

        try {
            const { data, error: queryError } = await supabase
                .from('document_templates')
                .select('*')
                .order('name');

            if (queryError) {
                if (import.meta.env.DEV) console.error("Database query error:", queryError);
                throw new Error("Database connection failed.");
            }

            if (data && data.length > 0) {
                finalTemplates = data as Template[];
                if (import.meta.env.DEV) console.log(`✅ Loaded ${data.length} templates from database`);
            } else {
                const { count, error: countError } = await supabase
                    .from('document_templates')
                    .select('*', { count: 'exact', head: true });

                if (countError) throw countError;

                if (count === 0) {
                    if (seedingRef.current) return;
                    seedingRef.current = true;
                    
                    try {
                        if (import.meta.env.DEV) console.log("Empty database detected. Seeding templates...");
                        const templatesToSeed = getReadOnlyDefaultTemplates().map(({ name, key, content }) => ({ name, key, content }));
                        
                        const { data: seededData, error: seedError } = await supabase
                            .from('document_templates')
                            .upsert(templatesToSeed, { onConflict: 'key' })
                            .select();

                        if (seedError) {
                            if (import.meta.env.DEV) console.error("❌ Seeding failed:", seedError);
                            errorMessage = "Could not initialize templates. Using read-only mode.";
                            finalTemplates = getReadOnlyDefaultTemplates();
                        } else {
                            if (import.meta.env.DEV) console.log("✅ Templates seeded successfully");
                            finalTemplates = ((seededData as Template[]) || []).sort((a, b) => a.name.localeCompare(b.name));
                        }
                    } finally {
                        seedingRef.current = false;
                    }
                } else {
                    if (import.meta.env.DEV) console.warn("Templates exist in DB but query returned empty. Check RLS permissions.");
                    errorMessage = "Unable to access templates due to a permission issue. Using read-only mode.";
                    finalTemplates = getReadOnlyDefaultTemplates();
                }
            }
        } catch (err) {
            if (import.meta.env.DEV) console.error("❌ Failed to connect to or initialize database:", err);
            errorMessage = "Unable to connect to the database. Changes cannot be saved. Please check your internet connection.";
            finalTemplates = getReadOnlyDefaultTemplates();
        }

        setTemplates(finalTemplates);
        setError(errorMessage);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchTemplates();
        // Cleanup ref on component unmount
        return () => {
            seedingRef.current = false;
        };
    }, [fetchTemplates]);

    const updateTemplate = async (template: Template, newContent: string) => {
        if (template.isReadOnly) {
            throw new Error("Cannot modify read-only default templates.");
        }

        const originalTemplates = templates;
        const newUpdatedAt = new Date().toISOString();
        const updatedTemplate = { ...template, content: newContent, updated_at: newUpdatedAt };

        // 1. Optimistic UI Update
        setTemplates(prev => prev.map(t => t.id === template.id ? updatedTemplate : t));

        try {
            // 2. DB Update with concurrency check
            const { error, count } = await supabase
                .from('document_templates')
                .update({ content: newContent, updated_at: newUpdatedAt })
                .eq('id', template.id)
                .eq('updated_at', template.updated_at); 

            if (error) throw error;
            
            if (count === 0) {
                // This means the row was either updated by someone else or deleted.
                await fetchTemplates(); // Get the latest state from the DB.
                throw new Error("This template was modified or deleted by another user. The editor has been refreshed.");
            }
            // Success: Optimistic update is confirmed.

        } catch (err) {
            // 3. Revert UI on any error and re-throw
            setTemplates(originalTemplates);
            throw err;
        }
    };
    
    const createTemplate = async (name: string, key: string): Promise<Template | null> => {
        const trimmedName = name.trim();
        const trimmedKey = key.trim();

        if (!trimmedName || !trimmedKey) {
            throw new Error("Template name and key cannot be empty.");
        }
        if (trimmedName.length > 100) {
            throw new Error("Template name cannot exceed 100 characters.");
        }
        if (trimmedKey.length > 50) {
            throw new Error("Template key cannot exceed 50 characters.");
        }

        const keyRegex = /^[a-z0-9_]+$/;
        if (!keyRegex.test(trimmedKey)) {
            throw new Error("Template key can only contain lowercase letters, numbers, and underscores.");
        }

        const newTemplateData = {
            name: trimmedName,
            key: trimmedKey,
            content: `<!-- Start writing your new '${trimmedName}' template here. -->`,
        };

        const { data, error } = await supabase
            .from('document_templates')
            .insert(newTemplateData)
            .select()
            .single();

        if (error) {
            if (import.meta.env.DEV) console.error("Error creating template:", error);
            if (error.code === '23505') {
                 throw new Error(`A template with the key '${trimmedKey}' already exists.`);
            }
            throw error;
        }

        if (data) {
            const createdTemplate = data as Template;
            setTemplates(prev => [createdTemplate, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
            return createdTemplate;
        }
        
        return null;
    };

    const value = { templates, loading, error, updateTemplate, createTemplate };

    return (
        <TemplatesContext.Provider value={value}>
            {children}
        </TemplatesContext.Provider>
    );
};
