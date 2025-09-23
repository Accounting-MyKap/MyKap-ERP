// pages/prospects/documentTemplates.ts

export const MORTGAGE_TEMPLATE = `
MORTGAGE AGREEMENT

This Mortgage Agreement is made on CLOSING DATE, between BORROWER NAME ("Mortgagor") and COMPANY NAME ("Mortgagee").

1.  **Loan Amount:** The Mortgagor has borrowed AMOUNT (the "Loan") from the Mortgagee.
2.  **Property:** The loan is secured by the property located at PROPERTY ADDRESS (the "Property").
3.  **Repayment:** The Mortgagor agrees to repay the Loan according to the terms of the Promissory Note signed on this date.

IN WITNESS WHEREOF, the parties have executed this Mortgage Agreement as of the date first above written.

_________________________
BORROWER NAME (Mortgagor)

_________________________
COMPANY NAME (Mortgagee)
`;

export const GUARANTY_AGREEMENT_TEMPLATE = `
GUARANTY AGREEMENT

This Guaranty Agreement is made on CLOSING DATE, by GUARANTOR NAME ("Guarantor") in favor of COMPANY NAME ("Lender").

1.  **Guaranty:** The Guarantor unconditionally guarantees the payment of all obligations of BORROWER NAME to the Lender, up to the amount of AMOUNT.
2.  **Consideration:** The Guarantor acknowledges receipt of good and valuable consideration for this Guaranty.

IN WITNESS WHEREOF, the Guarantor has executed this Guaranty Agreement.

_________________________
GUARANTOR NAME (Guarantor)
`;

export const PROMISSORY_NOTE_TEMPLATE = `
SECURED PROMISSORY NOTE

Loan Amount: AMOUNT
Date: CLOSING DATE

For value received, BORROWER NAME ("Borrower") promises to pay to the order of COMPANY NAME ("Lender"), the principal sum of AMOUNT, with interest thereon at the rate of NOTE RATE per annum.

This Note is secured by a Mortgage on the property located at PROPERTY ADDRESS.

_________________________
BORROWER NAME (Borrower)
`;
