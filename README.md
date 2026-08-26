# 🚗 National Auto Garage — Management System

A modern, professional, high-performance web application designed for **National Auto Garage**, a two-wheeler service & repair workshop.

---

## 📌 Project Status — 100% PRODUCTION READY & COMPLETE

* **All Development Phases & Core Modules**: ✅ **100% COMPLETED**
* **Verification Status**:
  * ✅ **37 / 37 Automated Verification Tests PASSED** (`cd backend && npm test`)
  * ✅ **Nordic Blue Theme System & Uniform Layout Sizing**: Applied across 100% of pages
  * ✅ **Smart Keywords Master & Typo-Tolerant Auto-Suggest Engine**: Integrated website-wide
  * ✅ **GitHub Repository Sync**: 100% up-to-date on `main` branch (`https://github.com/maazpathan07/national-auto-garage.git`)

---

## 🏢 Core Modules & Features

1. **🎨 Design System & Layout Consistency (Nordic Blue)**:
   - Unified color tokens (`#0284C7` Ocean Blue Primary, `#7DD3FC` Light Sky Accent, `#0C4A6E` Navy Text, `#F0F9FF` Neutral Background, `#0F172A` Deep Slate Sidebar).
   - Uniform container sizing (`max-w-7xl w-full mx-auto`) and standardized white header card containers across every single page.
2. **🚀 UX Shortcuts & Redirection**:
   - Clickable brand logo (`N NATIONAL AUTO GARAGE PORTAL`) & `ADMIN PORTAL` badge to jump to `/dashboard`.
   - `+ Quick Action` Topbar menu for 1-click creation of Job Cards, Inventory Items, Invoices, and Expenses.
   - Dynamic browser tab title synchronization (`document.title`).
3. **📊 Operational Dashboard (`/dashboard`)**:
   - Real-time KPI metrics for Revenue, Active Job Cards, Low Stock Alerts, and Outstanding Customer Dues.
4. **📦 Products & Inventory Management (`/inventory`)**:
   - Spare parts & oils catalog, SKU/OEM tracking, Unit Cost vs Selling MRP, double-entry stock ledger, and negative stock protection.
5. **🚚 Suppliers & Supplier Orders (`/suppliers` & `/supplier-orders`)**:
   - Vendor directory with shop details and GSTIN, plus purchase orders with **WhatsApp 1-Click Send Integration**.
6. **🔧 Service Job Cards (`/jobs/full-service` & `/jobs/engine-job`)**:
   - Full Service & heavy Engine Repair job cards with customer complaints, mechanic assignments, labour charges, and parts deduction.
7. **📄 Bills & Invoices (`/invoices`)**:
   - GST/Non-GST invoices (`INV-2026-0001`) with automated subtotal, discount, tax, and print-ready layout.
8. **💳 Customer Khata / Outstanding (`/outstanding`)**:
   - Dedicated customer receivables register with partial payment settlement and balance due tracking.
9. **🧾 Operating Expenses / OPEX (`/expenses`)**:
   - Expense tracking with 3-Account Notebook Ledger Math (`Garage Account`, `Imran Pathan Account`, `Naim Pathan Account`).
10. **🧮 Live Settlement Calculator (`/calculator`)**:
    - Live 50/50 Partner Equity Profit & Advance Draw Calculator with Net Payout breakdown for **Naim Pathan** & **Imran Pathan**.
11. **🏷️ Smart Keywords Master & Typo-Tolerant Auto-Suggestions (`/keywords`)**:
    - Global master keyword management with typo-tolerant fuzzy auto-suggestions (`tayer` ➔ **Tyre**, `brek` ➔ **Brake Pad**, `oil` ➔ **Engine Oil**) across all input fields website-wide.

---

## 🗄️ Database Architecture

Lightweight & optimized MongoDB models:

| Model | Purpose |
| :--- | :--- |
| **`User`** | Admin authentication & bcrypt password verification |
| **`Customer`** | Customer profiles with 10-digit mobile normalization |
| **`Vehicle`** | Two-wheeler records with normalized registration numbers |
| **`Product` / `Part`** | Spare parts & oil stock catalog with MRP and cost prices |
| **`InventoryMovement`** | Immutable stock ledger movement records |
| **`Supplier`** | Vendor contact directory and GSTIN |
| **`SupplierOrder`** | Spare part purchase orders |
| **`ServiceJob`** | Service & Engine Repair job card records |
| **`Bill`** | Customer invoice snapshot & payment status |
| **`Payment`** | Customer payment receipts register |
| **`Expense`** | Garage operating expenses & 3-account ledger attribution |
| **`CustomerOutstanding`** | Standalone customer khata dues register |
| **`MasterKeyword`** | Global auto-suggestion keywords list |
| **`Settings`** | Garage branding, prefixes, and GST configuration |
| **`Employee`** | Mechanics & technician staff register |
| **`ServiceType`** | Standard service rates catalog |
| **`Counter`** | Sequential ID generator (`CUST-`, `JOB-`, `INV-`, `EXP-`, `DUE-`) |

---

## 🛠️ Technology Stack

* **Backend**: Node.js, Express.js, Mongoose, MongoDB, Zod, Bcrypt.js, JsonWebToken
* **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
* **Testing**: Automated Node test runner (`npm test`)

---

## 🚀 How to Run locally

1. **Start Backend API**:
   ```bash
   cd backend
   npm run dev
   ```
2. **Start Frontend Web App**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Run Test Suite**:
   ```bash
   cd backend
   npm test
   ```
