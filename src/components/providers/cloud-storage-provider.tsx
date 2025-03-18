"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { loadFromTelegramCloud, saveToTelegramCloud } from '@/utils/telegramExportImport';
import { useDebtsStore } from "@/stores/debts-store";
import { useNotesStore } from "@/stores/notes-store";
import { useFinancesStore } from "@/stores/finances-store";
import { useSettingsStore } from "@/stores/settings-store";

// Ключи для хранения данных
const STORAGE_KEYS = {
  NOTES: 'zametka_notes_data',
  FINANCES: 'zametka_finances_data',
  DEBTS: 'zametka_debts_data',
  SETTINGS: 'zametka_settings',
  LAST_CLOUD_LOAD: 'zametka_last_cloud_load',
  SESSION_LOADED: 'zametka_session_loaded', // Флаг для отслеживания загрузки в текущей сессии
};

// Список всех ключей для CloudStorage
const ALL_KEYS = Object.values(STORAGE_KEYS);

// Определение типа для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

// Статусы загрузки для каждого типа данных
interface LoadingStatus {
  isLoaded: boolean;
  count: number | null;
  error: string | null;
  timestamp: number | null;
}

// Контекст для предоставления состояния загрузки данных
interface CloudStorageContextType {
  isLoading: boolean;
  lastLoadTime: string | null;
  loadError: string | null;
  loadStatus: {
    notes: LoadingStatus;
    finances: LoadingStatus;
    debts: LoadingStatus;
    settings: LoadingStatus;
  };
  reloadData: () => Promise<void>;
  syncData: () => Promise<boolean>;
}

const CloudStorageContext = createContext<CloudStorageContextType>({
  isLoading: false,
  lastLoadTime: null,
  loadError: null,
  loadStatus: {
    notes: { isLoaded: false, count: null, error: null, timestamp: null },
    finances: { isLoaded: false, count: null, error: null, timestamp: null },
    debts: { isLoaded: false, count: null, error: null, timestamp: null },
    settings: { isLoaded: false, count: null, error: null, timestamp: null },
  },
  reloadData: async () => {},
  syncData: async () => false,
});

export const useCloudStorage = () => useContext(CloudStorageContext);

interface CloudStorageProviderProps {
  children: React.ReactNode;
}

