import React from 'react';
import { Globe, Check, Sun, Moon } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export default function Language() {
  const { language, changeLanguage, t } = useLanguage();
  const { theme, setLightTheme, setDarkTheme } = useTheme();

  const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
    { code: 'om', name: 'Afaan Oromoo', native: 'Afaan Oromoo', flag: '🇪🇹' },
  ];

  return (
    <div className="app-page">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Language Selection */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">{t('chooseLanguage')}</h1>
              <p className="text-sm text-gray-500">{t('selectPreferredLanguage')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all hover:shadow-md ${
                  language === lang.code
                    ? 'border-orange-600 bg-orange-50 text-orange-900 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-orange-300 text-gray-800'
                }`}
              >
                <div className="flex items-center space-x-4 text-left">
                  <span className="text-4xl">{lang.flag}</span>
                  <div>
                    <p className="font-black text-lg">{lang.name}</p>
                    <p className="text-sm text-gray-600">{lang.native}</p>
                  </div>
                </div>
                {language === lang.code && (
                  <div className="bg-orange-600 text-white p-2 rounded-xl shadow-md">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl">
              {theme === 'dark' ? (
                <Moon className="w-6 h-6" />
              ) : (
                <Sun className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">{t('themePreference')}</h2>
              <p className="text-sm text-gray-500">Choose your preferred app appearance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={setLightTheme}
              className={`p-6 rounded-2xl border-2 transition-all hover:shadow-md ${
                theme === 'light'
                  ? 'border-purple-600 bg-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-4 rounded-2xl ${theme === 'light' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-yellow-600' : 'text-gray-600'}`} />
                </div>
                <div className="text-center">
                  <p className="font-black text-lg text-gray-900">{t('lightMode')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('brightAndClear')}</p>
                </div>
                {theme === 'light' && (
                  <div className="mt-2">
                    <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>{t('active')}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-gray-200">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <div className="h-2 bg-gray-200 rounded mb-1"></div>
                  <div className="h-2 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
            </button>

            <button
              onClick={setDarkTheme}
              className={`p-6 rounded-2xl border-2 transition-all hover:shadow-md ${
                theme === 'dark'
                  ? 'border-purple-600 bg-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-indigo-600' : 'text-gray-600'}`} />
                </div>
                <div className="text-center">
                  <p className="font-black text-lg text-gray-900">{t('darkMode')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('easyOnEyes')}</p>
                </div>
                {theme === 'dark' && (
                  <div className="mt-2">
                    <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>{t('active')}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-gray-800 rounded-xl border border-gray-700">
                <div className="bg-gray-900 p-2 rounded-lg">
                  <div className="h-2 bg-gray-700 rounded mb-1"></div>
                  <div className="h-2 bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
