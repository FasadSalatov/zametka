// Объявление глобальных типов для Telegram WebApp API

// Объявление типов для CloudStorage
interface CloudStorage {
  setItem: (key: string, value: string, callback?: (error: any, success: boolean) => void) => void;
  getItem: (key: string, callback: (error: any, value: string | null) => void) => void;
  getItems: (keys: string[], callback: (error: any, values: Record<string, string | null>) => void) => void;
  removeItem: (key: string, callback?: (error: any, success: boolean) => void) => void;
  removeItems: (keys: string[], callback?: (error: any, success: boolean) => void) => void;
  getKeys: (callback: (error: any, keys: string[]) => void) => void;
}

// Типы для HapticFeedback
type HapticFeedbackStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type HapticNotificationType = 'error' | 'success' | 'warning';

interface HapticFeedback {
  impactOccurred: (style: HapticFeedbackStyle) => void;
  notificationOccurred: (type: HapticNotificationType) => void;
  selectionChanged: () => void;
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

// Тип для WebApp API
interface TelegramWebApp {
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
}

// Объявление в глобальной области видимости
declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

// Экспорт для возможности импортировать типы
export type { 
  TelegramWebApp,
  CloudStorage,
  HapticFeedback,
  PopupParams,
  PopupButton
}; 