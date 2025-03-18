import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TelegramStorageProvider } from "@/components/providers/telegram-storage-provider";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import Script from "next/script";
import StorageInitializer from '@/components/providers/storage-initializer';

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Zametka - Личный сервис",
  description: "Мой личный сервис для заметок и финансов",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="scroll-smooth">
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive" 
        />
        <Script id="safe-area-init" strategy="afterInteractive">
          {`
            // Инициализация CSS переменных safe area при загрузке страницы
            function updateSafeArea() {
              if (window.Telegram && window.Telegram.WebApp) {
                const tgApp = window.Telegram.WebApp;
                const html = document.documentElement;
                
                console.log('Telegram WebApp API доступен');
                console.log('Telegram WebApp версия:', tgApp.version);
                
                if (tgApp.version) {
                  // Обрабатываем системные safe area insets (notch, navigation bar и т.д.)
                  if (tgApp.safeAreaInset) {
                    console.log('Telegram safeAreaInset:', tgApp.safeAreaInset);
                    html.style.setProperty('--tg-safe-area-inset-top', tgApp.safeAreaInset.top + 'px');
                    html.style.setProperty('--tg-safe-area-inset-right', tgApp.safeAreaInset.right + 'px');
                    html.style.setProperty('--tg-safe-area-inset-bottom', tgApp.safeAreaInset.bottom + 'px');
                    html.style.setProperty('--tg-safe-area-inset-left', tgApp.safeAreaInset.left + 'px');
                    
                    // Добавляем класс для отображения информации
                    html.classList.add('has-tg-safe-area');
                  } else {
                    console.log('Telegram safeAreaInset недоступен');
                  }
                  
                  // Обрабатываем content safe area insets (учитывая UI элементы Telegram)
                  if (tgApp.contentSafeAreaInset) {
                    console.log('Telegram contentSafeAreaInset:', tgApp.contentSafeAreaInset);
                    html.style.setProperty('--tg-content-safe-area-inset-top', tgApp.contentSafeAreaInset.top + 'px');
                    html.style.setProperty('--tg-content-safe-area-inset-right', tgApp.contentSafeAreaInset.right + 'px');
                    html.style.setProperty('--tg-content-safe-area-inset-bottom', tgApp.contentSafeAreaInset.bottom + 'px');
                    html.style.setProperty('--tg-content-safe-area-inset-left', tgApp.contentSafeAreaInset.left + 'px');
                    
                    // Добавляем класс для отображения информации
                    html.classList.add('has-tg-content-safe-area');
                  } else {
                    console.log('Telegram contentSafeAreaInset недоступен');
                  }
                }
                
                // Получаем значения CSS env переменных для safe-area
                const computedStyle = getComputedStyle(html);
                const cssEnvSafeAreaTop = computedStyle.getPropertyValue('--safe-area-inset-top').trim();
                const cssEnvSafeAreaRight = computedStyle.getPropertyValue('--safe-area-inset-right').trim();
                const cssEnvSafeAreaBottom = computedStyle.getPropertyValue('--safe-area-inset-bottom').trim();
                const cssEnvSafeAreaLeft = computedStyle.getPropertyValue('--safe-area-inset-left').trim();
                
                console.log('CSS env safe-area-inset-top:', cssEnvSafeAreaTop);
                console.log('CSS env safe-area-inset-right:', cssEnvSafeAreaRight);
                console.log('CSS env safe-area-inset-bottom:', cssEnvSafeAreaBottom);
                console.log('CSS env safe-area-inset-left:', cssEnvSafeAreaLeft);
                
                // Устанавливаем CSS переменные для combined safe area (максимум из env и Telegram)
                const tgSafeAreaTop = parseFloat(html.style.getPropertyValue('--tg-safe-area-inset-top') || '0');
                const tgSafeAreaRight = parseFloat(html.style.getPropertyValue('--tg-safe-area-inset-right') || '0');
                const tgSafeAreaBottom = parseFloat(html.style.getPropertyValue('--tg-safe-area-inset-bottom') || '0');
                const tgSafeAreaLeft = parseFloat(html.style.getPropertyValue('--tg-safe-area-inset-left') || '0');
                
                const cssEnvTop = parseFloat(cssEnvSafeAreaTop) || 0;
                const cssEnvRight = parseFloat(cssEnvSafeAreaRight) || 0;
                const cssEnvBottom = parseFloat(cssEnvSafeAreaBottom) || 0;
                const cssEnvLeft = parseFloat(cssEnvSafeAreaLeft) || 0;
                
                // Устанавливаем максимальные значения
                html.style.setProperty('--combined-safe-area-inset-top', Math.max(cssEnvTop, tgSafeAreaTop) + 'px');
                html.style.setProperty('--combined-safe-area-inset-right', Math.max(cssEnvRight, tgSafeAreaRight) + 'px');
                html.style.setProperty('--combined-safe-area-inset-bottom', Math.max(cssEnvBottom, tgSafeAreaBottom) + 'px');
                html.style.setProperty('--combined-safe-area-inset-left', Math.max(cssEnvLeft, tgSafeAreaLeft) + 'px');
                
                console.log('Combined safe-area top:', Math.max(cssEnvTop, tgSafeAreaTop) + 'px');
                console.log('Combined safe-area bottom:', Math.max(cssEnvBottom, tgSafeAreaBottom) + 'px');
                
                // Устанавливаем обработчики событий для обновления в случае изменения safe area
                if (tgApp.onEvent) {
                  // Отписываемся от предыдущих событий, чтобы избежать дублирования
                  try {
                    tgApp.offEvent('safeAreaChanged', updateSafeArea);
                    tgApp.offEvent('contentSafeAreaChanged', updateSafeArea);
                    tgApp.offEvent('viewportChanged', updateSafeArea);
                    tgApp.offEvent('themeChanged', updateSafeArea);
                  } catch (e) {
                    console.warn('Ошибка при отписке от событий Telegram:', e);
                  }
                  
                  // Подписываемся на события
                  tgApp.onEvent('safeAreaChanged', updateSafeArea);
                  tgApp.onEvent('contentSafeAreaChanged', updateSafeArea);
                  tgApp.onEvent('viewportChanged', updateSafeArea);
                  tgApp.onEvent('themeChanged', updateSafeArea);
                  
                  // Сообщаем в консоль о результатах инициализации
                  console.log('Safe area event handlers initialized');
                }
                
                // Добавляем класс для touch-устройств
                if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                  html.classList.add('touch-device');
                }
                
                // Добавляем глобальный обработчик для тактильной обратной связи на кнопках
                document.addEventListener('click', function(e) {
                  // Проверяем, является ли целевой элемент кнопкой или его родителем является кнопка
                  const target = e.target;
                  const button = target.tagName === 'BUTTON' ? target : target.closest('button');
                  const interactiveElement = 
                    button || 
                    target.closest('a[role="button"]') || 
                    target.closest('.btn') || 
                    (target.className && typeof target.className === 'string' && target.className.includes('btn')) ||
                    target.closest('[data-haptic]');
                    
                  if (interactiveElement && tgApp.HapticFeedback) {
                    // Получаем силу вибрации из атрибута data-haptic или используем medium по умолчанию
                    const hapticType = interactiveElement.getAttribute('data-haptic') || 'medium';
                    try {
                      tgApp.HapticFeedback.impactOccurred(hapticType);
                    } catch (err) {
                      console.warn('Failed to trigger haptic feedback:', err);
                    }
                  }
                }, false);
                
                // Сообщаем Telegram, что приложение готово
                if (tgApp.ready) {
                  tgApp.ready();
                  console.log('Вызван метод Telegram WebApp.ready()');
                }
              } else {
                console.log('Telegram WebApp API недоступен, используются только CSS env переменные');
                // Устанавливаем дефолтные значения для combined safe area, которые будут использовать env()
                document.documentElement.style.setProperty('--combined-safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
                document.documentElement.style.setProperty('--combined-safe-area-inset-right', 'env(safe-area-inset-right, 0px)');
                document.documentElement.style.setProperty('--combined-safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
                document.documentElement.style.setProperty('--combined-safe-area-inset-left', 'env(safe-area-inset-left, 0px)');
              }
            }
            
            // Запускаем инициализацию после загрузки страницы
            function initSafeArea() {
              console.log('Initializing safe area');
              updateSafeArea();
            }
            
            // Проверяем состояние документа и запускаем инициализацию
            if (document.readyState === 'complete') {
              initSafeArea();
            } else {
              window.addEventListener('load', initSafeArea);
            }
            
            // Также обновляем при изменении размера окна
            window.addEventListener('resize', updateSafeArea);
          `}
        </Script>
      </head>
      <body className={`${inter.className} antialiased overflow-x-hidden`}>
        <StorageInitializer />
        <ThemeProvider defaultTheme="dark">
          <TelegramStorageProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 w-full px-3 sm:px-4 py-4 sm:py-6 mx-auto max-w-full sm:max-w-7xl">
                {children}
              </main>
              <Footer />
            </div>
          </TelegramStorageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
