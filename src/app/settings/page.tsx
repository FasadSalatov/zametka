"use client";

import React from 'react';
import { ModeToggle } from '@/components/mode-toggle';
import TelegramFullscreenButton from '@/components/TelegramFullscreenButton';
import SettingsExportImport from '@/components/SettingsExportImport';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Настройки</h1>
        <p className="text-muted-foreground">Управление приложением и параметрами</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">Внешний вид</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Тема оформления</h3>
              <p className="text-sm text-muted-foreground">Выберите светлую или темную тему</p>
            </div>
            <ModeToggle />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Полноэкранный режим</h3>
              <p className="text-sm text-muted-foreground">Переключение полноэкранного режима в Telegram</p>
            </div>
            <TelegramFullscreenButton />
          </div>
        </div>
        
        <SettingsExportImport 
          onDataImported={(data) => {
            // Перезагружаем страницу для применения импортированных данных
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
          onError={(error) => {
            console.error('Ошибка при импорте/экспорте:', error);
          }}
        />
      </div>
      
      <div className="p-4 bg-card rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">О приложении</h2>
        
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Zametka</span> - приложение для управления личными заметками, 
            финансами и долгами, оптимизированное для работы в Telegram.
          </p>
          
          <p className="text-sm text-muted-foreground">
            Версия: 1.0.0
          </p>
          
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
} 