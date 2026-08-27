import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Translates a string child using the app dictionary (and optional API).
 * Usage: <TranslateText>Add to Cart</TranslateText>
 * Or: <TranslateText k="addToCart" />
 */
export default function TranslateText({ children, k }) {
  const { language, t, translateText } = useLanguage();
  const source = k || (typeof children === 'string' ? children : null);
  const [text, setText] = useState(() => (source ? t(source) : children));

  useEffect(() => {
    if (!source) {
      setText(children);
      return;
    }

    const fromDict = t(source);
    setText(fromDict);

    // If still English and language isn't EN, try API for dynamic phrases
    if (language !== 'en' && fromDict === source) {
      let cancelled = false;
      translateText(source, language).then((translated) => {
        if (!cancelled && translated) setText(translated);
      });
      return () => {
        cancelled = true;
      };
    }
  }, [source, children, language, t, translateText]);

  if (source) return <>{text}</>;
  return <>{children}</>;
}

export function useTranslate() {
  const { language, translateText, t } = useLanguage();

  const translate = async (text) => {
    if (language === 'en' || !text) return text;
    const fromDict = t(text);
    if (fromDict !== text) return fromDict;
    return translateText(text, language);
  };

  return { translate, language, t };
}
