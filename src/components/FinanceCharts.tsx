"use client";

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Transaction, getMonthlyData, getCategoryData } from '@/services/storage';

interface FinanceChartsProps {
  transactions: Transaction[];
}

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063', '#52BE80', '#5499C7'];
const EXPENSE_COLORS = ['#FF8042', '#EC7063', '#E74C3C', '#C0392B', '#D35400'];
const INCOME_COLORS = ['#00C49F', '#52BE80', '#27AE60', '#2ECC71', '#1ABC9C'];

export default function FinanceCharts({ transactions }: FinanceChartsProps) {
  const [chartType, setChartType] = useState<'monthly' | 'category'>('monthly');
  
  if (transactions.length === 0) {
    return (
      <div className="card p-6 glass">
        <div className="text-center p-10">
          <h3 className="text-xl font-medium mb-2">Нет данных для графика</h3>
          <p className="text-sm opacity-70">Добавьте транзакции, чтобы увидеть статистику</p>
        </div>
      </div>
    );
  }
  
  const monthlyData = getMonthlyData(transactions);
  const categoryData = getCategoryData(transactions);
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };
  
  return (
    <div className="card p-6 glass hover-lift">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gradient">Финансовая статистика</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('monthly')}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              chartType === 'monthly'
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-200 dark:bg-gray-700 text-foreground'
            }`}
          >
            По месяцам
          </button>
          <button
            onClick={() => setChartType('category')}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              chartType === 'category' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-200 dark:bg-gray-700 text-foreground'
            }`}
          >
            По категориям
          </button>
        </div>
      </div>
      
      <div className="h-[300px]">
        {chartType === 'monthly' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${formatNumber(value)} ₽`, '']} 
                labelFormatter={(label) => `Месяц: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar name="Доходы" dataKey="income" fill="#52BE80" radius={[4, 4, 0, 0]} />
              <Bar name="Расходы" dataKey="expense" fill="#EC7063" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div>
              <h3 className="text-sm font-medium mb-2 text-center">Расходы по категориям</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData.filter(d => d.type === 'expense')}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => 
                      percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                    }
                  >
                    {categoryData
                      .filter(d => d.type === 'expense')
                      .map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} 
                        />
                      ))
                    }
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${formatNumber(value)} ₽`, '']}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 text-center">Доходы по категориям</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData.filter(d => d.type === 'income')}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => 
                      percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                    }
                  >
                    {categoryData
                      .filter(d => d.type === 'income')
                      .map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={INCOME_COLORS[index % INCOME_COLORS.length]} 
                        />
                      ))
                    }
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${formatNumber(value)} ₽`, '']}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 