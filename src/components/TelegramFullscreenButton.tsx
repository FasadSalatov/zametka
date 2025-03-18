"use client";

import { useState, useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { isCloudStorageAvailable, cloudStorageSetItem } from '@/utils/cloudStorage';

interface FullscreenButtonProps {
  buttonText?: string;
  exitButtonText?: string;
  className?: string;
  showVersionWarning?: boolean;
}

const TelegramFullscreenButton = ({ 
  buttonText = "Полноэкранный режим", 
  exitButtonText = "Выйти из полноэкрана",
  className = "",
  showVersionWarning = true
}: FullscreenButtonProps) => {
  const { isAvailable, isFullscreenSupported, isFullscreen, toggleFullscreen } = useTelegramWebApp();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Отображаем предупреждение, если полноэкранный режим не поддерживается
    if (isAvailable && !isFullscreenSupported && showVersionWarning) {
      setShowWarning(true);
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    // Загружаем сохраненное состояние полноэкранного режима при первом рендеринге
    const loadFullscreenSetting = async () => {
      if (isAvailable && isFullscreenSupported && isCloudStorageAvailable()) {
        try {
          const stored = localStorage.getItem('fullscreen_enabled');
          if (stored === 'true' && !isFullscreen) {
            // Восстанавливаем полноэкранный режим с небольшой задержкой
            setTimeout(() => {
              toggleFullscreen();
            }, 1000);
          }
        } catch (e) {
          console.error('Ошибка при загрузке настроек полноэкранного режима:', e);
        }
      }
    };
    
    loadFullscreenSetting();
  }, [isAvailable, isFullscreenSupported, showVersionWarning, isFullscreen, toggleFullscreen]);

  // Сохраняем состояние полноэкранного режима при его изменении
  useEffect(() => {
    if (isAvailable && isFullscreenSupported) {
      try {
        localStorage.setItem('fullscreen_enabled', isFullscreen ? 'true' : 'false');
        
        // Сохраняем также в CloudStorage, если доступно
        if (isCloudStorageAvailable()) {
          cloudStorageSetItem('fullscreen_enabled', isFullscreen ? 'true' : 'false');
        }
      } catch (e) {
        console.error('Ошибка при сохранении настроек полноэкранного режима:', e);
      }
    }
  }, [isAvailable, isFullscreenSupported, isFullscreen]);

  // Обертка для добавления тактильной обратной связи
  const handleToggleFullscreen = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
    toggleFullscreen();
  };

  if (!isAvailable) {
    return null;
  }

  if (!isFullscreenSupported) {
    return showWarning ? (
      <div className="text-xs text-yellow-500 animate-pulse">
        Для полноэкранного режима требуется Telegram 8.0+
      </div>
    ) : null;
  }

  return (
    <>
      <button
        onClick={handleToggleFullscreen}
        className={`px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm ${className}`}
      >
        {buttonText && exitButtonText ? (isFullscreen ? exitButtonText : buttonText) : (
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
          >
            {isFullscreen ? (
              <>
                <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
                <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
              </>
            ) : (
              <>
                <path d="M3 8V5a2 2 0 0 1 2-2h3"></path>
                <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
                <path d="M21 16v3a2 2 0 0 1-2 2h-3"></path>
                <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
              </>
            )}
          </svg>
        )}
      </button>
      {showWarning && (
        <div className="absolute top-full left-0 right-0 mt-2 text-xs bg-yellow-500/20 text-yellow-500 p-2 rounded-lg animate-fadeIn">
          Ошибка активации полноэкранного режима
        </div>
      )}
    </>
  );
};

export default TelegramFullscreenButton; 