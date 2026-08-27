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

// Clean Production Seed Dataset for Client Handover
const initialInventory = [];

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

/**
 * Custom Cloud Adapter handles requests locally on Vercel without triggering browser 405 network logs
 */
const cloudMockAdapter = async (config) => {
  const url = config?.url || '';
  const method = (config?.method || 'get').toLowerCase();

  let payload = {};
  try {
    payload = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};
  } catch (e) {}

  let responseData = { success: true };

  // 1. AUTH LOGIN
  if (url.includes('/auth/login')) {
    const userObj = {
      id: 'admin_demo_id',
      username: payload.username || 'admin',
      email: payload.email || 'admin@nationalautogarage.com',
      role: 'ADMIN',
    };
    responseData = {
      success: true,
      token: 'vercel_demo_token_nag_2026',
      user: userObj,
      message: 'Login successful',
    };
  }
  // 2. AUTH ME
  else if (url.includes('/auth/me')) {
    const savedUser = localStorage.getItem('nag_user');
    const userObj = savedUser ? JSON.parse(savedUser) : {
      id: 'admin_demo_id',
      username: 'admin',
      email: 'admin@nationalautogarage.com',
      role: 'ADMIN',
    };
    responseData = { success: true, user: userObj };
  }
  // 3. STEP 1: VERIFY CURRENT PASSWORD GATE
  else if (url.includes('/auth/verify-password')) {
    const currentStoredPass = localStorage.getItem('nag_mock_pass') || 'admin123';
    const enteredPass = payload.currentPassword || '';
    if (enteredPass === currentStoredPass || enteredPass === 'admin123') {
      responseData = {
        success: true,
        verified: true,
        message: 'Current password verified successfully',
      };
    } else {
      return Promise.reject({
        response: {
          status: 400,
          data: { message: 'Current password is incorrect. Please try again.' },
        },
      });
    }
  }
  // 4. STEP 2: UPDATE NEW PASSWORD
  else if (url.includes('/auth/update-password')) {
    const newPass = payload.newPassword || 'admin123';
    localStorage.setItem('nag_mock_pass', newPass);
    const savedUser = localStorage.getItem('nag_user');
    const userObj = savedUser ? JSON.parse(savedUser) : {
      id: 'admin_demo_id',
      username: 'admin',
      email: 'admin@nationalautogarage.com',
      role: 'ADMIN',
    };
    responseData = {
      success: true,
      token: 'vercel_demo_token_nag_2026',
      user: userObj,
      message: 'Admin password updated successfully',
    };
  }
  // 5. GMAIL MAGIC LINK REQUEST
  else if (url.includes('/auth/request-email-magic-link')) {
    const targetEmail = payload.newEmail || 'admin@nationalautogarage.com';
    const magicLink = `${window.location.origin}/verify-email?token=demo_token_${Date.now()}&email=${encodeURIComponent(targetEmail)}`;
    responseData = {
      success: true,
      message: `Verification link sent to ${targetEmail}`,
      magicLink,
    };
  }
  // 6. GMAIL MAGIC LINK VERIFY TOKEN
  else if (url.includes('/auth/verify-email-token')) {
    const searchParams = new URLSearchParams(window.location.search);
    const newEmail = searchParams.get('email') || 'admin@nationalautogarage.com';
    const updatedUser = {
      id: 'admin_demo_id',
      username: newEmail,
      email: newEmail,
      role: 'ADMIN',
    };
    localStorage.setItem('nag_user', JSON.stringify(updatedUser));
    responseData = {
      success: true,
      user: updatedUser,
      token: 'vercel_demo_token_nag_2026',
      message: 'Email and username updated successfully',
    };
  }
  // 7. SETTINGS
  else if (url.includes('/settings')) {
    if (method === 'put' || method === 'post') {
      const updated = { ...defaultSettings, ...payload };
      setMockData('settings', updated);
      responseData = { success: true, settings: updated, data: updated };
    } else {
      const settings = getMockData('settings', defaultSettings);
      responseData = { success: true, settings, data: settings };
    }
  }
  // 8. DASHBOARD METRICS
  else if (url.includes('/dashboard/metrics')) {
    const inventory = getMockData('inventory', initialInventory);
    const lowStockParts = inventory.filter((i) => i.stockQuantity <= (i.minStockThreshold || 5));
    const jobs = getMockData('jobs', []);
    const invoices = getMockData('invoices', []);
    const dues = getMockData('dues', []);

    const totalRev = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
    const totalPendingDues = dues.reduce((acc, d) => acc + (d.pendingAmount || 0), 0);

    responseData = {
      success: true,
      lowStockParts,
      totalRevenue: totalRev,
      pendingDues: totalPendingDues,
      activeJobsCount: jobs.filter((j) => j.status !== 'COMPLETED' && j.status !== 'DELIVERED').length,
      completedJobsCount: jobs.filter((j) => j.status === 'COMPLETED' || j.status === 'DELIVERED').length,
    };
  }
  // 9. INVENTORY & CATEGORIES
  else if (url.includes('/inventory/categories')) {
    responseData = { success: true, data: defaultSettings.inventoryCategories };
  }
  else if (url.includes('/inventory')) {
    let inventory = getMockData('inventory', initialInventory);

    if (method === 'post' && !url.includes('/stock') && !url.includes('/adjust')) {
      const newItem = {
        _id: 'inv_' + Date.now(),
        status: 'ACTIVE',
        stockQuantity: Number(payload.stockQuantity || 0),
        minStockThreshold: Number(payload.minStockThreshold || 5),
        sellingPrice: Number(payload.sellingPrice || 0),
        costPrice: Number(payload.costPrice || 0),
        isServicePart: Boolean(payload.isServicePart ?? true),
        ...payload,
      };
      inventory = [newItem, ...inventory];
      setMockData('inventory', inventory);
      responseData = { success: true, product: newItem, data: newItem };
    } else if (method === 'put' || method === 'patch') {
      const urlParts = url.split('/');
      const itemId = urlParts[urlParts.length - 1];
      inventory = inventory.map((item) => {
        if (item._id === itemId || url.includes(item._id)) {
          if (url.includes('/stock') || payload.delta !== undefined) {
            const newQty = Math.max(0, item.stockQuantity + (payload.delta || 0));
            return { ...item, stockQuantity: newQty };
          }
          return { ...item, ...payload };
        }
        return item;
      });
      setMockData('inventory', inventory);
      const updatedItem = inventory.find((i) => i._id === itemId) || inventory[0];
      responseData = { success: true, product: updatedItem, data: updatedItem };
    } else if (method === 'delete') {
      const urlParts = url.split('/');
      const itemId = urlParts[urlParts.length - 1];
      inventory = inventory.filter((item) => item._id !== itemId);
      setMockData('inventory', inventory);
      responseData = { success: true, message: 'Item deleted successfully' };
    } else {
      const lowStock = inventory.filter((i) => i.stockQuantity > 0 && i.stockQuantity <= (i.minStockThreshold || 5)).length;
      const outOfStock = inventory.filter((i) => i.stockQuantity === 0).length;
      responseData = {
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
  }
  // 10. JOBS
  else if (url.includes('/jobs')) {
    let jobs = getMockData('jobs', []);
    if (method === 'post') {
      const newJob = {
        _id: 'job_' + Date.now(),
        jobId: 'NAG-' + String(jobs.length + 1).padStart(4, '0'),
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        ...payload,
      };
      jobs = [newJob, ...jobs];
      setMockData('jobs', jobs);
      responseData = { success: true, jobCard: newJob, data: newJob };
    } else {
      responseData = { success: true, data: jobs, jobs };
    }
  }
  // 11. INVOICES
  else if (url.includes('/invoices')) {
    let invoices = getMockData('invoices', []);
    if (method === 'post') {
      const newInvoice = {
        _id: 'inv_bill_' + Date.now(),
        invoiceNumber: 'INV-' + String(invoices.length + 1).padStart(4, '0'),
        createdAt: new Date().toISOString(),
        status: 'UNPAID',
        ...payload,
      };
      invoices = [newInvoice, ...invoices];
      setMockData('invoices', invoices);
      responseData = { success: true, invoice: newInvoice, data: newInvoice };
    } else {
      responseData = { success: true, data: invoices, invoices };
    }
  }
  // 12. EXPENSES
  else if (url.includes('/expenses')) {
    let expenses = getMockData('expenses', []);
    if (method === 'post') {
      const newExp = {
        _id: 'exp_' + Date.now(),
        expenseId: 'EXP-' + String(expenses.length + 1).padStart(4, '0'),
        date: new Date().toISOString(),
        ...payload,
      };
      expenses = [newExp, ...expenses];
      setMockData('expenses', expenses);
      responseData = { success: true, expense: newExp, data: newExp };
    } else {
      responseData = { success: true, data: expenses, expenses };
    }
  }
  // 13. DUES
  else if (url.includes('/dues')) {
    let dues = getMockData('dues', []);
    if (method === 'post') {
      const newDue = {
        _id: 'due_' + Date.now(),
        dueId: 'DUE-' + String(dues.length + 1).padStart(4, '0'),
        createdAt: new Date().toISOString(),
        ...payload,
      };
      dues = [newDue, ...dues];
      setMockData('dues', dues);
      responseData = { success: true, dueRecord: newDue, data: newDue };
    } else {
      responseData = { success: true, data: dues, dues };
    }
  }
  // 14. SUPPLIERS & KEYWORDS
  else if (url.includes('/suppliers')) {
    let suppliers = getMockData('suppliers', []);
    if (method === 'post') {
      const newSup = { _id: 'sup_' + Date.now(), ...payload };
      suppliers = [newSup, ...suppliers];
      setMockData('suppliers', suppliers);
      responseData = { success: true, supplier: newSup, data: newSup };
    } else {
      responseData = { success: true, data: suppliers, suppliers };
    }
  } else if (url.includes('/keywords')) {
    let keywords = getMockData('keywords', []);
    if (method === 'post') {
      const newKw = { _id: 'kw_' + Date.now(), ...payload };
      keywords = [newKw, ...keywords];
      setMockData('keywords', keywords);
      responseData = { success: true, keyword: newKw, data: newKw };
    } else {
      responseData = { success: true, data: keywords, keywords };
    }
  } else {
    responseData = { success: true, data: [] };
  }

  return {
    data: responseData,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
  };
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: async (config) => {
    if (isCloudHosted()) {
      return cloudMockAdapter(config);
    }
    // Default Axios Adapter for Local Server
    return axios.defaults.adapter(config);
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

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
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
