"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useCloudStorage } from '@/components/providers/cloud-storage-provider';
import { useNotesStore } from '@/stores/notes-store';
import { useFinancesStore } from '@/stores/finances-store';
import { useDebtsStore } from '@/stores/debts-store';
import { useSettingsStore } from '@/stores/settings-store';
import { showNotification } from '@/utils/helpers';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  CloudStorageStats, 
  getCloudStorageStats, 
  createExportData, 
  exportDataToFile, 
  importDataFromFile 
} from '@/utils/telegramExportImport';

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

export default function SettingsExportImport() {
  const { notes } = useNotesStore();
  const { transactions } = useFinancesStore();
  const { debts } = useDebtsStore();
  const { settings } = useSettingsStore();
  const { isLoading, loadStatus, syncData } = useCloudStorage();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [cloudStats, setCloudStats] = useState<CloudStorageStats | null>(null);

  // Получение информации о данных в облаке при монтировании компонента
  useEffect(() => {
    const fetchCloudStats = async () => {
      const stats = await getCloudStorageStats();
      setCloudStats(stats);
    };
    
    fetchCloudStats();
    
    // Обновляем статистику каждые 30 секунд
    const interval = setInterval(fetchCloudStats, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Экспорт данных в файл
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = createExportData(notes, transactions, debts, settings);
      const success = exportDataToFile(exportData, 'zametka_backup.json');
      
      if (!success) {
        showNotification('Ошибка при экспорте данных', 'error');
      }
    } catch (error) {
      console.error('Ошибка при экспорте данных:', error);
      showNotification('Ошибка при экспорте данных', 'error');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Импорт данных из файла
  const handleImport = async () => {
    setIsImporting(true);
    try {
      const importedData = await importDataFromFile();
      
      if (importedData) {
        // Применение импортированных данных
        if (importedData.notes) {
          useNotesStore.getState().setNotes(importedData.notes);
        }
        
        if (importedData.finances) {
          useFinancesStore.getState().setTransactions(importedData.finances);
        }
        
        if (importedData.debts) {
          useDebtsStore.getState().setDebts(importedData.debts);
        }
        
        if (importedData.settings) {
          useSettingsStore.getState().setSettings(importedData.settings);
        }
        
        // Обновляем локальное хранилище
        try {
          if (importedData.notes) localStorage.setItem('notes', JSON.stringify(importedData.notes));
          if (importedData.finances) localStorage.setItem('finances', JSON.stringify(importedData.finances));
          if (importedData.debts) localStorage.setItem('debts', JSON.stringify(importedData.debts));
          if (importedData.settings) localStorage.setItem('settings', JSON.stringify(importedData.settings));
        } catch (e) {
          console.warn('Ошибка при сохранении данных в localStorage:', e);
        }
        
        // После успешного импорта синхронизируем с облаком
        syncData().catch(err => {
          console.error('Ошибка при синхронизации данных с облаком после импорта:', err);
        });
        
        showNotification('Данные успешно импортированы и применены', 'success');
        
        // Обновляем статистику облака
        const stats = await getCloudStorageStats();
        setCloudStats(stats);
      }
    } catch (error) {
      console.error('Ошибка при импорте данных:', error);
      showNotification('Ошибка при импорте данных', 'error');
    } finally {
      setIsImporting(false);
    }
  };
  
  // Синхронизация данных с облаком Telegram
  const handleSync = async () => {
    try {
      const success = await syncData();
      
      if (success) {
        // Обновляем статистику облака после синхронизации
        const stats = await getCloudStorageStats();
        setCloudStats(stats);
      }
    } catch (error) {
      console.error('Ошибка при синхронизации с облаком:', error);
      showNotification('Ошибка при синхронизации с облаком', 'error');
    }
  };
  
  // Форматирование времени последней синхронизации
  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Никогда';
    
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true,
        locale: ru
      });
    } catch (e) {
      return 'Недавно';
    }
  };

  return (
    <div className="space-y-6">
      {/* Информация о данных в облаке */}
      {cloudStats && (
        <div className="bg-background border border-border rounded-xl p-4 mb-4">
          <h3 className="text-lg font-medium mb-2">Данные в облаке Telegram</h3>
          
          {cloudStats.enabled ? (
            <div className="space-y-2 text-sm">
              <p>Последняя синхронизация: {formatLastSync(cloudStats.lastSync)}</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Заметки: {cloudStats.items[STORAGE_KEYS.NOTES] ?? 'нет данных'}</li>
                <li>Финансы: {cloudStats.items[STORAGE_KEYS.FINANCES] ?? 'нет данных'}</li>
                <li>Долги: {cloudStats.items[STORAGE_KEYS.DEBTS] ?? 'нет данных'}</li>
                <li>Настройки: {cloudStats.items[STORAGE_KEYS.SETTINGS] ? 'сохранены' : 'не сохранены'}</li>
              </ul>
              
              <Button 
                onClick={handleSync} 
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                {isLoading ? 'Синхронизация...' : 'Синхронизировать сейчас'}
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Облачное хранилище Telegram недоступно в этом браузере.
              Используйте мини-приложение в Telegram для синхронизации данных.
            </p>
          )}
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Резервное копирование</h3>
          <p className="text-sm text-muted-foreground">Экспортируйте данные в файл для создания резервной копии</p>
          
          <Button
            onClick={handleExport}
            disabled={isExporting || isImporting}
            className="w-full"
          >
            {isExporting ? 'Экспорт...' : 'Экспортировать данные'}
          </Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Восстановление данных</h3>
          <p className="text-sm text-muted-foreground">Импортируйте данные из ранее созданной резервной копии</p>
          
          <Button
            onClick={handleImport}
            disabled={isExporting || isImporting}
            className="w-full"
            variant="outline"
          >
            {isImporting ? 'Импорт...' : 'Импортировать данные'}
          </Button>
        </div>
      </div>
    </div>
  );
} 