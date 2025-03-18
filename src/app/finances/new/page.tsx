"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addTransaction } from "@/services/storage";

export default function NewTransactionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().split("T")[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Сохраняем транзакцию
    addTransaction({
      title: formData.title,
      amount: parseFloat(formData.amount) || 0,
      type: formData.type as 'income' | 'expense',
      category: formData.category,
      date: formData.date
    });
    
    // Перенаправляем пользователя назад на страницу финансов
    router.push("/finances");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Новая транзакция</h1>
        <Link
          href="/finances"
          className="bg-secondary text-secondary-foreground rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors"
          style={{
            paddingTop: `calc(0.5rem + var(--tg-safe-area-inset-top))`,
            paddingRight: `calc(1rem + var(--tg-safe-area-inset-right))`, 
          }}
        >
          Отмена
        </Link>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Название
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-background border border-input rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="Название транзакции"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-1">
                Сумма (₽)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                required
                value={formData.amount}
                onChange={handleChange}
                className="w-full bg-background border border-input rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Тип
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-background border border-input rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              >
                <option value="expense">Расход</option>
                <option value="income">Доход</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Категория
              </label>
              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-background border border-input rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="Категория (например, Продукты, Зарплата)"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-1">
                Дата
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-background border border-input rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-primary/90"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 