"use client";

import React, { useEffect } from "react";
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
        // Проверка локального хранилища
        const localStorageKeys = Object.keys(localStorage);
        console.log("Ключи в localStorage:", localStorageKeys);
        
        // Загрузка заметок
        if (notes.length === 0) {
          // Пробуем стандартные ключи
          const savedNotes = localStorage.getItem("notes");
          // Пробуем ключи из CloudStorage
          const savedZametkaNotesString = localStorage.getItem(STORAGE_KEYS.NOTES);
          // Также проверяем прямо ключ zametka_notes
          const savedZametkaNotesDirectString = localStorage.getItem("zametka_notes");
          
          let parsedNotes = null;
          
          if (savedNotes) {
            console.log("Загружаем заметки из localStorage (ключ notes)...");
            try {
              parsedNotes = JSON.parse(savedNotes);
            } catch (e) {
              console.error("Ошибка при разборе заметок из notes:", e);
            }
          } else if (savedZametkaNotesString) {
            console.log(`Загружаем заметки из localStorage (ключ ${STORAGE_KEYS.NOTES})...`);
            try {
              parsedNotes = JSON.parse(savedZametkaNotesString);
            } catch (e) {
              console.error(`Ошибка при разборе заметок из ${STORAGE_KEYS.NOTES}:`, e);
            }
          } else if (savedZametkaNotesDirectString) {
            console.log("Загружаем заметки из localStorage (ключ zametka_notes)...");
            try {
              parsedNotes = JSON.parse(savedZametkaNotesDirectString);
            } catch (e) {
              console.error("Ошибка при разборе заметок из zametka_notes:", e);
            }
          }
          
          if (parsedNotes && Array.isArray(parsedNotes) && parsedNotes.length > 0) {
            console.log(`Найдено ${parsedNotes.length} заметок`);
            setNotes(parsedNotes);
            
            // Сохраняем в обоих ключах для совместимости
            localStorage.setItem("notes", JSON.stringify(parsedNotes));
            localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(parsedNotes));
          }
        }

        // Загрузка финансов
        if (transactions.length === 0) {
          const savedTransactions = localStorage.getItem("finances");
          const savedZametkaFinances = localStorage.getItem(STORAGE_KEYS.FINANCES);
          const savedZametkaFinancesDirect = localStorage.getItem("zametka_finances");
          
          let parsedTransactions = null;
          
          if (savedTransactions) {
            console.log("Загружаем финансы из localStorage (ключ finances)...");
            try {
              parsedTransactions = JSON.parse(savedTransactions);
            } catch (e) {
              console.error("Ошибка при разборе финансов из finances:", e);
            }
          } else if (savedZametkaFinances) {
            console.log(`Загружаем финансы из localStorage (ключ ${STORAGE_KEYS.FINANCES})...`);
            try {
              parsedTransactions = JSON.parse(savedZametkaFinances);
            } catch (e) {
              console.error(`Ошибка при разборе финансов из ${STORAGE_KEYS.FINANCES}:`, e);
            }
          } else if (savedZametkaFinancesDirect) {
            console.log("Загружаем финансы из localStorage (ключ zametka_finances)...");
            try {
              parsedTransactions = JSON.parse(savedZametkaFinancesDirect);
            } catch (e) {
              console.error("Ошибка при разборе финансов из zametka_finances:", e);
            }
          }
          
          if (parsedTransactions && Array.isArray(parsedTransactions) && parsedTransactions.length > 0) {
            console.log(`Найдено ${parsedTransactions.length} финансовых записей`);
            setTransactions(parsedTransactions);
            
            // Сохраняем в обоих ключах для совместимости
            localStorage.setItem("finances", JSON.stringify(parsedTransactions));
            localStorage.setItem(STORAGE_KEYS.FINANCES, JSON.stringify(parsedTransactions));
          }
        }

        // Загрузка долгов
        if (debts.length === 0) {
          const savedDebts = localStorage.getItem("debts");
          const savedZametkaDebts = localStorage.getItem(STORAGE_KEYS.DEBTS);
          const savedZametkaDebtsDirect = localStorage.getItem("zametka_debts");
          
          let parsedDebts = null;
          
          if (savedDebts) {
            console.log("Загружаем долги из localStorage (ключ debts)...");
            try {
              parsedDebts = JSON.parse(savedDebts);
            } catch (e) {
              console.error("Ошибка при разборе долгов из debts:", e);
            }
          } else if (savedZametkaDebts) {
            console.log(`Загружаем долги из localStorage (ключ ${STORAGE_KEYS.DEBTS})...`);
            try {
              parsedDebts = JSON.parse(savedZametkaDebts);
            } catch (e) {
              console.error(`Ошибка при разборе долгов из ${STORAGE_KEYS.DEBTS}:`, e);
            }
          } else if (savedZametkaDebtsDirect) {
            console.log("Загружаем долги из localStorage (ключ zametka_debts)...");
            try {
              parsedDebts = JSON.parse(savedZametkaDebtsDirect);
            } catch (e) {
              console.error("Ошибка при разборе долгов из zametka_debts:", e);
            }
          }
          
          if (parsedDebts && Array.isArray(parsedDebts) && parsedDebts.length > 0) {
            console.log(`Найдено ${parsedDebts.length} долгов`);
            setDebts(parsedDebts);
            
            // Сохраняем в обоих ключах для совместимости
            localStorage.setItem("debts", JSON.stringify(parsedDebts));
            localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(parsedDebts));
          }
        }

        // Загрузка настроек
        if (!settings || Object.keys(settings).length === 0) {
          const savedSettings = localStorage.getItem("settings");
          const savedZametkaSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
          const savedZametkaSettingsDirect = localStorage.getItem("zametka_settings");
          
          let parsedSettings = null;
          
          if (savedSettings) {
            console.log("Загружаем настройки из localStorage (ключ settings)...");
            try {
              parsedSettings = JSON.parse(savedSettings);
            } catch (e) {
              console.error("Ошибка при разборе настроек из settings:", e);
            }
          } else if (savedZametkaSettings) {
            console.log(`Загружаем настройки из localStorage (ключ ${STORAGE_KEYS.SETTINGS})...`);
            try {
              parsedSettings = JSON.parse(savedZametkaSettings);
            } catch (e) {
              console.error(`Ошибка при разборе настроек из ${STORAGE_KEYS.SETTINGS}:`, e);
            }
          } else if (savedZametkaSettingsDirect) {
            console.log("Загружаем настройки из localStorage (ключ zametka_settings)...");
            try {
              parsedSettings = JSON.parse(savedZametkaSettingsDirect);
            } catch (e) {
              console.error("Ошибка при разборе настроек из zametka_settings:", e);
            }
          }
          
          if (parsedSettings && typeof parsedSettings === "object") {
            console.log("Настройки загружены");
            setSettings(parsedSettings);
            
            // Сохраняем в обоих ключах для совместимости
            localStorage.setItem("settings", JSON.stringify(parsedSettings));
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsedSettings));
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