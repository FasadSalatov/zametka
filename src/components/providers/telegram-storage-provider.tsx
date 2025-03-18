"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotesStore } from '@/stores/notes-store';
import { useFinancesStore } from '@/stores/finances-store';
import { useDebtsStore } from '@/stores/debts-store';
import { useSettingsStore } from '@/stores/settings-store';
import { 
  saveToCloud, 
  loadFromCloud, 
  loadAllFromCloud, 
  STORAGE_KEYS, 
  isCloudStorageAvailable,
  CloudData
} from '@/utils/cloudStorage';
import { showNotification } from '@/utils/helpers';

// Типы состояния для каждого вида данных
interface DataStatus {
  isLoaded: boolean;
  count: number | null;
  timestamp: number | null;
  error: string | null;
}

// Контекст для CloudStorage
interface TelegramStorageContext {
  isAvailable: boolean; // Доступен ли CloudStorage
  isLoading: boolean; // Идет ли загрузка данных
  lastSyncTime: string | null; // Время последней синхронизации
  error: string | null; // Ошибка, если есть
  status: {
    notes: DataStatus;
    finances: DataStatus;
    debts: DataStatus;
    settings: DataStatus;
  };
  syncData: () => Promise<boolean>; // Синхронизировать данные с облаком
  loadData: () => Promise<boolean>; // Загрузить данные из облака
}

// Создаем контекст
const TelegramStorageContext = createContext<TelegramStorageContext>({
  isAvailable: false,
  isLoading: false,
  lastSyncTime: null,
  error: null,
  status: {
    notes: { isLoaded: false, count: null, timestamp: null, error: null },
    finances: { isLoaded: false, count: null, timestamp: null, error: null },
    debts: { isLoaded: false, count: null, timestamp: null, error: null },
    settings: { isLoaded: false, count: null, timestamp: null, error: null },
  },
  syncData: async () => false,
  loadData: async () => false,
});

// Хук для использования контекста
export const useTelegramStorage = () => useContext(TelegramStorageContext);

