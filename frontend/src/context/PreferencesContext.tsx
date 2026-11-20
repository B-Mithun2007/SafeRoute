/**
 * User Preferences Context
 * Manages travel safety settings across all navigation views.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import PreferenceService, { defaultPreferences } from '../services/preferenceService';
import { TravelPreferences } from '../types/user';

interface PreferencesContextType {
  preferences: TravelPreferences;
  isLoading: boolean;
  updatePreferences: (newPrefs: Partial<TravelPreferences>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<TravelPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await PreferenceService.getPreferences();
        setPreferences(loaded);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const updatePreferences = async (newPrefs: Partial<TravelPreferences>): Promise<void> => {
    const merged = { ...preferences, ...newPrefs };
    setPreferences(merged);
    await PreferenceService.savePreferences(merged);
  };

  const resetToDefaults = async (): Promise<void> => {
    setPreferences(defaultPreferences);
    await PreferenceService.savePreferences(defaultPreferences);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        isLoading,
        updatePreferences,
        resetToDefaults,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export default PreferencesContext;
