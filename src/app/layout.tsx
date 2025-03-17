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
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
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
