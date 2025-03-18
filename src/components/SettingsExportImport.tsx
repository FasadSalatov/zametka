"use client";

import React, { useState } from 'react';
import { exportDataWithTelegram, importDataWithTelegram, saveToTelegramCloud, loadFromTelegramCloud } from '@/utils/telegramExportImport';
import { Button } from '@/components/ui/Button';

// Ключи для хранения данных
const STORAGE_KEYS = {
  NOTES: 'zametka_notes_data',
  FINANCES: 'zametka_finances_data',
  DEBTS: 'zametka_debts_data',
  SETTINGS: 'zametka_settings',
};

interface SettingsExportImportProps {
  onDataImported?: (data: any) => void;
  onError?: (error: Error) => void;
}

export default function SettingsExportImport({ onDataImported, onError }: SettingsExportImportProps) {
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    exportAll: false,
    importAll: false,
    saveToCloud: false,
    loadFromCloud: false
  });
  const [lastAction, setLastAction] = useState<string | null>(null);

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

  return (
    <div className="space-y-4">
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
              disabled={loading.saveToCloud}
              data-haptic="medium"
              className="h-12 text-base flex justify-center items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {loading.saveToCloud ? 'Сохранение...' : 'Сохранить в облако TG'}
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