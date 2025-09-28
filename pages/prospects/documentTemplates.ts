// pages/prospects/documentTemplates.ts

export const MORTGAGE_TEMPLATE = `
MORTGAGE AGREEMENT

This Mortgage Agreement is made on {{CLOSING_DATE}}, between {{BORROWER_NAME}} ("Mortgagor") and {{COMPANY_NAME}} ("Mortgagee").

1.  **Loan Amount:** The Mortgagor has borrowed {{AMOUNT}} ({{AMOUNT_IN_WORDS}}) (the "Loan") from the Mortgagee.
2.  **Property:** The loan is secured by the property located at {{PROPERTY_ADDRESS}} (the "Property").
3.  **Repayment:** The Mortgagor agrees to repay the Loan according to the terms of the Promissory Note signed on this date.

IN WITNESS WHEREOF, the parties have executed this Mortgage Agreement as of the date first above written.

_________________________
{{BORROWER_NAME}} (Mortgagor)

_________________________
{{COMPANY_NAME}} (Mortgagee)
`;

export const GUARANTY_AGREEMENT_TEMPLATE = `
GUARANTY AGREEMENT

This Guaranty Agreement is made on {{CLOSING_DATE}}, by {{GUARANTOR_NAME}} ("Guarantor") in favor of {{COMPANY_NAME}} ("Lender").

1.  **Guaranty:** The Guarantor unconditionally guarantees the payment of all obligations of {{BORROWER_NAME}} to the Lender, up to the amount of {{AMOUNT}} ({{AMOUNT_IN_WORDS}}).
2.  **Consideration:** The Guarantor acknowledges receipt of good and valuable consideration for this Guaranty.

IN WITNESS WHEREOF, the Guarantor has executed this Guaranty Agreement.

_________________________
{{GUARANTOR_NAME}} (Guarantor)
`;

export const PROMISSORY_NOTE_TEMPLATE = `
SECURED PROMISSORY NOTE

Loan Amount: {{AMOUNT}}
Date: {{EFFECTIVE_DATE}}

1. AGREEMENT TO PAY. For value received on {{EFFECTIVE_DATE}}, {{BORROWER_ENTITY_DESCRIPTION}}, (the “Borrower(s) and Guarantor(s)”), hereby promises to pay to the order of Home Kapital Finance, LLC, a Florida Limited Liability Company, with an address of 1555 Bonaventure Blvd, Suite 2015, Weston, FL 33326, together with its successors and assigns (the “Lender”), the principal sum of {{AMOUNT_IN_WORDS}} U.S. DOLLARS AND 00/100 CENTS ({{AMOUNT}}) (the "Loan”), Plus Interest, {{NUMBER_OF_MONTHS_IN_WORDS}} ({{NUMBER_OF_MONTHS}}) months from the first day of the first month following the closing, (the “Maturity Date”), at the place and in the manner hereinafter provided, together with interest thereon at the rate or rates described below, and any and all other amounts which may be due and payable hereunder or under the other Loan Documents (as hereinafter defined) from time to time.

2. INTEREST RATE.

2.1. Interest Prior to Default. Interest shall accrue on the principal balance of this Secured Promissory Note (the “Note”) outstanding from the date hereof through the Maturity Date at a per annum fixed rate of interest (“Interest Rate”) Equal to {{INTEREST_RATE_IN_WORDS}} Percent ({{INTEREST_RATE_NUMBER}}%).

2.2. Interest After Default. From and after the Maturity Date or upon the occurrence and during the continuance of an Event of Default (as hereinafter defined), interest shall accrue on the unpaid principal balance during any such period at an annual rate (the “Default Rate”) equal to five percent (5%) plus from time to time the Interest Rate; provided, however, in no event shall the Default Rate exceed the maximum rate permitted by law. The interest accruing under this Section 2.2 shall be immediately due and payable by the Borrower(s) and Guarantor(s) to the holder of this Note upon demand and shall be additional indebtedness evidenced by this Note. Upon the occurrence of an Event of Default with respect to the payment of any installment of interest or principal on this Note which continues for more than fifteen (15) calendar days after the said installment becomes due, in addition to making payment of the installment due and any interest thereon at the interest rates provided in this Section 2.2, the Borrower(s) and Guarantor(s) shall pay to the Lender upon demand a late charge in an amount equal to the greater of (i) ten percent (10.0%) of any such overdue installment(s).

2.3. Interest Calculation. Interest on this Note shall be calculated on the basis of a 365 day year and the actual number of days elapsed in any portion of a month in which interest is due. If any payment to be made by the Borrower(s) and Guarantor(s) hereunder shall become due on a day other than a Saturday, Sunday or public holiday under the laws of the State of Michigan or other day on which the Lender is not open for business in Michigan (a “Business Day”), such payment shall be made on the next succeeding Business Day and such extension of time shall be included in computing any interest in respect of such payment.

3. PAYMENT TERMS.

(a) {{AMOUNT_IN_WORDS}} U.S. DOLLARS AND 00/100 CENTS ({{AMOUNT}}) the sum which is secured by this NOTE, together with interest on the whole sum that shall be from time to time unpaid at the rate of {{INTEREST_RATE_IN_WORDS}} Percent ({{INTEREST_RATE_NUMBER}}%), per annum computed upon the balance of the purchase price then unpaid, payable as follows:

Minimum Monthly Payments of Interest Only of {{MONTHLY_INSTALLMENT}}, beginning one month from the first day of the first month following the closing, monthly payment to be applied first upon interest then principal.

All of the Borrowed Money and Interest Shall be fully Paid in {{NUMBER_OF_MONTHS_IN_WORDS}} ({{NUMBER_OF_MONTHS}}) months from the first day of the first month following the closing.
...
`;
