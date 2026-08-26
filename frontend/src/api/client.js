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

const isStaticHosting = () => {
  return (
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('vercel.app')
  );
};

// Initial Mock Seed Data for Standalone Client Mode
const getInitialMockData = (key, defaultVal) => {
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

// Response interceptor with graceful Standalone Demo Fallback for GitHub Pages
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config;
    const url = config?.url || '';
    const isStatic = isStaticHosting();
    const isNetworkOr404Err = !error.response || error.response.status === 404 || error.response.status === 405;

    // Handle Standalone Client Fallback on GitHub Pages or when backend server is unreachable
    if (isStatic || isNetworkOr404Err) {
      console.warn(`[NAG Standalone Mode] Handling request locally for: ${url}`);

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
          token: 'demo_jwt_token_nag_2026',
          user: userObj,
          message: 'Login successful (Demo Mode)',
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
          return { success: true, settings: updated };
        }
        const settings = getInitialMockData('settings', defaultSettings);
        return { success: true, settings };
      }

      // 4. DASHBOARD METRICS
      if (url.includes('/dashboard/metrics')) {
        const inventory = getInitialMockData('inventory', [
          { _id: '1', name: 'Castrol 20W40 1L', partNumber: 'OIL-001', stockQuantity: 12, minStockThreshold: 5, sellingPrice: 380, category: 'Engine Oil' },
          { _id: '2', name: 'Front Brake Pad Hero Splendor', partNumber: 'BP-102', stockQuantity: 3, minStockThreshold: 5, sellingPrice: 150, category: 'Brake Pads' },
        ]);
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

      // 5. GENERIC FALLBACK FOR INVENTORY, JOBS, INVOICES, EXPENSES, DUES, KEYWORDS
      if (url.includes('/inventory')) {
        return getInitialMockData('inventory', [
          { _id: '1', name: 'Castrol 20W40 1L', partNumber: 'OIL-001', stockQuantity: 12, minStockThreshold: 5, sellingPrice: 380, category: 'Engine Oil' },
          { _id: '2', name: 'Front Brake Pad Hero Splendor', partNumber: 'BP-102', stockQuantity: 3, minStockThreshold: 5, sellingPrice: 150, category: 'Brake Pads' },
        ]);
      }
      if (url.includes('/jobs')) return getInitialMockData('jobs', []);
      if (url.includes('/invoices')) return getInitialMockData('invoices', []);
      if (url.includes('/expenses')) return getInitialMockData('expenses', []);
      if (url.includes('/dues')) return getInitialMockData('dues', []);
      if (url.includes('/keywords')) return getInitialMockData('keywords', []);
      if (url.includes('/suppliers')) return getInitialMockData('suppliers', []);

      // Return empty array / object fallback to prevent crash
      return [];
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('nag_token');
      localStorage.removeItem('nag_user');
      if (!window.location.hash.includes('login') && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const customMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
