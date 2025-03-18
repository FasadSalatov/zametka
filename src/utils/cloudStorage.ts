"use client";

import { Note } from "@/app/notes/types";
import { Transaction } from "@/app/finances/types";
import { Debt } from "@/app/debts/types";
import { showNotification } from "@/utils/helpers";

// Ключи для хранения данных в Telegram Cloud Storage
export const STORAGE_KEYS = {
  NOTES: 'zametka_notes',
  FINANCES: 'zametka_finances',
  DEBTS: 'zametka_debts',
  SETTINGS: 'zametka_settings',
  LAST_SYNC: 'zametka_last_sync',
};

// Типы данных для хранения
export type CloudData = {
  notes?: Note[];
  finances?: Transaction[];
  debts?: Debt[];
  settings?: Record<string, any>;
};

/**
 * Проверяет доступность Telegram WebApp API
 */
export function isTelegramWebAppAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 
           !!window.Telegram && 
           !!window.Telegram.WebApp;
  } catch (e) {
    console.error('Ошибка при проверке Telegram WebApp API:', e);
    return false;
  }
}

/**
 * Проверяет доступность CloudStorage в Telegram API
 */
export function isCloudStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    if (!window.Telegram || !window.Telegram.WebApp) {
      console.log('WebApp API недоступен');
      return false;
    }
    
    const tgApp = window.Telegram.WebApp;
    
    // Проверяем наличие API CloudStorage
    if (!tgApp.CloudStorage) {
      console.log('CloudStorage API недоступен');
      return false;
    }
    
    // Проверяем необходимые методы CloudStorage
    if (typeof tgApp.CloudStorage.getItem !== 'function' || 
        typeof tgApp.CloudStorage.setItem !== 'function') {
      console.log('CloudStorage API неполный: отсутствуют необходимые методы');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Ошибка при проверке доступности CloudStorage:', e);
    return false;
  }
}

/**
 * Обертка для CloudStorage.setItem, возвращающая Promise
 */
export function cloudStorageSetItem(key: string, value: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isCloudStorageAvailable() || !window.Telegram?.WebApp?.CloudStorage) {
      resolve(false);
      return;
    }
    
    window.Telegram.WebApp.CloudStorage.setItem(
      key, 
      value,
      (error: any, success: boolean) => {
        if (error) {
          console.error(`Ошибка при сохранении ${key} в CloudStorage:`, error);
          resolve(false);
          return;
        }
        resolve(success);
      }
    );
  });
}

/**
 * Обертка для CloudStorage.getItem, возвращающая Promise
 */
export function cloudStorageGetItem(key: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!isCloudStorageAvailable() || !window.Telegram?.WebApp?.CloudStorage) {
      resolve(null);
      return;
    }
    
    window.Telegram.WebApp.CloudStorage.getItem(
      key,
      (error: any, value: string | null) => {
        if (error) {
          console.error(`Ошибка при получении ${key} из CloudStorage:`, error);
          resolve(null);
          return;
        }
        resolve(value);
      }
    );
  });
}

/**
 * Обертка для CloudStorage.getItems, возвращающая Promise
 */
export function cloudStorageGetItems(keys: string[]): Promise<Record<string, string | null>> {
  return new Promise((resolve) => {
    if (!isCloudStorageAvailable() || !window.Telegram?.WebApp?.CloudStorage) {
      resolve({});
      return;
    }
    
    window.Telegram.WebApp.CloudStorage.getItems(
      keys,
      (error: any, values: Record<string, string | null>) => {
        if (error) {
          console.error(`Ошибка при получении нескольких ключей из CloudStorage:`, error);
          resolve({});
          return;
        }
        resolve(values || {});
      }
    );
  });
}

/**
 * Обертка для CloudStorage.removeItem, возвращающая Promise
 */
export function cloudStorageRemoveItem(key: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isCloudStorageAvailable() || !window.Telegram?.WebApp?.CloudStorage) {
      resolve(false);
      return;
    }
    
    window.Telegram.WebApp.CloudStorage.removeItem(
      key,
      (error: any, success: boolean) => {
        if (error) {
          console.error(`Ошибка при удалении ${key} из CloudStorage:`, error);
          resolve(false);
          return;
        }
        resolve(success);
      }
    );
  });
}

/**
 * Обертка для CloudStorage.getKeys, возвращающая Promise
 */
export function cloudStorageGetKeys(): Promise<string[]> {
  return new Promise((resolve) => {
    if (!isCloudStorageAvailable() || !window.Telegram?.WebApp?.CloudStorage) {
      resolve([]);
      return;
    }
    
    window.Telegram.WebApp.CloudStorage.getKeys(
      (error: any, keys: string[]) => {
        if (error) {
          console.error(`Ошибка при получении списка ключей из CloudStorage:`, error);
          resolve([]);
          return;
        }
        resolve(keys || []);
      }
    );
  });
}

/**
 * Сохраняет данные в Telegram CloudStorage
 */
export async function saveToCloud(key: string, data: any): Promise<boolean> {
  try {
    if (!isCloudStorageAvailable()) {
      showNotification('CloudStorage API недоступен', 'error');
      return false;
    }

    const dataStr = JSON.stringify(data);
    
    // Проверка лимита размера данных (4096 символов для значения)
    if (dataStr.length > 4096) {
      console.error(`Данные для ${key} слишком большие: ${dataStr.length} символов. Лимит: 4096 символов`);
      showNotification(`Ошибка: Данные для ${key} превышают лимит (${dataStr.length} символов)`, "error");
      return false;
    }

    // Сохраняем данные в CloudStorage
    const success = await cloudStorageSetItem(key, dataStr);
    
    if (success) {
      // Обновляем время последней синхронизации
      await cloudStorageSetItem(STORAGE_KEYS.LAST_SYNC, String(Date.now()));
      
      // Haptic feedback если доступен
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      return true;
    } else {
      showNotification(`Не удалось сохранить данные ${key} в облако`, "error");
      return false;
    }
  } catch (error) {
    console.error(`Ошибка при сохранении ${key} в Telegram Cloud:`, error);
    showNotification(`Ошибка при сохранении данных ${key} в облако Telegram`, "error");
    return false;
  }
}

