"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getSettings, updateSettings, Settings, downloadDataAsFile, importDataFromFile } from "@/services/storage";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>({
    dollarRate: 91,
    darkMode: false
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Анимируем загрузку
    setIsLoading(true);
    
    // Имитируем задержку для анимации
    setTimeout(() => {
      // Загружаем настройки из localStorage
      const loadedSettings = getSettings();
      setSettings(loadedSettings);
      setIsLoading(false);
    }, 600);
  }, []);

  // Обработчик изменения курса доллара
  const handleDollarRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setSettings({ ...settings, dollarRate: value });
    }
  };

  // Обработчик изменения темы
  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    setSettings({ ...settings, darkMode: newTheme === "dark" });
  };

  // Сохранение настроек
  const saveSettings = () => {
    updateSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Экспорт данных
  const handleExport = () => {
    downloadDataAsFile();
  };

  // Импорт данных
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      const file = e.target.files[0];
      const success = await importDataFromFile(file);
      
      if (success) {
        setImportStatus('success');
        
        // Загружаем обновленные настройки
        const loadedSettings = getSettings();
        setSettings(loadedSettings);
        
        // Применяем тему из импортированных настроек
        if (loadedSettings.darkMode) {
          setTheme('dark');
        } else {
          setTheme('light');
        }
        
        setTimeout(() => {
          setImportStatus('idle');
        }, 3000);
      } else {
        setImportStatus('error');
        setTimeout(() => {
          setImportStatus('idle');
        }, 3000);
      }
    } catch (error) {
      console.error('Ошибка при импорте:', error);
      setImportStatus('error');
      setTimeout(() => {
        setImportStatus('idle');
      }, 3000);
    }
    
    // Сбрасываем input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Настройки</h1>
        <button
          onClick={saveSettings}
          className={`${
            isSaved 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-primary hover:bg-primary/90"
          } text-primary-foreground rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-all hover-lift flex items-center gap-2`}
        >
          {isSaved ? (
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
                className="animate-pulse"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Сохранено
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
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Сохранить настройки
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 shimmer" style={{height: '250px'}}></div>
          ))}
          <div className="card p-6 shimmer md:col-span-2" style={{height: '150px'}}></div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-6 glass hover-lift">
              <h2 className="text-xl font-semibold mb-5 text-gradient">Внешний вид</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">Тема</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={`p-4 rounded-lg border ${
                        theme === "light"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      } flex flex-col items-center justify-center gap-3 hover:border-primary transition-all hover-lift ${
                        theme === "light" ? "hover-glow" : ""
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-md hover:shadow-lg transition-all">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#000000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={theme === "light" ? "animate-pulse" : ""}
                        >
                          <circle cx="12" cy="12" r="4"></circle>
                          <path d="M12 2v2"></path>
                          <path d="M12 20v2"></path>
                          <path d="m4.93 4.93 1.41 1.41"></path>
                          <path d="m17.66 17.66 1.41 1.41"></path>
                          <path d="M2 12h2"></path>
                          <path d="M20 12h2"></path>
                          <path d="m6.34 17.66-1.41 1.41"></path>
                          <path d="m19.07 4.93-1.41 1.41"></path>
                        </svg>
                      </div>
                      <span className="font-medium">Светлая</span>
                    </button>

                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`p-4 rounded-lg border ${
                        theme === "dark"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      } flex flex-col items-center justify-center gap-3 hover:border-primary transition-all hover-lift ${
                        theme === "dark" ? "hover-glow" : ""
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full bg-black border border-black flex items-center justify-center shadow-md hover:shadow-lg transition-all">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="red"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={theme === "dark" ? "animate-pulse" : ""}
                        >
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                        </svg>
                      </div>
                      <span className="font-medium">Тёмная</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 glass hover-lift">
              <h2 className="text-xl font-semibold mb-5 text-gradient">Курс валют</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="dollar-rate" className="block text-sm font-medium mb-2">
                    Курс USD/RUB
                  </label>
                  <div className="p-3 border border-input bg-card/30 rounded-md hover:bg-card/50 transition-all">
                    <input
                      id="dollar-rate"
                      type="number"
                      value={settings.dollarRate}
                      onChange={handleDollarRateChange}
                      className="w-full p-2 border border-input rounded-md focus:border-primary focus:ring-1 focus:ring-primary bg-transparent"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <p className="mt-3 text-sm text-foreground opacity-70">
                    Текущий курс для конвертации долларов в рубли
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 glass hover-lift">
              <h2 className="text-xl font-semibold mb-5 text-gradient">Резервное копирование</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium mb-2">Экспорт данных</h3>
                  <p className="text-sm text-foreground opacity-70 mb-3">
                    Сохраните все ваши данные в файл для безопасного хранения
                  </p>
                  <button
                    onClick={handleExport}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-all hover-lift flex items-center gap-2"
                  >
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Экспортировать данные
                  </button>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-2">Импорт данных</h3>
                  <p className="text-sm text-foreground opacity-70 mb-3">
                    Восстановите данные из ранее сохраненного файла
                  </p>
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".json"
                      ref={fileInputRef}
                      onChange={handleImport}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-foreground rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-all hover-lift inline-flex items-center gap-2 ${
                        importStatus === 'success' ? 'bg-green-500 hover:bg-green-600 text-white' : 
                        importStatus === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' : ''
                      }`}
                    >
                      {importStatus === 'idle' && (
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
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          Импортировать данные
                        </>
                      )}
                      
                      {importStatus === 'success' && (
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
                            className="animate-pulse"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          Данные импортированы
                        </>
                      )}
                      
                      {importStatus === 'error' && (
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
                            className="animate-pulse"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          Ошибка импорта
                        </>
                      )}
                    </label>
                  </div>
                  <p className="mt-3 text-xs text-foreground opacity-70">
                    * При импорте данных будут заменены все текущие данные
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 glass hover-lift">
            <h2 className="text-xl font-semibold mb-5 text-gradient">О приложении</h2>
            <div className="space-y-3 text-foreground opacity-80">
              <p>Zametka - персональное приложение для управления заметками и финансами.</p>
              <div className="p-3 rounded-md bg-primary/5 border border-primary/10 shadow-inner">
                <div className="flex items-center justify-between">
                  <span>Версия:</span>
                  <span className="text-primary font-medium">1.0.0</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span>Разработчик:</span>
                  <span className="text-[#ff5252] font-medium">@Fasad_Salatov</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 