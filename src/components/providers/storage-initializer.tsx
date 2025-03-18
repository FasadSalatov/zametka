"use client";

import React, { useEffect } from "react";
import { useNotesStore } from "@/stores/notes-store";
import { useFinancesStore } from "@/stores/finances-store";
import { useDebtsStore } from "@/stores/debts-store";
import { useSettingsStore } from "@/stores/settings-store";

export function StorageInitializer() {
  const { notes, setNotes } = useNotesStore();
  const { transactions, setTransactions } = useFinancesStore();
  const { debts, setDebts } = useDebtsStore();
  const { settings, setSettings } = useSettingsStore();

  useEffect(() => {
    console.log("Инициализация хранилищ данных...");

    // Проверяем, есть ли уже данные в хранилищах
    console.log("Текущие данные в хранилищах:", {
      notes: notes.length,
      transactions: transactions.length,
      debts: debts.length,
      settings: settings ? Object.keys(settings).length : 0,
    });

    // Если хранилища пусты, пробуем загрузить данные из localStorage
    if (typeof window !== "undefined") {
      try {
        if (notes.length === 0) {
          const savedNotes = localStorage.getItem("notes");
          if (savedNotes) {
            console.log("Загружаем заметки из localStorage...");
            const parsedNotes = JSON.parse(savedNotes);
            if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
              console.log(`Найдено ${parsedNotes.length} заметок`);
              setNotes(parsedNotes);
            }
          }
        }

        if (transactions.length === 0) {
          const savedTransactions = localStorage.getItem("finances");
          if (savedTransactions) {
            console.log("Загружаем финансы из localStorage...");
            const parsedTransactions = JSON.parse(savedTransactions);
            if (Array.isArray(parsedTransactions) && parsedTransactions.length > 0) {
              console.log(`Найдено ${parsedTransactions.length} финансовых записей`);
              setTransactions(parsedTransactions);
            }
          }
        }

        if (debts.length === 0) {
          const savedDebts = localStorage.getItem("debts");
          if (savedDebts) {
            console.log("Загружаем долги из localStorage...");
            const parsedDebts = JSON.parse(savedDebts);
            if (Array.isArray(parsedDebts) && parsedDebts.length > 0) {
              console.log(`Найдено ${parsedDebts.length} долгов`);
              setDebts(parsedDebts);
            }
          }
        }

        if (!settings || Object.keys(settings).length === 0) {
          const savedSettings = localStorage.getItem("settings");
          if (savedSettings) {
            console.log("Загружаем настройки из localStorage...");
            const parsedSettings = JSON.parse(savedSettings);
            if (parsedSettings && typeof parsedSettings === "object") {
              console.log("Настройки загружены");
              setSettings(parsedSettings);
            }
          }
        }

        // Проверяем, что данные загрузились
        setTimeout(() => {
          console.log("Данные после инициализации:", {
            notes: useNotesStore.getState().notes.length,
            transactions: useFinancesStore.getState().transactions.length,
            debts: useDebtsStore.getState().debts.length,
            settings: useSettingsStore.getState().settings ? Object.keys(useSettingsStore.getState().settings).length : 0,
          });
        }, 500);
      } catch (error) {
        console.error("Ошибка при загрузке данных из localStorage:", error);
      }
    }
  }, [notes.length, transactions.length, debts.length, settings, setNotes, setTransactions, setDebts, setSettings]);

  return null;
}

export default StorageInitializer; 