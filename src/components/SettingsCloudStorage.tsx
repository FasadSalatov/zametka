"use client";

import React, { useState, useEffect } from 'react';
import { useNotesStore } from '@/stores/notes-store';
import { useFinancesStore } from '@/stores/finances-store';
import { useDebtsStore } from '@/stores/debts-store';
import { useSettingsStore } from '@/stores/settings-store';
import { 
  isCloudStorageAvailable, 
  saveToCloud, 
  loadAllFromCloud, 
  getCloudStorageStats,
  STORAGE_KEYS
} from '@/utils/cloudStorage';
import { showNotification } from '@/utils/helpers';

export default function SettingsCloudStorage() {
  const { notes, setNotes } = useNotesStore();
  const { transactions, setTransactions } = useFinancesStore();
  const { debts, setDebts } = useDebtsStore();
  const { settings, setSettings } = useSettingsStore();
  
  const [cloudAvailable, setCloudAvailable] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDirection, setSyncDirection] = useState<'toCloud' | 'fromCloud'>('toCloud');
  const [stats, setStats] = useState<{
    enabled: boolean;
    items: Record<string, number | null>;
    lastSync: number | null;
  }>({
    enabled: false,
    items: {},
    lastSync: null
  });
  
  // Проверяем доступность CloudStorage
  useEffect(() => {
    const checkCloudStorage = async () => {
      const available = isCloudStorageAvailable();
      setCloudAvailable(available);
      
      if (available) {
        refreshStats();
      }
    };
    
    checkCloudStorage();
  }, []);
  
  // Обновляем статистику CloudStorage
  const refreshStats = async () => {
    const storageStats = await getCloudStorageStats();
    setStats(storageStats);
  };
  
  // Сохраняем данные из локального хранилища в облако
  const handleSaveToCloud = async () => {
    if (!cloudAvailable) {
      showNotification('CloudStorage API недоступен', 'error');
      return;
    }
    
    setIsSyncing(true);
    setSyncDirection('toCloud');
    
    try {
      // Сохраняем заметки
      if (notes.length > 0) {
        const notesSuccess = await saveToCloud(STORAGE_KEYS.NOTES, notes);
        if (!notesSuccess) {
          console.error('Не удалось сохранить заметки в облако');
        }
      }
      
      // Сохраняем финансы
      if (transactions.length > 0) {
        const financesSuccess = await saveToCloud(STORAGE_KEYS.FINANCES, transactions);
        if (!financesSuccess) {
          console.error('Не удалось сохранить финансы в облако');
        }
      }
      
      // Сохраняем долги
      if (debts.length > 0) {
        const debtsSuccess = await saveToCloud(STORAGE_KEYS.DEBTS, debts);
        if (!debtsSuccess) {
          console.error('Не удалось сохранить долги в облако');
        }
      }
      
      // Сохраняем настройки
      if (settings && Object.keys(settings).length > 0) {
        const settingsSuccess = await saveToCloud(STORAGE_KEYS.SETTINGS, settings);
        if (!settingsSuccess) {
          console.error('Не удалось сохранить настройки в облако');
        }
      }
      
      // Обновляем статистику
      await refreshStats();
      
      // showNotification('Данные успешно сохранены в облако', 'success');
      
      // Haptic feedback если доступен
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (error) {
      console.error('Ошибка при сохранении данных в облако:', error);
      showNotification('Ошибка при сохранении данных в облако', 'error');
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Загружаем данные из облака в локальное хранилище
  const handleLoadFromCloud = async () => {
    if (!cloudAvailable) {
      showNotification('CloudStorage API недоступен', 'error');
      return;
    }
    
    setIsSyncing(true);
    setSyncDirection('fromCloud');
    
    try {
      const cloudData = await loadAllFromCloud();
      
      // Применяем заметки из облака, если они есть
      if (cloudData.notes && cloudData.notes.length > 0) {
        setNotes(cloudData.notes);
        localStorage.setItem('notes', JSON.stringify(cloudData.notes));
      }
      
      // Применяем финансы из облака, если они есть
      if (cloudData.finances && cloudData.finances.length > 0) {
        setTransactions(cloudData.finances);
        localStorage.setItem('finances', JSON.stringify(cloudData.finances));
      }
      
      // Применяем долги из облака, если они есть
      if (cloudData.debts && cloudData.debts.length > 0) {
        setDebts(cloudData.debts);
        localStorage.setItem('debts', JSON.stringify(cloudData.debts));
      }
      
      // Применяем настройки из облака, если они есть
      if (cloudData.settings) {
        setSettings(cloudData.settings);
        localStorage.setItem('settings', JSON.stringify(cloudData.settings));
      }
      
      // showNotification('Данные успешно загружены из облака', 'success');
      
      // Haptic feedback если доступен
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных из облака:', error);
      showNotification('Ошибка при загрузке данных из облака', 'error');
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Форматируем дату последней синхронизации
  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Никогда';
    
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (!cloudAvailable) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Облачное хранилище</h3>
          <p className="text-sm text-muted-foreground">Облачное хранилище Telegram недоступно</p>
          <p className="text-sm text-muted-foreground">Возможные причины:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            <li>Вы запускаете приложение вне Telegram WebApp</li>
            <li>Используемая вами версия Telegram не поддерживает CloudStorage</li>
            <li>Приложение не имеет необходимых разрешений</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Облачное хранилище</h3>
        <p className="text-sm text-muted-foreground">
          Синхронизируйте ваши данные между устройствами с помощью облачного хранилища Telegram
        </p>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleSaveToCloud}
              disabled={isSyncing}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm py-2 rounded-md disabled:opacity-50"
            >
              {isSyncing && syncDirection === 'toCloud' ? 'Сохранение...' : 'Сохранить в облако'}
            </button>
            
            <button
              onClick={handleLoadFromCloud}
              disabled={isSyncing}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-sm py-2 rounded-md disabled:opacity-50"
            >
              {isSyncing && syncDirection === 'fromCloud' ? 'Загрузка...' : 'Загрузить из облака'}
            </button>
          </div>
          
          <div className="border border-border rounded-md p-4 space-y-2">
            <h4 className="font-medium">Статистика хранилища:</h4>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div>Заметки:</div>
              <div>{stats.items[STORAGE_KEYS.NOTES] ?? 0}</div>
              
              <div>Финансы:</div>
              <div>{stats.items[STORAGE_KEYS.FINANCES] ?? 0}</div>
              
              <div>Долги:</div>
              <div>{stats.items[STORAGE_KEYS.DEBTS] ?? 0}</div>
              
              <div>Настройки:</div>
              <div>{stats.items[STORAGE_KEYS.SETTINGS] === 1 ? 'Да' : 'Нет'}</div>
              
              <div className="col-span-2 pt-2 mt-2 border-t border-border">
                <div className="flex justify-between">
                  <span>Последняя синхронизация:</span>
                  <span>{formatLastSync(stats.lastSync)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 