export function CloudStorageProvider({ children }: CloudStorageProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [loadStatus, setLoadStatus] = useState<CloudStorageContextType['loadStatus']>({
    notes: { isLoaded: false, count: null, error: null, timestamp: null },
    finances: { isLoaded: false, count: null, error: null, timestamp: null },
    debts: { isLoaded: false, count: null, error: null, timestamp: null },
    settings: { isLoaded: false, count: null, error: null, timestamp: null },
  });
  
  // Получаем доступ к хранилищам данных
  const { setNotes } = useNotesStore();
  const { setTransactions } = useFinancesStore();
  const { setDebts } = useDebtsStore();
  const { setSettings } = useSettingsStore();
  
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

  // Получение текущих данных из localStorage
  const getCurrentData = () => {
    try {
      return {
        notes: localStorage.getItem('notes') ? JSON.parse(localStorage.getItem('notes') || '[]') : [],
        finances: localStorage.getItem('finances') ? JSON.parse(localStorage.getItem('finances') || '[]') : [],
        debts: localStorage.getItem('debts') ? JSON.parse(localStorage.getItem('debts') || '[]') : [],
        settings: localStorage.getItem('settings') ? JSON.parse(localStorage.getItem('settings') || '{}') : {},
      };
    } catch (e) {
      console.error('Ошибка при получении данных из localStorage:', e);
      return {
        notes: [],
        finances: [],
        debts: [],
        settings: {},
      };
    }
  };

  // Синхронизация локальных данных с облаком
  const syncDataToCloud = async (): Promise<boolean> => {
    setLoadingStep('Синхронизация данных с облаком...');
    setIsLoading(true);
    
    try {
      const currentData = getCurrentData();
      
      // Сохраняем каждый тип данных в облако
      const results = await Promise.all([
        saveToTelegramCloud(STORAGE_KEYS.NOTES, currentData.notes),
        saveToTelegramCloud(STORAGE_KEYS.FINANCES, currentData.finances),
        saveToTelegramCloud(STORAGE_KEYS.DEBTS, currentData.debts),
        saveToTelegramCloud(STORAGE_KEYS.SETTINGS, currentData.settings),
      ]);
      
      const success = results.every(Boolean);
      
      if (success) {
        console.log('Все данные успешно синхронизированы с облаком');
        
        // Сохраняем время последней синхронизации
        const now = new Date();
        await saveToTelegramCloud(STORAGE_KEYS.LAST_CLOUD_LOAD, now.toISOString());
        setLastLoadTime(now.toLocaleString());
        
        setLoadingStep('Данные успешно синхронизированы');
        
        // Показываем уведомление
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tgApp = window.Telegram.WebApp;
          
          if (tgApp.showPopup) {
            tgApp.showPopup({
              title: 'Синхронизация',
              message: 'Данные успешно сохранены в облаке',
              buttons: [{ type: 'close' }]
            });
          }
          
          if (tgApp.HapticFeedback) {
            tgApp.HapticFeedback.notificationOccurred('success');
          }
        }
        
        // Обновляем статус загрузки
        setLoadStatus({
          notes: { isLoaded: true, count: currentData.notes.length, error: null, timestamp: Date.now() },
          finances: { isLoaded: true, count: currentData.finances.length, error: null, timestamp: Date.now() },
          debts: { isLoaded: true, count: currentData.debts.length, error: null, timestamp: Date.now() },
          settings: { isLoaded: Object.keys(currentData.settings).length > 0, count: 1, error: null, timestamp: Date.now() },
        });
        
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStep('');
        }, 1500);
        
        return true;
      } else {
        console.error('Не все данные удалось синхронизировать');
        setLoadingStep('Ошибка синхронизации');
        setLoadError('Не все данные удалось сохранить в облако');
        
        // Показываем уведомление об ошибке
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tgApp = window.Telegram.WebApp;
          
          if (tgApp.showPopup) {
            tgApp.showPopup({
              title: 'Ошибка синхронизации',
              message: 'Не все данные удалось сохранить в облако',
              buttons: [{ type: 'close' }]
            });
          }
          
          if (tgApp.HapticFeedback) {
            tgApp.HapticFeedback.impactOccurred('error');
          }
        }
        
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStep('');
        }, 1500);
        
        return false;
      }
    } catch (error) {
      console.error('Ошибка при синхронизации данных с облаком:', error);
      setLoadingStep('Ошибка синхронизации');
      setLoadError('Произошла ошибка при синхронизации данных');
      
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStep('');
      }, 1500);
      
      return false;
    }
  };

  // Прямая работа с CloudStorage API через WebApp
  const getAllCloudStorageData = async (): Promise<Record<string, any>> => {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp?.CloudStorage) {
      console.error('CloudStorage API недоступен');
      return {};
    }
    
    try {
      const tgApp = window.Telegram.WebApp;
      
      // Используем getItems для получения всех данных сразу
      if (typeof tgApp.CloudStorage.getItems === 'function') {
        return new Promise((resolve) => {
          tgApp.CloudStorage.getItems(ALL_KEYS, (error: any, values: Record<string, string | null>) => {
            if (error) {
              console.error('Ошибка при получении данных из CloudStorage:', error);
              resolve({});
              return;
            }
            
            const result: Record<string, any> = {};
            
            // Обрабатываем каждый ключ
            Object.entries(values).forEach(([key, value]) => {
              if (value) {
                try {
                  result[key] = JSON.parse(value);
                } catch (e) {
                  result[key] = value;
                }
              }
            });
            
            resolve(result);
          });
        });
      } 
      // Если getItems не поддерживается, получаем каждый ключ отдельно
      else {
        const result: Record<string, any> = {};
        
        for (const key of ALL_KEYS) {
          try {
            const value = await loadFromTelegramCloud(key);
            if (value !== null) {
              result[key] = value;
            }
          } catch (e) {
            console.error(`Ошибка при загрузке ключа ${key}:`, e);
          }
        }
        
        return result;
      }
    } catch (e) {
      console.error('Ошибка при работе с CloudStorage API:', e);
      return {};
    }
  };

  // Проверка наличия данных в облаке
  const checkCloudData = async () => {
    setLoadingStep('Проверка данных в облаке...');
    
    try {
      // Пробуем получить все данные напрямую через CloudStorage API
      const allCloudData = await getAllCloudStorageData();
      
      // Проверяем наличие данных
      const hasData = Object.keys(allCloudData).length > 0;
      
      if (hasData) {
        console.log('Найдены данные в облаке:', Object.keys(allCloudData));
        return allCloudData;
      }
      
      // Если прямой метод не сработал, пробуем загрузить каждый ключ отдельно
      const hasNotes = await loadFromTelegramCloud(STORAGE_KEYS.NOTES);
      const hasFinances = await loadFromTelegramCloud(STORAGE_KEYS.FINANCES);
      const hasDebts = await loadFromTelegramCloud(STORAGE_KEYS.DEBTS);
      const hasSettings = await loadFromTelegramCloud(STORAGE_KEYS.SETTINGS);
      
      const individualData: Record<string, any> = {};
      if (hasNotes) individualData[STORAGE_KEYS.NOTES] = hasNotes;
      if (hasFinances) individualData[STORAGE_KEYS.FINANCES] = hasFinances;
      if (hasDebts) individualData[STORAGE_KEYS.DEBTS] = hasDebts;
      if (hasSettings) individualData[STORAGE_KEYS.SETTINGS] = hasSettings;
      
      const dataExists = hasNotes || hasFinances || hasDebts || hasSettings;
      
      if (dataExists) {
        console.log('Найдены данные в облаке через индивидуальные запросы:', Object.keys(individualData));
        return individualData;
      }
      
      return null;
    } catch (error) {
      console.error('Ошибка при проверке данных в облаке:', error);
      return null;
    }
  };

  // Основная функция загрузки данных из облака
  const loadDataFromCloud = async () => {
    setIsLoading(true);
    setLoadError(null);
    setLoadingStep('Инициализация...');
    
    try {
      // Проверяем, загружались ли данные в этой сессии
      const sessionLoaded = sessionStorage.getItem(STORAGE_KEYS.SESSION_LOADED);
      if (sessionLoaded) {
        console.log('Данные уже были загружены в этой сессии.');
        setIsLoading(false);
        setLoadingStep('');
        return false;
      }
      
      // Проверяем доступность CloudStorage API
      if (typeof window === 'undefined' || !window.Telegram?.WebApp?.CloudStorage) {
        console.warn('Telegram CloudStorage API недоступен');
        setLoadError('CloudStorage API недоступен');
        setLoadingStep('Ошибка: CloudStorage API недоступен');
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStep('');
        }, 3000);
        return false;
      }
      
      // Проверяем наличие данных в облаке
      setLoadingStep('Проверка данных в облаке...');
      const cloudData = await checkCloudData();
      
      if (!cloudData) {
        console.log('В облаке нет данных для загрузки');
        setLoadingStep('Данные в облаке не найдены');
        
        // Синхронизируем текущие локальные данные с облаком
        const currentData = getCurrentData();
        if (currentData.notes.length > 0 || currentData.finances.length > 0 || currentData.debts.length > 0) {
          setLoadingStep('Выполняем первичную синхронизацию с облаком...');
          await syncDataToCloud();
        }
        
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStep('');
        }, 1500);
        
        sessionStorage.setItem(STORAGE_KEYS.SESSION_LOADED, 'true');
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
        
        // Получаем данные из результата проверки облака
        const notes = cloudData[STORAGE_KEYS.NOTES];
        const finances = cloudData[STORAGE_KEYS.FINANCES];
        const debts = cloudData[STORAGE_KEYS.DEBTS];
        const settings = cloudData[STORAGE_KEYS.SETTINGS];
        
        let dataLoaded = false;
        let hasChanges = false;
        
        // Обновляем статус заметок
        if (notes && Array.isArray(notes)) {
          setLoadingStep('Применение заметок...');
          const notesChanged = applyLoadedData('notes', notes);
          dataLoaded = true;
          hasChanges = hasChanges || notesChanged;
          console.log('Заметки успешно загружены из облака:', notes.length);
          setLoadStatus(prev => ({
            ...prev,
            notes: { isLoaded: true, count: notes.length, error: null, timestamp: Date.now() }
          }));
        } else {
          setLoadStatus(prev => ({
            ...prev,
            notes: { isLoaded: false, count: null, error: 'Заметки не найдены', timestamp: null }
          }));
        }
        
        // Обновляем статус финансов
        if (finances && Array.isArray(finances)) {
          setLoadingStep('Применение финансов...');
          const financesChanged = applyLoadedData('finances', finances);
          dataLoaded = true;
          hasChanges = hasChanges || financesChanged;
          console.log('Финансы успешно загружены из облака:', finances.length);
          setLoadStatus(prev => ({
            ...prev,
            finances: { isLoaded: true, count: finances.length, error: null, timestamp: Date.now() }
          }));
        } else {
          setLoadStatus(prev => ({
            ...prev,
            finances: { isLoaded: false, count: null, error: 'Финансы не найдены', timestamp: null }
          }));
        }
        
        // Обновляем статус долгов
        if (debts && Array.isArray(debts)) {
          setLoadingStep('Применение долгов...');
          const debtsChanged = applyLoadedData('debts', debts);
          dataLoaded = true;
          hasChanges = hasChanges || debtsChanged;
          console.log('Долги успешно загружены из облака:', debts.length);
          setLoadStatus(prev => ({
            ...prev,
            debts: { isLoaded: true, count: debts.length, error: null, timestamp: Date.now() }
          }));
        } else {
          setLoadStatus(prev => ({
            ...prev,
            debts: { isLoaded: false, count: null, error: 'Долги не найдены', timestamp: null }
          }));
        }
        
        // Обновляем статус настроек
        if (settings && typeof settings === 'object') {
          setLoadingStep('Применение настроек...');
          const settingsChanged = applyLoadedData('settings', settings);
          dataLoaded = true;
          hasChanges = hasChanges || settingsChanged;
          console.log('Настройки успешно загружены из облака');
          setLoadStatus(prev => ({
            ...prev,
            settings: { isLoaded: true, count: 1, error: null, timestamp: Date.now() }
          }));
        } else {
          setLoadStatus(prev => ({
            ...prev,
            settings: { isLoaded: false, count: null, error: 'Настройки не найдены', timestamp: null }
          }));
        }
        
        // Устанавливаем шаг загрузки
        setLoadingStep(dataLoaded ? 'Данные успешно загружены' : 'Данные не найдены');
        
        // Записываем флаг, что данные загружены в этой сессии
        sessionStorage.setItem(STORAGE_KEYS.SESSION_LOADED, 'true');
        
        // Сохраняем время последней загрузки
        const now = new Date();
        setLastLoadTime(now.toLocaleString());
        
        // Показываем уведомление об успешной загрузке данных
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tgApp = window.Telegram.WebApp;
          
          if (dataLoaded && tgApp.showPopup) {
            const loadedItems = [];
            if (loadStatus.notes.isLoaded) loadedItems.push(`Заметки (${loadStatus.notes.count})`);
            if (loadStatus.finances.isLoaded) loadedItems.push(`Финансы (${loadStatus.finances.count})`);
            if (loadStatus.debts.isLoaded) loadedItems.push(`Долги (${loadStatus.debts.count})`);
            if (loadStatus.settings.isLoaded) loadedItems.push('Настройки');
            
            const message = loadedItems.length > 0 
              ? `Загружено: ${loadedItems.join(', ')}`
              : 'Данные не найдены в облаке';
            
            tgApp.showPopup({
              title: 'Данные загружены',
              message,
              buttons: [{ type: 'close' }]
            });
            
            if (tgApp.HapticFeedback) {
              tgApp.HapticFeedback.impactOccurred('medium');
            }
          }
        }
        
        // Сообщаем в консоль информацию о загруженных данных
        console.log('Статус загрузки данных из облака:', {
          notes: loadStatus.notes,
          finances: loadStatus.finances,
          debts: loadStatus.debts,
          settings: loadStatus.settings
        });
        
        // Если есть изменения и страница уже загружена, перезагружаем её для применения изменений
        if (hasChanges && document.readyState === 'complete') {
          setLoadingStep('Обновление страницы...');
          console.log('Обнаружены изменения в данных, перезагрузка страницы...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          // Скрываем индикатор загрузки через 3 секунды
          setTimeout(() => {
            setIsLoading(false);
            setLoadingStep('');
          }, 1500);
        }
        
        return dataLoaded;
      } catch (error) {
        console.error('Ошибка при загрузке данных из облака:', error);
        setLoadError('Не удалось загрузить данные из облака');
        setLoadingStep('Ошибка загрузки данных');
        
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
        
        // Скрываем индикатор загрузки через 3 секунды
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStep('');
        }, 3000);
        
        return false;
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных из облака:', error);
      setLoadError('Не удалось загрузить данные из облака');
      setLoadingStep('Ошибка загрузки данных');
      
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
      
      // Скрываем индикатор загрузки через 3 секунды
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStep('');
      }, 3000);
      
      return false;
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
    loadStatus,
    reloadData,
    syncData: syncDataToCloud
  };
  
  return (
    <CloudStorageContext.Provider value={contextValue}>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="bg-primary text-white text-xs flex items-center justify-between px-3 py-2">
            <div className="flex items-center">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white/80 rounded-full animate-spin mr-2"></div>
              <span>{loadingStep || 'Загрузка данных из облака...'}</span>
            </div>
          </div>
        </div>
      )}
      
      {loadError && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="bg-destructive text-white text-xs flex items-center justify-between px-3 py-2">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <span>Ошибка: {loadError}</span>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </CloudStorageContext.Provider>
  );
} 