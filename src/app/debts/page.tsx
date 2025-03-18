"use client";

import { useState, useEffect } from 'react';
import { Debt, getDebts, addDebt, updateDebt, deleteDebt, calculateTotalDebts } from '@/services/storage';
import Link from 'next/link';

const DebtPage = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояние для формы добавления/редактирования долга
  const [formData, setFormData] = useState<{
    id?: string;
    personName: string;
    amount: string;
    description: string;
    dueDate: string;
  }>({
    personName: '',
    amount: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const [isEditMode, setIsEditMode] = useState(false);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const loadedDebts = getDebts();
      setDebts(loadedDebts);
      setTotalDebt(calculateTotalDebts(loadedDebts));
      setIsLoading(false);
    }, 500);
  }, []);

  // Форматирование суммы
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Обработчик изменения полей формы
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.personName.trim() || !formData.amount.trim()) {
      alert('Пожалуйста, заполните имя человека и сумму долга');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Пожалуйста, введите корректную сумму долга');
      return;
    }

    if (isEditMode && formData.id) {
      // Обновление существующего долга
      const updatedDebt = updateDebt(formData.id, {
        personName: formData.personName,
        amount,
        description: formData.description,
        dueDate: formData.dueDate
      });

      if (updatedDebt) {
        const updatedDebts = debts.map(debt => 
          debt.id === formData.id ? updatedDebt : debt
        );
        setDebts(updatedDebts);
        setTotalDebt(calculateTotalDebts(updatedDebts));
      }
    } else {
      // Добавление нового долга
      const newDebt = addDebt({
        personName: formData.personName,
        amount,
        description: formData.description,
        dueDate: formData.dueDate
      });

      const updatedDebts = [...debts, newDebt];
      setDebts(updatedDebts);
      setTotalDebt(calculateTotalDebts(updatedDebts));
    }

    // Сброс формы и закрытие
    resetForm();
    setIsFormOpen(false);
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({
      personName: '',
      amount: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0]
    });
    setIsEditMode(false);
  };

  // Открытие формы для редактирования
  const handleEdit = (debt: Debt) => {
    setFormData({
      id: debt.id,
      personName: debt.personName,
      amount: debt.amount.toString(),
      description: debt.description,
      dueDate: debt.dueDate
    });
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  // Переключение статуса возврата долга
  const handleToggleReturned = (id: string) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const updatedDebt = updateDebt(id, { isReturned: !debt.isReturned });
    if (updatedDebt) {
      const updatedDebts = debts.map(d => d.id === id ? updatedDebt : d);
      setDebts(updatedDebts);
      setTotalDebt(calculateTotalDebts(updatedDebts));
    }
  };

  // Показ диалога подтверждения удаления
  const showDeleteDialog = (id: string) => {
    setShowDeleteConfirmation(id);
  };

  // Удаление долга
  const confirmDelete = () => {
    if (!showDeleteConfirmation) return;

    if (deleteDebt(showDeleteConfirmation)) {
      const updatedDebts = debts.filter(debt => debt.id !== showDeleteConfirmation);
      setDebts(updatedDebts);
      setTotalDebt(calculateTotalDebts(updatedDebts));
    }
    
    setShowDeleteConfirmation(null);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            Долги
          </h1>
          <p className="text-foreground/80">
            Отслеживание и управление долгами
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="bg-secondary p-3 rounded-lg">
            <div className="text-sm text-foreground/70">Общая сумма долгов:</div>
            <div className="font-bold text-xl">{formatCurrency(totalDebt)}</div>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md shadow-sm transition-colors hover-lift"
          >
            Добавить долг
          </button>
        </div>
      </div>

      {/* Список долгов */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : debts.length === 0 ? (
        <div className="text-center py-12 bg-secondary/20 rounded-lg">
          <div className="text-xl font-semibold mb-2">У вас пока нет долгов</div>
          <p className="text-foreground/70 mb-4">Добавьте новый долг, чтобы начать отслеживание</p>
          <button 
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md shadow-sm transition-colors hover-lift"
          >
            Добавить долг
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {debts.map(debt => (
            <div key={debt.id} className={`card p-4 ${debt.isReturned ? 'opacity-60' : ''}`}>
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{debt.personName}</h3>
                    {debt.isReturned && (
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
                        Возвращено
                      </span>
                    )}
                    {!debt.isReturned && new Date(debt.dueDate) < new Date() && (
                      <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-500 rounded-full">
                        Просрочено
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-foreground/70">
                    Срок: {formatDate(debt.dueDate)}
                  </div>
                  {debt.description && (
                    <p className="text-sm mt-1">{debt.description}</p>
                  )}
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                  <div className="font-bold text-lg">{formatCurrency(debt.amount)}</div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleToggleReturned(debt.id)}
                      className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 transition-colors"
                      title={debt.isReturned ? "Отметить как невозвращенный" : "Отметить как возвращенный"}
                    >
                      {debt.isReturned ? "Не возвращен" : "Возвращен"}
                    </button>
                    <button 
                      onClick={() => handleEdit(debt)}
                      className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 transition-colors"
                      title="Редактировать"
                    >
                      Изменить
                    </button>
                    <button 
                      onClick={() => showDeleteDialog(debt.id)}
                      className="text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-500 transition-colors"
                      title="Удалить"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Форма добавления/редактирования долга */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ 
          paddingTop: `calc(1rem + var(--tg-content-safe-area-inset-top))`,
          paddingLeft: `calc(1rem + var(--tg-content-safe-area-inset-left))`,
          paddingRight: `calc(1rem + var(--tg-content-safe-area-inset-right))`,
          paddingBottom: `calc(1rem + var(--tg-content-safe-area-inset-bottom))` 
        }}>
          <div className="bg-card p-5 rounded-lg shadow-lg w-full max-w-lg animate-fadeInScale">
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? 'Редактировать долг' : 'Добавить новый долг'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Имя человека</label>
                <input
                  type="text"
                  name="personName"
                  value={formData.personName}
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border bg-background rounded-md"
                  placeholder="За что должен"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Срок возврата</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border bg-background rounded-md"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsFormOpen(false);
                  }}
                  className="px-4 py-2 border rounded-md bg-background hover:bg-secondary/50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  {isEditMode ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ 
          paddingTop: `calc(1rem + var(--tg-content-safe-area-inset-top))`,
          paddingLeft: `calc(1rem + var(--tg-content-safe-area-inset-left))`,
          paddingRight: `calc(1rem + var(--tg-content-safe-area-inset-right))`,
          paddingBottom: `calc(1rem + var(--tg-content-safe-area-inset-bottom))` 
        }}>
          <div className="bg-card p-5 rounded-lg shadow-lg w-full max-w-md animate-fadeInScale">
            <h2 className="text-xl font-bold mb-2">Подтверждение удаления</h2>
            <p className="mb-4">Вы действительно хотите удалить этот долг? Это действие нельзя отменить.</p>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirmation(null)}
                className="px-4 py-2 border rounded-md bg-background hover:bg-secondary/50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtPage; 