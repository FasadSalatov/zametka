"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { loadFromTelegramCloud } from '@/utils/telegramExportImport';

// Ключи для хранения данных
const STORAGE_KEYS = {
  NOTES: 'zametka_notes_data',
  FINANCES: 'zametka_finances_data',
  DEBTS: 'zametka_debts_data',
  SETTINGS: 'zametka_settings',
  LAST_CLOUD_LOAD: 'zametka_last_cloud_load',
  SESSION_LOADED: 'zametka_session_loaded', // Флаг для отслеживания загрузки в текущей сессии
};

// Определение типа для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

// Контекст для предоставления состояния загрузки данных
interface CloudStorageContextType {
  isLoading: boolean;
  lastLoadTime: string | null;
  loadError: string | null;
  reloadData: () => Promise<void>;
}

const CloudStorageContext = createContext<CloudStorageContextType>({
  isLoading: false,
  lastLoadTime: null,
  loadError: null,
  reloadData: async () => {},
});

export const useCloudStorage = () => useContext(CloudStorageContext);

interface CloudStorageProviderProps {
  children: React.ReactNode;
}

export function CloudStorageProvider({ children }: CloudStorageProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Применение загруженных данных из облака
  const applyLoadedData = (key: string, data: any): boolean => {
    if (!data) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Ошибка при сохранении данных ${key} в localStorage:`, error);
      return false;
    }
  };

  // Основная функция загрузки данных из облака
  const loadDataFromCloud = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    // Проверяем, загружались ли данные в этой сессии
    const sessionLoaded = sessionStorage.getItem(STORAGE_KEYS.SESSION_LOADED);
    if (sessionLoaded) {
      console.log('Данные уже были загружены в этой сессии.');
      setIsLoading(false);
      return false;
    }
    
    try {
      // Показываем уведомление о начале загрузки данных
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tgApp = window.Telegram.WebApp;
        
        if (tgApp.showPopup) {
          tgApp.showPopup({
            title: 'Загрузка данных',
            message: 'Загружаем ваши данные из облака Telegram...',
            buttons: [{ type: 'close' }]
          });
        }
        
        if (tgApp.HapticFeedback) {
          tgApp.HapticFeedback.impactOccurred('light');
        }
      }
      
      console.log('Загрузка данных из облака Telegram...');
      
      // Загружаем все данные параллельно для ускорения процесса
      const [notes, finances, debts, settings] = await Promise.all([
        loadFromTelegramCloud(STORAGE_KEYS.NOTES),
        loadFromTelegramCloud(STORAGE_KEYS.FINANCES),
        loadFromTelegramCloud(STORAGE_KEYS.DEBTS),
        loadFromTelegramCloud(STORAGE_KEYS.SETTINGS)
      ]);
      
      let dataLoaded = false;
      let hasChanges = false;
      
      // Применяем загруженные данные, если они существуют
      if (notes && Array.isArray(notes)) {
        const notesChanged = applyLoadedData('notes', notes);
        dataLoaded = true;
        hasChanges = hasChanges || notesChanged;
        console.log('Заметки успешно загружены из облака');
      }
      
      if (finances && Array.isArray(finances)) {
        const financesChanged = applyLoadedData('finances', finances);
        dataLoaded = true;
        hasChanges = hasChanges || financesChanged;
        console.log('Финансы успешно загружены из облака');
      }
      
      if (debts && Array.isArray(debts)) {
        const debtsChanged = applyLoadedData('debts', debts);
        dataLoaded = true;
        hasChanges = hasChanges || debtsChanged;
        console.log('Долги успешно загружены из облака');
      }
      
      if (settings && typeof settings === 'object') {
        const settingsChanged = applyLoadedData('settings', settings);
        dataLoaded = true;
        hasChanges = hasChanges || settingsChanged;
        console.log('Настройки успешно загружены из облака');
      }
      
      // Записываем флаг, что данные загружены в этой сессии
      sessionStorage.setItem(STORAGE_KEYS.SESSION_LOADED, 'true');
      
      // Сохраняем время последней загрузки
      const now = new Date();
      setLastLoadTime(now.toLocaleString());
      
      // Показываем уведомление об успешной загрузке данных
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tgApp = window.Telegram.WebApp;
        
        if (dataLoaded && tgApp.showPopup) {
          tgApp.showPopup({
            title: 'Данные загружены',
            message: 'Ваши данные успешно загружены из облака Telegram.',
            buttons: [{ type: 'close' }]
          });
          
          if (tgApp.HapticFeedback) {
            tgApp.HapticFeedback.impactOccurred('medium');
          }
        }
      }
      
      // Если есть изменения и страница уже загружена, перезагружаем её для применения изменений
      if (hasChanges && document.readyState === 'complete') {
        console.log('Обнаружены изменения в данных, перезагрузка страницы...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
      return dataLoaded;
    } catch (error) {
      console.error('Ошибка при загрузке данных из облака:', error);
      setLoadError('Не удалось загрузить данные из облака');
      
      // Показываем уведомление об ошибке
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tgApp = window.Telegram.WebApp;
        
        if (tgApp.showPopup) {
          tgApp.showPopup({
            title: 'Ошибка загрузки',
            message: 'Не удалось загрузить данные из облака Telegram. Пожалуйста, попробуйте позже.',
            buttons: [{ type: 'close' }]
          });
          
          if (tgApp.HapticFeedback) {
            tgApp.HapticFeedback.impactOccurred('error');
          }
        }
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка данных при первом рендеринге
  useEffect(() => {
    loadDataFromCloud();
  }, []);
  
  // Функция для принудительной перезагрузки данных
  const reloadData = async () => {
    // Удаляем флаг загрузки сессии
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_LOADED);
    
    // Загружаем данные заново
    await loadDataFromCloud();
  };
  
  const contextValue: CloudStorageContextType = {
    isLoading,
    lastLoadTime,
    loadError,
    reloadData
  };
  
  return (
    <CloudStorageContext.Provider value={contextValue}>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-white text-xs text-center py-1 px-2">
          Загрузка данных из облака...
        </div>
      )}
      {children}
    </CloudStorageContext.Provider>
  );
} 