'use client'

// This component can remain mostly unchanged as it uses Google Translate API
// Only import paths need to be updated

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          config: {
            pageLanguage: string;
            includedLanguages?: string;
            layout?: number;
            autoDisplay?: boolean;
            multilanguagePage?: boolean;
          },
          elementId: string
        ) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

interface GoogleTranslateWidgetProps {
  targetLanguage?: string;
  onTranslationReady?: () => void;
}

let scriptLoadAttempted = false;
let scriptElement: HTMLScriptElement | null = null;

export default function GoogleTranslateWidget({
  targetLanguage,
  onTranslationReady
}: GoogleTranslateWidgetProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [widgetInitialized, setWidgetInitialized] = useState(false);
  const isMountedRef = useRef(true);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initAttemptsRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;

    const initializeWidget = () => {
      if (!isMountedRef.current) return;

      try {
        const element = document.getElementById('google_translate_element');
        if (!element) {
          console.warn('Google Translate element not found');
          return;
        }

        if (window.google?.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,es,pt,fr,de,it,zh-CN,ja,ko,ar,hi',
              layout: 0,
              autoDisplay: false,
              multilanguagePage: true
            },
            'google_translate_element'
          );
          setWidgetInitialized(true);
          if (onTranslationReady) {
            onTranslationReady();
          }
        }
      } catch (error) {
        console.error('Error initializing Google Translate:', error);
      }
    };

    if (!scriptLoadAttempted) {
      scriptLoadAttempted = true;
      scriptElement = document.createElement('script');
      scriptElement.type = 'text/javascript';
      scriptElement.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      scriptElement.async = true;
      
      window.googleTranslateElementInit = initializeWidget;
      document.head.appendChild(scriptElement);
    } else if (window.google?.translate) {
      initializeWidget();
    }

    return () => {
      isMountedRef.current = false;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [onTranslationReady]);

  return (
    <div id="google_translate_element" className="hidden" />
  );
}

