"use client";

import { useEffect, useState } from 'react';

interface TelegramWebApp {
  isFullscreen?: boolean;
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;
  onEvent?: (eventType: string, callback: (data?: any) => void) => void;
  offEvent?: (eventType: string, callback: (data?: any) => void) => void;
}

declare global {
  interface Window {
    // @ts-ignore
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

type TelegramFullscreenProps = {
  showButton?: boolean;
  buttonText?: string;
  exitButtonText?: string;
  className?: string;
};

export default function TelegramFullscreen({
  showButton = true,
  buttonText = "Развернуть на весь экран",
  exitButtonText = "Выйти из полноэкранного режима",
  className = ""
}: TelegramFullscreenProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false);

  useEffect(() => {
    // Проверяем доступность Telegram WebApp
    const telegram = window.Telegram?.WebApp;
    
    if (telegram) {
      setIsTelegramAvailable(true);
      
      // Проверяем поддержку полноэкранного режима (Bot API 8.0+)
      if (typeof telegram.requestFullscreen === 'function' && 
          typeof telegram.exitFullscreen === 'function') {
        setIsAvailable(true);
        
        // Синхронизируем состояние полноэкранного режима
        setIsFullscreen(telegram.isFullscreen || false);
        
        // Добавляем обработчик изменения полноэкранного режима
        const onFullscreenChanged = () => {
          setIsFullscreen(telegram.isFullscreen || false);
        };
        
        // Добавляем обработчик ошибки полноэкранного режима
        const onFullscreenFailed = (error: { error: string }) => {
          console.error('Ошибка полноэкранного режима:', error.error);
          setIsFullscreen(false);
        };
        
        // Регистрируем обработчики событий
        telegram.onEvent?.('fullscreenChanged', onFullscreenChanged);
        telegram.onEvent?.('fullscreenFailed', onFullscreenFailed);
        
        // Удаляем обработчики при размонтировании
        return () => {
          telegram.offEvent?.('fullscreenChanged', onFullscreenChanged);
          telegram.offEvent?.('fullscreenFailed', onFullscreenFailed);
        };
      }
    }
  }, []);

  // Переключение полноэкранного режима
  const toggleFullscreen = () => {
    const telegram = window.Telegram?.WebApp;
    
    if (telegram && isAvailable) {
      if (isFullscreen) {
        telegram.exitFullscreen?.();
      } else {
        telegram.requestFullscreen?.();
      }
    }
  };

  // Если Telegram API не доступен или полноэкранный режим не поддерживается, не отображаем кнопку
  if (!isTelegramAvailable || !isAvailable || !showButton) {
    return null;
  }

  return (
    <button
      onClick={toggleFullscreen}
      className={`bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-all hover-lift flex items-center gap-2 ${className}`}
    >
      {isFullscreen ? (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          {exitButtonText}
        </>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          {buttonText}
        </>
      )}
    </button>
  );
} 