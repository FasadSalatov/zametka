"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addNote } from "@/services/storage";

export default function NewNotePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Общее"
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Сохраняем заметку
    addNote({
      title: formData.title,
      content: formData.content,
      category: formData.category
    });
    
    // Перенаправляем пользователя назад на страницу заметок
    router.push("/notes");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Новая заметка</h1>
        <Link
          href="/notes"
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
                Заголовок
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-background border border-input rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="Заголовок заметки"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Категория
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-background border border-input rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              >
                <option value="Общее">Общее</option>
                <option value="Задача">Задача</option>
                <option value="Идея">Идея</option>
                <option value="Личное">Личное</option>
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">
                Содержание
              </label>
              <textarea
                id="content"
                name="content"
                rows={8}
                required
                value={formData.content}
                onChange={handleChange}
                className="w-full bg-background border border-input rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="Текст заметки..."
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