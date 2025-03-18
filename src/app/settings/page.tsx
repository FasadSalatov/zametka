"use client";

import React, { useEffect, useState } from 'react';
import SettingsExportImport from '@/components/SettingsExportImport';
import TelegramFullscreenButton from '@/components/TelegramFullscreenButton';

export default function SettingsPage() {
  const [theme, setTheme] = useState<string>('dark');

  // При монтировании получаем текущую тему
  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(currentTheme);
  }, []);

  // Обработчик смены темы
  const handleThemeChange = (newTheme: string) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    setTheme(newTheme);
    
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.error('Не удалось сохранить тему в localStorage:', e);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Настройки</h1>
      
      <div className="space-y-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-xl font-medium mb-4">Данные</h2>
          <SettingsExportImport />
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-xl font-medium mb-4">Внешний вид</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Тема</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleThemeChange('light')}
                  className={`p-3 rounded-lg flex items-center border transition-colors ${theme === 'light' ? 'bg-primary/10 border-primary' : 'bg-muted border-border'}`}
                  data-haptic="light"
                >
                  <div className="w-5 h-5 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                  </div>
                  <span>Светлая</span>
                </button>
                
                <button 
                  onClick={() => handleThemeChange('dark')}
                  className={`p-3 rounded-lg flex items-center border transition-colors ${theme === 'dark' ? 'bg-primary/10 border-primary' : 'bg-muted border-border'}`}
                  data-haptic="light"
                >
                  <div className="w-5 h-5 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  </div>
                  <span>Тёмная</span>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Полноэкранный режим</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Включить полноэкранный режим в Telegram</span>
                <TelegramFullscreenButton />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-xl font-medium mb-4">О приложении</h2>
          <div className="text-muted-foreground text-sm space-y-2">
            <p>Версия: 1.0.0</p>
            <p>Приложение для удобного ведения заметок, учета финансов и долгов.</p>
            <p>Все данные хранятся локально на вашем устройстве.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 