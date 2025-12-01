'use client'

import React, { useState, useEffect } from 'react';
import { X, Globe, CheckCircle } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/contexts/LanguageContext';

interface LanguagePreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (language: LanguageCode) => void;
  currentLanguage?: LanguageCode;
}

export default function LanguagePreferenceModal({
  isOpen,
  onClose,
  onSelectLanguage,
  currentLanguage = 'en'
}: LanguagePreferenceModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(currentLanguage);

  useEffect(() => {
    if (isOpen && currentLanguage) {
      setSelectedLanguage(currentLanguage);
    }
  }, [isOpen, currentLanguage]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectLanguage(selectedLanguage);
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="dark:bg-gray-800 light:bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-gray-700 light:border-gray-200">
        <div className="sticky top-0 dark:bg-gray-800 light:bg-white border-b dark:border-gray-700 light:border-gray-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#F4A024]/10">
              <Globe className="w-6 h-6 text-[#F4A024]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-themed">Welcome to Paisán</h2>
              <p className="text-sm text-themed-muted mt-1">
                Select your preferred language for the best experience
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-themed-muted" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`flex items-center justify-between gap-3 p-4 rounded-lg border-2 transition-all ${
                  selectedLanguage === lang.code
                    ? 'border-[#F4A024] bg-[#F4A024]/10 text-[#F4A024]'
                    : 'dark:border-gray-600 light:border-gray-300 dark:bg-gray-700/30 light:bg-gray-50 text-themed-secondary dark:hover:bg-gray-700/50 light:hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-medium block">{lang.nativeName}</span>
                    <span className="text-sm opacity-75">{lang.name}</span>
                  </div>
                </div>
                {selectedLanguage === lang.code && (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="dark:bg-blue-500/10 light:bg-blue-50 border dark:border-blue-500/20 light:border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-themed-secondary mb-3">
              <strong>How Translation Works:</strong>
            </p>
            <ul className="text-sm text-themed-secondary space-y-2 list-disc list-inside">
              <li>This site contains content in <strong>multiple languages</strong> (English, Spanish, and others)</li>
              <li>When you select a language, the page will be translated using <strong>Google Translate</strong></li>
              <li>All content, including product names and descriptions in different languages, will be translated to your selected language</li>
              <li>A translation widget will appear to allow you to adjust translation settings</li>
              <li>You can change your language preference at any time from your profile or the language button</li>
              <li>Your choice is saved and will be remembered on future visits</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border-2 dark:border-gray-600 light:border-gray-300 text-themed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Keep English
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedLanguage === 'en'}
              className="flex-1 px-6 py-3 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedLanguage === 'en' ? 'Keep English' : `Use ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
