import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

// Google Translate API configuration
const GOOGLE_TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || '';
const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translationCache, setTranslationCache] = useState({});

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    const savedCache = localStorage.getItem('translationCache');
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    if (savedCache) {
      try {
        setTranslationCache(JSON.parse(savedCache));
      } catch (e) {
        console.error('Failed to load translation cache');
      }
    }
  }, []);

  // Save cache to localStorage when it updates
  useEffect(() => {
    if (Object.keys(translationCache).length > 0) {
      localStorage.setItem('translationCache', JSON.stringify(translationCache));
    }
  }, [translationCache]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Translate text using Google Translate API
  const translateText = async (text, targetLang) => {
    // If target language is English or text is empty, return original
    if (targetLang === 'en' || !text || typeof text !== 'string') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}_${targetLang}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    // If no API key, return original text
    if (!GOOGLE_TRANSLATE_API_KEY) {
      console.warn('Google Translate API key not configured. Add VITE_GOOGLE_TRANSLATE_API_KEY to your .env file');
      return text;
    }

    try {
      // Map language codes to Google Translate codes
      const langMap = {
        'en': 'en',
        'am': 'am', // Amharic
        'om': 'om', // Oromo
      };

      const targetLanguageCode = langMap[targetLang] || targetLang;

      const response = await fetch(
        `${TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: targetLanguageCode,
            format: 'text',
          }),
        }
      );

      if (!response.ok) {
        console.error('Translation API error:', response.statusText);
        return text;
      }

      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;

      // Cache the translation
      setTranslationCache((prev) => ({
        ...prev,
        [cacheKey]: translatedText,
      }));

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  // Synchronous translation function (uses cache only)
  const t = (text) => {
    if (language === 'en' || !text || typeof text !== 'string') {
      return text;
    }

    const cacheKey = `${text}_${language}`;
    const cached = translationCache[cacheKey];
    
    // If translation exists in cache, return it
    if (cached) {
      return cached;
    }

    // Otherwise, trigger async translation in background and return original
    translateText(text, language).catch(console.error);
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage, 
      t,
      translateText
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

