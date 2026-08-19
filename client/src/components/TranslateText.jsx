import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * TranslateText Component - Automatically translates text using Google Translate API
 * 
 * Usage:
 * <TranslateText>Hello World</TranslateText>
 * 
 * Or wrap entire sections:
 * <TranslateText>
 *   <div>
 *     <h1>Title</h1>
 *     <p>Description text</p>
 *   </div>
 * </TranslateText>
 */
export default function TranslateText({ children }) {
  const { language, translateText } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState(children);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (language === 'en' || !children) {
      setTranslatedContent(children);
      return;
    }

    const translate = async () => {
      setIsLoading(true);

      try {
        // If children is a string, translate directly
        if (typeof children === 'string') {
          const translated = await translateText(children, language);
          setTranslatedContent(translated);
        } else {
          // For complex content, keep original
          setTranslatedContent(children);
        }
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedContent(children);
      } finally {
        setIsLoading(false);
      }
    };

    translate();
  }, [children, language, translateText]);

  if (isLoading) {
    return <span className="opacity-50">{children}</span>;
  }

  return <>{translatedContent}</>;
}

/**
 * Hook version for more control
 */
export function useTranslate() {
  const { language, translateText } = useLanguage();

  const translate = async (text) => {
    if (language === 'en' || !text) {
      return text;
    }
    return await translateText(text, language);
  };

  return { translate, language };
}
