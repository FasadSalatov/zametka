"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Note, getNotes, deleteNote } from "@/services/storage";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(6);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Анимируем загрузку
    setIsLoading(true);
    
    // Имитация задержки загрузки для анимации
    setTimeout(() => {
      const loadedNotes = getNotes();
      setNotes(loadedNotes);
      setFilteredNotes(loadedNotes);
      setIsLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    let result = notes;

    // Применяем фильтр категории
    if (categoryFilter !== "all") {
      result = result.filter((note) => note.category === categoryFilter);
    }

    // Применяем поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    setFilteredNotes(result);
  }, [searchQuery, categoryFilter, notes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const handleDeleteNote = (id: string) => {
    // Если уже показываем подтверждение для этой заметки, удаляем её
    if (showDeleteConfirmation === id) {
      deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
      setShowDeleteConfirmation(null);
    } else {
      // Иначе показываем подтверждение
      setShowDeleteConfirmation(id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(null);
  };

  const handleShowMore = () => {
    setDisplayCount(displayCount + 6);
  };

  // Получение уникальных категорий
  const categories = ["all", ...Array.from(new Set(notes.map((note) => note.category)))];

  // Форматирование даты
  const formatDate = (dateString: string | number): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gradient fire-text">Заметки</h1>
        <Link
          href="/notes/new"
          className="btn-neon rounded-all px-4 py-2 text-sm font-medium shadow-sm transition-colors hover-lift flex items-center gap-2 action-button action-button-primary justify-center md:justify-start"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Новая заметка
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fadeInScale">
        <div className="input-fancy">
          <div className="relative">
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
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary opacity-70"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Поиск заметок..."
              className="w-full pl-10 pr-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 font-medium text-shadow rounded-all"
            />
          </div>
        </div>

        <div className="input-fancy">
          <div className="relative">
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
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary opacity-70"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <select
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="w-full pl-10 pr-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 appearance-none cursor-pointer font-medium text-shadow rounded-all"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "Все категории" : category}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
                className="text-primary"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 shimmer rounded-all" style={{height: '180px', animationDelay: `${i * 0.1}s`}}></div>
          ))}
        </div>
      ) : (
        <>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 animate-fadeInScale">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-all bg-primary/10 mb-4 animate-float">
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
                  className="text-primary animate-pulse"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 12h8"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2 text-gradient">Заметок не найдено</h3>
              <p className="text-foreground opacity-70 mb-6">
                {searchQuery
                  ? "Попробуйте изменить параметры поиска."
                  : categoryFilter !== "all"
                  ? "В выбранной категории нет заметок."
                  : "Создайте свою первую заметку прямо сейчас!"}
              </p>
              <Link href="/notes/new" className="btn-neon rounded-all px-4 py-2 text-sm font-medium hover-lift">
                Создать заметку
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.slice(0, displayCount).map((note, index) => (
                  <div 
                    key={note.id} 
                    className="card-premium p-5 hover:border-primary border-opacity-50 transition-colors animate-fadeInScale" 
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 rounded-all bg-primary/20 text-xs font-medium text-shadow">
                        {note.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {showDeleteConfirmation === note.id ? (
                          <>
                            <button 
                              onClick={() => handleDeleteNote(note.id)}
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
                          </>
                        ) : (
                          <button 
                            onClick={() => handleDeleteNote(note.id)}
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
                    <h3 className="text-xl font-semibold mb-2 truncate text-gradient">{note.title}</h3>
                    <div className="text-foreground opacity-70 mb-4 line-clamp-3">{note.content}</div>
                    <div className="flex justify-between items-center text-xs text-foreground opacity-60 border-t border-border pt-3">
                      <span className="font-medium">{formatDate(note.createdAt)}</span>
                      <Link
                        href={`/notes/${note.id}`}
                        className="inline-flex items-center text-primary hover:underline hover-lift group font-medium"
                      >
                        Подробнее
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
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
                  </div>
                ))}
              </div>

              {filteredNotes.length > displayCount && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleShowMore}
                    className="btn-neon rounded-all px-5 py-2 text-sm font-medium shadow-sm transition-colors hover-lift animate-pulse"
                  >
                    Показать ещё
                  </button>
                </div>
              )}

              <div className="text-sm text-foreground opacity-70 text-center mt-8 animate-fadeIn">
                Показано {Math.min(displayCount, filteredNotes.length)} из {filteredNotes.length} заметок
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
} 