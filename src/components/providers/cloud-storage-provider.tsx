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

// Статусы загрузки для каждого типа данных
interface LoadingStatus {
  isLoaded: boolean;
  count: number; // Количество элементов
  error: string | null;
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
}

const CloudStorageContext = createContext<CloudStorageContextType>({
  isLoading: false,
  lastLoadTime: null,
  loadError: null,
  loadStatus: {
    notes: { isLoaded: false, count: 0, error: null },
    finances: { isLoaded: false, count: 0, error: null },
    debts: { isLoaded: false, count: 0, error: null },
    settings: { isLoaded: false, count: 0, error: null },
  },
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
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [loadStatus, setLoadStatus] = useState<CloudStorageContextType['loadStatus']>({
    notes: { isLoaded: false, count: 0, error: null },
    finances: { isLoaded: false, count: 0, error: null },
    debts: { isLoaded: false, count: 0, error: null },
    settings: { isLoaded: false, count: 0, error: null },
  });
  
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

  // Проверка наличия данных в облаке
  const checkCloudData = async () => {
    setLoadingStep('Проверка данных в облаке...');
    
    try {
      const hasNotes = await loadFromTelegramCloud(STORAGE_KEYS.NOTES);
      const hasFinances = await loadFromTelegramCloud(STORAGE_KEYS.FINANCES);
      const hasDebts = await loadFromTelegramCloud(STORAGE_KEYS.DEBTS);
      const hasSettings = await loadFromTelegramCloud(STORAGE_KEYS.SETTINGS);
      
      const dataExists = hasNotes || hasFinances || hasDebts || hasSettings;
      
      return dataExists;
    } catch (error) {
      console.error('Ошибка при проверке данных в облаке:', error);
      return false;
    }
  };

  // Основная функция загрузки данных из облака
  const loadDataFromCloud = async () => {
    setIsLoading(true);
    setLoadError(null);
    setLoadingStep('Инициализация...');
    
    // Проверяем, загружались ли данные в этой сессии
    const sessionLoaded = sessionStorage.getItem(STORAGE_KEYS.SESSION_LOADED);
    if (sessionLoaded) {
      console.log('Данные уже были загружены в этой сессии.');
      setIsLoading(false);
      setLoadingStep('');
      return false;
    }
    
    // Проверяем наличие данных в облаке
    const hasData = await checkCloudData();
    if (!hasData) {
      console.log('В облаке нет данных для загрузки');
      setLoadingStep('Данные в облаке не найдены');
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStep('');
      }, 2000);
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
      
      // Загружаем заметки
      setLoadingStep('Загрузка заметок...');
      const notes = await loadFromTelegramCloud(STORAGE_KEYS.NOTES);
      
      // Загружаем финансы
      setLoadingStep('Загрузка финансов...');
      const finances = await loadFromTelegramCloud(STORAGE_KEYS.FINANCES);
      
      // Загружаем долги
      setLoadingStep('Загрузка долгов...');
      const debts = await loadFromTelegramCloud(STORAGE_KEYS.DEBTS);
      
      // Загружаем настройки
      setLoadingStep('Загрузка настроек...');
      const settings = await loadFromTelegramCloud(STORAGE_KEYS.SETTINGS);
      
      let dataLoaded = false;
      let hasChanges = false;
      
      // Обновляем статус заметок
      if (notes && Array.isArray(notes)) {
        const notesChanged = applyLoadedData('notes', notes);
        dataLoaded = true;
        hasChanges = hasChanges || notesChanged;
        console.log('Заметки успешно загружены из облака:', notes.length);
        setLoadStatus(prev => ({
          ...prev,
          notes: { isLoaded: true, count: notes.length, error: null }
        }));
      } else {
        setLoadStatus(prev => ({
          ...prev,
          notes: { isLoaded: false, count: 0, error: 'Заметки не найдены' }
        }));
      }
      
      // Обновляем статус финансов
      if (finances && Array.isArray(finances)) {
        const financesChanged = applyLoadedData('finances', finances);
        dataLoaded = true;
        hasChanges = hasChanges || financesChanged;
        console.log('Финансы успешно загружены из облака:', finances.length);
        setLoadStatus(prev => ({
          ...prev,
          finances: { isLoaded: true, count: finances.length, error: null }
        }));
      } else {
        setLoadStatus(prev => ({
          ...prev,
          finances: { isLoaded: false, count: 0, error: 'Финансы не найдены' }
        }));
      }
      
      // Обновляем статус долгов
      if (debts && Array.isArray(debts)) {
        const debtsChanged = applyLoadedData('debts', debts);
        dataLoaded = true;
        hasChanges = hasChanges || debtsChanged;
        console.log('Долги успешно загружены из облака:', debts.length);
        setLoadStatus(prev => ({
          ...prev,
          debts: { isLoaded: true, count: debts.length, error: null }
        }));
      } else {
        setLoadStatus(prev => ({
          ...prev,
          debts: { isLoaded: false, count: 0, error: 'Долги не найдены' }
        }));
      }
      
      // Обновляем статус настроек
      if (settings && typeof settings === 'object') {
        const settingsChanged = applyLoadedData('settings', settings);
        dataLoaded = true;
        hasChanges = hasChanges || settingsChanged;
        console.log('Настройки успешно загружены из облака');
        setLoadStatus(prev => ({
          ...prev,
          settings: { isLoaded: true, count: 1, error: null }
        }));
      } else {
        setLoadStatus(prev => ({
          ...prev,
          settings: { isLoaded: false, count: 0, error: 'Настройки не найдены' }
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
        }, 3000);
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
    } finally {
      // setIsLoading(false);
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
    reloadData
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
      {children}
    </CloudStorageContext.Provider>
  );
} 