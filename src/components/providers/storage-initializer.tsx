"use client";

import React, { useEffect, useState } from "react";
import { useNotesStore } from "@/stores/notes-store";
import { useFinancesStore } from "@/stores/finances-store";
import { useDebtsStore } from "@/stores/debts-store";
import { useSettingsStore } from "@/stores/settings-store";
import { STORAGE_KEYS } from "@/utils/cloudStorage";

export function StorageInitializer() {
  const { notes, setNotes } = useNotesStore();
  const { transactions, setTransactions } = useFinancesStore();
  const { debts, setDebts } = useDebtsStore();
  const { settings, setSettings } = useSettingsStore();
  const [initialized, setInitialized] = useState(false);

  // Принудительная загрузка данных из localStorage немедленно
  useEffect(() => {
    // Функция для немедленной инициализации данных
    const initializeData = () => {
      try {
        console.log("Ручная инициализация хранилищ данных...");
        
        if (typeof window === "undefined") return;
        
        // Вывод всех ключей в localStorage
        const allKeys = Object.keys(localStorage);
        console.log("Все ключи в localStorage:", allKeys);
        
        // Проверяем ключи с заметками
        const notesKey = "zametka_notes";
        if (allKeys.includes(notesKey)) {
          try {
            const notesData = localStorage.getItem(notesKey);
            console.log(`Данные из ${notesKey}:`, notesData);
            
            if (notesData) {
              const parsedNotes = JSON.parse(notesData);
              console.log(`Разобранные заметки:`, parsedNotes);
              
              if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
                console.log(`Загружаем ${parsedNotes.length} заметок в Zustand...`);
                setNotes(parsedNotes);
                localStorage.setItem("notes", notesData);
              }
            }
          } catch (e) {
            console.error(`Ошибка при загрузке заметок из ${notesKey}:`, e);
          }
        }
        
        // Проверяем ключи с финансами
        const financesKey = "zametka_finances";
        if (allKeys.includes(financesKey)) {
          try {
            const financesData = localStorage.getItem(financesKey);
            console.log(`Данные из ${financesKey}:`, financesData);
            
            if (financesData) {
              const parsedFinances = JSON.parse(financesData);
              console.log(`Разобранные финансы:`, parsedFinances);
              
              if (Array.isArray(parsedFinances) && parsedFinances.length > 0) {
                console.log(`Загружаем ${parsedFinances.length} финансов в Zustand...`);
                setTransactions(parsedFinances);
                localStorage.setItem("finances", financesData);
              }
            }
          } catch (e) {
            console.error(`Ошибка при загрузке финансов из ${financesKey}:`, e);
          }
        }
        
        // Дополнительная проверка для других возможных ключей финансов
        const alternativeFinancesKeys = ["finances", "zametka-finances", "transactions", "zametka_transactions"];
        for (const key of alternativeFinancesKeys) {
          if (allKeys.includes(key) && !allKeys.includes(financesKey)) {
            try {
              const financesData = localStorage.getItem(key);
              console.log(`Данные из альтернативного ключа ${key}:`, financesData);
              
              if (financesData) {
                const parsedFinances = JSON.parse(financesData);
                console.log(`Разобранные финансы из альтернативного ключа:`, parsedFinances);
                
                if (Array.isArray(parsedFinances) && parsedFinances.length > 0) {
                  console.log(`Загружаем ${parsedFinances.length} финансов из ключа ${key} в Zustand...`);
                  setTransactions(parsedFinances);
                  localStorage.setItem("finances", financesData);
                  localStorage.setItem("zametka_finances", financesData);
                  break;
                }
              }
            } catch (e) {
              console.error(`Ошибка при загрузке финансов из альтернативного ключа ${key}:`, e);
            }
          }
        }
        
        // Проверяем ключи с долгами
        const debtsKey = "zametka_debts";
        if (allKeys.includes(debtsKey)) {
          try {
            const debtsData = localStorage.getItem(debtsKey);
            console.log(`Данные из ${debtsKey}:`, debtsData);
            
            if (debtsData) {
              const parsedDebts = JSON.parse(debtsData);
              console.log(`Разобранные долги:`, parsedDebts);
              
              if (Array.isArray(parsedDebts) && parsedDebts.length > 0) {
                console.log(`Загружаем ${parsedDebts.length} долгов в Zustand...`);
                setDebts(parsedDebts);
                localStorage.setItem("debts", debtsData);
              }
            }
          } catch (e) {
            console.error(`Ошибка при загрузке долгов из ${debtsKey}:`, e);
          }
        }
        
        setInitialized(true);
      } catch (error) {
        console.error("Ошибка при ручной инициализации:", error);
      }
    };

    // Выполняем инициализацию немедленно
    if (!initialized) {
      console.log("Запуск принудительной инициализации");
      initializeData();
    }
  }, [initialized, setNotes, setTransactions, setDebts, setSettings]);

  // Логируем текущее состояние хранилищ после инициализации
  useEffect(() => {
    if (initialized) {
      console.log("Состояние хранилищ после инициализации:", {
        notes: notes.length > 0 ? `${notes.length} заметок` : "Нет заметок",
        transactions: transactions.length > 0 ? `${transactions.length} транзакций` : "Нет транзакций",
        debts: debts.length > 0 ? `${debts.length} долгов` : "Нет долгов",
        settings: settings ? "Настройки загружены" : "Нет настроек"
      });
      
      // Если после инициализации данные все еще не загружены, 
      // но есть в localStorage, принудительно загружаем их снова
      if (notes.length === 0) {
        const notesData = localStorage.getItem("zametka_notes");
        if (notesData) {
          try {
            const parsedNotes = JSON.parse(notesData);
            if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
              console.log("ПРИНУДИТЕЛЬНАЯ загрузка заметок из localStorage");
              setNotes(parsedNotes);
              
              // Обновляем Zustand storage вручную
              localStorage.setItem("notes", notesData);
            }
          } catch (e) {
            console.error("Ошибка при разборе заметок:", e);
          }
        }
      }
      
      // Проверка финансов после инициализации
      if (transactions.length === 0) {
        // Проверяем все возможные ключи для финансов
        const possibleKeys = ["zametka_finances", "finances", "zametka-finances", "transactions", "zametka_transactions"];
        for (const key of possibleKeys) {
          const financeData = localStorage.getItem(key);
          if (financeData) {
            try {
              const parsedFinances = JSON.parse(financeData);
              if (Array.isArray(parsedFinances) && parsedFinances.length > 0) {
                console.log(`ПРИНУДИТЕЛЬНАЯ загрузка финансов из ключа ${key}`);
                setTransactions(parsedFinances);
                
                // Обновляем Zustand storage вручную
                localStorage.setItem("finances", financeData);
                localStorage.setItem("zametka_finances", financeData);
                break;
              }
            } catch (e) {
              console.error(`Ошибка при разборе финансов из ключа ${key}:`, e);
            }
          }
        }
      }
    }
  }, [initialized, notes, transactions, debts, settings, setNotes]);

  return (
    <div style={{ display: 'none' }}>
      {initialized ? "Данные инициализированы" : "Инициализация хранилищ..."}
    </div>
  );
}

export default StorageInitializer; 