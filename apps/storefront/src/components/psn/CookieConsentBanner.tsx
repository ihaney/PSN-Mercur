'use client'

import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, Settings } from 'lucide-react';
import { getCurrentUser } from '@/lib/data/cookies';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const consent = localStorage.getItem('cookie_consent');
    const consentExpiry = localStorage.getItem('cookie_consent_expiry');

    if (!consent || !consentExpiry) {
      setShowBanner(true);
    } else {
      const expiryDate = new Date(consentExpiry);
      if (expiryDate < new Date()) {
        setShowBanner(true);
      } else {
        try {
          const savedPreferences = JSON.parse(consent);
          setPreferences(savedPreferences);
          applyCookiePreferences(savedPreferences);
        } catch (error) {
          setShowBanner(true);
        }
      }
    }
  }, []);

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    if (typeof window === 'undefined') return;

    if (!prefs.analytics) {
      if (window.plausible) {
        (window as any).plausible = undefined;
      }
      document.cookie = 'plausible_ignore=true; path=/; max-age=31536000; SameSite=Lax';
    } else {
      document.cookie = 'plausible_ignore=; path=/; max-age=0';
    }

    if (prefs.functional) {
      localStorage.setItem('functional_cookies_enabled', 'true');
    } else {
      localStorage.removeItem('functional_cookies_enabled');
    }
  };

  const saveConsent = async (prefs: CookiePreferences) => {
    if (typeof window === 'undefined') return;

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    localStorage.setItem('cookie_consent_expiry', expiryDate.toISOString());

    applyCookiePreferences(prefs);

    try {
      // TODO: Log consent to Medusa backend if needed
      const user = await getCurrentUser();
      if (user) {
        // TODO: Create server action to log consent
        // await logCookieConsent({
        //   user_id: user.id,
        //   preferences: prefs,
        //   consented_at: new Date().toISOString(),
        //   user_agent: navigator.userAgent,
        // });
        console.log('Cookie consent logged for user:', user.id);
      }
    } catch (error) {
      console.error('Failed to log consent:', error);
    }

    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(onlyNecessary);
    saveConsent(onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const handleTogglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="w-full max-w-4xl pointer-events-auto">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {!showSettings ? (
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Cookie className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    We value your privacy
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                    By clicking "Accept All", you consent to our use of cookies.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={handleRejectAll}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Customize
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cookie Preferences
                  </h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Necessary Cookies</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Essential for the website to function properly. Cannot be disabled.
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-60">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Help us understand how visitors interact with our website.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleTogglePreference('analytics')}
                        className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                          preferences.analytics ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                        } px-1`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Marketing Cookies</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Used to track visitors across websites to display relevant ads.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleTogglePreference('marketing')}
                        className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                          preferences.marketing ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                        } px-1`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Functional Cookies</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Enable enhanced functionality and personalization.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleTogglePreference('functional')}
                        className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                          preferences.functional ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                        } px-1`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Accept All
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                For more information, please read our{' '}
                <a href="/policies#cookies" className="text-blue-600 hover:underline">
                  Cookie Policy
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

