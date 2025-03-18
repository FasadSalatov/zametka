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
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <h2 className="text-xl font-semibold mb-4">Экспорт и импорт данных</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Файловые операции</h3>
          <p className="text-sm text-muted-foreground">Экспорт и импорт через JSON-файлы</p>
          <div className="flex flex-col gap-2">
            <Button 
              variant="primary" 
              onClick={handleExportAll} 
              disabled={loading.exportAll}
              data-haptic="medium"
            >
              {loading.exportAll ? 'Экспорт...' : 'Экспортировать все данные'}
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={handleImportAll} 
              disabled={loading.importAll}
              data-haptic="medium"
            >
              {loading.importAll ? 'Импорт...' : 'Импортировать из файла'}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Облачное хранилище</h3>
          <p className="text-sm text-muted-foreground">Синхронизация через Telegram Cloud</p>
          <div className="flex flex-col gap-2">
            <Button 
              variant="accent" 
              onClick={handleSaveToCloud} 
              disabled={loading.saveToCloud}
              data-haptic="medium"
            >
              {loading.saveToCloud ? 'Сохранение...' : 'Сохранить в облако Telegram'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLoadFromCloud} 
              disabled={loading.loadFromCloud}
              data-haptic="medium"
            >
              {loading.loadFromCloud ? 'Загрузка...' : 'Загрузить из облака Telegram'}
            </Button>
          </div>
        </div>
      </div>
      
      {lastAction && (
        <div className="mt-4 p-2 bg-secondary/20 rounded text-sm text-center">
          {lastAction}
        </div>
      )}
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Примечание: Экспортированные данные включают заметки, финансы, долги и настройки приложения.</p>
        <p>При импорте данных текущие данные будут заменены импортированными.</p>
      </div>
    </div>
  );
} 