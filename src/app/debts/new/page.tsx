"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDebt } from '@/services/storage';
import Link from 'next/link';

export default function NewDebtPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    personName: '',
    amount: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.personName.trim() || !formData.amount.trim()) {
      alert('Пожалуйста, заполните имя человека и сумму долга');
      setIsSubmitting(false);
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Пожалуйста, введите корректную сумму долга');
      setIsSubmitting(false);
      return;
    }

    // Добавление нового долга
    addDebt({
      personName: formData.personName,
      amount,
      description: formData.description,
      dueDate: formData.dueDate
    });

    // Возвращаемся на страницу со списком долгов
    setTimeout(() => {
      router.push('/debts');
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Добавить новый долг
        </h1>
        <Link 
          href="/debts" 
          className="text-sm px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
        >
          Назад к списку
        </Link>
      </div>

      <div className="card p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Имя должника</label>
            <input
              type="text"
              name="personName"
              value={formData.personName}
              onChange={handleChange}
              className="w-full px-3 py-2 border bg-background rounded-md"
              placeholder="Иван Иванов"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Сумма долга (₽)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border bg-background rounded-md"
              placeholder="1000"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Описание (необязательно)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border bg-background rounded-md"
              placeholder="За что должен"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Срок возврата</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border bg-background rounded-md"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Link
              href="/debts"
              className="px-4 py-2 border rounded-md bg-background hover:bg-secondary/50 transition-colors"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-primary-foreground rounded-full"></span>
                  Сохранение...
                </span>
              ) : 'Добавить долг'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 