/**
 * Загружает данные из Telegram CloudStorage
 */
export async function loadFromCloud<T>(key: string): Promise<T | null> {
  try {
    if (!isCloudStorageAvailable()) {
      return null;
    }

    const dataStr = await cloudStorageGetItem(key);
    
    if (!dataStr) {
      console.log(`Данные ${key} не найдены в Telegram Cloud`);
      return null;
    }
    
    try {
      const parsedData = JSON.parse(dataStr) as T;
      return parsedData;
    } catch (parseError) {
      console.error(`Ошибка при разборе данных для ${key}:`, parseError);
      showNotification(`Ошибка при разборе данных ${key} из облака Telegram`, "error");
      return null;
    }
  } catch (error) {
    console.error(`Ошибка при загрузке ${key} из Telegram Cloud:`, error);
    return null;
  }
}

/**
 * Загружает все данные из Telegram CloudStorage
 */
export async function loadAllFromCloud(): Promise<CloudData> {
  try {
    if (!isCloudStorageAvailable()) {
      return {};
    }
    
    const keys = Object.values(STORAGE_KEYS).filter(k => k !== STORAGE_KEYS.LAST_SYNC);
    const values = await cloudStorageGetItems(keys);
    
    const result: CloudData = {};
    
    if (values[STORAGE_KEYS.NOTES]) {
      try {
        const notesData = values[STORAGE_KEYS.NOTES];
        if (notesData) {
          result.notes = JSON.parse(notesData);
        }
      } catch (e) {
        console.error('Ошибка при разборе заметок:', e);
      }
    }
    
    if (values[STORAGE_KEYS.FINANCES]) {
      try {
        const financesData = values[STORAGE_KEYS.FINANCES];
        if (financesData) {
          result.finances = JSON.parse(financesData);
        }
      } catch (e) {
        console.error('Ошибка при разборе финансов:', e);
      }
    }
    
    if (values[STORAGE_KEYS.DEBTS]) {
      try {
        const debtsData = values[STORAGE_KEYS.DEBTS];
        if (debtsData) {
          result.debts = JSON.parse(debtsData);
        }
      } catch (e) {
        console.error('Ошибка при разборе долгов:', e);
      }
    }
    
    if (values[STORAGE_KEYS.SETTINGS]) {
      try {
        const settingsData = values[STORAGE_KEYS.SETTINGS];
        if (settingsData) {
          result.settings = JSON.parse(settingsData);
        }
      } catch (e) {
        console.error('Ошибка при разборе настроек:', e);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Ошибка при загрузке данных из Telegram Cloud:', error);
    return {};
  }
}

/**
 * Получает статистику по данным в CloudStorage
 */
export async function getCloudStorageStats(): Promise<{
  enabled: boolean;
  items: Record<string, number | null>;
  lastSync: number | null;
}> {
  if (!isCloudStorageAvailable()) {
    return {
      enabled: false,
      items: {},
      lastSync: null
    };
  }
  
  try {
    // Получаем время последней синхронизации
    const lastSyncStr = await cloudStorageGetItem(STORAGE_KEYS.LAST_SYNC);
    const lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) : null;
    
    // Получаем все данные
    const values = await cloudStorageGetItems([
      STORAGE_KEYS.NOTES,
      STORAGE_KEYS.FINANCES,
      STORAGE_KEYS.DEBTS,
      STORAGE_KEYS.SETTINGS
    ]);
    
    // Вычисляем количество элементов в каждом хранилище
    let notesCount: number | null = null;
    let financesCount: number | null = null;
    let debtsCount: number | null = null;
    
    if (values[STORAGE_KEYS.NOTES]) {
      try {
        const notesData = values[STORAGE_KEYS.NOTES];
        if (notesData) {
          notesCount = (JSON.parse(notesData) as Note[]).length;
        }
      } catch (e) {
        console.error('Ошибка при разборе заметок:', e);
      }
    }
    
    if (values[STORAGE_KEYS.FINANCES]) {
      try {
        const financesData = values[STORAGE_KEYS.FINANCES];
        if (financesData) {
          financesCount = (JSON.parse(financesData) as Transaction[]).length;
        }
      } catch (e) {
        console.error('Ошибка при разборе финансов:', e);
      }
    }
    
    if (values[STORAGE_KEYS.DEBTS]) {
      try {
        const debtsData = values[STORAGE_KEYS.DEBTS];
        if (debtsData) {
          debtsCount = (JSON.parse(debtsData) as Debt[]).length;
        }
      } catch (e) {
        console.error('Ошибка при разборе долгов:', e);
      }
    }
    
    const settingsAvailable = values[STORAGE_KEYS.SETTINGS] ? true : false;
    
    return {
      enabled: true,
      items: {
        [STORAGE_KEYS.NOTES]: notesCount,
        [STORAGE_KEYS.FINANCES]: financesCount,
        [STORAGE_KEYS.DEBTS]: debtsCount,
        [STORAGE_KEYS.SETTINGS]: settingsAvailable ? 1 : 0
      },
      lastSync
    };
  } catch (error) {
    console.error('Ошибка при получении статистики CloudStorage:', error);
    return {
      enabled: true,
      items: {},
      lastSync: null
    };
  }
} 