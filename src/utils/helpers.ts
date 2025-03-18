"use client";

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Показывает уведомление пользователю, используя Telegram API если доступно
 * @param message Текст уведомления
 * @param type Тип уведомления: 'success', 'error', 'warning', 'info'
 */
export function showNotification(message: string, type: NotificationType = 'info'): void {
  // Пробуем показать нативное уведомление Telegram
  try {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tgApp = window.Telegram.WebApp;
      
      // Показываем уведомление через Telegram API
      if (tgApp.showPopup) {
        tgApp.showPopup({
          title: getNotificationTitle(type),
          message,
          buttons: [{ type: 'ok' }]
        });
        
        // Хаптик-обратная связь по типу уведомления
        if (tgApp.HapticFeedback) {
          switch (type) {
            case 'success':
              tgApp.HapticFeedback.notificationOccurred('success');
              break;
            case 'error':
              tgApp.HapticFeedback.notificationOccurred('error');
              break;
            case 'warning':
              tgApp.HapticFeedback.notificationOccurred('warning');
              break;
            default:
              tgApp.HapticFeedback.impactOccurred('light');
          }
        }
        
        return;
      }
    }
  } catch (e) {
    console.error('Ошибка показа уведомления через Telegram API:', e);
  }
  
  // Фолбэк: вывод в консоль
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Опционально можно добавить визуальное уведомление через DOM
  // если уведомление через Telegram API недоступно
}

/**
 * Возвращает заголовок уведомления в зависимости от типа
 */
function getNotificationTitle(type: NotificationType): string {
  switch (type) {
    case 'success':
      return 'Успешно';
    case 'error':
      return 'Ошибка';
    case 'warning':
      return 'Внимание';
    case 'info':
    default:
      return 'Информация';
  }
} 