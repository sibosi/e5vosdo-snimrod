import { useState, useEffect } from 'react';

interface PageSettings {
  headspace?: number;
  // Add other page settings as needed
}

interface UsePageSettingsReturn {
  pageSettings: PageSettings | null;
  updatePageSettings: (settings: Partial<PageSettings>) => void;
}

export const usePageSettings = (): UsePageSettingsReturn => {
  const [pageSettings, setPageSettings] = useState<PageSettings | null>({
    headspace: 0, // Default value
  });

  const updatePageSettings = (settings: Partial<PageSettings>) => {
    setPageSettings((prev) => ({
      ...prev,
      ...settings,
    }));
  };

  // You can add logic here to persist settings or fetch from API
  useEffect(() => {
    // Example: Load settings from AsyncStorage or API
    // const loadSettings = async () => {
    //   try {
    //     const savedSettings = await AsyncStorage.getItem('pageSettings');
    //     if (savedSettings) {
    //       setPageSettings(JSON.parse(savedSettings));
    //     }
    //   } catch (error) {
    //     console.error('Error loading page settings:', error);
    //   }
    // };
    // loadSettings();
  }, []);

  return {
    pageSettings,
    updatePageSettings,
  };
};
