import axios from 'axios';
import { AuthService } from '../services/authService.js';
import { InventoryService } from '../services/inventoryService.js';
import { JobService } from '../services/jobService.js';
import { BillingService } from '../services/billingService.js';
import { OutstandingService } from '../services/outstandingService.js';
import { ExpenseService } from '../services/expenseService.js';
import { SupplierService } from '../services/supplierService.js';
import { KeywordService } from '../services/keywordService.js';
import { SettingsService } from '../services/settingsService.js';
import { DashboardService } from '../services/dashboardService.js';

/**
 * Universal Direct Firebase Adapter
 * Routes all API calls directly to Cloud Firestore & Firebase Auth services
 * with offline IndexedDB local caching and atomic sequence transactions.
 */
const firebaseApiAdapter = async (config) => {
  const url = (config?.url || '').replace(/^\/api/, '');
  const method = (config?.method || 'get').toLowerCase();

  let payload = {};
  try {
    payload = config.data
      ? typeof config.data === 'string'
        ? JSON.parse(config.data)
        : config.data
      : {};
  } catch (e) {}

  const params = config?.params || {};

  try {
    let resultData = { success: true };

    // --- 1. AUTHENTICATION ---
    if (url.includes('/auth/login')) {
      const user = await AuthService.login(payload.username || payload.email || payload.identifier, payload.password);
      resultData = { success: true, user, token: 'firebase_auth_token_' + user.id, message: 'Login successful' };
    } else if (url.includes('/auth/me')) {
      const user = AuthService.getCurrentUser();
      resultData = { success: true, user, data: { user } };
    } else if (url.includes('/auth/verify-password')) {
      await AuthService.verifyPassword(payload.currentPassword);
      resultData = { success: true, verified: true, message: 'Current password verified' };
    } else if (url.includes('/auth/update-password') || url.includes('/auth/update-credentials')) {
      const res = await AuthService.updateCredentials(payload);
      resultData = { success: true, ...res };
    }

    // --- 2. SETTINGS ---
    else if (url.startsWith('/settings') || url === '/settings') {
      if (method === 'put' || method === 'post') {
        const updated = await SettingsService.updateSettings(payload);
        resultData = { success: true, settings: updated, data: updated };
      } else {
        const settings = await SettingsService.getSettings();
        resultData = { success: true, settings, data: settings, ...settings };
      }
    }

    // --- 3. DASHBOARD METRICS & STOCK ALERTS ---
    else if (url.includes('/dashboard/metrics')) {
      const metrics = await DashboardService.getMetrics();
      resultData = { success: true, ...metrics, data: metrics };
    }

    // --- 4. INVENTORY ---
    else if (url.startsWith('/inventory')) {
      if (url.includes('/categories')) {
        const settings = await SettingsService.getSettings();
        resultData = { success: true, data: settings.inventoryCategories || [] };
      } else if (url.includes('/adjust-stock') || (method === 'post' && url.includes('/stock'))) {
        const idMatch = url.match(/\/inventory\/([^/]+)\/adjust-stock/);
        const prodId = idMatch ? idMatch[1] : (payload.productId || payload._id || payload.id);
        const res = await InventoryService.adjustStock(prodId, payload);
        resultData = { success: true, ...res };
      } else if (url.includes('/movements')) {
        const idMatch = url.match(/\/inventory\/([^/]+)\/movements/);
        const prodId = idMatch ? idMatch[1] : params.productId;
        const res = await InventoryService.getMovements(prodId, params);
        resultData = { success: true, ...res, data: res };
      } else if (method === 'post') {
        const product = await InventoryService.createProduct(payload);
        resultData = { success: true, product, data: product };
      } else if (method === 'put' || method === 'patch') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        const product = await InventoryService.updateProduct(id, payload);
        resultData = { success: true, product, data: product };
      } else if (method === 'delete') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        await InventoryService.deleteProduct(id);
        resultData = { success: true, message: 'Product deleted successfully' };
      } else if (url.match(/\/inventory\/([^/?]+)$/)) {
        const parts = url.split('?')[0].split('/');
        const id = parts[parts.length - 1];
        const res = await InventoryService.getProductById(id);
        resultData = { success: true, ...res, data: res.product };
      } else {
        const res = await InventoryService.getProducts(params);
        resultData = { success: true, ...res, data: res };
      }
    }

    // --- 5. JOB CARDS ---
    else if (url.startsWith('/jobs')) {
      if (url.includes('/status') && (method === 'patch' || method === 'post' || method === 'put')) {
        const idMatch = url.match(/\/jobs\/([^/]+)\/status/);
        const jobId = idMatch ? idMatch[1] : payload.jobId;
        const job = await JobService.updateJobStatus(jobId, payload.status || payload.newStatus);
        resultData = { success: true, job, data: job };
      } else if (method === 'post') {
        const job = await JobService.createJob(payload);
        resultData = { success: true, jobCard: job, job, data: job };
      } else if (method === 'patch' || method === 'put') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        const job = await JobService.updateJob(id, payload);
        resultData = { success: true, jobCard: job, job, data: job };
      } else if (method === 'delete') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        await JobService.deleteJob(id);
        resultData = { success: true, message: 'Job deleted successfully' };
      } else if (url.match(/\/jobs\/([^/?]+)$/)) {
        const parts = url.split('?')[0].split('/');
        const id = parts[parts.length - 1];
        const job = await JobService.getJobById(id);
        resultData = { success: true, job, data: job };
      } else {
        const res = await JobService.getJobs(params);
        resultData = { success: true, ...res, data: res.jobs };
      }
    }

    // --- 6. BILLS & INVOICES ---
    else if (url.startsWith('/invoices') || url.startsWith('/bills')) {
      if (url.includes('/payments') && method === 'post') {
        const idMatch = url.match(/\/(?:invoices|bills)\/([^/]+)\/payments/);
        const billId = idMatch ? idMatch[1] : payload.billId;
        const res = await BillingService.recordPayment({ billId, ...payload });
        resultData = { success: true, ...res };
      } else if (method === 'post') {
        const bill = await BillingService.createBill(payload);
        resultData = { success: true, invoice: bill, bill, data: bill };
      } else if (method === 'delete') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        await BillingService.deleteBill(id);
        resultData = { success: true, message: 'Invoice deleted successfully' };
      } else if (url.match(/\/(?:invoices|bills)\/([^/?]+)$/)) {
        const parts = url.split('?')[0].split('/');
        const id = parts[parts.length - 1];
        const bill = await BillingService.getBillById(id);
        resultData = { success: true, invoice: bill, bill, data: bill };
      } else {
        const res = await BillingService.getBills(params);
        resultData = { success: true, ...res, data: res.bills };
      }
    }

    // --- 7. OUTSTANDING / KHATA (DUES) ---
    else if (url.startsWith('/outstanding') || url.startsWith('/dues')) {
      if (method === 'post') {
        const record = await OutstandingService.createOutstandingRecord(payload);
        resultData = { success: true, dueRecord: record, record, data: record };
      } else if (method === 'put' || method === 'patch') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        const record = await OutstandingService.updateOutstandingRecord(id, payload);
        resultData = { success: true, dueRecord: record, record, data: record };
      } else if (method === 'delete') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        await OutstandingService.deleteOutstandingRecord(id);
        resultData = { success: true, message: 'Outstanding dues record deleted' };
      } else {
        const res = await OutstandingService.getOutstandingRecords(params);
        resultData = { success: true, ...res, data: res.records };
      }
    }

    // --- 8. EXPENSES (3-ACCOUNTS) ---
    else if (url.startsWith('/expenses')) {
      if (url.includes('/bulk-delete') && method === 'post') {
        const res = await ExpenseService.bulkDeleteExpenses(payload.ids);
        resultData = { success: true, ...res };
      } else if (method === 'post') {
        const exp = await ExpenseService.createExpense(payload);
        resultData = { success: true, expense: exp, data: exp };
      } else if (method === 'put' || method === 'patch') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        const exp = await ExpenseService.updateExpense(id, payload);
        resultData = { success: true, expense: exp, data: exp };
      } else if (method === 'delete') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        await ExpenseService.deleteExpense(id);
        resultData = { success: true, message: 'Expense entry deleted' };
      } else {
        const res = await ExpenseService.getExpenses(params);
        resultData = { success: true, ...res, data: res };
      }
    }

    // --- 9. SUPPLIERS & PURCHASE ORDERS ---
    else if (url.startsWith('/supplier-orders')) {
      if (method === 'post') {
        const order = await SupplierService.createSupplierOrder(payload);
        resultData = { success: true, order, data: order };
      } else if (method === 'delete') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        await SupplierService.deleteSupplierOrder(id);
        resultData = { success: true, message: 'Supplier order deleted' };
      } else {
        const res = await SupplierService.getSupplierOrders(params);
        resultData = { success: true, ...res, data: res.orders };
      }
    } else if (url.startsWith('/suppliers')) {
      if (method === 'post') {
        const sup = await SupplierService.createSupplier(payload);
        resultData = { success: true, supplier: sup, data: sup };
      } else if (method === 'patch' || method === 'put') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        const sup = await SupplierService.updateSupplier(id, payload);
        resultData = { success: true, supplier: sup, data: sup };
      } else if (method === 'delete') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        await SupplierService.deleteSupplier(id);
        resultData = { success: true, message: 'Supplier deleted' };
      } else {
        const res = await SupplierService.getSuppliers(params);
        resultData = { success: true, ...res, data: res.suppliers };
      }
    }

    // --- 10. MASTER KEYWORDS ---
    else if (url.startsWith('/master-keywords') || url.startsWith('/keywords')) {
      if (url.includes('/bulk-delete') && method === 'post') {
        const res = await KeywordService.bulkDeleteKeywords(payload.ids);
        resultData = { success: true, ...res };
      } else if (method === 'post') {
        const kw = await KeywordService.createKeyword(payload.word);
        resultData = { success: true, keyword: kw, data: kw };
      } else if (method === 'put' || method === 'patch') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        const kw = await KeywordService.updateKeyword(id, payload.word);
        resultData = { success: true, keyword: kw, data: kw };
      } else if (method === 'delete') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        await KeywordService.deleteKeyword(id);
        resultData = { success: true, message: 'Keyword deleted' };
      } else {
        const list = await KeywordService.getKeywords();
        resultData = { success: true, data: list, keywords: list };
      }
    } else {
      resultData = { success: true, data: [] };
    }

    return {
      data: resultData,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
    };
  } catch (err) {
    console.error(`Firebase API Adapter error on [${method.toUpperCase()}] ${url}:`, err);
    return Promise.reject({
      response: {
        status: 400,
        data: { message: err.message || 'Operation failed' },
      },
      message: err.message || 'Operation failed',
    });
  }
};

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: firebaseApiAdapter,
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const customMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
