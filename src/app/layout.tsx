import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import Script from "next/script";

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
          src="https://telegram.org/js/telegram-web-app.js?56"
          strategy="beforeInteractive" 
        />
        <Script id="safe-area-init" strategy="afterInteractive">
          {`
            // Инициализация CSS переменных safe area при загрузке страницы
            function updateSafeArea() {
              if (window.Telegram && window.Telegram.WebApp) {
                const tgApp = window.Telegram.WebApp;
                const html = document.documentElement;
                
                if (tgApp.version && typeof tgApp.isVersionAtLeast === 'function' && tgApp.isVersionAtLeast('8.0')) {
                  // Обрабатываем системные safe area insets (notch, navigation bar и т.д.)
                  if (tgApp.safeAreaInset) {
                    console.log('Telegram safeAreaInset:', tgApp.safeAreaInset);
                    html.style.setProperty('--tg-safe-area-inset-top', tgApp.safeAreaInset.top + 'px');
                    html.style.setProperty('--tg-safe-area-inset-right', tgApp.safeAreaInset.right + 'px');
                    html.style.setProperty('--tg-safe-area-inset-bottom', tgApp.safeAreaInset.bottom + 'px');
                    html.style.setProperty('--tg-safe-area-inset-left', tgApp.safeAreaInset.left + 'px');
                    
                    // Добавляем класс для отображения информации
                    html.classList.add('has-tg-safe-area');
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
                  }
                } else {
                  // Версия Telegram не поддерживает safe area API, используем CSS env()
                  console.log('Telegram version does not support safe area API, using CSS env() variables');
                }
                
                // Устанавливаем обработчики событий для обновления в случае изменения safe area
                if (tgApp.onEvent) {
                  tgApp.onEvent('safeAreaChanged', updateSafeArea);
                  tgApp.onEvent('contentSafeAreaChanged', updateSafeArea);
                  tgApp.onEvent('fullscreenChanged', updateSafeArea);
                  
                  // Сообщаем в консоль о результатах инициализации
                  console.log('Safe area event handlers initialized');
                }
                
                // Сообщаем Telegram, что приложение готово
                if (tgApp.ready) {
                  tgApp.ready();
                }
              } else {
                console.log('Telegram WebApp API not available');
              }
            }
            
            // Запускаем инициализацию после полной загрузки страницы
            function initSafeArea() {
              console.log('Initializing safe area');
              updateSafeArea();
              
              // Отображаем текущие значения env() переменных
              const computedStyle = getComputedStyle(document.documentElement);
              console.log('CSS env safe-area-inset-top:', computedStyle.getPropertyValue('--safe-area-inset-top'));
              console.log('CSS env safe-area-inset-bottom:', computedStyle.getPropertyValue('--safe-area-inset-bottom'));
            }
            
            if (document.readyState === 'complete') {
              initSafeArea();
            } else {
              window.addEventListener('load', initSafeArea);
            }
          `}
        </Script>
      </head>
      <body className={`${inter.className} antialiased overflow-x-hidden`}>
        <ThemeProvider defaultTheme="dark">
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 w-full px-3 sm:px-4 py-4 sm:py-6 mx-auto max-w-full sm:max-w-7xl">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
