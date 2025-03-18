import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Settings = {
  theme?: string;
  autoSave?: boolean;
  language?: string;
  [key: string]: any;
};

interface SettingsState {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  updateSetting: (key: string, value: any) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {},
      setSettings: (settings) => set({ settings }),
      updateSetting: (key, value) => 
        set((state) => ({ 
          settings: { ...state.settings, [key]: value } 
        })),
    }),
    { name: 'settings' }
  )
); 