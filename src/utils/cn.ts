import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Функция для объединения имен классов с использованием clsx и tailwind-merge
 * Позволяет корректно объединять и разрешать конфликты классов Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 