# Walkthrough - User Role Progressive Wizard & Menu Navigation

We have completed the progressive multi-step user creation wizard and menu filters for the **User Role** module.

---

## What was Changed

### 1. Database Schema Updates
- Altered `admins` database schema in [`app/api/admin/setup/route.ts`](file:///c:/Users/fammu/Desktop/academic-app/app/api/admin/setup/route.ts) with columns needed for the progressive wizard:
  - `joining_date` (Date)
  - `permissions` (text array)
  - `gender` (gender option)
  - `address` (street address)
  - `state` / `district` / `pincode` (location details)
  - `aadhar_no` (identification)
  - `aadhar_card_url` (attached document)
  - `signature_url` (attached signature)
  - `login_time_type` / `login_time` / `logout_time` / `login_expire_date` / `device_permission_count` (security criteria)
- Triggered migration successfully (returns `{"success": true}`).

### 2. Sidebar Dropdown Navigation
- Updated [`components/layout/AdminSidebar.tsx`](file:///c:/Users/fammu/Desktop/academic-app/components/layout/AdminSidebar.tsx) to turn `User Role` into an expandable dropdown with active sub-menus:
  - **All User** (`/admin/user-role`)
  - **Admin** (`/admin/user-role?role=Admin`)
  - **Manager** (`/admin/user-role?role=Manager`)
  - **BDM** (`/admin/user-role?role=BDM`)
  - **Custom** (`/admin/user-role?role=Custom`)
- Modified parent-link active checks so the sidebar chevron dynamically highlights and opens according to matching URL search parameters.
- Wrapped `AdminSidebar` in a `<Suspense>` boundary in [`AdminLayout.tsx`](file:///c:/Users/fammu/Desktop/academic-app/components/layout/AdminLayout.tsx) to avoid Next.js static compilation de-optimization warnings when reading `useSearchParams`.

### 3. Backend REST APIs
- Updated GET, POST, and PUT handlers in [`app/api/admin/users/route.ts`](file:///c:/Users/fammu/Desktop/academic-app/app/api/admin/users/route.ts) and [`app/api/admin/users/[id]/route.ts`](file:///c:/Users/fammu/Desktop/academic-app/app/api/admin/users/[id]/route.ts) to parse, insert, and update all new progressive wizard parameters.
- Fixed a compatibility bug in `[id]` dynamic route endpoints. Since Next.js 16/15 treats `params` as a `Promise`, we updated all administrative dynamic routes to asynchronously resolve `params` (i.e. `const { id } = await params`) before accessing the ID value. The fix was applied across:
  - Users ID API: [`app/api/admin/users/[id]/route.ts`](file:///c:/Users/fammu/Desktop/academic-app/app/api/admin/users/[id]/route.ts)
  - Income Parties ID API: [`app/api/admin/income/parties/[id]/route.ts`](file:///c:/Users/fammu/Desktop/academic-app/app/api/admin/income/parties/[id]/route.ts)
  - Income Records ID API: [`app/api/admin/income/records/[id]/route.ts`](file:///c:/Users/fammu/Desktop/academic-app/app/api/admin/income/records/[id]/route.ts)
  - Income Categories ID API: [`app/api/admin/income/categories/[id]/route.ts`](file:///c:/Users/fammu/Desktop/academic-app/app/api/admin/income/categories/[id]/route.ts)
  - Expense Records ID API: [`app/api/admin/expense/records/[id]/route.ts`](file:///c:/Users/fammu/Desktop/academic-app/app/api/admin/expense/records/[id]/route.ts)

### 4. Progressive Wizard Page
- Created the step-by-step progressive user creation wizard at [`app/admin/user-role/create/page.tsx`](file:///c:/Users/fammu/Desktop/academic-app/app/admin/user-role/create/page.tsx):
  - **Step 1 (Personal Details):** Captures name, email, dial codes, permissions selection (with tag capsules/pills), profile picture upload, role classifications, joining dates, and passwords.
  - **Step 2 (Address Details):** Progressive tick indicators, captures address, state, district, pincode, Aadhar card number, Aadhar file attachments, and signature attachments.
  - **Step 3 (Log in Criteria):** Dynamically toggles custom login/logout times based on 'Always' vs 'Custom' radio buttons, login expiration dates, and multi-device count controls.
  - **Step 4 (Final Preview):** Structured into premium card sections (Basic Info, Login & Account, Aadhar, Address, and Log in Criteria) matching mockup designs, complete with direct edit jump links, back arrows, print layouts, and submit actions.

---

## Verification Results

We verified the complete progressive wizard flow in the browser subagent:
1. **User List:** Displays administrative users partitioned correctly.
2. **Add User Flow:** Navigates to `/admin/user-role/create` and successfully inputs details, uploads a mock profile image, and transits between progressive steps under step validation checks.
3. **Sidebar Interaction:** Clicking role sub-menus dynamically alters query parameters and triggers automatic filter updates.
