export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO дата
  updatedAt: string; // ISO дата
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  color?: string;
} 