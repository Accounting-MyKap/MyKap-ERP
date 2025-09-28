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

This Guaranty Agreement is made on {{CLOSING_DATE}}, by {{GUARANTOR_NAME_INDIVIDUALLY}} ("Guarantor") in favor of {{COMPANY_NAME}} ("Lender").

1.  **Guaranty:** The Guarantor unconditionally guarantees the payment of all obligations of {{BORROWER_NAME}} to the Lender, up to the amount of {{AMOUNT}} ({{AMOUNT_IN_WORDS}}).
2.  **Consideration:** The Guarantor acknowledges receipt of good and valuable consideration for this Guaranty.

IN WITNESS WHEREOF, the Guarantor has executed this Guaranty Agreement.

_________________________
{{GUARANTOR_NAME_INDIVIDUALLY}} (Guarantor)
`;

export const PROMISSORY_NOTE_TEMPLATE = `
{{AMOUNT}}

SECURED PROMISSORY NOTE

(the "Effective Date”)

1. AGREEMENT TO PAY. For value received on {{EFFECTIVE_DATE}}, {{BORROWER_ENTITY_DESCRIPTION}}, (the “Borrower(s) and Guarantor(s)”), hereby promises to pay to the order of Home Kapital Finance, LLC, a Florida Limited Liability Company, with an address of 1555 Bonaventure Blvd, Suite 2015, Weston, FL 33326, together with its successors and assigns (the “Lender”), the principal sum of {{AMOUNT_IN_WORDS}} U.S. DOLLARS AND 00/100 CENTS ({{AMOUNT}}) (the "Loan”), Plus Interest, {{NUMBER_OF_MONTHS_IN_WORDS}} ({{NUMBER_OF_MONTHS}}) months from the first day of the first month following the closing, (the “Maturity Date”), at the place and in the manner hereinafter provided, together with interest thereon at the rate or rates described below, and any and all other amounts which may be due and payable hereunder or under the other Loan Documents (as hereinafter defined) from time to time.

2. INTEREST RATE.

2.1. Interest Prior to Default. Interest shall accrue on the principal balance of this Secured Promissory Note (the “Note”) outstanding from the date hereof through the Maturity Date at a per annum fixed rate of interest (“Interest Rate”) Equal to {{INTEREST_RATE_IN_WORDS}} Percent ({{INTEREST_RATE_NUMBER}}%).

2.2. Interest After Default. From and after the Maturity Date or upon the occurrence and during the continuance of an Event of Default (as hereinafter defined), interest shall accrue on the unpaid principal balance during any such period at an annual rate (the “Default Rate”) equal to five percent (5%) plus from time to time the Interest Rate; provided, however, in no event shall the Default Rate exceed the maximum rate permitted by law. The interest accruing under this Section 2.2 shall be immediately due and payable by the Borrower(s) and Guarantor(s) to the holder of this Note upon demand and shall be additional indebtedness evidenced by this Note. Upon the occurrence of an Event of Default with respect to the payment of any installment of interest or principal on this Note which continues for more than fifteen (15) calendar days after the said installment becomes due, in addition to making payment of the installment due and any interest thereon at the interest rates provided in this Section 2.2, the Borrower(s) and Guarantor(s) shall pay to the Lender upon demand a late charge in an amount equal to the greater of (i) ten percent (10.0%) of any such overdue installment(s).

2.3. Interest Calculation. Interest on this Note shall be calculated on the basis of a 365 day year and the actual number of days elapsed in any portion of a month in which interest is due. If any payment to be made by the Borrower(s) and Guarantor(s) hereunder shall become due on a day other than a Saturday, Sunday or public holiday under the laws of the State of Michigan or other day on which the Lender is not open for business in Michigan (a “Business Day”), such payment shall be made on the next succeeding Business Day and such extension of time shall be included in computing any interest in respect of such payment.

3. PAYMENT TERMS.

(a) {{AMOUNT_IN_WORDS}} U.S. DOLLARS AND 00/100 CENTS ({{AMOUNT}}) the sum which is secured by this NOTE, together with interest on the whole sum that shall be from time to time unpaid at the rate of {{INTEREST_RATE_IN_WORDS}} Percent ({{INTEREST_RATE_NUMBER}}%), per annum computed upon the balance of the purchase price then unpaid, payable as follows:

Minimum Monthly Payments of Interest Only of {{MONTHLY_INSTALLMENT}}, beginning one month from the first day of the first month following the closing, monthly payment to be applied first upon interest then principal.

All of the Borrowed Money and Interest Shall be fully Paid in {{NUMBER_OF_MONTHS}} months from the first day of the first month following the closing.

If any installment is not paid within Seven (7) days of the due date, Borrower will immediately pay to the holder of this Note a late charge equal to 10 percent. This is in addition to the holder's other rights and remedies for default in payment of an installment of interest when due.

Payments of Principal & Interest. The unpaid Principal balance and Interest of this Note, if not sooner paid or declared to be due in accordance with the terms hereof, together with all accrued and unpaid interest thereon and any other amounts due and payable hereunder or under any of the Loan Documents shall be due and payable in full on the {{MATURITY_DATE}}.

3.2. Application of Payments – Prior to Event of Default. Prior to the occurrence of an Event of Default, all payments and prepayments on account of the indebtedness evidenced by this Note shall be applied as follows: (a) first, to fees, expenses, costs and other similar amounts then due and payable to the Lender, including, without limitation any prepayment premium, exit fee or late charges due hereunder, (b) second, to accrued and unpaid interest on the principal balance of this Note, (c) third, to the payment of principal due in the calendar month in which the payment or prepayment is made, (d) fourth, to any escrows, impounds or other amounts which may then be due and payable under the Loan Documents, (e) fifth, to any other amounts then due the Lender hereunder or under any of the other Loan Documents, and (f) last, to the unpaid principal balance of this Note in the inverse order of maturity. Any prepayment on account of the indebtedness evidenced by this Note shall not extend or postpone the due date or reduce the amount of any subsequent monthly payment of principal and interest due hereunder.

3.3. Allocation of Payments - After Event of Default. Notwithstanding any other provisions of this Note to the contrary, after the occurrence and during the continuance of an Event of Default, all amounts collected or received by the Lender on account of the Obligations or any other amounts outstanding under any of the other Loan Documents or in respect of certain premises and improvements thereon and Commonly Known as :

Property 1: {{PROPERTY_ADDRESS}}

(the "Mortgaged Premises”), as more particularly described in the Mortgage dated as of the Effective Date of this Note, made by the Borrower(s) and Guarantor(s) to the Lender with respect to the Mortgaged Premises, as the same may be amended, modified, restated or supplemented from time to time (the "Mortgage") shall be paid over or delivered as follows:

First, to the payment(s) of all reasonable out-of-pocket costs and expenses (including reasonable attorneys' fees) of the Lender in connection with enforcing the rights of the Lender under this Note and the other Loan Documents and any protective advances (including advances relating to taxes and insurance) made by the Lender with respect to the Mortgaged Premises under or pursuant to the term of this Note or the other Loan Documents;

Second, to payment(s) of any fees owed to the Lender by the Borrower(s) and Guarantor(s) under this Note or the other Loan Documents;

Third, to the payment(s) of all of the Obligations consisting of accrued fees and interest arising under or pursuant to this Note or the other Loan Documents;

Fourth, to the ratable payment(s) of the outstanding principal amount of the Loan, with the application to principal on the Loan being applied in the inverse order of maturity; and

Fifth, to all other Obligations and other obligations which shall have become due and payable under the other Loan Documents and not repaid pursuant to clauses “First” through “Fourth" above; and

Sixth, to the payment(s) of the surplus, if any, to the Borrower(s) and Guarantor(s) or whoever may be lawfully entitled to receive such surplus.

In carrying out the foregoing, amounts received shall be applied in the numerical order provided until exhausted prior to application to the next succeeding category.

"Obligations” means the present and future loans, advances, debts, liabilities and other obligations of the Borrower(s) and Guarantor(s) to the Lender under this Note and the other Loan Documents (whether absolute, contingent, matured or unmatured) including: (a) the outstanding principal and accrued interest (including interest accruing after a petition for relief under the federal bankruptcy laws has been filed, whether or not allowed) in respect of the Loan to the Borrower(s) and Guarantor(s) by the Lender and other amounts owing by the Borrower(s) and Guarantor(s) to the Lender under this Note or any other Loan Document, (b) all fees owing to the Lender under this Note and the other Loan Documents, (c) any costs and expenses reimbursable to the Lender under this Note, and (d) compensation and indemnification obligations under this Note or any other Loan Document.

3.4. Method of Payments. All payments of principal and interest hereunder shall be paid by automatic debit, wire transfer, check, or currency which, at the time or times of payment, is the legal tender for public and private debts in the United States of America and shall be made at such place as the Lender or the legal holder or holders of this Note may from time to time appoint in the payment invoice or otherwise in writing, and in the absence of such appointment, then at the offices of the Lender at 1555 Bonaventure Boulevard, Suite 2015, Weston, FL, 33326. Payment made by check shall be deemed paid on the date the Lender receives such check; provided, however, that if such check is subsequently returned to the Lender unpaid due to insufficient funds or otherwise, the payment shall not be deemed to have been made and shall continue to bear interest until collected. Notwithstanding the foregoing, the final payment due under this Note must be made by wire transfer or other immediately available funds.

3.5. Late Charge. If any payment of interest or principal due hereunder is not made within fifteen (15) calendar days after such payment is due in accordance with the terms hereof, then, in addition to the payment of the amount so due, the Borrower(s) and Guarantor(s) shall pay to the Lender a "late charge" of ten percent for each whole dollar so overdue to defray part of the cost of collection and handling such late payment. The Borrower(s) and Guarantor(s) agrees that the damages to be sustained by the holder hereof for the detriment caused by any late payment are extremely difficult and impractical to ascertain, and that the amount of five cents for each one dollar due is a reasonable estimate of such damages, does not constitute interest, and is not a penalty.

3.6. Prepayments. This Note may be prepaid, in whole or in part, at any time and from time to time without premium or penalty. However, all prepayments will be applied first to any accrued interest and then to principal. Amounts prepaid may not be reborrowed.

4. SECURITY. This Note is secured by that (or those) certain: (a) the Mortgage creating a first lien on the Mortgaged Premises Described in Exhibit A; (b) a Personal Guaranty Agreement, dated as of the Effective Date, made by {{GUARANTOR_NAME_INDIVIDUALLY}}, Individually, to the Lender (the “Guaranty"); and (c) any and all other documents now or hereafter given to evidence or secure payment of this Note or delivered to induce the Lender to disburse the proceeds of the Loan, as the foregoing documents may hereafter be amended, restated or replaced from time to time.

5. EVENTS OF DEFAULT. The occurrence of any one or more of the following events shall constitute an "Event of Default" under this Note:

(a) If the Borrower(s) and Guarantor(s) fails to make any of the payments under this Note or any other Loan Document (including whether of principal, interest, fees or other amount and regardless of amount) when and as the same shall become due and payable;

(b) If the Borrower(s) and Guarantor(s) fails to perform any of the non monetary obligations under this Note or any of the other Loan Documents;

(c) The Borrower(s) and Guarantor(s) or any guarantor is the subject of an order for relief by a bankruptcy court, or is unable or admits its inability (whether through repudiation or otherwise) to pay its debts as they mature, or makes an assignment for the benefit of creditors; or the Borrower(s) and Guarantor(s) or any guarantor applies for or consents to the appointment of any receiver, trustee, custodian, conservator, liquidator, rehabilitator or similar officer for it or any part of its property; or any receiver, trustee, custodian, conservator, liquidator, rehabilitator or similar officer is appointed without the application or consent of the Borrower(s) and Guarantor(s) or any guarantor, as the case may be, and the appointment continues undischarged or unstayed for sixty (60) days; or the Borrower(s) and Guarantor(s) or any guarantor institutes or consents to any bankruptcy, insolvency, reorganization, arrangement, readjustment of Indebtedness, dissolution, custodianship, conservatorship, liquidation, construction or similar proceeding relating to it or any part of its property; or any similar proceeding is instituted without the consent of the Borrower(s) and Guarantor(s) or any guarantor, as the case may be, and continues undismissed or unstayed for sixty (60) days; or any judgment, writ, warrant of attachment or execution, or similar process is issued or levied against any property of the Borrower(s) and Guarantor(s), or any guarantor and is not released, vacated or fully bonded within thirty (30) days after its issue or levy;

(d) If any representation or warranty made or deemed made by the Borrower(s) and Guarantor(s) or any Guarantor in this Note or any related agreement, mortgage, guaranty agreement, security agreement, pledge agreement, environmental or other indemnity agreement, which is now or hereafter required to be delivered by or on behalf of the Borrower(s) and Guarantor(s) or any guarantor to the Lender in connection with this Note, as the same may be amended, restated, replaced, supplemented, or modified from time to time (collectively, the “Loan Documents”) or in any certificate, document or financial or other statement furnished at any time in connection herewith or therewith, as the case may be, shall prove to have been misleading in any material respect on the date when made or deemed to have been made;

(e) If any (a) material adverse change occurs in the financial condition, operation, or management of the Borrower(s) and Guarantor(s) (or any guarantor), or (b) event occurs which has a material adverse effect on the rights and remedies of the Lender under the Loan Documents, in each case, as determined by the Lender in its sole discretion;

(f) If the Borrower(s) and Guarantor(s) fails to keep, perform, or observe any other agreement, covenant or condition on the part of the Borrower(s) and Guarantor(s) contained in any other Loan Document or security instrument evidencing or securing the indebtedness of the Borrower(s) and Guarantor(s) to the Lender under this Loan or any other loan with Lender, which default is not cured within the time period set forth in this Note or therein;

(g) If the Borrower(s) and Guarantor(s), or any guarantor who is not a natural person is dissolved, liquidated or terminated, or all or substantially all of the assets of the Borrower(s) and Guarantor(s), or any guarantor are sold or otherwise transferred without the Lender's prior written consent;

(h) If any Loan Document shall cease to be in full force and effect or the Borrower(s) and Guarantor(s) or any Person contests in any manner the validity or enforceability of the applicable Loan Document;

(i) The Borrower(s) and Guarantor(s) or any guarantor shall have a final non appealable judgment entered against it, him or her in excess of $50,000.00 in any civil, administrative or other proceeding, which judgment is not fully covered by insurance, and such judgment remains unpaid, unvacated, unbonded or unstayed by appeal or otherwise for a period of thirty (30) days from the date of its entry;

(j) Any guarantor that is a natural person dies, or becomes disabled or mentally impaired;

(k) Any Guaranty is repudiated, revoked or terminated in whole or in part without the Lender's prior written consent; or any guarantor claims that his, her or its Guaranty is ineffective or unenforceable, in whole or in part and for any reason, with respect to amounts then outstanding or amounts that might in the future be outstanding;

(l) At the Lender's option in its sole and absolute discretion, the institution of foreclosure proceedings that are not dismissed within thirty (30) days with respect to any mechanic's lien or any other lien secured by an interest in the Mortgaged Premises;

(m) If the Borrower(s) and Guarantor(s) (i) transfers or permits to be transferred (whether by operation of law or otherwise) any membership or other equity interest in the Borrowing Entity that would result in Guarantor not being directly or indirectly in control of, (ii) transfers or permits to be transferred (whether by operation of law or otherwise) the Mortgaged Premises or any part thereof, or (iii) permits any liens upon the Mortgaged Premises or any part thereof except for the Permitted Exceptions; or

(n) The occurrence of any "Event of Default" under the Mortgage or any of the other Loan Documents.

6. REMEDIES. At the election of the holder hereof, and without notice, the principal balance remaining unpaid under this Note, and all unpaid interest accrued thereon and any other amounts due hereunder, shall be and become immediately due and payable in full upon the occurrence of any Event of Default. Failure to exercise this option shall not constitute a waiver of the right to exercise the same in the event of any subsequent Event of Default. No holder hereof shall, by any act of omission or commission, be deemed to waive any of its rights, remedies or powers hereunder or otherwise unless such waiver is in writing and signed by the holder hereof, and then only to the extent specifically set forth therein. The rights, remedies and powers of the holder hereof, as provided in this Note, the Mortgage and in all of the other Loan Documents are cumulative and concurrent, and may be pursued singly, successively or together against the Borrower(s) and Guarantor(s), any guarantor hereof, the Mortgaged Premises and any other security given at any time to secure the repayment hereof, all at the sole discretion of the holder hereof. If any suit or action is instituted or attorneys are employed to collect this Note or any part hereof, the Borrower(s) and Guarantor(s) promises and agrees to pay all costs of collection, including reasonable attorneys' fees and court costs.

7. COVENANTS AND WAIVERS. The Borrower(s) and Guarantor(s) and all others who now or may at any time become liable for all or any part of the obligations evidenced hereby, expressly agree hereby to be jointly and severally bound, and jointly and severally: (i) waive and renounce any and all homestead, redemption and exemption rights and the benefit of all valuation and appraisement privileges against the indebtedness evidenced by this Note or by any extension or renewal hereof; (ii) waive presentment and demand for payment, notices of nonpayment and of dishonor, protest of dishonor, and notice of protest; (iii) except as expressly provided in the Loan Documents, waive any and all notices in connection with the delivery and acceptance hereof and all other notices in connection with the performance, default, or enforcement of the payment hereof or hereunder; (iv) waive any and all lack of diligence and delays in the enforcement of the payment hereof; (v) agree that the liability of the Borrower(s) and Guarantor(s) and each guarantor, endorser or obligor shall be unconditional (unless otherwise limited in the Loan Documents) and without regard to the liability of any other person or entity for the payment hereof, and shall not in any manner be affected by any indulgence or forbearance granted or consented to by the Lender to any of them with respect hereto; (vi) consent to any and all extensions of time, renewals, waivers, or modifications that may be granted by the Lender with respect to the payment or other provisions hereof, and to the release of any security at any time given for the payment hereof, or any part thereof, with or without substitution, and to the release of any person or entity liable for the payment hereof; and (vii) consent to the addition of any and all other makers, endorsers, guarantors, and other obligors for the payment hereof, and to the acceptance of any and all other security for the payment hereof, and agree that the addition of any such makers, endorsers, guarantors or other obligors, or security shall not affect the liability of the Borrower(s) and Guarantor(s), any guarantor and all others now liable for all or any part of the obligations evidenced hereby. This provision is a material inducement for the Lender making the Loan to the Borrower(s) and Guarantor(s).

8. GENERAL AGREEMENTS.

8.1. Business Purpose Loan. The Loan is a business loan which comes within the purview of the State of Michigan.

8.2. Time. Time is of the essence hereof.

8.3. Governing Law. This Note is governed and controlled as to validity, enforcement, interpretation, construction, effect and in all other respects by the statutes, laws and decisions of the State of Michigan, without regard to its conflicts of law provisions.

8.4. Amendments. This Note may not be changed or amended orally but only by an instrument in writing signed by the party against whom enforcement of the change or amendment is sought.

8.5. No Joint Venture. The Lender shall not be construed for any purpose to be a partner, joint venturer, agent or associate of the Borrower(s) and Guarantor(s) or of any lessee, operator, concessionaire or licensee of the Borrower(s) and Guarantor(s) in the conduct of its business, and by the execution of this Note, the Borrower(s) and Guarantor(s) agree to indemnify, defend, and hold the Lender harmless from and against any and all damages, costs, expenses and liability that may be incurred by the Lender as a result of a claim that the Lender is such partner, joint venturer, agent or associate.

8.6. Disbursement. All funds disbursed to or for the benefit of the Borrower(s) and Guarantor(s), will be disbursed by the Lender.

8.7. Joint and Several Obligations. If this Note is executed by more than one party, the obligations and liabilities of each Borrower(s) and Guarantor(s) under this Note shall be joint and several and shall be binding upon and enforceable against each Borrower(s) and Guarantor(s) and their respective successors and assigns. This Note shall insure to the benefit of and may be enforced by the Lender and its successors and assigns.

8.8. Severable Loan Provisions. If any provision of this Note is deemed to be invalid by reason of the operation of law, or by reason of the interpretation placed thereon by any administrative agency or any court, the Borrower(s) and Guarantor(s) and the Lender shall negotiate an equitable adjustment in the provisions of the same in order to effect, to the maximum extent permitted by law, the purpose of this Note and the validity and enforceability of the remaining provisions, or portions or applications thereof, shall not be affected thereby and shall remain in full force and effect.

8.9. Interest Limitation. If the interest provisions herein or in any of the Loan Documents shall result, at any time during the Loan, in an effective rate of interest which, for any calendar month, exceeds the limit of usury or other laws applicable to the Loan, all sums in excess of those lawfully collectible as interest of the period in question shall, without further agreement or notice between or by any party hereto, be applied upon principal immediately upon receipt of such monies by the Lender, with the same force and effect as though the payer has specifically designated such extra sums to be so applied to principal and the Lender had agreed to accept such extra payment(s) as a premium-free prepayment. Notwithstanding the foregoing, however, the Lender may at any time and from time to time elect by notice in writing to the Borrower(s) and Guarantor(s) to reduce or limit the collection to such sums which, when added to the said first-stated interest, shall not result in any payments toward principal in accordance with the requirements of the preceding sentence. In no event shall any agreed to or actual exaction as consideration for this Loan transcend the limits imposed or provided by the law applicable to this transaction or the makers hereof in the jurisdiction in which the Mortgaged Premises are located for the use or detention of money or for forbearance in seeking its collection.

8.10. Assignability. The Lender may at any time assign its rights in this Note and the Loan Documents, or any part thereof and transfer its rights in any or all of the collateral, and the Lender thereafter shall be relieved from all liability with respect to such collateral. In addition, the Lender may at any time sell one or more participations in the Note. The Borrower(s) and Guarantor(s) may NOT assign its interest in this Note, or any other agreement with the Lender or any portion thereof, either voluntarily or by operation of law, without the prior written consent of the Lender

9. NOTICES. All notices, requests, demands, directions and other communications under the provisions of this Note or the other Loan Documents must be in writing (including electronic mail communication) unless otherwise expressly permitted under this Note and must be sent by certified first-class express mail, private overnight or next Business Day courier, in all cases with charges prepaid, or by electronic mail (with proof of delivery and read receipt) and any such properly given notice shall be effective when received, if on a Business Day and if not, at the start of business on the next Business Day. All notices shall be sent to the applicable party at the addresses stated below or in accordance with the last unrevoked written notice from such party to the other parties.

If to the Lender: Home Kapital Finance, LLC, a Florida Limited Liability Company, 1555 Bonaventure Blvd, Suite 2015, Weston, FL 33326

If to the Borrower(s) and Guarantor(s): {{BORROWER_NOTICE_ADDRESS}}
Email:
{{GUARANTOR_NAME_INDIVIDUALLY}}
Address:
Email:
Address:
Email:

10. CONSENT TO JURISDICTION. To induce the Lender to accept this note, the Borrower(s) and Guarantor(s) irrevocably agrees that, subject to the Lender's sole and absolute election, all actions or proceedings in any way arising out of or related to this note will be litigated in courts having situs in Wayne, Michigan. The Borrower(s) and Guarantor(s) hereby consents and submits to the jurisdiction of any court located within Wayne, Michigan, waives personal service of process upon the Borrower(s) and Guarantor(s), and agrees that all such service of process may be made by registered mail directed to the Borrower(s) and Guarantor(s) at the address stated in the mortgage and service so made will be deemed to be completed upon actual receipt.

11. WAIVER OF JURY TRIAL. The Borrower(s) and Guarantor(s) and the Lender (by acceptance of this note), having been represented by counsel, each knowingly and voluntarily waives any right to a trial by jury in any action or proceeding to enforce or defend any rights (a) under this note or any other loan agreement or under any amendment, instrument, document or agreement delivered or which may in the future be delivered in connection with this note or (b) arising from any Lender relationship existing in connection with this note, and agrees that any such action or proceeding will be tried before a court and not before a jury. The Borrower(s) and Guarantor(s) agrees that it will not assert any claim against the Lender on any theory of liability for special, indirect, consequential, incidental or punitive damages.

12. WAIVER OF DEFENSES. THE BORROWER(S) AND GUARANTOR(S) WAIVES EVERY PRESENT AND FUTURE DEFENSE (OTHER THAN THE DEFENSE OF PAYMENT IN FULL), CAUSE OF ACTION, COUNTERCLAIM OR SETOFF WHICH THE BORROWER(S) AND GUARANTOR(S) MAY NOW HAVE OR HEREAFTER MAY HAVE TO ANY ACTION BY THE LENDER IN ENFORCING THIS NOTE OR ANY OF THE LOAN DOCUMENTS. THIS PROVISION IS A MATERIAL INDUCEMENT FOR THE LENDER GRANTING ANY FINANCIAL ACCOMMODATION TO THE BORROWER(S) AND GUARANTOR(S).

13. Customer Identification - USA Patriot Act Notice; OFAC and Bank Secrecy Act. The Lender hereby notifies the Borrower(s) and Guarantor(s) that pursuant to the requirements of the USA Patriot Act (Title III of Pub. L. 107-56, signed into law October 26, 2001) (the “Act”), and the Lender's policies and practices, the Lender is required to obtain, verify and record certain information and documentation that identifies the Borrower(s) and Guarantor(s), which information includes the name and address of the Borrower(s) and Guarantor(s) and such other information that will allow the Lender to identify the Borrower(s) and Guarantor(s) in accordance with the Act. In addition, the Borrower(s) and Guarantor(s) shall (a) ensure that no person who owns a controlling interest in or otherwise controls the Borrower(s) and Guarantor(s) or any subsidiary of the Borrower(s) and Guarantor(s) is or shall be listed on the Specially Designated Nationals and Blocked Person List or other similar lists maintained by the Office of Foreign Assets Control (“OFAC”), the Department of the Treasury or included in any Executive Orders, (b) not use or permit the use of the proceeds of the Loan to violate any of the foreign asset control regulations of OFAC or any enabling statute or Executive Order relating thereto, and (c) comply, and cause any of its subsidiaries to comply, with all applicable Bank Secrecy Act (“BSA”) laws and regulations, as amended.

14. EXPENSES AND INDEMNIFICATION. The Borrower(s) and Guarantor(s) shall pay all costs and expenses incurred by the Lender in connection with the preparation of this Note and the Loan Documents, including, without limitation, reasonable attorneys' fees. The Borrower(s) and Guarantor(s) shall pay any and all stamp and other taxes, UCC search fees, filing fees and other costs and expenses in connection with the execution and delivery of this Note and the other instruments and documents to be delivered hereunder, and agrees to save the Lender harmless from and against any and all liabilities with respect to or resulting from any delay in paying or omission to pay such costs and expenses. The Borrower(s) and Guarantor(s) hereby authorizes the Lender to charge any account of the Borrower(s) and Guarantor(s) with the Lender for all sums due under this Section. The Borrower(s) and Guarantor(s) also agrees to defend (with counsel satisfactory to the Lender), protect, indemnify and hold harmless the Lender, any parent corporation, affiliated corporation or subsidiary of the Lender, and each of their respective officers, directors, employees, attorneys and agents (each, an “Indemnified Party") from and against any and all liabilities, obligations, losses, damages, penalties, actions, judgments, suits, claims, costs, expenses and distributions of any kind or nature (including, without limitation, the disbursements and the reasonable fees of counsel for each Indemnified Party thereto, which shall also include, without limitation, reasonable attorneys' fees), which may be imposed on, incurred by, or asserted against, any Indemnified Party (whether direct, indirect or consequential and whether based on any federal, state or local laws or regulations, including, without limitation, securities, environmental laws and commercial laws and regulations, under common law or in equity, or based on contract or otherwise) in any manner relating to or arising out of this Note or any of the Loan Documents, or any act, event or transaction related or attendant thereto, the preparation, execution and delivery of this Note and the Loan Documents, the making or issuance and management of the Loan, the use or intended use of the proceeds of the Loan and the enforcement of the Lender's rights and remedies under this Note, the Loan Documents, any other instruments and documents delivered hereunder or thereunder, or under any other agreement between the Borrower(s) and Guarantor(s) and the Lender; provided, however, that the Borrower(s) and Guarantor(s) shall not have any obligation hereunder to any Indemnified Party with respect to matters caused by or resulting from the willful misconduct or gross negligence of such Indemnified Party. To the extent that the undertaking to indemnify set forth in the preceding sentence may be unenforceable because it violates any law or public policy, the Borrower(s) and Guarantor(s) shall satisfy such undertaking to the maximum extent permitted by applicable law. Any liability, obligation, loss, damage, penalty, cost or expense covered by this indemnity shall be paid to such Indemnified Party on demand, and failing prompt payment, together with interest thereon at the Default Rate from the date incurred by such Indemnified Party until paid by the Borrower(s) and Guarantor(s), shall be added to the obligations of the Borrower(s) and Guarantor(s) evidenced by this Note and secured by the collateral securing this Note. This indemnity is not intended to excuse the Lender from performing hereunder. The provisions of this section shall survive the closing of the Loan, the satisfaction and payment of this Note and any cancellation of the Loan Documents. The Borrower(s) and Guarantor(s) shall also pay, and hold the Lender harmless from, any and all claims of any brokers, finders or agents claiming a right to any fees in connection with arranging the Loan.

[signature page follows]

IN WITNESS WHEREOF, the Borrower(s) and Guarantor(s) has executed and delivered this Secured Promissory Note as of the day and year first above written.

BORROWER(S) AND GUARANTOR(S)(S):

By: _________________________ Date: _________________________
{{BORROWER_NAME}}, a {{STATE}} Limited Liability Company

By: _________________________ Date: _________________________
{{GUARANTOR_NAME_INDIVIDUALLY}}, Individually

State of ____________ // County of ____________

On ____________, before me, ____________, a Notary Public in The County of ____________, State of ____________, personally appeared {{SIGNATORY_NAME_FOR_NOTARY}}, Individually and as a Member of {{BORROWER_NAME}}, a {{STATE}} Limited Liability Company, Government Issued ID Verified, to me known to be the person described in and who executed the foregoing instrument and acknowledged that he/she executed the same as his/her free act and deed.

Notary Public: _________________________

Approved by the Lender : Home Kapital Finance, LLC, a Florida Limited Liability Company,

Date: _________________________
Diego Felipe Quesada, Member

Signature Page to Secured Promissory Note
Note #: {{BORROWER_NAME}} to Home Kapital Finance, LLC
`;