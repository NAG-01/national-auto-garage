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

export const SettingsService = {
  async getSettings() {
    try {
      const settingsRef = doc(db, 'settings', 'global');
      const snap = await getDoc(settingsRef);
      if (snap && snap.exists()) {
        return { ...defaultSettings, ...snap.data() };
      }
      try {
        await setDoc(settingsRef, defaultSettings, { merge: true });
      } catch (e) {}
      return defaultSettings;
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
      return { ...defaultSettings, ...updated };
    } catch (e) {
      return { ...defaultSettings, ...newSettings };
    }
  },
};
