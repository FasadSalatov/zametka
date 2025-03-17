"use client";

import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useEffect, useState } from 'react';

type TelegramFullscreenButtonProps = {
  buttonText?: string;
  exitButtonText?: string;
  className?: string;
  showVersionWarning?: boolean;
};

export default function TelegramFullscreenButton({
  buttonText = "Развернуть на весь экран",
  exitButtonText = "Выйти из полноэкранного режима",
  className = "",
  showVersionWarning = false
}: TelegramFullscreenButtonProps) {
  const { isAvailable, isFullscreenSupported, isFullscreen, toggleFullscreen, version } = useTelegramWebApp();
  const [showWarning, setShowWarning] = useState(false);

  // Показываем предупреждение один раз при загрузке, если функция не поддерживается
  useEffect(() => {
    if (isAvailable && !isFullscreenSupported && showVersionWarning) {
      setShowWarning(true);
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isAvailable, isFullscreenSupported, showVersionWarning]);

  // Если Telegram API не доступен, вообще не отображаем ничего
  if (!isAvailable) {
    return null;
  }

  // Если полноэкранный режим не поддерживается, но отображаем предупреждение
  if (!isFullscreenSupported) {
    return showWarning ? (
      <div className="hidden sm:block text-xs text-yellow-500 animate-pulse">
        {version ? `Полноэкранный режим доступен с версии 8.0 (текущая: ${version})` : 'Полноэкранный режим не поддерживается'}
      </div>
    ) : null;
  }

  // Если текст кнопки пустой, показываем только иконку (для мобильных устройств)
  const showIconOnly = buttonText === '' && exitButtonText === '';

  return (
    <button
      onClick={toggleFullscreen}
      className={`bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-medium shadow-sm transition-all hover-lift flex items-center gap-2 ${showIconOnly ? 'p-2' : 'px-3 py-2'} ${className}`}
      type="button"
      aria-label={isFullscreen ? "Выйти из полноэкранного режима" : "Развернуть на весь экран"}
    >
      {isFullscreen ? (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          {!showIconOnly && exitButtonText}
        </>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          {!showIconOnly && buttonText}
        </>
      )}
    </button>
  );
} 