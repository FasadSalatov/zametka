import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note } from '@/app/notes/types';

interface NotesState {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updatedNote: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      setNotes: (notes) => set({ notes }),
      addNote: (note) => set((state) => ({ 
        notes: [...state.notes, note] 
      })),
      updateNote: (id, updatedNote) => set((state) => ({ 
        notes: state.notes.map((note) => 
          note.id === id ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() } : note
        ) 
      })),
      deleteNote: (id) => set((state) => ({ 
        notes: state.notes.filter((note) => note.id !== id) 
      })),
    }),
    { name: 'notes' }
  )
); 