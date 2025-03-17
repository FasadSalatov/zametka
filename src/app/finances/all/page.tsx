"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Transaction, getTransactions, formatDate, deleteTransaction } from "@/services/storage";

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Анимируем загрузку
    setIsLoading(true);
    
    // Имитация задержки загрузки для анимации
    setTimeout(() => {
      // Загружаем транзакции из хранилища
      const loadedTransactions = getTransactions();
      setTransactions(loadedTransactions);
      setIsLoading(false);
    }, 600);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteTransaction = (id: string) => {
    // Если уже показываем подтверждение для этой транзакции, удаляем её
    if (showDeleteConfirmation === id) {
      deleteTransaction(id);
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      setShowDeleteConfirmation(null);
    } else {
      // Иначе показываем подтверждение
      setShowDeleteConfirmation(id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(null);
  };

  // Фильтрация транзакций
  const filteredTransactions = transactions
    .filter(transaction => 
      transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(transaction => 
      filter === "all" ? true : transaction.type === filter
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Все транзакции</h1>
        <Link
          href="/finances"
          className="inline-flex items-center text-sm text-primary hover:underline hover-lift group"
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
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          >
            <path d="m15 18-6-6 6-6"></path>
          </svg>
          Назад к финансам
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-5 items-start md:items-center mb-6">
        <div className="flex-1 flex items-center space-x-2 rounded-md border border-input p-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all hover:border-primary/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground opacity-70"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input
            className="flex-1 bg-transparent outline-none placeholder:text-foreground/50"
            placeholder="Поиск транзакций..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all hover:scale-105 ${
              filter === "all"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter("income")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all hover:scale-105 ${
              filter === "income"
                ? "bg-green-500 text-white shadow-md"
                : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
            }`}
          >
            Доходы
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all hover:scale-105 ${
              filter === "expense"
                ? "bg-red-500 text-white shadow-md"
                : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            }`}
          >
            Расходы
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-6 shimmer" style={{height: '400px'}}></div>
      ) : (
        <div className="card p-6 glass">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-foreground opacity-70">
              {transactions.length === 0 
                ? "У вас пока нет транзакций. Создайте свою первую транзакцию!" 
                : "Не найдено транзакций по вашему запросу."}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 pb-3 border-b border-border font-medium text-sm text-foreground opacity-70">
                <div className="md:col-span-2">Название</div>
                <div className="text-right">Сумма</div>
                <div className="hidden md:block">Категория</div>
                <div className="text-right">Действия</div>
              </div>
              {filteredTransactions.map((transaction, index) => (
                <div 
                  key={transaction.id} 
                  className="grid grid-cols-3 md:grid-cols-5 gap-4 py-3 border-b border-border/50 hover:border-primary/30 items-center transition-all hover:bg-card/50 rounded-md px-3 hover-lift" 
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${transaction.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'} transition-transform hover:scale-110`}>
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
                      <div>
                        <div className="font-medium">{transaction.title}</div>
                        <div className="text-xs text-foreground opacity-50">{transaction.date} • {formatDate(transaction.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                  <div className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                  <div className="hidden md:block">
                    <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                      {transaction.category}
                    </span>
                  </div>
                  <div className="text-right flex items-center justify-end gap-2">
                    {showDeleteConfirmation === transaction.id ? (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="p-1 text-red-500 hover:bg-red-500/20 rounded-md transition-colors hover:scale-110"
                          title="Подтвердить удаление"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                        <button 
                          onClick={cancelDelete}
                          className="p-1 text-foreground hover:bg-foreground/10 rounded-md transition-colors hover:scale-110"
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
                        className="p-1 text-foreground opacity-70 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors hover:scale-110"
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
        </div>
      )}
      
      {!isLoading && filteredTransactions.length > 0 && (
        <div className="text-center text-sm text-foreground opacity-50 py-2">
          Найдено транзакций: {filteredTransactions.length}
        </div>
      )}
    </div>
  );
} 