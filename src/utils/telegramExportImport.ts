"use client";

import { Note } from "@/app/notes/types";
import { Transaction } from "@/app/finances/types";
import { Debt } from "@/app/debts/types";
import { showNotification } from "@/utils/helpers";

export type ZametkaData = {
  notes?: Note[];
  finances?: Transaction[];
  debts?: Debt[];
  settings?: Record<string, any>;
};

// Ключи для хранения данных в Telegram Cloud Storage
export const STORAGE_KEYS = {
  NOTES: 'zametka_notes',
  FINANCES: 'zametka_finances',
  DEBTS: 'zametka_debts',
  SETTINGS: 'zametka_settings',
  LAST_SYNC: 'zametka_last_sync',
};

/**
 * Проверяет доступность Telegram WebApp API
 */
export function isTelegramWebAppAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 
           !!window.Telegram && 
           !!window.Telegram.WebApp && 
           !!window.Telegram.WebApp.version;
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
 * Сохраняет данные в Telegram CloudStorage
 * @param key Ключ для сохранения
 * @param data Данные для сохранения
 * @returns Promise<boolean>
 */
export async function saveToTelegramCloud(key: string, data: any): Promise<boolean> {
  try {
    if (!isCloudStorageAvailable()) {
      console.warn('CloudStorage API недоступен');
      return false;
    }

    // @ts-ignore
        const tgApp = window.Telegram.WebApp;
    const dataStr = JSON.stringify(data);
    
    // Проверка лимита размера данных (150KB для CloudStorage)
    if (dataStr.length > 150 * 1024) {
      console.error(`Данные для ${key} слишком большие: ${dataStr.length} байт. Лимит: 150KB`);
      showNotification(`Ошибка: Данные для ${key} слишком большие (${Math.round(dataStr.length / 1024)}KB). Лимит: 150KB`, "error");
      return false;
    }
    
    // Сохраняем данные в CloudStorage
    await tgApp.CloudStorage.setItem(key, dataStr);
    
    // Обновляем время последней синхронизации
    await tgApp.CloudStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(Date.now()));
    
    // Выводим хэш данных для отладки
    const hash = await computeDataHash(dataStr);
    console.log(`Сохранено в CloudStorage: ${key} (hash: ${hash})`);
    
    // Haptic feedback если доступен
    if (tgApp.HapticFeedback) {
      tgApp.HapticFeedback.notificationOccurred('success');
    }
    
    return true;
  } catch (error) {
    console.error(`Ошибка при сохранении ${key} в Telegram Cloud:`, error);
    showNotification(`Ошибка при сохранении данных ${key} в облако Telegram`, "error");
    return false;
  }
}

/**
 * Загружает данные из Telegram CloudStorage
 * @param key Ключ для загрузки
 * @returns Promise<T | null>
 */
