import { SRSDeckItem } from "../types";
import { useStore } from "../store/useStore";

export interface SRSData {
  currentSession: number;
  lastActiveDate: string | null;
  cards: Record<string, SRSDeckItem>;
}

const migrateToSRSData = (oldData: any): SRSData => {
  if (!oldData) return { currentSession: 1, lastActiveDate: null, cards: {} };
  // If it's already the new format
  if (oldData.currentSession !== undefined) return oldData;
  // If it's the old Record<string, SRSDeckItem> format
  return {
    currentSession: 1,
    lastActiveDate: null,
    cards: oldData
  };
};

export const getSRSData = (studentId: string): SRSData => {
  const allDecks = useStore.getState().srsDecks;
  return migrateToSRSData(allDecks[studentId]);
};

export const saveSRSData = (studentId: string, data: SRSData) => {
  const state = useStore.getState();
  const allDecks = { ...state.srsDecks };
  allDecks[studentId] = data;
  state.setSrsDecks(allDecks);
};

export const syncSRSSession = (studentId: string): boolean => {
  const data = getSRSData(studentId);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  let updated = false;

  if (data.lastActiveDate !== today) {
    if (data.lastActiveDate !== null) {
      data.currentSession += 1;
    }
    data.lastActiveDate = today;
    updated = true;
  }

  if (updated) {
    saveSRSData(studentId, data);
  }
  return updated;
};

export const addWordsToSRS = (studentId: string, flashcards: { word: string; translation_ar: string; example: string }[]) => {
  const data = getSRSData(studentId);
  
  let added = false;
  flashcards.forEach(fc => {
    const key = fc.word.toLowerCase();
    if (!data.cards[key]) {
      data.cards[key] = {
        id: key,
        word: fc.word,
        translation_ar: fc.translation_ar,
        example: fc.example,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        nextReviewSession: data.currentSession,
        lastReviewSession: data.currentSession,
      };
      added = true;
    }
  });

  if (added) {
    saveSRSData(studentId, data);
  }
};

export const updateSRSItem = (studentId: string, wordId: string, grade: number) => {
  const data = getSRSData(studentId);
  const item = data.cards[wordId];
  if (!item) return;

  // Modifed SuperMemo-2 Algorithm (Session based)
  if (grade >= 3) {
    if (item.repetition === 0) {
      item.interval = 1;
    } else if (item.repetition === 1) {
      item.interval = 6;
    } else {
      item.interval = Math.round(item.interval * item.efactor);
    }
    item.repetition += 1;
  } else {
    item.repetition = 0;
    item.interval = 1;
  }

  item.efactor = item.efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (item.efactor < 1.3) item.efactor = 1.3;

  item.lastReviewSession = data.currentSession;
  item.nextReviewSession = data.currentSession + item.interval;

  saveSRSData(studentId, data);
};

export const getDueCards = (studentId: string): SRSDeckItem[] => {
  const data = getSRSData(studentId);
  
  return Object.values(data.cards).filter(item => {
    // Migration for legacy date-based items
    if (item.nextReviewSession === undefined) {
       item.nextReviewSession = data.currentSession;
    }
    return item.nextReviewSession <= data.currentSession;
  });
};

export const calculateRetentionRate = (studentId: string): number => {
  const data = getSRSData(studentId);
  const deck = Object.values(data.cards);
  if (deck.length === 0) return 0;
  
  const retained = deck.filter(item => item.interval > 1 || item.repetition > 0);
  return Math.round((retained.length / deck.length) * 100);
};

export const getSRSStats = (studentId: string) => {
    const data = getSRSData(studentId);
    const deck = Object.values(data.cards);
    if (deck.length === 0) return { mastery: 0, learning: 0, total: 0 };

    const mastery = deck.filter(i => i.interval > 21).length;
    const learning = deck.length - mastery;
    return { mastery, learning, total: deck.length };
};

export const deleteSRSItem = (studentId: string, wordId: string) => {
  const data = getSRSData(studentId);
  if (data.cards[wordId]) {
    delete data.cards[wordId];
    saveSRSData(studentId, data);
  }
};
