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
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl shadow-sm" style={{ 
      paddingTop: `calc(var(--combined-safe-area-inset-top) + 2rem)`,
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
            <Link
              href="/settings"
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="Настройки"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={pathname === "/settings" ? "text-primary" : "text-foreground"}
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
      {/* Мобильное меню */}
      <div className="md:hidden">
        <div className="grid grid-cols-4 gap-0 p-0.5">
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