export async function loadFromTelegramCloud<T>(key: string): Promise<T | null> {
  try {
    if (!isCloudStorageAvailable()) {
      console.warn('CloudStorage API недоступен');
      return null;
    }

    // @ts-ignore
    const tgApp = window.Telegram.WebApp;
    const dataStr = await tgApp.CloudStorage.getItem(key);
    
    if (!dataStr) {
      console.log(`Данные ${key} не найдены в Telegram Cloud`);
      return null;
    }
    
    // Выводим хэш данных для отладки
    const hash = await computeDataHash(dataStr);
    console.log(`Загружено из CloudStorage: ${key} (hash: ${hash}, размер: ${dataStr.length} байт)`);
    
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
 * Вычисляет хеш данных для отладки
 * @param data Строка данных
 * @returns Promise<string>
 */
async function computeDataHash(data: string): Promise<string> {
  try {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      // Простой fallback для хэша, если WebCrypto недоступен
      return String(data.length);
    }
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-1', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.slice(0, 8); // Сокращенный хеш для удобства
  } catch (e) {
    console.warn('Не удалось вычислить хеш данных:', e);
    return String(data.length);
  }
}

/**
 * Создает объект с данными приложения для экспорта
 */
export function createExportData(
  notes?: Note[], 
  finances?: Transaction[], 
  debts?: Debt[],
  settings?: Record<string, any>
): ZametkaData {
  return {
    notes: notes || [],
    finances: finances || [],
    debts: debts || [],
    settings: settings || {},
  };
}

/**
 * Экспортирует данные в файл
 */
export function exportDataToFile(data: ZametkaData, filename = 'zametka_backup.json') {
  try {
    // Создаем JSON-строку из данных
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Создаем ссылку для скачивания
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Очищаем
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    // Вызываем haptic feedback, если доступен
    // @ts-ignore
    if (isTelegramWebAppAvailable() && window.Telegram.WebApp.HapticFeedback) {
      // @ts-ignore
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    
    showNotification('Данные успешно экспортированы', 'success');
    return true;
  } catch (error) {
    console.error('Ошибка при экспорте данных:', error);
    showNotification('Ошибка при экспорте данных', 'error');
    return false;
  }
}

/**
 * Импортирует данные из файла
 */
export function importDataFromFile(): Promise<ZametkaData | null> {
  return new Promise((resolve) => {
    try {
      // Создаем скрытый input для выбора файла
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          showNotification('Файл не выбран', 'warning');
          resolve(null);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const importedData = JSON.parse(content) as ZametkaData;
            
            // Базовая валидация импортированных данных
            if (!validateImportedData(importedData)) {
              showNotification('Неверный формат файла данных', 'error');
              resolve(null);
              return;
            }
            
            // Вызываем haptic feedback, если доступен
            // @ts-ignore
            if (isTelegramWebAppAvailable() && window.Telegram.WebApp.HapticFeedback) {
              // @ts-ignore
              window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
            
            showNotification('Данные успешно импортированы', 'success');
            resolve(importedData);
          } catch (error) {
            console.error('Ошибка при разборе импортированного файла:', error);
            showNotification('Ошибка при разборе файла данных', 'error');
            resolve(null);
          }
        };
        
        reader.onerror = () => {
          showNotification('Ошибка при чтении файла', 'error');
          resolve(null);
        };
        
        reader.readAsText(file);
      };
      
      // Удаляем элемент после выбора файла
      input.onabort = () => {
        document.body.removeChild(input);
        resolve(null);
      };
      
      document.body.appendChild(input);
      input.click();
      
      // Это необходимо для iOS Safari
      setTimeout(() => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }, 5000);
    } catch (error) {
      console.error('Ошибка при импорте данных:', error);
      showNotification('Ошибка при импорте данных', 'error');
      resolve(null);
    }
  });
}

/**
 * Валидирует импортированные данные
 */
function validateImportedData(data: any): data is ZametkaData {
  // Проверяем, что data - объект
  if (!data || typeof data !== 'object') return false;
  
  // Проверяем основные поля
  if (
    (data.notes !== undefined && !Array.isArray(data.notes)) ||
    (data.finances !== undefined && !Array.isArray(data.finances)) ||
    (data.debts !== undefined && !Array.isArray(data.debts)) ||
    (data.settings !== undefined && typeof data.settings !== 'object')
  ) {
    return false;
  }
  
  return true;
}

// Тип данных о доступности CloudStorage
export type CloudStorageStats = {
  enabled: boolean;
  items: Record<string, number | null>;
  lastSync: number | null;
};

// Получает информацию о данных, хранящихся в CloudStorage
export async function getCloudStorageStats(): Promise<CloudStorageStats> {
  if (!isCloudStorageAvailable()) {
    return {
      enabled: false,
      items: {},
      lastSync: null
    };
  }
  
  try {
    // @ts-ignore
     const tgApp = window.Telegram.WebApp;
    
    // Получаем время последней синхронизации
    const lastSyncStr = await tgApp.CloudStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    const lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) : null;
    
    // Получаем количество элементов для каждого типа данных
    const notesStr = await tgApp.CloudStorage.getItem(STORAGE_KEYS.NOTES);
    const financesStr = await tgApp.CloudStorage.getItem(STORAGE_KEYS.FINANCES);
    const debtsStr = await tgApp.CloudStorage.getItem(STORAGE_KEYS.DEBTS);
    const settingsStr = await tgApp.CloudStorage.getItem(STORAGE_KEYS.SETTINGS);
    
    // Вычисляем количество элементов в каждом хранилище
    const notesCount = notesStr ? (JSON.parse(notesStr) as Note[]).length : null;
    const financesCount = financesStr ? (JSON.parse(financesStr) as Transaction[]).length : null;
    const debtsCount = debtsStr ? (JSON.parse(debtsStr) as Debt[]).length : null;
    const settingsAvailable = settingsStr ? true : false;
    
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