import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return '/api';
};

const isCloudHosted = () => {
  return (
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('github.io')
  );
};

// Initial Full Garage Seed Dataset for Standalone Cloud Hosting
const initialInventory = [
  { _id: 'inv_1', name: 'Castrol Activ 4T 20W-40 Engine Oil (1L)', partNumber: 'OIL-20W40-1L', category: 'Engine Oil', stockQuantity: 25, minStockThreshold: 5, sellingPrice: 380, costPrice: 310, status: 'ACTIVE', isServicePart: true },
  { _id: 'inv_2', name: 'Front Brake Pad / Shoe (Hero Splendor / Passion)', partNumber: 'BP-HERO-01', category: 'Brake Pads', stockQuantity: 3, minStockThreshold: 5, sellingPrice: 180, costPrice: 130, status: 'ACTIVE', isServicePart: true },
  { _id: 'inv_3', name: 'NGK Spark Plug CPR8EA-9', partNumber: 'SP-NGK-8EA', category: 'Spark Plugs', stockQuantity: 18, minStockThreshold: 5, sellingPrice: 120, costPrice: 85, status: 'ACTIVE', isServicePart: true },
  { _id: 'inv_4', name: 'Drive Chain & Sprocket Kit (Bajaj Pulsar 150)', partNumber: 'CS-PULSAR-150', category: 'Chain & Sprockets', stockQuantity: 8, minStockThreshold: 3, sellingPrice: 1450, costPrice: 1100, status: 'ACTIVE', isServicePart: true },
  { _id: 'inv_5', name: 'Air Filter Element (Honda Activa 5G/6G)', partNumber: 'AF-ACTIVA-5G', category: 'Filters', stockQuantity: 14, minStockThreshold: 5, sellingPrice: 220, costPrice: 160, status: 'ACTIVE', isServicePart: true },
  { _id: 'inv_6', name: 'TVS Eurogrip Tyre 90/90-12 Tubeless', partNumber: 'TY-TVS-909012', category: 'Tyres', stockQuantity: 0, minStockThreshold: 2, sellingPrice: 1250, costPrice: 980, status: 'ACTIVE', isServicePart: false },
  { _id: 'inv_7', name: 'Clutch Cable (TVS Apache RTR 160)', partNumber: 'CB-APACHE-CL', category: 'General Parts', stockQuantity: 10, minStockThreshold: 3, sellingPrice: 160, costPrice: 110, status: 'ACTIVE', isServicePart: true },
  { _id: 'inv_8', name: 'Motul Chain Lube Spray (400ml)', partNumber: 'LB-MOTUL-400', category: 'General Parts', stockQuantity: 15, minStockThreshold: 4, sellingPrice: 490, costPrice: 380, status: 'ACTIVE', isServicePart: false },
];

