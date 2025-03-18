"use client";

import React from 'react';
import { useTelegramStorage } from '@/components/providers/telegram-storage-provider';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function TelegramCloudStorageSettings() {
  const { 
    isAvailable, 
    isLoading, 
    lastSyncTime, 
    error, 
    status, 
    syncData, 
    loadData 
  } = useTelegramStorage();

  const handleSync = async () => {
    if (!isLoading) {
      await syncData();
    }
  };

  const handleLoad = async () => {
    if (!isLoading) {
      await loadData();
    }
  };

  if (!isAvailable) {
    return (
      <div className="card p-4 space-y-4 glassmorphism">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Облачное хранилище Telegram</h2>
          <span className="text-sm px-2 py-1 bg-destructive/20 text-destructive rounded-full">Недоступно</span>
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

  return (
    <div className="card p-4 space-y-4 glassmorphism">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Облачное хранилище Telegram</h2>
        <span className="text-sm px-2 py-1 bg-success/20 text-success rounded-full">Доступно</span>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Telegram CloudStorage позволяет хранить ваши данные в облаке и синхронизировать их между устройствами.
        </p>
        
        {lastSyncTime && (
          <p className="text-xs text-muted-foreground">
            Последняя синхронизация: {lastSyncTime}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            className="btn bg-primary text-primary-foreground hover:bg-primary/90 text-sm py-2 rounded-md disabled:opacity-50"
            onClick={handleSync}
            disabled={isLoading}
          >
            {isLoading ? 'Синхронизация...' : 'Сохранить в облако'}
          </button>
          
          <button
            className="btn bg-secondary text-secondary-foreground hover:bg-secondary/90 text-sm py-2 rounded-md disabled:opacity-50"
            onClick={handleLoad}
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : 'Загрузить из облака'}
          </button>
        </div>
      </div>
      
      {/* Состояние синхронизации */}
      <div className="space-y-2 text-sm">
        <h3 className="font-medium">Состояние синхронизации:</h3>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
            <span>Заметки:</span>
            <span className={`${status.notes.isLoaded ? 'text-success' : 'text-muted-foreground'}`}>
              {status.notes.count !== null ? `${status.notes.count} шт.` : 'Нет данных'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
            <span>Финансы:</span>
            <span className={`${status.finances.isLoaded ? 'text-success' : 'text-muted-foreground'}`}>
              {status.finances.count !== null ? `${status.finances.count} шт.` : 'Нет данных'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
            <span>Долги:</span>
            <span className={`${status.debts.isLoaded ? 'text-success' : 'text-muted-foreground'}`}>
              {status.debts.count !== null ? `${status.debts.count} шт.` : 'Нет данных'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-md bg-background/50">
            <span>Настройки:</span>
            <span className={`${status.settings.isLoaded ? 'text-success' : 'text-muted-foreground'}`}>
              {status.settings.isLoaded ? 'Сохранены' : 'Нет данных'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mt-2">
        <p>
          Ваши данные хранятся в облачном хранилище Telegram и доступны только вам. Они не удаляются при выходе из приложения или при обновлении Telegram.
        </p>
      </div>
    </div>
  );
} 