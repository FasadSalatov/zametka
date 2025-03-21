"use client";

import React, { useState, useEffect } from 'react';
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
  const [localCounts, setLocalCounts] = useState({
    notes: 0,
    finances: 0,
    debts: 0
  });
  
  // Обновляем счетчики при изменении данных
  useEffect(() => {
    console.log('SettingsExportImport - данные:', {
      notes: notes.length,
      transactions: transactions.length,
      debts: debts.length,
      settings: settings
    });
    
    // Если хранилища пусты, пробуем загрузить данные из localStorage
    if (typeof window !== "undefined" && notes.length === 0) {
      try {
        // Дополнительная проверка для ключа zametka_notes
        const savedZametkaNotesString = localStorage.getItem("zametka_notes");
        if (savedZametkaNotesString) {
          console.log("SettingsExportImport: Найдены заметки в localStorage под ключом zametka_notes");
          try {
            const parsedNotes = JSON.parse(savedZametkaNotesString);
            if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
              console.log(`SettingsExportImport: Загружаем ${parsedNotes.length} заметок из zametka_notes`);
              setNotes(parsedNotes);
              // Синхронизируем данные между ключами
              localStorage.setItem("notes", savedZametkaNotesString);
            }
          } catch (e) {
            console.error("Ошибка при разборе заметок из zametka_notes:", e);
          }
        }
      } catch (error) {
        console.error("Ошибка при проверке дополнительных ключей:", error);
      }
    }
    
    setLocalCounts({
      notes: notes.length,
      finances: transactions.length,
      debts: debts.length
    });
  }, [notes.length, transactions.length, debts.length, settings, setNotes]);
  
  // Экспорт данных в файл
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Попытка принудительно загрузить данные перед экспортом
      const zametkaNotesStr = localStorage.getItem("zametka_notes");
      if (zametkaNotesStr && notes.length === 0) {
        try {
          const parsedNotes = JSON.parse(zametkaNotesStr);
          if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
            console.log(`Экспорт: принудительная загрузка ${parsedNotes.length} заметок из localStorage`);
            setNotes(parsedNotes);
            // Небольшая задержка, чтобы хранилище обновилось
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (e) {
          console.error("Ошибка при разборе заметок перед экспортом:", e);
        }
      }
      
      // Проверка финансов перед экспортом
      if (transactions.length === 0) {
        // Проверяем все возможные ключи для финансов
        const possibleKeys = ["zametka_finances", "finances", "zametka-finances", "transactions", "zametka_transactions"];
        for (const key of possibleKeys) {
          const financeData = localStorage.getItem(key);
          if (financeData) {
            try {
              const parsedFinances = JSON.parse(financeData);
              if (Array.isArray(parsedFinances) && parsedFinances.length > 0) {
                console.log(`Экспорт: принудительная загрузка ${parsedFinances.length} финансов из ключа ${key}`);
                setTransactions(parsedFinances);
                
                // Сохраняем данные под стандартными ключами
                localStorage.setItem("finances", financeData);
                localStorage.setItem("zametka_finances", financeData);
                
                // Небольшая задержка, чтобы хранилище обновилось
                await new Promise(resolve => setTimeout(resolve, 100));
                break;
              }
            } catch (e) {
              console.error(`Ошибка при разборе финансов из ключа ${key}:`, e);
            }
          }
        }
      }
      
      // Проверяем, что данные действительно есть в хранилище
      console.log('Данные для экспорта ПОСЛЕ проверки:', {
        notes: useNotesStore.getState().notes.length,
        transactions: useFinancesStore.getState().transactions.length,
        debts: useDebtsStore.getState().debts.length,
      });
      
      // Принудительно используем актуальные данные из хранилища
      const currentNotes = useNotesStore.getState().notes;
      const currentTransactions = useFinancesStore.getState().transactions;
      const currentDebts = useDebtsStore.getState().debts;
      
      console.log('Экспорт данных:', {
        notes: currentNotes.length,
        transactions: currentTransactions.length,
        debts: currentDebts.length,
        settings: settings
      });
      
      const exportData: CloudData = {
        notes: currentNotes,
        finances: currentTransactions,
        debts: currentDebts,
        settings
      };
      
      // Создаем JSON-строку из данных
      const dataStr = JSON.stringify(exportData, null, 2);
      console.log('Экспортируемые данные (начало строки):', dataStr.substring(0, 100) + '...');
      
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
      
      // showNotification('Данные успешно экспортированы', 'success');
    } catch (error) {
      console.error('Ошибка при экспорте данных:', error);
      // showNotification('Ошибка при экспорте данных', 'error');
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
          // showNotification('Файл не выбран', 'warning');
          setIsImporting(false);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            console.log('Импортируемые данные (начало строки):', content.substring(0, 100) + '...');
            
            const importedData = JSON.parse(content) as CloudData;
            console.log('Импортированные данные:', {
              notes: importedData.notes?.length || 0,
              finances: importedData.finances?.length || 0,
              debts: importedData.debts?.length || 0,
              settings: importedData.settings ? 'Есть' : 'Нет'
            });
            
            // Базовая валидация импортированных данных
            if (!validateImportedData(importedData)) {
              // showNotification('Неверный формат файла данных', 'error');
              setIsImporting(false);
              return;
            }
            
            // Применение импортированных данных
            if (importedData.notes) {
              setNotes(importedData.notes);
              localStorage.setItem('notes', JSON.stringify(importedData.notes));
            }
            
            if (importedData.finances) {
              setTransactions(importedData.finances);
              localStorage.setItem('finances', JSON.stringify(importedData.finances));
            }
            
            if (importedData.debts) {
              setDebts(importedData.debts);
              localStorage.setItem('debts', JSON.stringify(importedData.debts));
            }
            
            if (importedData.settings) {
              setSettings(importedData.settings);
              localStorage.setItem('settings', JSON.stringify(importedData.settings));
            }
            
            // Вызываем haptic feedback, если доступен
            if (window.Telegram?.WebApp?.HapticFeedback) {
              window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
            
            // showNotification('Данные успешно импортированы', 'success');
            setIsImporting(false);
          } catch (error) {
            console.error('Ошибка при разборе импортированного файла:', error);
            // showNotification('Ошибка при разборе файла данных', 'error');
            setIsImporting(false);
          }
        };
        
        reader.onerror = () => {
          // showNotification('Ошибка при чтении файла', 'error');
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
      // showNotification('Ошибка при импорте данных', 'error');
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
        <div className="border border-border rounded-md p-4 mb-4">
          <h4 className="font-medium text-sm mb-2">Локальные данные:</h4>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div>Заметки:</div>
            <div>{localCounts.notes}</div>
            
            <div>Финансы:</div>
            <div>{localCounts.finances}</div>
            
            <div>Долги:</div>
            <div>{localCounts.debts}</div>
            
            <div>Настройки:</div>
            <div>{settings && Object.keys(settings).length > 0 ? 'Есть' : 'Нет'}</div>
          </div>
        </div>
        
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