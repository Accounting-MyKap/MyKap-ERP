// pages/prospects/GenerateDocumentModal.tsx
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import Modal from '../../components/ui/Modal';
import { Prospect } from './types';
import { MORTGAGE_TEMPLATE, GUARANTY_AGREEMENT_TEMPLATE, PROMISSORY_NOTE_TEMPLATE } from './documentTemplates';
import { formatCurrency, formatPercent, numberToWords } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

interface GenerateDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    prospect: Prospect;
}

const documentOptions = {
    promissory_note: { name: 'Secured Promissory Note', template: PROMISSORY_NOTE_TEMPLATE, filename: 'Secured-Promissory-Note.pdf' },
    mortgage: { name: 'Mortgage', template: MORTGAGE_TEMPLATE, filename: 'Mortgage.pdf' },
    guaranty: { name: 'Guaranty Agreement', template: GUARANTY_AGREEMENT_TEMPLATE, filename: 'Guaranty-Agreement.pdf' },
};

type DocumentKey = keyof typeof documentOptions;

const GenerateDocumentModal: React.FC<GenerateDocumentModalProps> = ({ isOpen, onClose, prospect }) => {
    const [selectedDoc, setSelectedDoc] = useState<DocumentKey>('promissory_note');
    const { showToast } = useToast();

    // Reset state when modal opens or prospect changes
    useEffect(() => {
        if (isOpen) {
            setSelectedDoc('promissory_note');
        }
    }, [isOpen, prospect]);

    const handleDownload = () => {
        const docInfo = documentOptions[selectedDoc];
        let template = docInfo.template;
        
        // --- Data Gathering ---
        const primaryProperty = prospect.properties?.find(p => p.is_primary);
        const propertyAddress = primaryProperty 
            ? `${primaryProperty.address.street || ''}, ${primaryProperty.address.city || ''}, ${primaryProperty.address.state || ''} ${primaryProperty.address.zip || ''}`.trim().replace(/,$/, '')
            : '[PROPERTY ADDRESS NOT FOUND]';

        const guarantor = prospect.co_borrowers?.find(cb => cb.relation_type === 'Guarantor');
        const guarantorName = guarantor ? guarantor.full_name : '[GUARANTOR NOT FOUND]';
        
        let borrowerEntityDesc = '';
        if (prospect.borrower_type === 'individual') {
            borrowerEntityDesc = `${prospect.borrower_name}, Individually`;
        } else if (prospect.borrower_type === 'company') {
            borrowerEntityDesc = `${prospect.borrower_name}, a ${prospect.state || '[STATE]'} Limited Liability Company`;
        } else { // 'both'
             borrowerEntityDesc = `${prospect.borrower_name}, a ${prospect.state || '[STATE]'} Limited Liability Company, and ${guarantorName}, Individually`;
        }

        const replacements: { [key: string]: string } = {
            '{{BORROWER_NAME}}': prospect.borrower_name,
            '{{COMPANY_NAME}}': "MyKap",
            '{{AMOUNT}}': formatCurrency(prospect.loan_amount),
            '{{AMOUNT_IN_WORDS}}': numberToWords(prospect.loan_amount) || '[AMOUNT IN WORDS]',
            '{{NOTE_RATE}}': formatPercent(prospect.terms?.note_rate, 3),
            '{{INTEREST_RATE_NUMBER}}': ((prospect.terms?.note_rate || 0) * 100).toFixed(3),
            '{{INTEREST_RATE_IN_WORDS}}': numberToWords((prospect.terms?.note_rate || 0) * 100) || '[RATE IN WORDS]',
            '{{CLOSING_DATE}}': prospect.terms?.closing_date || '[CLOSING DATE]',
            '{{MATURITY_DATE}}': prospect.terms?.maturity_date || '[MATURITY DATE]',
            '{{EFFECTIVE_DATE}}': prospect.terms?.closing_date || new Date().toLocaleDateString('en-US'),
            '{{PROPERTY_ADDRESS}}': propertyAddress,
            '{{GUARANTOR_NAME}}': guarantorName,
            '{{BORROWER_ENTITY_DESCRIPTION}}': borrowerEntityDesc,
            '{{NUMBER_OF_MONTHS}}': String(prospect.terms?.loan_term_months || '[# MONTHS]'),
            '{{NUMBER_OF_MONTHS_IN_WORDS}}': numberToWords(prospect.terms?.loan_term_months) || '[# MONTHS IN WORDS]',
            '{{MONTHLY_INSTALLMENT}}': formatCurrency(prospect.terms?.monthly_payment),
            '{{STATE}}': prospect.state || '[STATE]'
        };

        // --- Template Filling ---
        for (const [key, value] of Object.entries(replacements)) {
            template = template.replace(new RegExp(key, 'g'), value);
        }

        // --- PDF Generation ---
        try {
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'letter' // US Letter size
            });

            const margin = 15; // mm
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            const maxWidth = pageWidth - margin * 2;
            let y = margin;
            const lineHeight = 6; // mm for 11pt font size

            doc.setFont('times', 'normal');
            doc.setFontSize(11);

            const lines = doc.splitTextToSize(template, maxWidth);

            lines.forEach((line: string) => {
                if (y + lineHeight > pageHeight - margin) {
                    doc.addPage();
                    y = margin; 
                }
                doc.text(line, margin, y);
                y += lineHeight;
            });

            const filename = `${prospect.prospect_code}-${docInfo.filename}`;
            doc.save(filename);

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
                        value={selectedDoc}
                        onChange={(e) => setSelectedDoc(e.target.value as DocumentKey)}
                        className="input-field mt-1"
                    >
                        {Object.entries(documentOptions).map(([key, { name }]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                     <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button
                        onClick={handleDownload}
                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                        Download PDF
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default GenerateDocumentModal;