const getMockData = (key, defaultVal) => {
  try {
    const saved = localStorage.getItem(`nag_mock_${key}`);
    return saved ? JSON.parse(saved) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setMockData = (key, val) => {
  try {
    localStorage.setItem(`nag_mock_${key}`, JSON.stringify(val));
  } catch (e) {}
};

const defaultSettings = {
  garageName: 'National Auto Garage',
  tagline: 'Two-Wheeler Service & Repair Specialists',
  phone: '+91 98765 43210',
  email: 'admin@nationalautogarage.com',
  address: 'Shop No. 4, Garage Hub, Main Road, City',
  currencySymbol: '₹',
  dateFormat: 'DD/MM/YYYY',
  invoicePrefix: 'INV',
  jobIdPrefix: 'NAG',
  duesPrefix: 'DUE',
  expensePrefix: 'EXP',
  portalBadgeText: 'ADMIN PORTAL',
  topbarContextText: 'Workshop System',
  inventoryCategories: ['Engine Oil', 'Brake Pads', 'Filters', 'Chain & Sprockets', 'Tyres', 'Spark Plugs', 'General Parts'],
  expenseCategories: ['Shop Rent', 'Electricity & Utility', 'Mechanic Salary', 'Tea & Refreshments', 'Tool Purchase', 'Misc Maintenance'],
  paymentMethods: ['Cash', 'UPI / GPay / PhonePe', 'Bank Transfer (IMPS/NEFT)', 'Card'],
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nag_token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with Vercel Cloud Fallback Mode
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config;
    const url = config?.url || '';
    const isCloud = isCloudHosted();
    const isNetworkOr404Err = !error.response || error.response.status === 404 || error.response.status === 405;

    // Handle Standalone Vercel Cloud Fallback
    if (isCloud || isNetworkOr404Err) {
      console.warn(`[Vercel Mode] Processing request locally: ${url}`);

      // 1. AUTH LOGIN
      if (url.includes('/auth/login')) {
        const body = JSON.parse(config.data || '{}');
        const userObj = {
          id: 'admin_demo_id',
          username: body.username || 'admin',
          email: body.email || 'admin@nationalautogarage.com',
          role: 'ADMIN',
        };
        return {
          success: true,
          token: 'vercel_demo_token_nag_2026',
          user: userObj,
          message: 'Login successful',
        };
      }

      // 2. AUTH ME
      if (url.includes('/auth/me')) {
        const savedUser = localStorage.getItem('nag_user');
        const userObj = savedUser ? JSON.parse(savedUser) : {
          id: 'admin_demo_id',
          username: 'admin',
          email: 'admin@nationalautogarage.com',
          role: 'ADMIN',
        };
        return { success: true, user: userObj };
      }

      // 3. SETTINGS
      if (url.includes('/settings')) {
        if (config.method === 'put' || config.method === 'post') {
          const updated = { ...defaultSettings, ...JSON.parse(config.data || '{}') };
          setMockData('settings', updated);
          return { success: true, settings: updated, data: updated };
        }
        const settings = getMockData('settings', defaultSettings);
        return { success: true, settings, data: settings };
      }

      // 4. DASHBOARD METRICS
      if (url.includes('/dashboard/metrics')) {
        const inventory = getMockData('inventory', initialInventory);
        const lowStockParts = inventory.filter((i) => i.stockQuantity <= (i.minStockThreshold || 5));
        return {
          success: true,
          lowStockParts,
          totalRevenue: 45200,
          pendingDues: 3400,
          activeJobsCount: 4,
          completedJobsCount: 28,
        };
      }

      // 5. INVENTORY & CATEGORIES
      if (url.includes('/inventory/categories')) {
        return { success: true, data: defaultSettings.inventoryCategories };
      }
      if (url.includes('/inventory')) {
        const inventory = getMockData('inventory', initialInventory);
        const lowStock = inventory.filter((i) => i.stockQuantity > 0 && i.stockQuantity <= (i.minStockThreshold || 5)).length;
        const outOfStock = inventory.filter((i) => i.stockQuantity === 0).length;
        return {
          success: true,
          data: {
            products: inventory,
            summary: {
              totalProducts: inventory.length,
              activeProducts: inventory.length,
              lowStockCount: lowStock,
              outOfStockCount: outOfStock,
            },
          },
          products: inventory,
          summary: {
            totalProducts: inventory.length,
            activeProducts: inventory.length,
            lowStockCount: lowStock,
            outOfStockCount: outOfStock,
          },
        };
      }

      // 6. JOBS
      if (url.includes('/jobs')) {
        const jobs = getMockData('jobs', []);
        return { success: true, data: jobs, jobs };
      }

      // 7. INVOICES / BILLING
      if (url.includes('/invoices')) {
        const invoices = getMockData('invoices', []);
        return { success: true, data: invoices, invoices };
      }

      // 8. EXPENSES
      if (url.includes('/expenses')) {
        const expenses = getMockData('expenses', []);
        return { success: true, data: expenses, expenses };
      }

      // 9. DUES & RECEIVABLES
      if (url.includes('/dues')) {
        const dues = getMockData('dues', []);
        return { success: true, data: dues, dues };
      }

      // 10. KEYWORDS & SUPPLIERS
      if (url.includes('/keywords')) {
        const keywords = getMockData('keywords', []);
        return { success: true, data: keywords, keywords };
      }
      if (url.includes('/suppliers')) {
        const suppliers = getMockData('suppliers', []);
        return { success: true, data: suppliers, suppliers };
      }

      return { success: true, data: [] };
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('nag_token');
      localStorage.removeItem('nag_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const customMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
