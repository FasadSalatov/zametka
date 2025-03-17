"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Transaction, getTransactions, calculateBalance, deleteTransaction, getSettings, updateSettings } from "@/services/storage";
import FinanceCharts from "@/components/FinanceCharts";

// Функция форматирования даты
const formatDate = (dateString: string | number): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState({ balance: 0, income: 0, expense: 0 });
  const [dollarAmount, setDollarAmount] = useState<string>("");
  const [settings, setSettings] = useState({ dollarRate: 91 });
  const [isRateEditMode, setIsRateEditMode] = useState(false);
  const [tempRate, setTempRate] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRubleAnimation, setShowRubleAnimation] = useState(false);

  useEffect(() => {
    // Анимируем загрузку
    setIsLoading(true);
    
    // Имитация задержки загрузки для анимации
    setTimeout(() => {
      // Загружаем транзакции из хранилища и вычисляем метрики
      const loadedTransactions = getTransactions();
      setTransactions(loadedTransactions);
      setMetrics(calculateBalance(loadedTransactions));

      // Загружаем настройки
      const loadedSettings = getSettings();
      setSettings(loadedSettings);
      
      setIsLoading(false);
    }, 600);
  }, []);

  const handleDollarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDollarAmount(e.target.value);
    setShowRubleAnimation(true);
    setTimeout(() => setShowRubleAnimation(false), 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleEditRate = () => {
    setIsRateEditMode(true);
    setTempRate(settings.dollarRate.toString());
  };

  const handleSaveRate = () => {
    const newRate = parseFloat(tempRate);
    if (!isNaN(newRate) && newRate > 0) {
      const updatedSettings = updateSettings({ dollarRate: newRate });
      setSettings(updatedSettings);
    }
    setIsRateEditMode(false);
  };

  const handleDeleteTransaction = (id: string) => {
    // Если уже показываем подтверждение для этой транзакции, удаляем её
    if (showDeleteConfirmation === id) {
      deleteTransaction(id);
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      setMetrics(calculateBalance(updatedTransactions));
      setShowDeleteConfirmation(null);
    } else {
      // Иначе показываем подтверждение
      setShowDeleteConfirmation(id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gradient fire-text">Финансы</h1>
        <Link
          href="/finances/new"
          className="btn-neon rounded-all px-4 py-2 text-sm font-medium shadow-sm transition-colors hover-lift flex items-center gap-2 action-button action-button-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Новая транзакция
        </Link>
      </div>

      {isLoading ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 shimmer" style={{height: '100px', animationDelay: `${i * 0.2}s`}}></div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card p-4 shimmer" style={{height: '250px', animationDelay: `${i * 0.3 + 0.6}s`}}></div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card-premium p-5 animate-fadeInScale" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground opacity-70 mb-1">Баланс</p>
                  <h2 className="text-2xl font-bold text-shadow">{formatCurrency(metrics.balance)}</h2>
                </div>
                <div className="p-3 bg-primary/10 rounded-all animate-float hover:scale-110 transition-transform shadow-glow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary animate-glow"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="8"></line>
                  </svg>
                </div>
              </div>
            </div>

            <div className="card-premium p-5 animate-fadeInScale" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground opacity-70 mb-1">Доходы</p>
                  <h2 className="text-2xl font-bold text-green-500 text-shadow">{formatCurrency(metrics.income)}</h2>
                </div>
                <div className="p-3 bg-green-500/10 rounded-all animate-float hover:scale-110 transition-transform shadow-glow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-500 animate-glow"
                  >
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            <div className="card-premium p-5 animate-fadeInScale" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground opacity-70 mb-1">Расходы</p>
                  <h2 className="text-2xl font-bold text-red-500 text-shadow">{formatCurrency(metrics.expense)}</h2>
                </div>
                <div className="p-3 bg-red-500/10 rounded-all animate-float hover:scale-110 transition-transform shadow-glow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500 animate-glow"
                  >
                    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                    <polyline points="16 17 22 17 22 11"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <FinanceCharts transactions={transactions} />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="card glass animate-slideInLeft" style={{animationDelay: '0.4s'}}>
              <div className="relative p-5">
                <span className="absolute -top-2 -left-2 px-3 py-1 rounded-all bg-primary text-white text-sm font-bold shadow-glow z-10">
                  Транзакции
                </span>
                <h3 className="text-lg font-medium mb-5 text-gradient mt-3">Последние транзакции</h3>
                {transactions.length === 0 ? (
                  <div className="py-6 text-center text-foreground opacity-70">
                    У вас пока нет транзакций. Создайте свою первую транзакцию!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction, index) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between py-3 border-b border-border hover:border-primary/30 transition-all hover:bg-card/50 rounded-all px-2 hover-lift"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <div className="flex items-center">
                          <div className={`p-2 rounded-all ${transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'} transition-transform hover:scale-110 shadow-glow`}>
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
                              className={transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}
                            >
                              {transaction.type === 'income' ? (
                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                              ) : (
                                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                              )}
                              {transaction.type === 'income' ? (
                                <polyline points="16 7 22 7 22 13"></polyline>
                              ) : (
                                <polyline points="16 17 22 17 22 11"></polyline>
                              )}
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">{transaction.title}</p>
                            <p className="text-xs text-foreground opacity-70">{transaction.category} • {formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'} text-shadow`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                          {showDeleteConfirmation === transaction.id ? (
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="p-1 text-red-500 hover:bg-red-500/20 rounded-all transition-colors font-medium"
                                title="Подтвердить удаление"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </button>
                              <button 
                                onClick={cancelDelete}
                                className="p-1 text-foreground hover:bg-foreground/10 rounded-all transition-colors font-medium"
                                title="Отменить"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="p-1 text-foreground opacity-70 hover:opacity-100 hover:text-red-500 hover:bg-red-500/20 rounded-all transition-colors font-medium"
                              title="Удалить"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {transactions.length > 5 && (
                  <div className="mt-5">
                    <Link
                      href="/finances/all"
                      className="inline-flex items-center text-sm text-primary hover:underline hover-lift group animate-pulse"
                    >
                      Смотреть все транзакции
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
                        className="ml-1 group-hover:translate-x-1 transition-transform"
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="card glass animate-slideInRight" style={{animationDelay: '0.5s'}}>
              <div className="relative p-5">
                <span className="absolute -top-2 -right-2 px-3 py-1 rounded-all bg-primary text-white text-sm font-bold shadow-glow z-10">
                  Конвертер
                </span>
                <h3 className="text-lg font-medium mb-5 text-gradient mt-3">Конвертер валют</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-3 hover:bg-card/50 rounded-all transition-all bg-opacity-30 border border-primary/20 shadow-sharp">
                    <div className="font-medium text-shadow">Курс USD/RUB:</div>
                    <div className="flex items-center gap-2">
                      {isRateEditMode ? (
                        <>
                          <div className="input-fancy">
                            <input
                              type="number"
                              value={tempRate}
                              onChange={e => setTempRate(e.target.value)}
                              className="w-24 p-2 text-right focus:border-primary focus:ring-1 focus:ring-primary bg-transparent"
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <button 
                            onClick={handleSaveRate}
                            className="p-2 text-green-500 hover:bg-green-500/20 rounded-all transition-colors hover:scale-110 shadow-glow"
                            title="Сохранить"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-primary text-xl animate-pulse">{settings.dollarRate} ₽</span>
                          <button 
                            onClick={handleEditRate}
                            className="p-2 text-foreground opacity-70 hover:opacity-100 hover:text-primary hover:bg-primary/10 rounded-all transition-all hover:scale-110"
                            title="Изменить курс"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="input-fancy p-3 card-premium hover:shadow-glow">
                    <label htmlFor="dollar-amount" className="block text-sm text-foreground opacity-70 mb-2 font-medium text-shadow">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 6v12"></path>
                          <path d="M8 10h8"></path>
                        </svg>
                        Сумма в долларах (USD)
                      </div>
                    </label>
                    <input
                      id="dollar-amount"
                      type="number"
                      value={dollarAmount}
                      onChange={handleDollarChange}
                      className="w-full p-3 border-0 border-b-2 border-primary/30 focus:border-primary focus:ring-0 bg-transparent text-lg font-bold text-shadow"
                      placeholder="Введите сумму..."
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="p-4 card-premium rounded-all shadow-sharp">
                    <div className="block text-sm text-foreground opacity-70 mb-2 font-medium text-shadow">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path>
                          <line x1="2" y1="20" x2="2" y2="20"></line>
                        </svg>
                        Сумма в рублях (RUB)
                      </div>
                    </div>
                    <div className={`w-full p-3 border-0 border-b-2 border-primary/30 bg-transparent text-2xl font-bold text-primary text-shadow ${showRubleAnimation ? 'animate-fadeInScale' : ''}`}>
                      {dollarAmount && !isNaN(parseFloat(dollarAmount))
                        ? formatCurrency(parseFloat(dollarAmount) * settings.dollarRate)
                        : "0 ₽"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 