/**
 * Comprehensive Page-by-Page Operating Guides & Instructions
 * 100% Pure Frontend Configuration (Zero Database Storage)
 */
export const PAGE_HELP_GUIDES = {
  // 1. Dashboard
  'Operational Dashboard': {
    title: 'Operational Dashboard Guide',
    summary: 'Garage ke live business performance, revenue, active job cards, low stock warnings, aur customer dues ko ek jagah monitor karein.',
    steps: [
      'Top Metric Cards se Total Revenue, Active Jobs, Low Stock Items, aur Customer Dues ka live count dekhein.',
      'Garage Stock Alert Monitor Card par low-stock items ke aage "Restock Karein" button dabakar direct inventory par ja sakte hain.',
      'Quick Operations Grid se 1-click me kisi bhi feature page par navigate karein.',
    ],
    tips: [
      'Topbar logo ("N NATIONAL AUTO GARAGE PORTAL") par click karke aap kisi bhi page se yahan redirect ho sakte hain.',
      'Topbar me "+ Quick Action" button se Naya Job Card, Bill, ya Expense turant bana sakte hain.',
    ],
  },

  // 2. Inventory / Products
  'Products & Inventory': {
    title: 'Products & Inventory Guide',
    summary: 'Spare parts, oils, aur consumables ka catalogue, cost vs MRP selling price, aur stock quantity manage karein.',
    steps: [
      'Naya Item Add Karne Ke Liye: Item Name, SKU/OEM Number, Category, Purchase Cost Price, Selling Price, aur Initial Stock bharein.',
      'Minimum Stock Alert set karein (e.g. 5) taaki stock kam hote hi Dashboard par warning alert mil jaye.',
      'Service Job Card complete hote hi spare parts ka stock automatically double-entry ledger se minus ho jata hai.',
      'Negative Stock Guard: Stock 0 hone par kisi part ki billing strictly block hoti hai.',
    ],
    tips: [
      'Typo-Tolerant Input: Search bar me galat spelling par bhi smart suggestions aayengi (e.g. "tayer" ➔ Tyre).',
      'Table header check-box se multiple items select karke bulk delete kar sakte hain.',
    ],
  },

  // 3. Suppliers
  'Suppliers Directory': {
    title: 'Suppliers Directory Guide',
    summary: 'Spare part vendors, shops, contact numbers, aur GSTIN details ka directory register.',
    steps: [
      '"+ Add Supplier" button dabakar vendor ka Shop Name, Contact Person Name, Phone Number, Address, aur GSTIN bharein.',
      'Supplier card par click karke vendor ki contact details dekh sakte hain.',
      'Supplier Orders page (/supplier-orders) se is vendor ko direct purchase order bhej sakte hain.',
    ],
    tips: [
      'Search bar me vendor name ya phone number type karke turant search karein.',
    ],
  },

  // 4. Supplier Orders
  'Supplier Orders': {
    title: 'Supplier Orders & WhatsApp Guide',
    summary: 'Spare parts purchase order lists banayein aur vendor ke WhatsApp par direct bhejain.',
    steps: [
      '"+ Create Order" button dabayein aur Supplier select karein.',
      'Required spare parts, unki quantity, aur expected unit price add karein.',
      'Order create hone ke baad "Send via WhatsApp" button dabayein.',
      'Vendor ke WhatsApp par complete formatted purchase order list ka message automatically chala jayega.',
    ],
    tips: [
      'Order receive hone par inventory me manual stock add karna yaad rakhein.',
    ],
  },

  // 5. Full Service Jobs
  'Full Service Jobs': {
    title: 'Full Service Job Cards Guide',
    summary: 'Bike servicing, customer complaints, assigned mechanics, aur spare parts usage ka complete job card.',
    steps: [
      '"+ New Service Job" dabakar Customer Name, Phone, Bike Model, Registration No. (e.g. GJ01AB1234), aur KM Reading bharein.',
      'Customer Complaints list add karein (e.g. Engine oil change, brake loose, chain lube).',
      'Assigned mechanic select karein aur labour charges enter karein.',
      'Used Spare Parts add karein — parts select hote hi stock auto-deduct hoga aur total cost calculate ho jayegi.',
      'Job Status "READY_FOR_BILLING" mark karke Invoice generate karein.',
    ],
    tips: [
      'Customer phone number aur bike registration plate automatically uppercase aur format ho jati hai.',
    ],
  },

  // 6. Engine Jobs
  'Engine Jobs': {
    title: 'Engine Jobs & Heavy Repair Guide',
    summary: 'Engine overhaul, cylinder boring, head work, aur heavy repairing jobs ke dedicated job cards.',
    steps: [
      'Engine repair job cards me heavy labour charges, lathe machine charges, aur replacement engine parts details enter karein.',
      'Engine job status READY_FOR_BILLING hone par final customer invoice generate karein.',
    ],
    tips: [
      'Heavy engine work details customer complaints text me clearly document karein.',
    ],
  },

  // 7. Bills & Invoices
  'Bills & Invoices': {
    title: 'Bills & Invoicing Guide',
    summary: 'Official customer GST/Non-GST invoices (`INV-2026-0001`) generate karein aur payments record karein.',
    steps: [
      'Completed Job Card se ya direct "+ Create Invoice" dabakar bill generate karein.',
      'Subtotal, Discount, Tax (GST), aur Customer Advance Payment adjust karein.',
      'Paid Amount enter karte hi status UNPAID, PARTIALLY_PAID, ya PAID me auto-update hoga.',
      '"Print Invoice" button dabakar customer ko clean physical printed bill dein.',
    ],
    tips: [
      'Remaining balance automatically Customer Outstanding / Khata register me chala jata hai.',
    ],
  },

  // 8. Customer Outstanding
  'Customer Outstanding': {
    title: 'Customer Khata / Outstanding Guide',
    summary: 'Grahakon ke baki baqaya khata dues (`DUE-0001`) aur partial payment settlements track karein.',
    steps: [
      'Customer Dues Register me customer name, mobile, bike model, aur baki pending amount record karein.',
      'Jab customer baki paise jama kare, tab "Record Payment" dabakar balance update/clear karein.',
    ],
    tips: [
      'Mobile number type karke kisi bhi grahak ka khata record turant khojein.',
    ],
  },

  // 9. Operating Expenses
  'Operating Expenses': {
    title: 'Operating Expenses (OPEX) Guide',
    summary: 'Daily garage expenses (Rent, Electricity, Tea, Tools, Salary) aur 3-Account Notebook Ledger math.',
    steps: [
      'Expense Title, Category, aur Amount enter karein.',
      'Paid From Account select karein: Garage Account, Imran Pathan Account, ya Naim Pathan Account.',
      '3-Account Notebook Summary widget me har account ka total kharcha alag-alag dikhega.',
    ],
    tips: [
      'Partner accounts se kiye gaye out-of-pocket kharche monthly profit settlement me adjust hote hain.',
    ],
  },

  // 10. Settlement Calculator
  'Settlement Calculator': {
    title: 'Live Settlement Calculator Guide',
    summary: 'Partner 50/50 equity profit distribution aur advance draws ka live calculation.',
    steps: [
      'Total Revenue aur Garage Expenses enter karte hi Net Profit live calculate ho jayega.',
      'Naim Pathan Advance Draw aur Imran Pathan Advance Draw enter karein.',
      'System Naim Pathan (50%) aur Imran Pathan (50%) ka Net Payout Share live calculate karke dikhayega.',
    ],
    tips: [
      'Reset Calculator button dabakar form inputs clear kar sakte hain.',
    ],
  },

  // 11. Smart Keywords Master
  'Smart Keywords Master': {
    title: 'Smart Keywords Master Guide',
    summary: 'Global Master Terms list aur typo-tolerant recommendation engine manage karein.',
    steps: [
      'Master Keywords page par naye terms (e.g. Tyre, Brake Pad, Engine Oil) add, edit, ya delete karein.',
      'Poori website ke har input box me typing karte waqt smart recommendations automatic show hongi.',
      'Typo-Tolerant Engine spelling mistake karne par bhi sahi word suggest karega (e.g. `tayer` ➔ Tyre, `brek` ➔ Brake Pad).',
    ],
    tips: [
      'Pencil icon dabakar kisi bhi keyword ko edit kar sakte hain.',
    ],
  },

  // 12. User Guide
  'User Guide & System Manual': {
    title: 'User Guide & Documentation Center',
    summary: 'National Auto Garage website ke har ek feature, workflow, shortcuts, aur calculation ko samajhne ke liye complete official guide.',
    steps: [
      'Top search bar me topic name (e.g. Job Card, Bill, WhatsApp, Tyre) type karke help articles khojein.',
      'Direct Page Jump shortcuts se 1-click me kisi bhi page par navigate karein.',
    ],
    tips: [
      'Har page par top-right corner me "How to Use" icon button dabakar us specific page ki guide dekh sakte hain.',
    ],
  },
};
