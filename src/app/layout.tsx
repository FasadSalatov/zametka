import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CloudStorageProvider } from "@/components/providers/cloud-storage-provider";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Zametka",
  description: "Личный менеджер заметок, финансов и списка долгов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Скрипт инициализации CSS-переменных безопасных зон */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function initSafeAreaVars() {
              // Объявляем CSS-переменные для безопасных зон
              function setSafeAreaVars() {
                // Получаем данные о безопасных зонах из Telegram WebApp
                let safeAreaTop = 0;
                let safeAreaBottom = 0;
                let safeAreaLeft = 0;
                let safeAreaRight = 0;
                
                // Проверяем, доступен ли Telegram WebApp API
                if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                  const viewportHeight = window.Telegram.WebApp.viewportHeight;
                  const viewportStableHeight = window.Telegram.WebApp.viewportStableHeight;
                  
                  // Рассчитываем безопасную зону внизу (для клавиатуры)
                  if (viewportHeight && viewportStableHeight) {
                    safeAreaBottom = Math.max(0, viewportHeight - viewportStableHeight);
                  }
                  
                  // Если доступны данные о безопасных зонах от WebApp
                  if (window.Telegram.WebApp.safeAreaInsets) {
                    safeAreaTop = window.Telegram.WebApp.safeAreaInsets.top || 0;
                    safeAreaBottom = Math.max(
                      safeAreaBottom, 
                      window.Telegram.WebApp.safeAreaInsets.bottom || 0
                    );
                    safeAreaLeft = window.Telegram.WebApp.safeAreaInsets.left || 0;
                    safeAreaRight = window.Telegram.WebApp.safeAreaInsets.right || 0;
                  }
                }
                
                // Устанавливаем максимальные значения между стандартными iOS-переменными и значениями из Telegram
                document.documentElement.style.setProperty('--combined-safe-area-inset-top', 
                  \`max(env(safe-area-inset-top, 0px), \${safeAreaTop}px)\`);
                document.documentElement.style.setProperty('--combined-safe-area-inset-bottom', 
                  \`max(env(safe-area-inset-bottom, 0px), \${safeAreaBottom}px)\`);
                document.documentElement.style.setProperty('--combined-safe-area-inset-left', 
                  \`max(env(safe-area-inset-left, 0px), \${safeAreaLeft}px)\`);
                document.documentElement.style.setProperty('--combined-safe-area-inset-right', 
                  \`max(env(safe-area-inset-right, 0px), \${safeAreaRight}px)\`);
                
                // Определяем, является ли устройство сенсорным
                if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                  document.documentElement.classList.add('touch-device');
                }
              }
              
              // Устанавливаем переменные при загрузке
              setSafeAreaVars();
              
              // Добавляем слушатель событий изменения размера окна
              window.addEventListener('resize', setSafeAreaVars);
              
              // Слушаем событие изменения viewportHeight в Telegram WebApp
              if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                window.Telegram.WebApp.onEvent('viewportChanged', setSafeAreaVars);
              }
            })();
          `
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark">
          <CloudStorageProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 container mx-auto px-3 py-4 pt-20 pb-24">
                {children}
              </main>
              <Footer />
            </div>
          </CloudStorageProvider>
        </ThemeProvider>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
