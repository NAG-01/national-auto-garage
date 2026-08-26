import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    garageName: 'National Auto Garage',
    tagline: 'Two-Wheeler Service & Repair Specialists',
    phone: '+91 98765 43210',
    email: 'contact@nationalautogarage.com',
    address: 'Shop No. 4, Garage Hub, Main Road, City',
    gstNumber: '',
    currencySymbol: '₹',
    invoicePrefix: 'INV',
    jobIdPrefix: 'NAG',
    duesPrefix: 'DUE',
    expensePrefix: 'EXP',
    portalBadgeText: 'ADMIN PORTAL',
    topbarContextText: 'Workshop System',
    brandNameMain: 'National Auto',
    brandNameSub: 'Garage Portal',
    invoiceFooterNote: 'Thank you for choosing National Auto Garage! Safe Riding.',
  });
  const [loading, setLoading] = useState(true);

  const extractSettings = (res) => {
    if (!res) return null;
    if (res.data && typeof res.data === 'object' && (res.data.garageName || res.data.portalBadgeText)) {
      return res.data;
    }
    if (res.garageName || res.portalBadgeText) {
      return res;
    }
    return res.data || res;
  };

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      const payload = extractSettings(res);
      if (payload) {
        setSettings((prev) => ({ ...prev, ...payload }));
      }
    } catch (err) {
      console.warn('Failed to load settings from server, using defaults.', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettingsData) => {
    const res = await api.put('/settings', newSettingsData);
    const payload = extractSettings(res);
    if (payload) {
      setSettings((prev) => ({ ...prev, ...payload }));
    }
    return payload;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        fetchSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
