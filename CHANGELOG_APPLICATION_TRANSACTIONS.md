# Multi-Transaction Attachment & Lead Assignment Changes

## Overview
This document records the changes made to support multiple transaction attachments (Transaction ID / UTR, Amount, Payment Proof Screenshot) for Bank Transfer / Offline payment methods across Admin, BDM, and Manager portals, as well as lead auto-assignment fixes.

---

## 1. Multiple Transaction Attachments for Bank Transfer / Offline Payments

### Requirement
When selecting "Bank Transfer" (or offline payment methods such as UPI / Cash / Cheque) during Application creation, editing, or status updates, users can attach multiple transactions (multiple UTR/Transaction IDs, split amounts, and individual screenshot proofs) instead of being limited to a single transaction.

### Files Modified

#### 1. `app/admin/application/page.tsx`
- **State Added**: `transactions` array state initialized with `{ id: 1, transactionId: '', amount: '', screenshotFilename: '', screenshotDataUrl: '' }`.
- **Handlers Added**:
  - `handleAddTransaction()`: Appends a new empty transaction row.
  - `handleRemoveTransaction(id)`: Removes a specific transaction row (ensuring at least one row remains).
  - `handleTransactionChange(id, field, value)`: Updates individual transaction fields (UTR, Amount, Screenshot file & base64 preview).
- **UI Components**:
  - Replaced single transaction input with a dynamic card list when Bank Transfer / Offline payment modes are active.
  - Included "+ Add Another Transaction" button and trash/delete buttons per row.
- **Form Handlers Updated**:
  - `handleCreateApplication()`: Passes the `transactions` array in payload.
  - `openEditModal()` / `openUpdateStatusModal()`: Hydrates multi-transaction state from server data or defaults.
  - `handleCloseModal()`: Resets multi-transaction state.

#### 2. `app/bdm/application/page.tsx`
- Added multi-transaction state, handlers (`handleAddTransaction`, `handleRemoveTransaction`, `handleTransactionChange`), and multi-transaction attachment UI card list to BDM Application forms.

#### 3. `app/manager/application/page.tsx`
- Added multi-transaction state, handlers, and multi-transaction attachment UI card list to Manager Application forms.

#### 4. Backend API: `app/api/admin/application/route.ts`
- **POST Handler**:
  - Extracts `transactions` array from request body.
  - Persists combined `transaction_id` and full `transactions` array inside `requests.screenshots` (jsonb).

#### 5. Backend API: `app/api/admin/application/[id]/route.ts`
- **GET Handler**:
  - Left joins `requests` table on `institution_id = a.institution_id` to retrieve existing `transaction_id` and `screenshots` JSON.
- **PUT Handler**:
  - Accepts `transactions` array.
  - Inserts/updates `requests` table linking to the application institution, saving all transaction records and screenshots in `requests.screenshots`.

---

## 2. Lead Auto-Assignment & Type Mismatch Fix (CRM)

### Files Modified

#### 1. `app/api/admin/crm/leads/route.ts`
- **PostgreSQL Data Type Fix**: Fixed PostgreSQL type inference error `42P08: could not determine data type of parameter $11` when inserting lead with assigned user / creator ID.
- **Auto-Assignment**: When `assigned_to` is not provided, automatically defaults `assigned_to` to `user.id` (the user creating the lead) so that created leads are instantly visible and attributed to the creator.

#### 2. Lead Form Dropdowns (`app/manager/lead/page.tsx`, `app/bdm/crm/leads/page.tsx`, `app/admin/crm/leads/page.tsx`)
- Fixed status select dropdown to default to `NEW` instead of blank to avoid empty status submissions.

---

## 3. Official Invoice Template & Download Synchronization

### Requirement
When downloading invoices from `http://localhost:3000/admin/billing` (or from Requests), the generated document must match the official Invoice template layout with institution details ("Bill To"), line item breakdown, payment status, notes, terms, and balance due summary.

### Files Modified

#### 1. `app/admin/billing/page.tsx`
- **Updated `handleDownloadPDF()`**:
  - Structured output using official Invoice Template:
    - **Header**: Logo Box (`ACADEMY SETU`), "Who is this from?" provider box (`Academy Setu Technologies Pvt. Ltd.`, address, contact, GSTIN).
    - **Metadata Grid**: Invoice # (`INV-YYYY-XXXX`), Date, Payment Terms (`Due on Receipt`), Due Date, PO Number.
    - **Address Grid**: "Bill To" (School Name, Contact Person, Phone, Email, Address) & "Ship To" (Campus Software Access).
    - **Itemized Table**: Dark slate header (`#0f172a`) with columns `Plan Name`, `Quantity`, `Rate`, `Amount`, itemizing all plan features and module services.
    - **Bottom 2-Column Section**:
      - Left: Payment details with `✓ PAID` badge, UTR/Transaction ID, Notes, and Terms & Conditions.
      - Right: Clean summary showing Subtotal, Tax/GST, Discount, and Total.
    - Added crisp full outer container border (`border: 2px solid #0f172a`) in print styles (`@media print`) and on-screen views.

#### 2. `app/admin/request/page.tsx`
- **Updated `handleDownloadPDF()`**:
  - Connected the Bill download button in Request records to output the identical official Invoice Template with `Plan Name` column header and full outer page border.
