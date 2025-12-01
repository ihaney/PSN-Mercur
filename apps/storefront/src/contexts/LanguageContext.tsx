'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
];

interface LanguageContextType {
  preferredLanguage: string;
  setPreferredLanguage: (lang: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [preferredLanguage, setPreferredLanguageState] = useState('en');

  useEffect(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('paisan_preferred_language');
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        setPreferredLanguageState(saved);
      }
    }
  }, []);

  const setPreferredLanguage = async (lang: string) => {
    if (SUPPORTED_LANGUAGES.some(l => l.code === lang)) {
      setPreferredLanguageState(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('paisan_preferred_language', lang);
      }
      // TODO: Save to server via API if needed
    }
  };

  return (
    <LanguageContext.Provider value={{ preferredLanguage, setPreferredLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

