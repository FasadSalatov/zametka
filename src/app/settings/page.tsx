"use client";

import React from 'react';
import { ModeToggle } from '@/components/mode-toggle';
import TelegramFullscreenButton from '@/components/TelegramFullscreenButton';
import SettingsExportImport from '@/components/SettingsExportImport';

export default function SettingsPage() {
  return (
    <div className="pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Настройки</h1>
        <p className="text-sm text-muted-foreground">Управление приложением и данными</p>
      </div>
      
      <div className="space-y-4">
        {/* Основные настройки */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-medium">Основные настройки</h2>
          </div>
          
          <div className="divide-y divide-border">
            {/* Тема оформления */}
            <div className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium mb-0.5">Тема оформления</h3>
                <p className="text-xs text-muted-foreground">Светлая или темная тема</p>
              </div>
              <ModeToggle />
            </div>
            
            {/* Полноэкранный режим */}
            <div className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium mb-0.5">Полноэкранный режим</h3>
                <p className="text-xs text-muted-foreground">Для Telegram Mini App</p>
              </div>
              <TelegramFullscreenButton />
            </div>
          </div>
        </div>
        
        {/* Экспорт и импорт */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-medium">Данные</h2>
          </div>
          
          <div className="p-4">
            <SettingsExportImport 
              onDataImported={(data) => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              onError={(error) => {
                console.error('Ошибка при импорте/экспорте:', error);
              }}
            />
          </div>
        </div>
        
        {/* О приложении */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-medium">О приложении</h2>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              <p className="text-sm">
                <span className="font-medium">Zametka</span> — приложение для управления заметками, 
                финансами и долгами в Telegram
              </p>
              
              <div className="flex justify-between items-center text-sm py-2 px-3 rounded bg-muted/30">
                <span className="text-muted-foreground">Версия</span>
                <span className="font-medium">1.0.0</span>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 