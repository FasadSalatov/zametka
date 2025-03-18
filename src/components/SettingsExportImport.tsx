"use client";

import React, { useState, useEffect } from 'react';
import { exportDataWithTelegram, importDataWithTelegram, saveToTelegramCloud, loadFromTelegramCloud } from '@/utils/telegramExportImport';
import { Button } from '@/components/ui/Button';
import { useCloudStorage } from '@/components/providers/cloud-storage-provider';

// Ключи для хранения данных
const STORAGE_KEYS = {
  NOTES: 'zametka_notes_data',
  FINANCES: 'zametka_finances_data',
  DEBTS: 'zametka_debts_data',
  SETTINGS: 'zametka_settings',
  LAST_CLOUD_SAVE: 'zametka_last_cloud_save',
};

// Интервал автоматического сохранения (30 минут)
const AUTO_SAVE_INTERVAL = 30 * 60 * 1000;

interface SettingsExportImportProps {
  onDataImported?: (data: any) => void;
  onError?: (error: Error) => void;
}

export default function SettingsExportImport({ onDataImported, onError }: SettingsExportImportProps) {
  const { loadStatus, isLoading: isCloudLoading, reloadData } = useCloudStorage();
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    exportAll: false,
    importAll: false,
    saveToCloud: false,
    loadFromCloud: false,
    autoSave: false
  });
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);

  // Получение всех данных из localStorage
  const getAllData = () => {
    try {
      const data = {
        notes: localStorage.getItem('notes') ? JSON.parse(localStorage.getItem('notes') || '[]') : [],
        finances: localStorage.getItem('finances') ? JSON.parse(localStorage.getItem('finances') || '[]') : [],
        debts: localStorage.getItem('debts') ? JSON.parse(localStorage.getItem('debts') || '[]') : [],
        settings: localStorage.getItem('settings') ? JSON.parse(localStorage.getItem('settings') || '{}') : {},
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      return data;
    } catch (e) {
      console.error('Ошибка при получении данных:', e);
      return null;
    }
  };

  // Применение импортированных данных
  const applyImportedData = (data: any) => {
    try {
      if (data.notes) localStorage.setItem('notes', JSON.stringify(data.notes));
      if (data.finances) localStorage.setItem('finances', JSON.stringify(data.finances));
      if (data.debts) localStorage.setItem('debts', JSON.stringify(data.debts));
      if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings));
      
      if (onDataImported) onDataImported(data);
      
      return true;
    } catch (e) {
      console.error('Ошибка при применении импортированных данных:', e);
      if (onError) onError(new Error('Не удалось применить импортированные данные'));
      return false;
    }
  };

  // Экспорт всех данных
  const handleExportAll = async () => {
    setLoading({...loading, exportAll: true});
    try {
      const data = getAllData();
      if (!data) {
        throw new Error('Не удалось получить данные для экспорта');
      }
      
      const success = await exportDataWithTelegram(data, 'zametka_data_export.json');
      if (success) {
        setLastAction('Данные успешно экспортированы');
      } else {
        throw new Error('Экспорт не удался');
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      setLastAction('Ошибка при экспорте данных');
      if (onError) onError(error instanceof Error ? error : new Error('Неизвестная ошибка при экспорте'));
    } finally {
      setLoading({...loading, exportAll: false});
    }
  };

  // Импорт всех данных
  const handleImportAll = async () => {
    setLoading({...loading, importAll: true});
    try {
      const data = await importDataWithTelegram();
      if (!data) {
        throw new Error('Не удалось получить данные для импорта');
      }
      
      const success = applyImportedData(data);
      if (success) {
        setLastAction('Данные успешно импортированы');
      } else {
        throw new Error('Импорт не удался');
      }
    } catch (error) {
      console.error('Ошибка импорта:', error);
      setLastAction('Ошибка при импорте данных');
      if (onError) onError(error instanceof Error ? error : new Error('Неизвестная ошибка при импорте'));
    } finally {
      setLoading({...loading, importAll: false});
    }
  };

  // Сохранение в облако Telegram
  const handleSaveToCloud = async () => {
    setLoading({...loading, saveToCloud: true});
    try {
      const data = getAllData();
      if (!data) {
        throw new Error('Не удалось получить данные для сохранения в облако');
      }
      
      // Сохраняем каждый раздел отдельно, чтобы не превысить лимиты CloudStorage
      const notesSaved = await saveToTelegramCloud(STORAGE_KEYS.NOTES, data.notes);
      const financesSaved = await saveToTelegramCloud(STORAGE_KEYS.FINANCES, data.finances);
      const debtsSaved = await saveToTelegramCloud(STORAGE_KEYS.DEBTS, data.debts);
      const settingsSaved = await saveToTelegramCloud(STORAGE_KEYS.SETTINGS, data.settings);
      
      if (notesSaved && financesSaved && debtsSaved && settingsSaved) {
        // Сохраняем время последнего сохранения
        const now = new Date();
        await saveToTelegramCloud(STORAGE_KEYS.LAST_CLOUD_SAVE, now.toISOString());
        setLastAutoSave(new Date().toLocaleString());
        setLastAction('Данные успешно сохранены в облако Telegram');
      } else {
        throw new Error('Не все данные удалось сохранить в облако');
      }
    } catch (error) {
      console.error('Ошибка сохранения в облако:', error);
      setLastAction('Ошибка при сохранении в облако');
      if (onError) onError(error instanceof Error ? error : new Error('Неизвестная ошибка при сохранении в облако'));
    } finally {
      setLoading({...loading, saveToCloud: false});
    }
  };

  // Загрузка из облака Telegram
  const handleLoadFromCloud = async () => {
    setLoading({...loading, loadFromCloud: true});
    try {
      // Загружаем каждый раздел отдельно
      const notes = await loadFromTelegramCloud(STORAGE_KEYS.NOTES);
      const finances = await loadFromTelegramCloud(STORAGE_KEYS.FINANCES);
      const debts = await loadFromTelegramCloud(STORAGE_KEYS.DEBTS);
      const settings = await loadFromTelegramCloud(STORAGE_KEYS.SETTINGS);
      
      // Создаем объект с данными для импорта
      const data = { notes, finances, debts, settings };
      
      // Проверяем, что хотя бы одна секция данных была загружена
      if (notes || finances || debts || settings) {
        const success = applyImportedData(data);
        if (success) {
          setLastAction('Данные успешно загружены из облака Telegram');
        } else {
          throw new Error('Не удалось применить загруженные из облака данные');
        }
      } else {
        setLastAction('В облаке не найдено данных для загрузки');
      }
    } catch (error) {
      console.error('Ошибка загрузки из облака:', error);
      setLastAction('Ошибка при загрузке из облака');
      if (onError) onError(error instanceof Error ? error : new Error('Неизвестная ошибка при загрузке из облака'));
    } finally {
      setLoading({...loading, loadFromCloud: false});
    }
  };

  // Автоматическое сохранение данных в облако
  const performAutoSave = async () => {
    if (!autoSaveEnabled) return;
    
    try {
      setLoading({...loading, autoSave: true});
      console.log('Выполняется автоматическое сохранение данных в облако...');
      
      const data = getAllData();
      if (!data) {
        console.error('Не удалось получить данные для автосохранения');
        return;
      }
      
      // Проверяем, есть ли изменения, которые нужно сохранить
      const hasNotesData = Array.isArray(data.notes) && data.notes.length > 0;
      const hasFinancesData = Array.isArray(data.finances) && data.finances.length > 0;
      const hasDebtsData = Array.isArray(data.debts) && data.debts.length > 0;
      
      if (!hasNotesData && !hasFinancesData && !hasDebtsData) {
        console.log('Нет данных для автосохранения');
        return;
      }
      
      // Сохраняем данные в облако
      const notesSaved = hasNotesData ? await saveToTelegramCloud(STORAGE_KEYS.NOTES, data.notes) : true;
      const financesSaved = hasFinancesData ? await saveToTelegramCloud(STORAGE_KEYS.FINANCES, data.finances) : true;
      const debtsSaved = hasDebtsData ? await saveToTelegramCloud(STORAGE_KEYS.DEBTS, data.debts) : true;
      const settingsSaved = await saveToTelegramCloud(STORAGE_KEYS.SETTINGS, data.settings);
      
      if (notesSaved && financesSaved && debtsSaved && settingsSaved) {
        // Сохраняем время последнего сохранения
        const now = new Date();
        await saveToTelegramCloud(STORAGE_KEYS.LAST_CLOUD_SAVE, now.toISOString());
        setLastAutoSave(now.toLocaleString());
        console.log('Автоматическое сохранение выполнено успешно:', now.toLocaleString());
      } else {
        console.error('Не все данные удалось автоматически сохранить в облако');
      }
    } catch (error) {
      console.error('Ошибка при автоматическом сохранении:', error);
    } finally {
      setLoading({...loading, autoSave: false});
    }
  };

  // Загрузка информации о последнем сохранении
  useEffect(() => {
    const loadLastSaveInfo = async () => {
      try {
        const lastSave = await loadFromTelegramCloud(STORAGE_KEYS.LAST_CLOUD_SAVE);
        if (lastSave) {
          try {
            const date = new Date(lastSave);
            setLastAutoSave(date.toLocaleString());
          } catch (e) {
            console.error('Ошибка при парсинге даты последнего сохранения:', e);
          }
        }
      } catch (e) {
        console.error('Ошибка при загрузке информации о последнем сохранении:', e);
      }
    };
    
    loadLastSaveInfo();
  }, []);

  // Настройка периодического автосохранения
  useEffect(() => {
    // Функция, которая проверяет, нужно ли выполнить автосохранение
    const checkAndPerformAutoSave = async () => {
      if (!autoSaveEnabled) return;
      
      try {
        // Получаем время последнего сохранения
        const lastSave = await loadFromTelegramCloud(STORAGE_KEYS.LAST_CLOUD_SAVE);
        
        // Если нет информации о последнем сохранении или прошло больше интервала
        if (!lastSave) {
          performAutoSave();
          return;
        }
        
        try {
          const lastSaveDate = new Date(lastSave);
          const now = new Date();
          const timeSinceLastSave = now.getTime() - lastSaveDate.getTime();
          
          if (timeSinceLastSave >= AUTO_SAVE_INTERVAL) {
            performAutoSave();
          } else {
            console.log(`Время до следующего автосохранения: ${Math.floor((AUTO_SAVE_INTERVAL - timeSinceLastSave) / 1000 / 60)} минут`);
          }
        } catch (e) {
          console.error('Ошибка при проверке времени последнего сохранения:', e);
        }
      } catch (e) {
        console.error('Ошибка при проверке автосохранения:', e);
      }
    };
    
    // Проверяем при загрузке компонента
    checkAndPerformAutoSave();
    
    // Устанавливаем интервал для проверки
    const intervalId = setInterval(checkAndPerformAutoSave, 5 * 60 * 1000); // Проверка каждые 5 минут
    
    return () => clearInterval(intervalId);
  }, [autoSaveEnabled]);

  // Обработчик изменения данных в localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      // Если данные изменились, запланируем автосохранение через небольшую задержку
      // для предотвращения частых сохранений при множественных изменениях
      if (autoSaveEnabled) {
        const timer = setTimeout(() => {
          performAutoSave();
        }, 10000); // Задержка 10 секунд после последнего изменения
        
        return () => clearTimeout(timer);
      }
    };
    
    // Добавляем слушатель событий для изменений в localStorage
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [autoSaveEnabled]);

  return (
    <div className="space-y-4">
      {/* Информация о данных в облаке */}
      <div className="bg-card border border-border rounded-lg p-3">
        <h3 className="text-sm font-medium mb-2">Данные в облаке Telegram</h3>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span>Заметки:</span>
            <span className={loadStatus.notes.isLoaded ? "text-green-500" : "text-muted-foreground"}>
              {loadStatus.notes.isLoaded 
                ? `${loadStatus.notes.count} шт.` 
                : "Не найдены"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Финансы:</span>
            <span className={loadStatus.finances.isLoaded ? "text-green-500" : "text-muted-foreground"}>
              {loadStatus.finances.isLoaded 
                ? `${loadStatus.finances.count} шт.` 
                : "Не найдены"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Долги:</span>
            <span className={loadStatus.debts.isLoaded ? "text-green-500" : "text-muted-foreground"}>
              {loadStatus.debts.isLoaded 
                ? `${loadStatus.debts.count} шт.` 
                : "Не найдены"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Настройки:</span>
            <span className={loadStatus.settings.isLoaded ? "text-green-500" : "text-muted-foreground"}>
              {loadStatus.settings.isLoaded ? "Сохранены" : "Не найдены"}
            </span>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={reloadData}
            disabled={isCloudLoading} 
            className="text-xs h-8 w-full"
            data-haptic="light"
          >
            {isCloudLoading ? 'Обновление...' : 'Обновить данные из облака'}
          </Button>
        </div>
      </div>

      {/* Действия с данными */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Резервное копирование</h3>
        
          {/* Кнопки экспорта и сохранения */}
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="primary" 
              onClick={handleExportAll} 
              disabled={loading.exportAll}
              data-haptic="medium"
              className="h-12 text-base flex justify-center items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              {loading.exportAll ? 'Экспорт...' : 'Экспортировать в файл'}
            </Button>
            
            <Button 
              variant="accent" 
              onClick={handleSaveToCloud} 
              disabled={loading.saveToCloud || loading.autoSave}
              data-haptic="medium"
              className="h-12 text-base flex justify-center items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {(loading.saveToCloud || loading.autoSave) ? 'Сохранение...' : 'Сохранить в облако TG'}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Восстановление данных</h3>
        
          {/* Кнопки импорта и загрузки */}
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="secondary" 
              onClick={handleImportAll} 
              disabled={loading.importAll}
              data-haptic="medium"
              className="h-12 text-base flex justify-center items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {loading.importAll ? 'Импорт...' : 'Импортировать из файла'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLoadFromCloud} 
              disabled={loading.loadFromCloud}
              data-haptic="medium"
              className="h-12 text-base flex justify-center items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              {loading.loadFromCloud ? 'Загрузка...' : 'Загрузить из облака TG'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Настройки автосохранения */}
      <div className="mt-3 px-3 py-2 border border-border rounded-lg bg-muted/20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-medium">Автосохранение</h3>
            <p className="text-xs text-muted-foreground">Сохраняет данные в облако автоматически</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className="sr-only peer"
              data-haptic="light"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        
        {lastAutoSave && (
          <div className="text-xs text-muted-foreground">
            Последнее сохранение: {lastAutoSave}
          </div>
        )}
      </div>
      
      {/* Сообщение о результате операции */}
      {lastAction && (
        <div className="mt-2 p-3 bg-muted/30 rounded text-sm text-center animate-fadeIn">
          {lastAction}
        </div>
      )}
      
      {/* Информация */}
      <div className="mt-4 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
        <p className="mb-1">• Экспортированные данные включают заметки, финансы, долги и настройки.</p>
        <p>• При импорте текущие данные будут заменены импортированными.</p>
      </div>
    </div>
  );
} 