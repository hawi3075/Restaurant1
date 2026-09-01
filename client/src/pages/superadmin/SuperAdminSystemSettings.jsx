import React, { useState, useEffect } from 'react';
import { Settings, Database, Shield, Bell, Mail, Globe, Save, Crown } from 'lucide-react';
import showToast from '../../components/Toast';
import API from '../../services/api';

export default function SuperAdminSystemSettings() {
  const [settings, setSettings] = useState({
    // System
    maintenanceMode: false,
    allowNewRegistrations: true,
    
    // Business
    businessName: '',
    supportEmail: '',
    supportPhone: '',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security
    passwordMinLength: 6,
    sessionTimeout: 60,
    twoFactorAuth: false,
    
    // Features
    enableAIChat: true,
    enableReviews: true,
    enableDelivery: true,
    enableDineIn: true
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await API.get('/settings');
      setSettings(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await API.put('/settings', settings);
      showToast('System settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(error.response?.data?.error || 'Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex-1">
        <p className="font-bold text-gray-900 text-sm">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? 'bg-purple-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-4 rounded-2xl shadow-lg">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-500">Configure system-wide settings and preferences</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black text-gray-900">System Status</h2>
          </div>
          <div className="space-y-4">
            <ToggleSwitch
              checked={settings.maintenanceMode}
              onChange={() => handleToggle('maintenanceMode')}
              label="Maintenance Mode"
              description="When enabled, the system will be unavailable to regular users"
            />
            <ToggleSwitch
              checked={settings.allowNewRegistrations}
              onChange={() => handleToggle('allowNewRegistrations')}
              label="Allow New Registrations"
              description="Allow new customers to register on the platform"
            />
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black text-gray-900">Business Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={settings.businessName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                placeholder="ማእድ Ma'ad Restaurant System"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  name="supportEmail"
                  value={settings.supportEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                  placeholder="support@maad.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Support Phone
                </label>
                <input
                  type="tel"
                  name="supportPhone"
                  value={settings.supportPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                  placeholder="+251 900 000 000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <ToggleSwitch
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              label="Email Notifications"
              description="Send email notifications for orders and updates"
            />
            <ToggleSwitch
              checked={settings.smsNotifications}
              onChange={() => handleToggle('smsNotifications')}
              label="SMS Notifications"
              description="Send SMS notifications to customers"
            />
            <ToggleSwitch
              checked={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
              label="Push Notifications"
              description="Send push notifications to mobile apps"
            />
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black text-gray-900">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password Minimum Length
                </label>
                <input
                  type="number"
                  name="passwordMinLength"
                  value={settings.passwordMinLength}
                  onChange={handleInputChange}
                  min="6"
                  max="20"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleInputChange}
                  min="15"
                  max="480"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                />
              </div>
            </div>
            <ToggleSwitch
              checked={settings.twoFactorAuth}
              onChange={() => handleToggle('twoFactorAuth')}
              label="Two-Factor Authentication"
              description="Require 2FA for admin and super admin accounts"
            />
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Crown className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-black text-gray-900">System Features</h2>
          </div>
          <div className="space-y-4">
            <ToggleSwitch
              checked={settings.enableAIChat}
              onChange={() => handleToggle('enableAIChat')}
              label="AI Chat Assistant"
              description="Enable AI-powered chat support for users"
            />
            <ToggleSwitch
              checked={settings.enableReviews}
              onChange={() => handleToggle('enableReviews')}
              label="Customer Reviews"
              description="Allow customers to leave reviews and ratings"
            />
            <ToggleSwitch
              checked={settings.enableDelivery}
              onChange={() => handleToggle('enableDelivery')}
              label="Delivery Orders"
              description="Enable delivery order functionality"
            />
            <ToggleSwitch
              checked={settings.enableDineIn}
              onChange={() => handleToggle('enableDineIn')}
              label="Dine-In Orders"
              description="Enable dine-in order functionality"
            />
          </div>
        </div>

        {/* Save Button (Bottom) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
