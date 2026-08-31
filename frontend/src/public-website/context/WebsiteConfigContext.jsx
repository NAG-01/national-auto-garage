import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteConfigService, defaultWebsiteConfig } from '../../services/websiteConfigService.js';

const WebsiteConfigContext = createContext({
  config: defaultWebsiteConfig,
  loading: false,
  refreshConfig: async () => {},
});

export const WebsiteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultWebsiteConfig);
  const [loading, setLoading] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await WebsiteConfigService.getConfig();
      if (data) {
        setConfig((prev) => ({
          ...defaultWebsiteConfig,
          ...data,
          stats: Array.isArray(data.stats) && data.stats.length > 0 ? data.stats : defaultWebsiteConfig.stats,
          services: Array.isArray(data.services) && data.services.length > 0 ? data.services : defaultWebsiteConfig.services,
          advantages: Array.isArray(data.advantages) && data.advantages.length > 0 ? data.advantages : defaultWebsiteConfig.advantages,
        }));
      }
    } catch (err) {
      console.warn('[WebsiteConfigProvider] Falling back to default configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <WebsiteConfigContext.Provider value={{ config, loading, refreshConfig: fetchConfig }}>
      {children}
    </WebsiteConfigContext.Provider>
  );
};

export const useWebsiteConfig = () => {
  const ctx = useContext(WebsiteConfigContext);
  if (!ctx) {
    return { config: defaultWebsiteConfig, loading: false, refreshConfig: async () => {} };
  }
  return ctx;
};