// Провайдер для CloudStorage
export const TelegramStorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Состояние CloudStorage
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState('');
  const [status, setStatus] = useState<TelegramStorageContext['status']>({
    notes: { isLoaded: false, count: null, timestamp: null, error: null },
    finances: { isLoaded: false, count: null, timestamp: null, error: null },
    debts: { isLoaded: false, count: null, timestamp: null, error: null },
    settings: { isLoaded: false, count: null, timestamp: null, error: null },
  });

  // Хранилища данных
  const { notes, setNotes } = useNotesStore();
  const { transactions, setTransactions } = useFinancesStore();
  const { debts, setDebts } = useDebtsStore();
  const { settings, setSettings } = useSettingsStore();

  // Проверка доступности CloudStorage
  useEffect(() => {
    const checkAvailability = () => {
      const available = isCloudStorageAvailable();
      setIsAvailable(available);
      
      if (!available) {
        console.warn('Telegram CloudStorage API недоступен');
      } else {
        console.log('Telegram CloudStorage API доступен');
        // Автоматически загружаем данные при первой загрузке
        loadLastSyncTime();
      }
    };
    
    checkAvailability();
  }, []);

  // Загружаем время последней синхронизации
  const loadLastSyncTime = async () => {
    try {
      const syncTimeStr = await loadFromCloud<string>(STORAGE_KEYS.LAST_SYNC);
      if (syncTimeStr) {
        setLastSyncTime(new Date(syncTimeStr).toLocaleString());
      }
    } catch (e) {
      console.error('Ошибка при загрузке времени синхронизации:', e);
    }
  };

  // Синхронизация данных с облаком
  const syncData = async (): Promise<boolean> => {
    if (!isAvailable) {
      setError('CloudStorage недоступен');
      showNotification('CloudStorage недоступен', 'error');
      return false;
    }

    setIsLoading(true);
    setLoadingStep('Синхронизация данных с облаком...');
    setError(null);

    try {
      // Сохраняем все данные в облако
      const results = await Promise.all([
        saveToCloud(STORAGE_KEYS.NOTES, notes),
        saveToCloud(STORAGE_KEYS.FINANCES, transactions),
        saveToCloud(STORAGE_KEYS.DEBTS, debts),
        saveToCloud(STORAGE_KEYS.SETTINGS, settings),
      ]);

      const success = results.every(Boolean);

      if (success) {
        const now = new Date();
        setLastSyncTime(now.toLocaleString());
        await saveToCloud(STORAGE_KEYS.LAST_SYNC, now.toISOString());
        
        setStatus({
          notes: { isLoaded: true, count: notes.length, timestamp: now.getTime(), error: null },
          finances: { isLoaded: true, count: transactions.length, timestamp: now.getTime(), error: null },
          debts: { isLoaded: true, count: debts.length, timestamp: now.getTime(), error: null },
          settings: { isLoaded: true, count: 1, timestamp: now.getTime(), error: null },
        });
        
        setLoadingStep('Данные успешно синхронизированы');
        showNotification('Данные успешно синхронизированы с облаком', 'success');
        
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStep('');
        }, 1500);
        
        return true;
      } else {
        setError('Не все данные удалось синхронизировать');
        setLoadingStep('Ошибка синхронизации');
        showNotification('Не все данные удалось синхронизировать', 'error');
        
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStep('');
        }, 1500);
        
        return false;
      }
    } catch (e) {
      console.error('Ошибка при синхронизации данных:', e);
      setError(`Ошибка синхронизации: ${e instanceof Error ? e.message : 'Неизвестная ошибка'}`);
      setLoadingStep('Ошибка синхронизации');
      showNotification('Произошла ошибка при синхронизации', 'error');
      
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStep('');
      }, 1500);
      
      return false;
    }
  };

  // Загрузка данных из облака
  const loadData = async (): Promise<boolean> => {
    if (!isAvailable) {
      setError('CloudStorage недоступен');
      showNotification('CloudStorage недоступен', 'error');
      return false;
    }

    setIsLoading(true);
    setLoadingStep('Загрузка данных из облака...');
    setError(null);

    try {
      // Загружаем все данные из облака
      const cloudData = await loadAllFromCloud();
      
      if (Object.keys(cloudData).length === 0) {
        setError('В облаке нет данных');
        setLoadingStep('В облаке нет данных');
        showNotification('В облаке нет сохраненных данных', 'info');
        
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStep('');
        }, 1500);
        
        return false;
      }

      // Применяем загруженные данные
      const now = new Date();
      
      // Обновляем заметки
      if (cloudData.notes) {
        setNotes(cloudData.notes);
        setStatus(prev => ({ 
          ...prev, 
          notes: { 
            isLoaded: true, 
            count: cloudData.notes?.length || 0, 
            timestamp: now.getTime(), 
            error: null 
          } 
        }));
      }
      
      // Обновляем финансы
      if (cloudData.finances) {
        setTransactions(cloudData.finances);
        setStatus(prev => ({ 
          ...prev, 
          finances: { 
            isLoaded: true, 
            count: cloudData.finances?.length || 0, 
            timestamp: now.getTime(), 
            error: null 
          } 
        }));
      }
      
      // Обновляем долги
      if (cloudData.debts) {
        setDebts(cloudData.debts);
        setStatus(prev => ({ 
          ...prev, 
          debts: { 
            isLoaded: true, 
            count: cloudData.debts?.length || 0, 
            timestamp: now.getTime(), 
            error: null 
          } 
        }));
      }
      
      // Обновляем настройки
      if (cloudData.settings) {
        setSettings(cloudData.settings);
        setStatus(prev => ({ 
          ...prev, 
          settings: { 
            isLoaded: true, 
            count: 1, 
            timestamp: now.getTime(), 
            error: null 
          } 
        }));
      }

      setLastSyncTime(now.toLocaleString());
      
      // Сохраняем флаг о загрузке в сессии
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('zametka_session_loaded', 'true');
      }
      
      setLoadingStep('Данные успешно загружены');
      showNotification('Данные успешно загружены из облака', 'success');
      
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStep('');
      }, 1500);
      
      return true;
    } catch (e) {
      console.error('Ошибка при загрузке данных из облака:', e);
      setError(`Ошибка загрузки: ${e instanceof Error ? e.message : 'Неизвестная ошибка'}`);
      setLoadingStep('Ошибка загрузки');
      showNotification('Произошла ошибка при загрузке данных', 'error');
      
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStep('');
      }, 1500);
      
      return false;
    }
  };

  // Контекст
  const contextValue: TelegramStorageContext = {
    isAvailable,
    isLoading,
    lastSyncTime,
    error,
    status,
    syncData,
    loadData,
  };

  return (
    <TelegramStorageContext.Provider value={contextValue}>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="bg-primary text-white text-xs flex items-center justify-between px-3 py-2">
            <div className="flex items-center">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white/80 rounded-full animate-spin mr-2"></div>
              <span>{loadingStep}</span>
            </div>
          </div>
        </div>
      )}
      
      {error && !isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="bg-destructive text-white text-xs flex items-center justify-between px-3 py-2">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-white hover:text-white/80"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {children}
    </TelegramStorageContext.Provider>
  );
}; 