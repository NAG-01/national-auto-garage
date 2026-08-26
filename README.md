# National Auto Garage

A professional, simple, and reliable internal garage management system for **National Auto Garage**, a two-wheeler workshop.

---

## 📌 Project Status

* **Phase 1 — Architecture, Data Models & Foundation** — ✅ **COMPLETE**
* **Phase 2 — Foundation & Reusable Design System** — ✅ **COMPLETE**
* **Phase 3 — Single Admin Authentication & Protected Route Shell** — ✅ **COMPLETE**
* **Verification Status**:
  * ✅ **43 / 43 Phase 1 Architecture & Model Tests Passed** (`npm run test:phase1`)
  * ✅ **23 / 23 Payment & Outstanding Data Integrity Checks Passed** (`npm run test:payment`)
  * ✅ **Vite Production Build**: 1,674 modules compiled with **0 errors**

---

## 🏢 System Scope & Core Rules

1. **Single System Admin**: There is exactly **one** system admin account.
2. **Partnership Entities**: **Naim** (50%) and **Imran** (50%) are business partners whose transactions are tracked inside the financial settlement ledger (not separate login accounts).
3. **Core Modules (Strictly 9 Core Areas)**:
   1. Dashboard
   2. Products / Inventory
   3. Suppliers / Supplier Orders
   4. Customers / Vehicles
   5. Full Service
   6. Engine Jobs
   7. Bills / Payments
   8. Customer Outstanding (Dedicated Receivables Module)
   9. Partnership / Monthly Settlement
4. **Authoritative Payment Ledger**: Customer payments are stored as independent, immutable `Payment` records. Outstanding amount is derived strictly as $\text{Bill Grand Total} - \sum \text{Payment Records}$. Overpayments are strictly rejected.
5. **Double-Entry Stock Ledger**: Every inventory change records an immutable `InventoryMovement` entry with reasons and reference IDs.
6. **Cash-Based Partnership Accounting**: Month-end profit distribution is computed from realized cash inflows minus business expenses, adjusted for personal withdrawals and out-of-pocket partner expenses.

---

## 🎨 Global Design System (Phase 2 & Phase 3 Standards)

* **Palette**: Dark Navy shell (`#0F172A`), Industrial Orange accent (`#EA580C`), crisp slate neutrals, and high-contrast semantic indicators (Green `#16A34A`, Amber `#D97706`, Red `#DC2626`, Blue `#2563EB`).
* **Single Admin Auth**: Bcrypt-hashed password verification, JWT token persistence, client-side request interceptors, protected route shell, and topbar/sidebar logout triggers.
* **Indian Formatting**: Indian Rupee (`₹450`, `₹2,000`, `₹1,25,000`), 10-digit mobile formatting (`+91 98765 43210`), and normalized vehicle registration plates (`GJ 05 AB 1234`).
* **Reusable UI Components**:
  * `Button`: Primary, Accent, Secondary, Outline, Ghost, Danger, Success. Sizes: sm, md, lg.
  * `Input`, `CurrencyInput`, `Select`, `Textarea`, `SearchInput` (with password show/hide support).
  * `Badge` & `StatusBadge`: Complete domain status coverage with semantic dots.
  * `Card`, `CalloutCard`, `KpiCard`: Information hierarchy and high-readability financial metrics.
  * `Table` & `Pagination`: Responsive overflow protection with horizontal scroll and pagination.
  * `Modal` & `ConfirmDialog`: Accessible dialogs with Escape key support and focus trapping.
  * `ToastProvider` & `useToast`: Non-intrusive notification feedback (Success, Error, Warning, Info).
  * `Skeleton`: Card, Table, Form, and Page loading states.
  * `EmptyState` & `ErrorState`: Friendly empty list illustrations and error recovery handlers.

---

## 🗄️ Database Architecture (Phase 1 Models)

| Model | Purpose |
| :--- | :--- |
| **`User`** | Single Admin authentication schema with bcrypt password hashing |
| **`Customer`** | Customer profiles with 10-digit mobile normalization and deduplication indexes |
| **`Vehicle`** | Two-wheeler records with normalized uppercase registration numbers |
| **`Product`** | Spare parts & consumables catalog with purchase cost, selling price, current stock, and active/inactive status |
| **`InventoryMovement`** | Stock ledger logging every quantity change with movement reasons |
| **`Supplier`** | Vendor contact directory and active status |
| **`SupplierOrder`** | Purchase orders tracking items and quantities; stock increases strictly upon `RECEIVED` |
| **`ServiceJob`** | Full Service & Engine Job records with free-text problem notes and price-locked parts snapshots |
| **`Bill`** | Invoice snapshot recording item rates, labour charges, grand total, and cached payment state |
| **`Payment`** | Independent, immutable customer payment receipt ledger |
| **`BusinessExpense`** | Garage operating expenses (OPEX) with payer attribution (`GARAGE_MONEY`, `NAIM_PERSONAL`, `IMRAN_PERSONAL`) |
| **`PartnerTransaction`** | Partner drawings (personal withdrawals) and out-of-pocket contributions |
| **`MonthlySettlement`** | Finalized monthly financial snapshots with 50/50 profit distribution and line-item adjustments |
| **`Counter`** | Atomic sequential ID generator (`CUST-0001`, `PRD-0001`, `SUP-0001`, `VEH-0001`, `NAG-YYYY-XXXX`, `NAG-INV-YYYY-XXXX`, `PAY-YYYY-XXXX`, `EXP-YYYY-XXXX`, `PTX-YYYY-XXXX`) |
| **`AuditLog`** | Activity log for tracking critical state changes |

---

## 🛠️ Technology Stack

* **Backend**: Node.js, Express.js, Mongoose, MongoDB, Zod, Bcrypt.js, JsonWebToken
* **Frontend**: React (Vite), Tailwind CSS, Lucide Icons
* **Testing**: In-memory MongoDB automated test suites

---

## 🚀 Running the Project

1. **Start Backend API**:
   ```bash
   cd backend
   npm run start
   ```
2. **Start Frontend Web App**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Run Automated Test Suites**:
   ```bash
   cd backend
   npm run test:phase1
   npm run test:payment
   ```

---

## 🗺️ Planned Development Phases

* [x] **Phase 1** — Architecture, Data Models & Foundation — COMPLETE
* [x] **Phase 2** — Foundation & Reusable Design System — COMPLETE
* [x] **Phase 3** — Single Admin Authentication & Route Shell — COMPLETE
* [ ] **Phase 4** — Products & Inventory Module
* [ ] **Phase 5** — Suppliers & Supplier Orders Module
* [ ] **Phase 6** — Customers & Vehicles Module
* [ ] **Phase 7** — Full Service Module
* [ ] **Phase 8** — Engine Jobs Module
* [ ] **Phase 9** — Bills, Payments, Outstanding & WhatsApp Sharing
* [ ] **Phase 10** — Partnership Accounting & Monthly Settlement
* [ ] **Phase 11** — Main Operational Dashboard
* [ ] **Phase 12** — End-to-End Testing, Optimization & Final Polish
