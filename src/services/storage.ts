// Интерфейсы для типов данных
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
}

// Константы ключей для localStorage
const TRANSACTIONS_KEY = 'zametka_transactions';
const NOTES_KEY = 'zametka_notes';
const SETTINGS_KEY = 'zametka_settings';

// Интерфейс настроек
export interface Settings {
  dollarRate: number;
  darkMode: boolean;
}

// Значения по умолчанию
const DEFAULT_SETTINGS: Settings = {
  dollarRate: 91,
  darkMode: false
};

// Интерфейс для экспорта/импорта всех данных
export interface ExportData {
  transactions: Transaction[];
  notes: Note[];
  settings: Settings;
  version: string;
  exportDate: number;
}

// Функции для управления транзакциями
export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const transactions = localStorage.getItem(TRANSACTIONS_KEY);
    return transactions ? JSON.parse(transactions) : [];
  } catch (error) {
    console.error('Ошибка при получении транзакций:', error);
    return [];
  }
}

export function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const transactions = getTransactions();
  
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    createdAt: Date.now()
  };
  
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([...transactions, newTransaction]));
  
  return newTransaction;
}

export function deleteTransaction(id: string): boolean {
  const transactions = getTransactions();
  const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
  
  if (updatedTransactions.length === transactions.length) {
    return false; // Ничего не было удалено
  }
  
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
  return true;
}

// Функции для управления заметками
export function getNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const notes = localStorage.getItem(NOTES_KEY);
    return notes ? JSON.parse(notes) : [];
  } catch (error) {
    console.error('Ошибка при получении заметок:', error);
    return [];
  }
}

export function addNote(note: Omit<Note, 'id' | 'createdAt'>): Note {
  const notes = getNotes();
  
  const newNote: Note = {
    ...note,
    id: Date.now().toString(),
    createdAt: Date.now()
  };
  
  localStorage.setItem(NOTES_KEY, JSON.stringify([...notes, newNote]));
  
  return newNote;
}

export function deleteNote(id: string): boolean {
  const notes = getNotes();
  const updatedNotes = notes.filter(note => note.id !== id);
  
  if (updatedNotes.length === notes.length) {
    return false; // Ничего не было удалено
  }
  
  localStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
  return true;
}

// Функции для управления настройками
export function getSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Ошибка при получении настроек:', error);
    return DEFAULT_SETTINGS;
  }
}

export function updateSettings(newSettings: Partial<Settings>): Settings {
  const currentSettings = getSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
  
  return updatedSettings;
}

// Функции для экспорта и импорта данных
export function exportAllData(): ExportData {
  const transactions = getTransactions();
  const notes = getNotes();
  const settings = getSettings();
  
  const exportData: ExportData = {
    transactions,
    notes,
    settings,
    version: '1.0.0',
    exportDate: Date.now()
  };
  
  return exportData;
}

export function downloadDataAsFile() {
  const data = exportAllData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `zametka_backup_${date}.json`;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

export async function importDataFromFile(file: File): Promise<boolean> {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (!event.target || typeof event.target.result !== 'string') {
            reject(new Error('Ошибка чтения файла'));
            return;
          }
          
          const data: ExportData = JSON.parse(event.target.result);
          
          // Проверяем формат данных
          if (!data.transactions || !data.notes || !data.settings || !data.version) {
            reject(new Error('Некорректный формат файла'));
            return;
          }
          
          // Сохраняем данные в localStorage
          localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data.transactions));
          localStorage.setItem(NOTES_KEY, JSON.stringify(data.notes));
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
          
          resolve(true);
        } catch (error) {
          console.error('Ошибка при импорте данных:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Ошибка чтения файла'));
      };
      
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Ошибка при импорте данных:', error);
    return false;
  }
}

// Вспомогательные функции
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Сегодня';
  } else if (diffInDays === 1) {
    return 'Вчера';
  } else if (diffInDays < 7) {
    return `${diffInDays} дн. назад`;
  } else {
    return date.toLocaleDateString('ru-RU');
  }
}

export function calculateBalance(transactions: Transaction[]): { balance: number; income: number; expense: number } {
  return transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += transaction.amount;
        acc.balance += transaction.amount;
      } else {
        acc.expense += transaction.amount;
        acc.balance -= transaction.amount;
      }
      return acc;
    },
    { balance: 0, income: 0, expense: 0 }
  );
}

// Функции для работы с графиками
export function getMonthlyData(transactions: Transaction[], months = 6): { month: string; income: number; expense: number }[] {
  const now = new Date();
  const result = [];
  
  // Создаем данные за последние n месяцев
  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleString('ru-RU', { month: 'short' });
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Фильтруем транзакции за текущий месяц
    const monthTransactions = transactions.filter(transaction => {
      const txDate = new Date(transaction.createdAt);
      return txDate.getMonth() === month && txDate.getFullYear() === year;
    });
    
    // Считаем суммы доходов и расходов
    const { income, expense } = calculateBalance(monthTransactions);
    
    result.unshift({
      month: monthName,
      income,
      expense
    });
  }
  
  return result;
}

export function getCategoryData(transactions: Transaction[]): { name: string; value: number; type: 'income' | 'expense' }[] {
  const categories: Record<string, { income: number; expense: number }> = {};
  
  // Группируем транзакции по категориям
  transactions.forEach(transaction => {
    if (!categories[transaction.category]) {
      categories[transaction.category] = { income: 0, expense: 0 };
    }
    
    if (transaction.type === 'income') {
      categories[transaction.category].income += transaction.amount;
    } else {
      categories[transaction.category].expense += transaction.amount;
    }
  });
  
  // Преобразуем в формат для диаграммы
  const result: { name: string; value: number; type: 'income' | 'expense' }[] = [];
  
  Object.entries(categories).forEach(([category, data]) => {
    if (data.income > 0) {
      result.push({
        name: category,
        value: data.income,
        type: 'income'
      });
    }
    
    if (data.expense > 0) {
      result.push({
        name: category,
        value: data.expense,
        type: 'expense'
      });
    }
  });
  
  return result;
} 