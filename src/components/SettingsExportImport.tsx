"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useNotesStore } from '@/stores/notes-store';
import { useFinancesStore } from '@/stores/finances-store';
import { useDebtsStore } from '@/stores/debts-store';
import { useSettingsStore } from '@/stores/settings-store';
import { showNotification } from '@/utils/helpers';
import { 
  createExportData, 
  exportDataToFile, 
  importDataFromFile 
} from '@/utils/telegramExportImport';

export default function SettingsExportImport() {
  const { notes } = useNotesStore();
  const { transactions } = useFinancesStore();
  const { debts } = useDebtsStore();
  const { settings } = useSettingsStore();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
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
        
        showNotification('Данные успешно импортированы и применены', 'success');
      }
    } catch (error) {
      console.error('Ошибка при импорте данных:', error);
      showNotification('Ошибка при импорте данных', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
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