import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
  businessName: 'ማእድ Food Delivery',
  supportEmail: 'support@maed.com',
  supportPhone: '+251 900 000 000',
  currency: 'ETB',
  deliveryFee: 50,
  commissionRate: 15,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await API.get('/admin/settings');
      if (response.data) {
        setSettings({
          businessName: response.data.businessName || DEFAULT_SETTINGS.businessName,
          supportEmail: response.data.supportEmail || DEFAULT_SETTINGS.supportEmail,
          supportPhone: response.data.supportPhone || DEFAULT_SETTINGS.supportPhone,
          currency: response.data.currency || DEFAULT_SETTINGS.currency,
          deliveryFee: response.data.deliveryFee !== undefined && response.data.deliveryFee !== null
            ? Number(response.data.deliveryFee)
            : DEFAULT_SETTINGS.deliveryFee,
          commissionRate: response.data.commissionRate !== undefined && response.data.commissionRate !== null
            ? Number(response.data.commissionRate)
            : DEFAULT_SETTINGS.commissionRate,
        });
      }
    } catch (err) {
      console.warn('Could not load dynamic settings, using fallback defaults:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        deliveryFee: settings.deliveryFee,
        currency: settings.currency,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        businessName: settings.businessName,
        commissionRate: settings.commissionRate,
        loading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    return {
      settings: DEFAULT_SETTINGS,
      deliveryFee: DEFAULT_SETTINGS.deliveryFee,
      currency: DEFAULT_SETTINGS.currency,
      supportEmail: DEFAULT_SETTINGS.supportEmail,
      supportPhone: DEFAULT_SETTINGS.supportPhone,
      businessName: DEFAULT_SETTINGS.businessName,
      commissionRate: DEFAULT_SETTINGS.commissionRate,
      loading: false,
      refreshSettings: () => {},
    };
  }
  return context;
}
