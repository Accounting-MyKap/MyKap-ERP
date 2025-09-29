// pages/prospects/GenerateDocumentModal.tsx
import React, { useState, useEffect } from 'react';
import pdfMake from 'pdfmake/build/pdfmake';
// FIX: The type definitions for pdfmake fonts use a named export, so a namespace import is required to resolve the type error.
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';

import Modal from '../../components/ui/Modal';
import { Prospect } from './types';
import { formatCurrency, formatPercent, numberToWords } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { useTemplates } from '../../hooks/useTemplates';

// Set up pdfmake virtual file system.
// This is the officially documented way to link the fonts with the pdfmake instance when using modules.
pdfMake.vfs = pdfFonts.pdfMake.vfs;


type DocumentKey = 'promissory_note' | 'mortgage' | 'guaranty';

interface GenerateDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    prospect: Prospect;
}

const GenerateDocumentModal: React.FC<GenerateDocumentModalProps> = ({ isOpen, onClose, prospect }) => {
    const [selectedDocKey, setSelectedDocKey] = useState<DocumentKey>('promissory_note');
    const { templates, loading: templatesLoading } = useTemplates();
    const { showToast } = useToast();
    
    const documentOptions = templates.map(t => ({ name: t.name, key: t.key as DocumentKey }));

    useEffect(() => {
        if (isOpen) {
            setSelectedDocKey('promissory_note');
        }
    }, [isOpen, prospect]);

    const processTemplate = (template: string): string => {
        // --- Data Gathering ---
        const primaryProperty = prospect.properties?.find(p => p.is_primary);
        const propertyAddress = primaryProperty 
            ? `${primaryProperty.address.street || ''}, ${primaryProperty.address.city || ''}, ${primaryProperty.address.state || ''} ${primaryProperty.address.zip || ''}`.trim().replace(/,$/, '')
            : '[PROPERTY ADDRESS NOT FOUND]';

        const guarantor = prospect.co_borrowers?.find(cb => cb.relation_type === 'Guarantor');
        const guarantorName = guarantor ? guarantor.full_name : '[GUARANTOR NOT FOUND]';
        
        let borrowerEntityDesc = '';
        let borrowerNoticeAddress = '';
        
        if (prospect.borrower_type === 'individual') {
            borrowerEntityDesc = `${prospect.borrower_name}, Individually`;
            borrowerNoticeAddress = borrowerEntityDesc;
        } else if (prospect.borrower_type === 'company') {
            borrowerEntityDesc = `${prospect.borrower_name}, a ${prospect.state || '[STATE]'} Limited Liability Company`;
            borrowerNoticeAddress = borrowerEntityDesc;
        } else { // 'both'
             borrowerEntityDesc = `${prospect.borrower_name}, a ${prospect.state || '[STATE]'} Limited Liability Company, and ${guarantorName}, Individually`;
             borrowerNoticeAddress = `${prospect.borrower_name}, a ${prospect.state || '[STATE]'} Limited Liability Company`;
        }
        
        const signatoryForNotary = (prospect.borrower_type === 'company' || prospect.borrower_type === 'both') 
            ? guarantorName
            : prospect.borrower_name;

        // --- Basic Replacements ---
        const replacements: { [key: string]: string } = {
            '{{BORROWER_NAME}}': prospect.borrower_name,
            '{{COMPANY_NAME}}': "Home Kapital Finance, LLC",
            '{{AMOUNT}}': formatCurrency(prospect.loan_amount),
            '{{AMOUNT_IN_WORDS}}': numberToWords(prospect.loan_amount) || '[AMOUNT IN WORDS]',
            '{{NOTE_RATE}}': formatPercent(prospect.terms?.note_rate, 3),
            '{{INTEREST_RATE_NUMBER}}': ((prospect.terms?.note_rate || 0) * 100).toFixed(3),
            '{{INTEREST_RATE_IN_WORDS}}': numberToWords((prospect.terms?.note_rate || 0) * 100) || '[RATE IN WORDS]',
            '{{CLOSING_DATE}}': prospect.terms?.closing_date || '[CLOSING DATE]',
            '{{MATURITY_DATE}}': prospect.terms?.maturity_date || '[MATURITY DATE]',
            '{{EFFECTIVE_DATE}}': prospect.terms?.closing_date || new Date().toLocaleDateString('en-US'),
            '{{PROPERTY_ADDRESS}}': propertyAddress,
            '{{GUARANTOR_NAME_INDIVIDUALLY}}': guarantorName,
            '{{BORROWER_ENTITY_DESCRIPTION}}': borrowerEntityDesc,
            '{{BORROWER_NOTICE_ADDRESS}}': borrowerNoticeAddress,
            '{{SIGNATORY_NAME_FOR_NOTARY}}': signatoryForNotary,
            '{{NUMBER_OF_MONTHS}}': String(prospect.terms?.loan_term_months || '[# MONTHS]'),
            '{{NUMBER_OF_MONTHS_IN_WORDS}}': numberToWords(prospect.terms?.loan_term_months) || '[# MONTHS IN WORDS]',
            '{{MONTHLY_INSTALLMENT}}': formatCurrency(prospect.terms?.monthly_payment),
            '{{STATE}}': prospect.state || '[STATE]',
        };

        let processedContent = template;
        for (const [key, value] of Object.entries(replacements)) {
            processedContent = processedContent.replace(new RegExp(key.replace(/\{\{/g, '{{').replace(/\}\}/g, '}}'), 'g'), value || '');
        }
        
        // --- Conditional Blocks ---
        const hasCoBorrowers = prospect.co_borrowers && prospect.co_borrowers.length > 0;
        processedContent = processedContent.replace(/{{\#if co_borrowers}}(.*?){{\/if}}/gs, hasCoBorrowers ? '$1' : '');

        // --- Loop Blocks ---
        processedContent = processedContent.replace(/{{\#each co_borrowers}}(.*?){{\/each}}/gs, (match, innerTemplate) => {
            if (!hasCoBorrowers) return '';
            return (prospect.co_borrowers || []).map(cb => {
                return innerTemplate
                    .replace(/{{this\.full_name}}/g, cb.full_name || '')
                    .replace(/{{this\.relation_type}}/g, cb.relation_type || 'Co-Borrower');
            }).join('');
        });
        
         // --- Logo Placeholder ---
        processedContent = processedContent.replace(
            /\{\{COMPANY_LOGO\}\}/g,
            `<img src="https://storage.googleapis.com/assets_co-investment_simulator/logo.png" style="width: 150px;" />`
        );

        return processedContent;
    };

    const handleDownload = async () => {
        const docTemplate = templates.find(t => t.key === selectedDocKey);
        if (!docTemplate) {
            showToast('Selected document template could not be found.', 'error');
            return;
        }

        try {
            const processedHtml = processTemplate(docTemplate.content);
            const contentForPdf = htmlToPdfmake(processedHtml);

            const docDefinition = {
                content: contentForPdf,
                defaultStyle: {
                    font: 'Times'
                },
                 styles: {
                    'ql-align-center': {
                        // FIX: Use 'as const' to assert the literal type for alignment, resolving the
                        // TypeScript error where 'string' was not assignable to type 'Alignment'.
                        alignment: 'center' as const
                    },
                    'ql-align-right': {
                        alignment: 'right' as const
                    },
                    'ql-align-justify': {
                        alignment: 'justify' as const
                    }
                }
            };
            
            const filename = `${prospect.prospect_code}-${docTemplate.name.replace(/ /g, '-')}.pdf`;
            pdfMake.createPdf(docDefinition).download(filename);

            showToast('PDF document generated successfully!', 'success');
            onClose();

        } catch (err) {
            console.error(err);
            showToast('Failed to generate PDF document.', 'error');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate and Download Document">
            <div className="space-y-4">
                <div>
                    <label htmlFor="docType" className="block text-sm font-medium text-gray-700">Select Document Type</label>
                    <select
                        id="docType"
                        value={selectedDocKey}
                        onChange={(e) => setSelectedDocKey(e.target.value as DocumentKey)}
                        className="input-field mt-1"
                        disabled={templatesLoading}
                    >
                        {templatesLoading ? (
                            <option>Loading templates...</option>
                        ) : (
                            documentOptions.map(({ key, name }) => (
                                <option key={key} value={key}>{name}</option>
                            ))
                        )}
                    </select>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                     <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={templatesLoading}
                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        Download PDF
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default GenerateDocumentModal;
