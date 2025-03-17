"use client";

import { useEffect, useState } from 'react';

// Объявление типов в глобальной области видимости
type TelegramWebApp = {
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;
  isFullscreen?: boolean;
  onEvent?: (eventType: string, callback: Function) => void;
  offEvent?: (eventType: string, callback: Function) => void;
  ready?: () => void;
  version?: string;
  isVersionAtLeast?: (version: string) => boolean;
};

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}

export interface TelegramWebAppState {
  isAvailable: boolean;
  isFullscreenSupported: boolean;
  isFullscreen: boolean;
  requestFullscreen: () => void;
  exitFullscreen: () => void;
  toggleFullscreen: () => void;
  version: string | null;
}

// Минимальная версия для поддержки полноэкранного режима
const MIN_FULLSCREEN_VERSION = '8.0';

export function useTelegramWebApp(): TelegramWebAppState {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tgApp = (window as any).Telegram?.WebApp;
      
      if (tgApp) {
        setWebApp(tgApp);
        setIsAvailable(true);
        setVersion(tgApp.version || null);
        
        // Проверяем поддержку полноэкранного режима (Bot API 8.0+)
        const supportsFullscreen = 
          typeof tgApp.isVersionAtLeast === 'function' && 
          tgApp.isVersionAtLeast(MIN_FULLSCREEN_VERSION) && 
          typeof tgApp.requestFullscreen === 'function' && 
          typeof tgApp.exitFullscreen === 'function';
          
        setIsFullscreenSupported(supportsFullscreen);
        
        if (supportsFullscreen) {
          setIsFullscreen(!!tgApp.isFullscreen);
          
          const onFullscreenChanged = () => {
            setIsFullscreen(!!tgApp.isFullscreen);
          };
          
          tgApp.onEvent?.('fullscreenChanged', onFullscreenChanged);
          
          return () => {
            tgApp.offEvent?.('fullscreenChanged', onFullscreenChanged);
          };
        }
        
        tgApp.ready?.();
      }
    }
  }, []);
  
  const requestFullscreen = () => {
    if (webApp && isFullscreenSupported && !isFullscreen) {
      try {
        webApp.requestFullscreen?.();
      } catch (error) {
        console.warn('Ошибка при запросе полноэкранного режима:', error);
      }
    }
  };
  
  const exitFullscreen = () => {
    if (webApp && isFullscreenSupported && isFullscreen) {
      try {
        webApp.exitFullscreen?.();
      } catch (error) {
        console.warn('Ошибка при выходе из полноэкранного режима:', error);
      }
    }
  };
  
  const toggleFullscreen = () => {
    if (webApp && isFullscreenSupported) {
      if (isFullscreen) {
        exitFullscreen();
      } else {
        requestFullscreen();
      }
    }
  };
  
  return {
    isAvailable,
    isFullscreenSupported,
    isFullscreen,
    requestFullscreen,
    exitFullscreen,
    toggleFullscreen,
    version
  };
} 