"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTelegramStorage } from '@/components/providers/telegram-storage-provider';
import { useNotesStore } from '@/stores/notes-store';
import { useFinancesStore } from '@/stores/finances-store';
import { useDebtsStore } from '@/stores/debts-store';
import { showNotification } from '@/utils/helpers';

export default function TelegramCloudStorageCard() {
  const { 
    isAvailable, 
    isLoading, 
    lastSyncTime, 
    error, 
    status, 
    syncData, 
    loadData 
  } = useTelegramStorage();

  // Получаем количество локальных данных
  const { notes, setNotes } = useNotesStore();
  const { transactions, setTransactions } = useFinancesStore();
  const { debts, setDebts } = useDebtsStore();

  const [localCounts, setLocalCounts] = useState({
    notes: 0,
    finances: 0,
    debts: 0
  });

  // Обновление счетчиков локальных данных
  useEffect(() => {
    console.log('Локальные данные обновлены:', { 
      notes: notes.length, 
      transactions: transactions.length, 
      debts: debts.length 
    });
    
    // Проверяем содержимое localStorage
    if (typeof window !== "undefined") {
      try {
        const localStorageKeys = Object.keys(localStorage);
        console.log("Ключи в localStorage:", localStorageKeys);
        
        // Проверяем ключи, связанные с заметками
        const notesKeys = localStorageKeys.filter(key => key.includes("notes") || key.includes("Notes"));
        console.log("Ключи с заметками:", notesKeys);
        notesKeys.forEach(key => {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const parsed = JSON.parse(value);
              console.log(`Содержимое ключа ${key}:`, Array.isArray(parsed) ? `Массив (${parsed.length})` : typeof parsed);
            }
          } catch (e) {
            console.error(`Ошибка при анализе ключа ${key}:`, e);
          }
        });
      } catch (error) {
        console.error("Ошибка при анализе localStorage:", error);
      }
    }
    
    setLocalCounts({
      notes: notes.length,
      finances: transactions.length,
      debts: debts.length
    });
  }, [notes, transactions, debts]);

  const handleSync = async () => {
    try {
      if (!isLoading) {
        console.log('Синхронизация данных с облаком...');
        
        // Принудительная загрузка данных из localStorage перед синхронизацией
        let needsDelay = false;
        
        // Проверяем заметки
        if (notes.length === 0) {
          const notesStr = localStorage.getItem("zametka_notes");
          if (notesStr) {
            try {
              const parsedNotes = JSON.parse(notesStr);
              if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
                console.log(`CloudStorage: принудительная загрузка ${parsedNotes.length} заметок`);
                setNotes(parsedNotes);
                needsDelay = true;
              }
            } catch (e) {
              console.error("Ошибка при загрузке заметок перед синхронизацией:", e);
            }
          }
        }
        
        // Проверяем финансы
        if (transactions.length === 0) {
          const financesStr = localStorage.getItem("zametka_finances");
          if (financesStr) {
            try {
              const parsedFinances = JSON.parse(financesStr);
              if (Array.isArray(parsedFinances) && parsedFinances.length > 0) {
                console.log(`CloudStorage: принудительная загрузка ${parsedFinances.length} финансов`);
                setTransactions(parsedFinances);
                needsDelay = true;
              }
            } catch (e) {
              console.error("Ошибка при загрузке финансов перед синхронизацией:", e);
            }
          }
        }
        
        // Проверяем долги
        if (debts.length === 0) {
          const debtsStr = localStorage.getItem("zametka_debts");
          if (debtsStr) {
            try {
              const parsedDebts = JSON.parse(debtsStr);
              if (Array.isArray(parsedDebts) && parsedDebts.length > 0) {
                console.log(`CloudStorage: принудительная загрузка ${parsedDebts.length} долгов`);
                setDebts(parsedDebts);
                needsDelay = true;
              }
            } catch (e) {
              console.error("Ошибка при загрузке долгов перед синхронизацией:", e);
            }
          }
        }
        
        // Даем время на обновление хранилища
        if (needsDelay) {
          console.log("Ожидание обновления хранилища...");
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Получаем актуальные данные из хранилища Zustand напрямую
        const actualNotes = useNotesStore.getState().notes;
        const actualTransactions = useFinancesStore.getState().transactions;
        const actualDebts = useDebtsStore.getState().debts;
        
        console.log('Локальные данные перед синхронизацией:', {
          notes: actualNotes.length,
          transactions: actualTransactions.length,
          debts: actualDebts.length
        });
        
        const success = await syncData();
        if (success) {
         // showNotification('Данные успешно сохранены в облако', 'success');
        }
      }
    } catch (error) {
      console.error('Ошибка при синхронизации:', error);
      showNotification('Произошла ошибка при синхронизации', 'error');
    }
  };

  const handleLoad = async () => {
    try {
      if (!isLoading) {
        const success = await loadData();
        if (success) {
        //  showNotification('Данные успешно загружены из облака', 'success');
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке:', error);
      showNotification('Произошла ошибка при загрузке данных', 'error');
    }
  };

  if (!isAvailable) {
    return (
      <div className="bg-card border border-border rounded-md p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Облачное хранилище</h3>
          <span className="text-sm px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">Недоступно</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Облачное хранилище Telegram WebApp API недоступно. Возможные причины:
        </p>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Вы используете устаревшую версию Telegram (требуется 6.9+)</li>
          <li>Приложение запущено вне Telegram WebApp</li>
          <li>Функция отключена администратором бота</li>
        </ul>
      </div>
    );
  }

  // Расчет процента синхронизации
  const syncPercentage = {
    notes: localCounts.notes > 0 ? Math.min(100, ((status.notes.count || 0) / localCounts.notes * 100)) : (status.notes.count || 0) > 0 ? 100 : 0,
    finances: localCounts.finances > 0 ? Math.min(100, ((status.finances.count || 0) / localCounts.finances * 100)) : (status.finances.count || 0) > 0 ? 100 : 0,
    debts: localCounts.debts > 0 ? Math.min(100, ((status.debts.count || 0) / localCounts.debts * 100)) : (status.debts.count || 0) > 0 ? 100 : 0
  };

  return (
    <div className="bg-card border border-border rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Облачное хранилище</h3>
        <span className="text-sm px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">Доступно</span>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Синхронизируйте ваши данные между устройствами с помощью облачного хранилища Telegram
        </p>
        
        {lastSyncTime && (
          <p className="text-xs text-muted-foreground">
            Последняя синхронизация: {lastSyncTime}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm py-2 rounded-md disabled:opacity-50"
            onClick={handleSync}
            disabled={isLoading}
          >
            {isLoading ? 'Синхронизация...' : 'Сохранить в облако'}
          </button>
          
          <button
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-sm py-2 rounded-md disabled:opacity-50"
            onClick={handleLoad}
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : 'Загрузить из облака'}
          </button>
        </div>
      </div>
      
      {/* Состояние синхронизации */}
      <div className="space-y-3 text-sm">
        <h4 className="font-medium">Статус синхронизации:</h4>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span>Заметки:</span>
              <div className="flex space-x-3 text-xs">
                <span className="text-muted-foreground">Локально: <span className="font-medium">{localCounts.notes}</span></span>
                <span className="text-muted-foreground">В облаке: <span className={status.notes.isLoaded ? 'text-green-600 dark:text-green-400 font-medium' : 'font-medium'}>
                  {status.notes.count !== null ? status.notes.count : '0'}
                </span></span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${syncPercentage.notes >= 100 ? 'bg-green-600 dark:bg-green-500' : 'bg-amber-500 dark:bg-amber-400'}`} 
                style={{ width: `${syncPercentage.notes}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span>Финансы:</span>
              <div className="flex space-x-3 text-xs">
                <span className="text-muted-foreground">Локально: <span className="font-medium">{localCounts.finances}</span></span>
                <span className="text-muted-foreground">В облаке: <span className={status.finances.isLoaded ? 'text-green-600 dark:text-green-400 font-medium' : 'font-medium'}>
                  {status.finances.count !== null ? status.finances.count : '0'}
                </span></span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${syncPercentage.finances >= 100 ? 'bg-green-600 dark:bg-green-500' : 'bg-amber-500 dark:bg-amber-400'}`} 
                style={{ width: `${syncPercentage.finances}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span>Долги:</span>
              <div className="flex space-x-3 text-xs">
                <span className="text-muted-foreground">Локально: <span className="font-medium">{localCounts.debts}</span></span>
                <span className="text-muted-foreground">В облаке: <span className={status.debts.isLoaded ? 'text-green-600 dark:text-green-400 font-medium' : 'font-medium'}>
                  {status.debts.count !== null ? status.debts.count : '0'}
                </span></span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${syncPercentage.debts >= 100 ? 'bg-green-600 dark:bg-green-500' : 'bg-amber-500 dark:bg-amber-400'}`} 
                style={{ width: `${syncPercentage.debts}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs">
          <span className="font-medium">Ошибка: </span> {error}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mt-2">
        <p>
          <strong>Важно:</strong> После создания новых заметок, финансов или долгов нажмите "Сохранить в облако", чтобы синхронизировать их.
        </p>
      </div>
    </div>
  );
} 