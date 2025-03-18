"use client";

import React, { useState } from 'react';
import { useNotesStore } from '@/stores/notes-store';
import { useFinancesStore } from '@/stores/finances-store';
import { useDebtsStore } from '@/stores/debts-store';
import { useSettingsStore } from '@/stores/settings-store';
import { showNotification } from '@/utils/helpers';
import { CloudData } from '@/utils/cloudStorage';

// Компонент для экспорта и импорта данных
export default function SettingsExportImport() {
  const { notes, setNotes } = useNotesStore();
  const { transactions, setTransactions } = useFinancesStore();
  const { debts, setDebts } = useDebtsStore();
  const { settings, setSettings } = useSettingsStore();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Экспорт данных в файл
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData: CloudData = {
        notes,
        finances: transactions,
        debts,
        settings
      };
      
      // Создаем JSON-строку из данных
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Создаем ссылку для скачивания
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zametka_backup.json';
      document.body.appendChild(a);
      a.click();
      
      // Очищаем
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      // Вызываем haptic feedback, если доступен
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      showNotification('Данные успешно экспортированы', 'success');
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
      // Создаем скрытый input для выбора файла
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          showNotification('Файл не выбран', 'warning');
          setIsImporting(false);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const importedData = JSON.parse(content) as CloudData;
            
            // Базовая валидация импортированных данных
            if (!validateImportedData(importedData)) {
              showNotification('Неверный формат файла данных', 'error');
              setIsImporting(false);
              return;
            }
            
            // Применение импортированных данных
            if (importedData.notes) {
              setNotes(importedData.notes);
            }
            
            if (importedData.finances) {
              setTransactions(importedData.finances);
            }
            
            if (importedData.debts) {
              setDebts(importedData.debts);
            }
            
            if (importedData.settings) {
              setSettings(importedData.settings);
            }
            
            // Вызываем haptic feedback, если доступен
            if (window.Telegram?.WebApp?.HapticFeedback) {
              window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
            
            showNotification('Данные успешно импортированы', 'success');
            setIsImporting(false);
          } catch (error) {
            console.error('Ошибка при разборе импортированного файла:', error);
            showNotification('Ошибка при разборе файла данных', 'error');
            setIsImporting(false);
          }
        };
        
        reader.onerror = () => {
          showNotification('Ошибка при чтении файла', 'error');
          setIsImporting(false);
        };
        
        reader.readAsText(file);
      };
      
      // Удаляем элемент после выбора файла
      input.onabort = () => {
        document.body.removeChild(input);
        setIsImporting(false);
      };
      
      document.body.appendChild(input);
      input.click();
      
      // Это необходимо для iOS Safari
      setTimeout(() => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Ошибка при импорте данных:', error);
      showNotification('Ошибка при импорте данных', 'error');
      setIsImporting(false);
    }
  };
  
  // Валидация импортированных данных
  const validateImportedData = (data: any): data is CloudData => {
    // Проверяем, что data - объект
    if (!data || typeof data !== 'object') return false;
    
    // Проверяем основные поля
    if (
      (data.notes !== undefined && !Array.isArray(data.notes)) ||
      (data.finances !== undefined && !Array.isArray(data.finances)) ||
      (data.debts !== undefined && !Array.isArray(data.debts)) ||
      (data.settings !== undefined && typeof data.settings !== 'object')
    ) {
      return false;
    }
    
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Резервное копирование</h3>
          <p className="text-sm text-muted-foreground">Экспортируйте данные в файл для создания резервной копии</p>
          
          <button
            onClick={handleExport}
            disabled={isExporting || isImporting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm py-2 rounded-md disabled:opacity-50"
          >
            {isExporting ? 'Экспорт...' : 'Экспортировать данные'}
          </button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Восстановление данных</h3>
          <p className="text-sm text-muted-foreground">Импортируйте данные из ранее созданной резервной копии</p>
          
          <button
            onClick={handleImport}
            disabled={isExporting || isImporting}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 text-sm py-2 rounded-md disabled:opacity-50"
          >
            {isImporting ? 'Импорт...' : 'Импортировать данные'}
          </button>
        </div>
      </div>
    </div>
  );
} 