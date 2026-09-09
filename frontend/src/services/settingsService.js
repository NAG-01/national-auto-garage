import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

export const defaultSettings = {
  garageName: 'National Auto Garage',
  tagline: 'Two-Wheeler Service & Repair Specialists',
  phone: '+91 98765 43210',
  alternatePhone: '',
  email: 'contact@nationalautogarage.com',
  address: 'Shop No. 4, Garage Hub, Main Road, City',
  gstNumber: '',
  currencySymbol: '₹',
  dateFormat: 'DD/MM/YYYY',
  invoicePrefix: 'INV',
  jobIdPrefix: 'NAG',
  duesPrefix: 'DUE',
  expensePrefix: 'EXP',
  portalBadgeText: 'ADMIN PORTAL',
  topbarContextText: 'Workshop System',
  brandNameMain: 'National Auto',
  brandNameSub: 'Garage Portal',
  invoiceFooterNote: 'Thank you for choosing National Auto Garage! Safe Riding.',
  inventoryCategories: [
    'Engine Oil',
    'Brake Pads',
    'Filters',
    'Chain & Sprockets',
    'Tyres',
    'Spark Plugs',
    'General Parts',
  ],
  expenseCategories: [
    'Shop Rent',
    'Electricity & Utility',
    'Mechanic Salary',
    'Tea & Refreshments',
    'Tool Purchase',
    'Misc Maintenance',
  ],
  paymentMethods: [
    'Cash',
    'UPI / GPay / PhonePe',
    'Bank Transfer (IMPS/NEFT)',
    'Card',
  ],
};

const SETTINGS_CACHE_KEY = 'nag_settings_cache';
const SETTINGS_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache to minimize Firestore read quota

export const SettingsService = {
  async getSettings() {
    // 1. Check local cache to save Firestore reads
    try {
      const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < SETTINGS_CACHE_TTL_MS && data) {
          return { ...defaultSettings, ...data };
        }
      }
    } catch (e) {}

    // 2. Fetch from Firestore if cache expired or missing
    try {
      const settingsRef = doc(db, 'settings', 'global');
      const snap = await getDoc(settingsRef);
      let result = defaultSettings;
      if (snap && snap.exists()) {
        result = { ...defaultSettings, ...snap.data() };
      } else {
        try {
          await setDoc(settingsRef, defaultSettings, { merge: true });
        } catch (e) {}
      }

      // Save to local cache
      try {
        localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({ data: result, timestamp: Date.now() }));
      } catch (e) {}

      return result;
    } catch (e) {
      return defaultSettings;
    }
  },

  async updateSettings(newSettings) {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      const updated = {
        ...newSettings,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(settingsRef, updated, { merge: true });
      const finalSettings = { ...defaultSettings, ...updated };

      // Invalidate and update local cache immediately
      try {
        localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({ data: finalSettings, timestamp: Date.now() }));
      } catch (e) {}

      return finalSettings;
    } catch (e) {
      return { ...defaultSettings, ...newSettings };
    }
  },
};
