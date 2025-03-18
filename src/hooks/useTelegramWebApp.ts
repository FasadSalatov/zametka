"use client";

import { useEffect, useState } from 'react';

// Объявление типов для HapticFeedback
type HapticFeedbackStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type HapticNotificationType = 'error' | 'success' | 'warning';

interface HapticFeedback {
  impactOccurred: (style: HapticFeedbackStyle) => void;
  notificationOccurred: (type: HapticNotificationType) => void;
  selectionChanged: () => void;
}

// Объявление типов для CloudStorage
interface CloudStorage {
  setItem: (key: string, value: string, callback?: (error: any, success: boolean) => void) => void;
  getItem: (key: string, callback: (error: any, value: string | null) => void) => void;
  getItems: (keys: string[], callback: (error: any, values: Record<string, string | null>) => void) => void;
  removeItem: (key: string, callback?: (error: any, success: boolean) => void) => void;
  removeItems: (keys: string[], callback?: (error: any, success: boolean) => void) => void;
  getKeys: (callback: (error: any, keys: string[]) => void) => void;
}

// Тип для диалогов и кнопок
interface PopupButton {
  id?: string;
  type: 'ok' | 'close' | 'cancel' | 'default' | 'destructive';
  text?: string;
}

interface PopupParams {
  title: string;
  message: string;
  buttons: PopupButton[];
}

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
  safeAreaInset?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  contentSafeAreaInset?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  HapticFeedback?: HapticFeedback;
  CloudStorage?: CloudStorage;
  showPopup?: (params: PopupParams, callback?: (buttonId: string) => void) => void;
  showAlert?: (message: string, callback?: () => void) => void;
  showConfirm?: (message: string, callback?: (confirmed: boolean) => void) => void;
  openLink?: (url: string) => void;
  openTelegramLink?: (url: string) => void;
  openInvoice?: (url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
  platform?: string;
  colorScheme?: 'light' | 'dark';
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
  safeAreaInset: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } | null;
  contentSafeAreaInset: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } | null;
}

// Минимальная версия для поддержки полноэкранного режима
const MIN_FULLSCREEN_VERSION = '8.0';

export function useTelegramWebApp(): TelegramWebAppState {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [safeAreaInset, setSafeAreaInset] = useState<{
    top: number;
    right: number;
    bottom: number;
    left: number;
  } | null>(null);
  const [contentSafeAreaInset, setContentSafeAreaInset] = useState<{
    top: number;
    right: number;
    bottom: number;
    left: number;
  } | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tgApp = (window as any).Telegram?.WebApp;
      
      if (tgApp) {
        setWebApp(tgApp);
        setIsAvailable(true);
        setVersion(tgApp.version || null);
        
        // Инициализируем данные safe area
        if (tgApp.safeAreaInset) {
          setSafeAreaInset(tgApp.safeAreaInset);
        }
        
        if (tgApp.contentSafeAreaInset) {
          setContentSafeAreaInset(tgApp.contentSafeAreaInset);
        }
        
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
          
          const onSafeAreaChanged = () => {
            if (tgApp.safeAreaInset) {
              setSafeAreaInset(tgApp.safeAreaInset);
            }
          };
          
          const onContentSafeAreaChanged = () => {
            if (tgApp.contentSafeAreaInset) {
              setContentSafeAreaInset(tgApp.contentSafeAreaInset);
            }
          };
          
          tgApp.onEvent?.('fullscreenChanged', onFullscreenChanged);
          tgApp.onEvent?.('safeAreaChanged', onSafeAreaChanged);
          tgApp.onEvent?.('contentSafeAreaChanged', onContentSafeAreaChanged);
          
          return () => {
            tgApp.offEvent?.('fullscreenChanged', onFullscreenChanged);
            tgApp.offEvent?.('safeAreaChanged', onSafeAreaChanged);
            tgApp.offEvent?.('contentSafeAreaChanged', onContentSafeAreaChanged);
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
    version,
    safeAreaInset,
    contentSafeAreaInset
  };
} 