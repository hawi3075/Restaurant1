import React, { useState } from 'react';
import { Globe, Sun, Moon, LogOut, Check, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

// Language Modal for Staff Dashboards (Driver, Waiter, Chef, Admin)
function StaffLanguageModal({ isOpen, onClose }) {
  const { language, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
    { code: 'om', name: 'Afaan Oromoo', native: 'Afaan Oromoo', flag: '🇪🇹' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-orange-100 dark:border-gray-800 overflow-hidden">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500 z-10" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-orange-600 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pt-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('chooseLanguage') || 'Choose Language'}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('selectPreferredLanguage') || 'Select your preferred language'}</p>
            </div>
          </div>

          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  language === lang.code
                    ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  <span className="text-3xl">{lang.flag}</span>
                  <div>
                    <p className="font-bold text-base">{lang.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{lang.native}</p>
                  </div>
                </div>
                {language === lang.code && (
                  <div className="bg-orange-600 text-white p-2 rounded-xl shadow-md">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardHeader({ title }) {
  const { logout, user } = useAuth();
  const { language, t } = useLanguage();
  const { darkMode, toggleTheme } = useTheme();
  const [langModalOpen, setLangModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const getLanguageLabel = () => {
    if (language === 'am') return 'አማርኛ (ET)';
    if (language === 'om') return 'Afaan Oromoo';
    return 'English (US)';
  };

  return (
    <>
      <header className={`h-20 px-8 border-b flex items-center justify-between sticky top-0 z-10 transition-colors ${
        darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        {/* Page Context/Title */}
        <div>
          {title && <h1 className="text-xl font-black">{t(title) || title}</h1>}
          {user && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {user.name} • {user.role}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Profile Button */}
          <button
            onClick={() => {
              const basePath = user.role === 'ADMIN' ? '/admin' : 
                             user.role === 'CHEF' ? '/chef' : 
                             user.role === 'WAITER' ? '/waiter' : 
                             user.role === 'DRIVER' ? '/driver' : '/';
              navigate(`${basePath}/profile`);
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-sm font-bold transition ${
              darkMode 
                ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200' 
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
            title="View Profile"
          >
            <User className="w-4 h-4 text-orange-500" />
            <span>Profile</span>
          </button>

          {/* Language Switcher Button */}
          <button
            onClick={() => setLangModalOpen(true)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-sm font-bold transition ${
              darkMode 
                ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200' 
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
            title="Change Language"
          >
            <Globe className="w-4 h-4 text-orange-500" />
            <span>{getLanguageLabel()}</span>
          </button>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition ${
              darkMode 
                ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-amber-400' 
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 text-sm font-bold transition shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout') || 'Sign Out'}</span>
          </button>
        </div>
      </header>

      {/* Language Selection Modal */}
      <StaffLanguageModal 
        isOpen={langModalOpen} 
        onClose={() => setLangModalOpen(false)} 
      />
    </>
  );
}