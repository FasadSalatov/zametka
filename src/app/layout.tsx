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
                
                // Устанавливаем переменные safe area из Telegram WebApp
                if (tgApp.safeAreaInset) {
                  document.documentElement.style.setProperty('--tg-safe-area-inset-top', tgApp.safeAreaInset.top + 'px');
                  document.documentElement.style.setProperty('--tg-safe-area-inset-right', tgApp.safeAreaInset.right + 'px');
                  document.documentElement.style.setProperty('--tg-safe-area-inset-bottom', tgApp.safeAreaInset.bottom + 'px');
                  document.documentElement.style.setProperty('--tg-safe-area-inset-left', tgApp.safeAreaInset.left + 'px');
                }
                
                // Устанавливаем переменные content safe area из Telegram WebApp
                if (tgApp.contentSafeAreaInset) {
                  document.documentElement.style.setProperty('--tg-content-safe-area-inset-top', tgApp.contentSafeAreaInset.top + 'px');
                  document.documentElement.style.setProperty('--tg-content-safe-area-inset-right', tgApp.contentSafeAreaInset.right + 'px');
                  document.documentElement.style.setProperty('--tg-content-safe-area-inset-bottom', tgApp.contentSafeAreaInset.bottom + 'px');
                  document.documentElement.style.setProperty('--tg-content-safe-area-inset-left', tgApp.contentSafeAreaInset.left + 'px');
                }
                
                // Устанавливаем обработчики событий для обновления в случае изменения safe area
                if (tgApp.onEvent) {
                  tgApp.onEvent('safeAreaChanged', updateSafeArea);
                  tgApp.onEvent('contentSafeAreaChanged', updateSafeArea);
                }
              }
            }
            
            // Запускаем инициализацию после полной загрузки страницы
            if (document.readyState === 'complete') {
              updateSafeArea();
            } else {
              window.addEventListener('load', updateSafeArea);
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
