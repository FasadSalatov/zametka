"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import TelegramFullscreenButton from "./TelegramFullscreenButton";

const links = [
  { href: "/", label: "Главная" },
  { href: "/notes", label: "Заметки" },
  { href: "/finances", label: "Финансы" },
  { href: "/debts", label: "Долги" },
  { href: "/settings", label: "Настройки" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl shadow-sm" style={{ 
      paddingTop: `var(--combined-safe-area-inset-top)`,
      paddingLeft: `var(--combined-safe-area-inset-left)`,
      paddingRight: `var(--combined-safe-area-inset-right)` 
    }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-gradient">
              Zametka
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "text-primary bg-secondary shadow-sm"
                    : "text-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <TelegramFullscreenButton 
                buttonText="Полноэкранный режим" 
                exitButtonText="Выйти из полноэкрана"
                showVersionWarning={true}
              />
            </div>
            <div className="sm:hidden">
              <TelegramFullscreenButton 
                buttonText=""
                exitButtonText=""
                className="!px-2 !py-2"
                showVersionWarning={false}
              />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
      {/* Мобильное меню */}
      <div className="md:hidden">
        <div className="grid grid-cols-5 gap-0 p-0.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-1 py-2 rounded-md text-sm font-medium text-center transition-all ${
                pathname === link.href
                  ? "text-primary bg-secondary/50 shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-secondary/30"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 