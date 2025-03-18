"use client";

/**
 * Утилиты для экспорта и импорта данных с использованием Telegram WebApp API
 */

/**
 * Экспортирует данные через Telegram WebApp, создавая файл и открывая его
 * @param data Данные для экспорта
 * @param filename Имя файла
 */
export async function exportDataWithTelegram(data: any, filename: string): Promise<boolean> {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    console.error('Telegram WebApp API недоступен');
    return false;
  }
  
  const tgApp = window.Telegram.WebApp;
  
  try {
    // Конвертируем данные в JSON строку
    const jsonString = JSON.stringify(data, null, 2);
    
    // Создаем Blob и URL для скачивания
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    // @ts-ignore
    // Используем Telegram API для открытия ссылки
    if (tgApp.openLink) {
      // @ts-ignore
      // Подтверждаем действие через Telegram UI
      tgApp.showConfirm(
        'Вы хотите экспортировать данные?', 
        (confirmed: boolean) => {
          if (confirmed) {
            // Открываем ссылку для скачивания
            // @ts-ignore
            tgApp.openLink(url);
            
            // Показываем уведомление об успешном экспорте
            // @ts-ignore
              tgApp.showPopup({
              title: 'Экспорт данных',
              message: 'Данные успешно экспортированы',
              buttons: [{type: 'ok'}]
            });
          }
        }
      );
      return true;
    } else {
      // Запасной вариант, если openLink недоступен
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    }
  } catch (error) {
    console.error('Ошибка экспорта данных:', error);
    
    // Показываем ошибку через Telegram UI, если доступно
    // @ts-ignore
    if (tgApp.showPopup) {
      // @ts-ignore
      tgApp.showPopup({
        title: 'Ошибка экспорта',
        message: 'Не удалось экспортировать данные',
        buttons: [{type: 'ok'}]
      });
    }
    return false;
  }
}

/**
 * Импортирует данные через Telegram WebApp
 */
export async function importDataWithTelegram(): Promise<any> {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    console.error('Telegram WebApp API недоступен');
    return null;
  }
  
  const tgApp = window.Telegram.WebApp;
  
  return new Promise((resolve, reject) => {
    try {
      // Подтверждаем действие через Telegram UI
      // @ts-ignore
      tgApp.showConfirm(
        'Вы хотите импортировать данные? Это может заменить существующие данные.', 
        (confirmed: boolean) => {
          if (confirmed) {
            // Создаем невидимый input для выбора файла
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            input.style.display = 'none';
            
            input.onchange = (event) => {
              const file = (event.target as HTMLInputElement).files?.[0];
              if (!file) {
                reject(new Error('Файл не выбран'));
                return;
              }
              
              const reader = new FileReader();
              reader.onload = (e) => {
                try {
                  const content = e.target?.result as string;
                  const data = JSON.parse(content);
                  
                  // Показываем успешное сообщение
                  // @ts-ignore
                  if (tgApp.showPopup) {
                    // @ts-ignore
                    tgApp.showPopup({
                      title: 'Импорт данных',
                      message: 'Данные успешно импортированы',
                      buttons: [{type: 'ok'}]
                    });
                  }
                  
                  // Возвращаем импортированные данные
                  resolve(data);
                } catch (error) {
                  // @ts-ignore
                  if (tgApp.showPopup) {
                    // @ts-ignore
                    tgApp.showPopup({
                      title: 'Ошибка импорта',
                      message: 'Неверный формат файла',
                      buttons: [{type: 'ok'}]
                    });
                  }
                  reject(new Error('Неверный формат файла'));
                }
              };
              
              reader.onerror = () => {
                // @ts-ignore
                if (tgApp.showPopup) {
                  // @ts-ignore
                  tgApp.showPopup({
                    title: 'Ошибка импорта',
                    message: 'Не удалось прочитать файл',
                    buttons: [{type: 'ok'}]
                  });
                }
                reject(new Error('Не удалось прочитать файл'));
              };
              
              reader.readAsText(file);
            };
            
            // Активируем вибрацию
            // @ts-ignore
              if (tgApp.HapticFeedback) {
              // @ts-ignore
              tgApp.HapticFeedback.impactOccurred('medium');
            }
            
            // Запускаем выбор файла
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
          } else {
            reject(new Error('Импорт отменен пользователем'));
          }
        }
      );
    } catch (error) {
      console.error('Ошибка импорта данных:', error);
      reject(error);
    }
  });
}

/**
 * Сохраняет данные в облачное хранилище Telegram
 * @param key Ключ для сохранения
 * @param value Значение для сохранения (будет сериализовано в JSON)
 */
export async function saveToTelegramCloud(key: string, value: any): Promise<boolean> {
  // @ts-ignore
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.CloudStorage) {
    console.error('Telegram CloudStorage API недоступен');
    return false;
  }
  
  return new Promise((resolve) => {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      // @ts-ignore
      window.Telegram.WebApp.CloudStorage.setItem(key, serializedValue, (error, success) => {
        if (error || !success) {
          console.error('Ошибка сохранения в облако:', error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } catch (error) {
      console.error('Ошибка сохранения в облако:', error);
      resolve(false);
    }
  });
}

/**
 * Загружает данные из облачного хранилища Telegram
 * @param key Ключ для загрузки
 */
export async function loadFromTelegramCloud(key: string): Promise<any> {
  // @ts-ignore
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.CloudStorage) {
    console.error('Telegram CloudStorage API недоступен');
    return null;
  }
  
  return new Promise((resolve) => {
    try {
      // @ts-ignore
      window.Telegram.WebApp.CloudStorage.getItem(key, (error, value) => {
        if (error) {
          console.error('Ошибка загрузки из облака:', error);
          resolve(null);
        } else {
          if (!value) {
            resolve(null);
            return;
          }
          
          try {
            // Пробуем распарсить как JSON
            const parsedValue = JSON.parse(value);
            resolve(parsedValue);
          } catch {
            // Если не получилось, возвращаем как строку
            resolve(value);
          }
        }
      });
    } catch (error) {
      console.error('Ошибка загрузки из облака:', error);
      resolve(null);
    }
  });
} 