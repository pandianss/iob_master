export const OFFICE_NOTE_TEMPLATE = `
**Office Note No.** [AUTO-GENERATED]
**Date:** ${new Date().toLocaleDateString('en-IN')}
**Office:** [Insert Office/Department Name]

**Subject: Approval for incurring expenditure towards [Insert purpose]**

**1. Background & Necessity**
[Briefly explain the business/operational requirement. Clearly state why the expense is unavoidable/essential.]

**2. Reference to Policy / Circulars**
[Explicitly refer to relevant circulars/policies. Mention circular number, date, and clause.]

**3. Budget Provision & Availability**
*   **Financial Year:** [FY 20XX-XX]
*   **Budget Head:** [Insert GL Code]
*   **Original Allocation:** ₹ [Amount]
*   **Utilized till date:** ₹ [Amount]
*   **Balance Available:** ₹ [Amount]
*(Expense is within sanctioned budget / Proposed through re-appropriation)*

**4. Nature & Classification**
*   **Class:** [Capital / Revenue]
*   **Type:** [Recurring / Non-recurring]
*   **Debit Account:** [Insert GL Head]

**5. Vendor / Beneficiary Details**
*   **Name:** [Insert Vendor Name]
*   **Relationship:** [Empanelled / Approved / One-time]
*   **Credit Account:** [Insert Account Details]

**6. Financial Details**
*   **Gross Amount:** ₹ [Amount]
*   **Tax (GST/TDS):** ₹ [Amount]
*   **Net Payable:** ₹ [Amount]
*(Rupees [Amount in words] only)*

**7. Justification & Reasonableness**
Certified that:
*   Rates are reasonable and as per prevailing norms/contracts.
*   Due diligence has been carried out.
*   No splitting of expenditure to avoid sanction limits.

**8. Compliance & Certifications**
Confirmed compliance with procurement norms, CVC guidelines, and internal audit requirements. The expenditure is subject to post-audit.

**9. Approval Sought**
Approval is solicited for incurring an expenditure of **₹ [Amount]** towards the above purpose.

**Authority Competent to Sanction:** [Insert Authority Level per DFP]

--------------------------------------------------
**Initiated By:** [Name & Designation]
**Recommended By:** [Name & Designation]
`;
