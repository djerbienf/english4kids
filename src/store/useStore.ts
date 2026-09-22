import { create } from 'zustand';
import { DictionaryEntry, AppParameters } from '../types';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot, collection, writeBatch, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { DEFAULT_APP_PARAMETERS } from '../utils/parameters';
import {
  DEFAULT_COURSE_DATA,
  DEFAULT_LESSONS_LIST,
  DEFAULT_STUDENTS,
  DEFAULT_CURSUSES,
  DEFAULT_STATS,
} from "../data/mockData";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  // Log as warning rather than throwing fatal exception so the client continues seamlessly in offline/cached mode
  console.warn('Firestore offline/notice:', JSON.stringify(errInfo));
}

interface AppState {
  deletedIds: string[];
  setDeletedIds: (ids: string[]) => void;

  dictionaryWords: DictionaryEntry[];
  setDictionaryWords: (words: DictionaryEntry[]) => void;
  updateDictionary: (words: DictionaryEntry[] | DictionaryEntry) => Promise<void> | void;

  lessonsList: any[];
  setLessonsList: (data: any[] | ((prev: any[]) => any[])) => Promise<void> | void;

  courseData: any[];
  setCourseData: (data: any[]) => Promise<void> | void;
  updateLessonField: (unitId: string, lessonId: string, field: string, value: any) => Promise<void> | void;
  updateStandaloneLessonField: (lessonId: string, field: string, value: any) => Promise<void> | void;

  studentsList: any[];
  setStudentsList: (data: any[]) => Promise<void> | void;

  studentCursuses: Record<string, any[]>;
  setStudentCursuses: (data: Record<string, any[]>) => Promise<void> | void;
  addToCursus: (studentId: string, item: any) => Promise<void> | void;
  removeFromCursus: (studentId: string, itemId: string) => Promise<void> | void;

  studentStats: Record<string, any>;
  setStudentStats: (data: any) => Promise<void> | void;

  studentHistory: any[];
  setStudentHistory: (data: any) => Promise<void> | void;

  srsDecks: Record<string, any>;
  setSrsDecks: (data: any) => Promise<void> | void;

  appParameters: AppParameters;
  setAppParameters: (params: AppParameters) => Promise<void> | void;

  resetAllData: () => Promise<void> | void;
  seedDefaultData: () => Promise<void>;
  initFirebaseSync: () => void;
}

const FIREBASE_DOC_ID = 'main_lms_data';

const stripUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(stripUndefined);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] !== undefined) {
          newObj[key] = stripUndefined(obj[key]);
        }
      }
    }
    return newObj;
  }
  return obj;
};

const BATCH_LIMIT = 450;

async function trackDeletedIds(idsToDelete: string[], set: any, get: any) {
  if (!idsToDelete || idsToDelete.length === 0) return;
  const currentDeleted = get().deletedIds || [];
  const updatedDeleted = Array.from(new Set([...currentDeleted, ...idsToDelete]));
  set({ deletedIds: updatedDeleted });
  localStorage.setItem("lms_deleted_ids", JSON.stringify(updatedDeleted));

  try {
    await setDoc(
      doc(db, "app_data", FIREBASE_DOC_ID),
      { deletedIds: arrayUnion(...idsToDelete) },
      { merge: true }
    );
  } catch (error) {
    console.error("Failed to update deletedIds in Firestore:", error);
  }
}

async function syncCollectionToFirestore(
  collectionName: string,
  itemsToSet: any[],
  idsToDelete: string[],
  transformItem?: (item: any, index: number) => any
) {
  try {
    let batch = writeBatch(db);
    let count = 0;

    for (let i = 0; i < itemsToSet.length; i++) {
      const originalItem = itemsToSet[i];
      const item = transformItem ? transformItem(originalItem, i) : originalItem;
      if (!item.id) continue;
      
      const docRef = doc(db, "app_data", FIREBASE_DOC_ID, collectionName, item.id);
      batch.set(docRef, stripUndefined(item), { merge: true });
      count++;
      
      if (count >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }

    for (const id of idsToDelete) {
      if (!id) continue;
      const docRef = doc(db, "app_data", FIREBASE_DOC_ID, collectionName, id);
      batch.delete(docRef);
      count++;
      
      if (count >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    if (idsToDelete && idsToDelete.length > 0) {
      try {
        await setDoc(
          doc(db, "app_data", FIREBASE_DOC_ID),
          { deletedIds: arrayUnion(...idsToDelete) },
          { merge: true }
        );
      } catch (e) {
        console.warn("Notice writing deletedIds to Firestore:", e);
      }
    }
  } catch (error) {
    console.warn("Firestore syncCollection warning (operating in offline/cached mode):", error);
  }
}

export const useStore = create<AppState>((set, get) => ({
  deletedIds: [],
  setDeletedIds: (ids: string[]) => {
    localStorage.setItem("lms_deleted_ids", JSON.stringify(ids));
    set({ deletedIds: ids });
  },

  dictionaryWords: [],
  setDictionaryWords: (words) => {
    set({ dictionaryWords: words });
  },
  updateDictionary: async (words: any) => {
    const state = get();
    try {
      if (Array.isArray(words)) {
        console.log("updateDictionary called with", words.length, "words");
        const newIds = new Set(words.map(w => w.id));
        const oldIds = new Set(state.dictionaryWords.map(w => w.id));
        
        const addedOrUpdated = words.filter(w => !oldIds.has(w.id) || JSON.stringify(w) !== JSON.stringify(state.dictionaryWords.find(ow => ow.id === w.id)));
        const removedIds = state.dictionaryWords.filter(w => !newIds.has(w.id)).map(w => w.id);

        if (removedIds.length > 0) {
          await trackDeletedIds(removedIds, set, get);
        }

        await syncCollectionToFirestore("dictionary_words", addedOrUpdated, removedIds);
        
        // Remove dictionaryWords from the main document to free up space
        await setDoc(doc(db, "app_data", FIREBASE_DOC_ID), { dictionaryWords: [] }, { merge: true });
        
        set({ dictionaryWords: words });
      } else {
        const word = words;
        await setDoc(doc(db, "app_data", FIREBASE_DOC_ID, "dictionary_words", word.id), stripUndefined(word), { merge: true });
        const isExisting = state.dictionaryWords.some((w) => w.id === word.id);
        const updated = isExisting
          ? state.dictionaryWords.map((w) => (w.id === word.id ? word : w))
          : [word, ...state.dictionaryWords];
        set({ dictionaryWords: updated });
      }
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}/dictionary_words`);
    }
  },

  lessonsList: [],
  setLessonsList: async (data: any) => {
    const previousLessons = get().lessonsList;
    const newData = typeof data === 'function' ? data(previousLessons) : data;
    localStorage.setItem("lms_lessons_list", JSON.stringify(newData));
    set({ lessonsList: newData });

    try {
      const newIds = new Set(newData.map((l: any) => l.id));
      const removedIds = previousLessons.filter((l: any) => !newIds.has(l.id)).map((l: any) => l.id);

      if (removedIds.length > 0) {
        await trackDeletedIds(removedIds, set, get);
      }

      await syncCollectionToFirestore("lessons", newData, removedIds);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}/lessons`);
    }
  },

  courseData: [],
  setCourseData: async (data: any) => {
    const previousCourses = get().courseData;
    const newData = typeof data === 'function' ? data(previousCourses) : data;
    localStorage.setItem("lms_course_data", JSON.stringify(newData));
    set({ courseData: newData });

    try {
      const newIds = new Set(newData.map((u: any) => u.id));
      const removedIds = previousCourses.filter((u: any) => !newIds.has(u.id)).map((u: any) => u.id);

      if (removedIds.length > 0) {
        await trackDeletedIds(removedIds, set, get);
      }

      await syncCollectionToFirestore("courses", newData, removedIds, (unit, index) => ({ ...unit, order: index }));

      // Remove courseData from the main document to free up space
      await setDoc(doc(db, "app_data", FIREBASE_DOC_ID), { courseData: [] }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}/courses`);
    }
  },

  updateStandaloneLessonField: async (lessonId, field, value) => {
    const state = get();
    const updated = state.lessonsList.map((lesson) => {
      if (lesson.id === lessonId) {
        return { ...lesson, [field]: value };
      }
      return lesson;
    });
    localStorage.setItem("lms_lessons_list", JSON.stringify(updated));
    set({ lessonsList: updated });

    try {
      const updatedLesson = updated.find(l => l.id === lessonId);
      if (updatedLesson) {
        await setDoc(
          doc(db, "app_data", FIREBASE_DOC_ID, "lessons", lessonId),
          stripUndefined(updatedLesson),
          { merge: true }
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}/lessons/${lessonId}`);
    }
  },

  updateLessonField: async (unitId, lessonId, field, value) => {
    const state = get();
    const updated = state.courseData.map((unit) => {
      if (unit.id === unitId) {
        return {
          ...unit,
          lessons: unit.lessons.map((lesson: any) => {
            if (lesson.id === lessonId) {
              return { ...lesson, [field]: value };
            }
            return lesson;
          }),
        };
      }
      return unit;
    });
    localStorage.setItem("lms_course_data", JSON.stringify(updated));
    set({ courseData: updated });

    try {
      const updatedUnit = updated.find(u => u.id === unitId);
      if (updatedUnit) {
        const index = updated.findIndex(u => u.id === unitId);
        const unitWithOrder = { ...updatedUnit, order: index };
        await setDoc(
          doc(db, "app_data", FIREBASE_DOC_ID, "courses", unitId),
          stripUndefined(unitWithOrder),
          { merge: true }
        );
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}/courses/${unitId}`);
    }
  },

  studentsList: [],
  setStudentsList: async (data: any) => {
    const previousStudents = get().studentsList;
    const newData = typeof data === 'function' ? data(previousStudents) : data;
    localStorage.setItem("lms_students", JSON.stringify(newData));
    set({ studentsList: newData });

    try {
      const newIds = new Set(newData.map((s: any) => s.id));
      const removedIds = previousStudents.filter((s: any) => !newIds.has(s.id)).map((s: any) => s.id);

      if (removedIds.length > 0) {
        await trackDeletedIds(removedIds, set, get);
      }

      const batches: Promise<void>[] = [];
      let currentBatch = writeBatch(db);
      let count = 0;

      for (const student of newData) {
        currentBatch.set(doc(db, "app_data", FIREBASE_DOC_ID, "students", student.id), stripUndefined(student), { merge: true });
        count++;
        if (count >= 490) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      for (const id of removedIds) {
        currentBatch.delete(doc(db, "app_data", FIREBASE_DOC_ID, "students", id));
        count++;
        if (count >= 490) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);

      // Remove studentsList from main doc
      await setDoc(doc(db, "app_data", FIREBASE_DOC_ID), { studentsList: [] }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}/students`);
    }
  },

  studentCursuses: {},
  setStudentCursuses: async (data: any) => {
    const previousCursuses = get().studentCursuses;
    const newData = typeof data === 'function' ? data(previousCursuses) : data;
    localStorage.setItem("lms_student_cursuses", JSON.stringify(newData));
    set({ studentCursuses: newData });

    try {
      const newStudentIds = new Set(Object.keys(newData));
      const removedStudentIds = Object.keys(previousCursuses).filter(id => !newStudentIds.has(id));

      if (removedStudentIds.length > 0) {
        await trackDeletedIds(removedStudentIds, set, get);
      }

      const batches: Promise<void>[] = [];
      let currentBatch = writeBatch(db);
      let count = 0;

      for (const [studentId, cursusList] of Object.entries(newData)) {
        currentBatch.set(
          doc(db, "app_data", FIREBASE_DOC_ID, "student_cursuses", studentId),
          stripUndefined({ cursus: cursusList }),
          { merge: true }
        );
        count++;
        if (count >= 490) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      for (const id of removedStudentIds) {
        currentBatch.delete(doc(db, "app_data", FIREBASE_DOC_ID, "student_cursuses", id));
        count++;
        if (count >= 490) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);

      // Remove studentCursuses from main doc
      await setDoc(doc(db, "app_data", FIREBASE_DOC_ID), { studentCursuses: {} }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}/student_cursuses`);
    }
  },

  addToCursus: async (studentId, item) => {
    const state = get();
    const current = state.studentCursuses[studentId] || [];
    const updatedList = [
      ...current,
      {
        id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: item.type,
        title: item.title,
        status: "pending",
        lessonId: item.lessonId,
        unitId: item.unitId,
      },
    ];
    const updated = {
      ...state.studentCursuses,
      [studentId]: updatedList,
    };
    localStorage.setItem("lms_student_cursuses", JSON.stringify(updated));
    set({ studentCursuses: updated });

    try {
      await setDoc(
        doc(db, "app_data", FIREBASE_DOC_ID, "student_cursuses", studentId),
        stripUndefined({ cursus: updatedList }),
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}/student_cursuses/${studentId}`);
    }
  },

  removeFromCursus: async (studentId, itemId) => {
    const state = get();
    const current = state.studentCursuses[studentId] || [];
    const updatedList = current.filter((c: any) => c.id !== itemId);
    const updated = {
      ...state.studentCursuses,
      [studentId]: updatedList,
    };
    localStorage.setItem("lms_student_cursuses", JSON.stringify(updated));
    set({ studentCursuses: updated });

    try {
      await setDoc(
        doc(db, "app_data", FIREBASE_DOC_ID, "student_cursuses", studentId),
        stripUndefined({ cursus: updatedList }),
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}/student_cursuses/${studentId}`);
    }
  },

  studentStats: {},
  setStudentStats: async (data: any) => {
    const state = get();
    let newData = typeof data === 'function' ? data(state.studentStats) : data;
    localStorage.setItem("lms_student_stats", JSON.stringify(newData));
    set({ studentStats: newData });

    try {
      const batches: Promise<void>[] = [];
      let currentBatch = writeBatch(db);
      let count = 0;

      for (const [studentId, stats] of Object.entries(newData)) {
        currentBatch.set(
          doc(db, "app_data", FIREBASE_DOC_ID, "student_stats", studentId),
          stripUndefined(stats),
          { merge: true }
        );
        count++;
        if (count >= 490) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);

      // Remove from main doc
      await setDoc(doc(db, "app_data", FIREBASE_DOC_ID), { studentStats: {} }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}/student_stats`);
    }
  },

  appParameters: DEFAULT_APP_PARAMETERS,
  setAppParameters: async (params) => {
    localStorage.setItem("lms_machine_parameters", JSON.stringify(params));
    set({ appParameters: params });
    try {
      await setDoc(doc(db, "app_data", FIREBASE_DOC_ID), stripUndefined({ appParameters: params }), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}`);
    }
  },

  studentHistory: [],
  setStudentHistory: async (data: any) => {
    const state = get();
    let newData = typeof data === 'function' ? data(state.studentHistory) : data;
    localStorage.setItem("lms_student_history", JSON.stringify(newData));
    set({ studentHistory: newData });

    try {
      const newIds = new Set(newData.map((h: any) => h.id));
      const removedIds = state.studentHistory.filter((h: any) => !newIds.has(h.id)).map((h: any) => h.id);

      if (removedIds.length > 0) {
        await trackDeletedIds(removedIds, set, get);
      }

      const addedOrUpdated = newData.filter((h: any) => {
        const oldH = state.studentHistory.find((oh: any) => oh.id === h.id);
        return !oldH || JSON.stringify(h) !== JSON.stringify(oldH);
      });

      const batches: Promise<void>[] = [];
      let currentBatch = writeBatch(db);
      let count = 0;

      for (const event of addedOrUpdated) {
        currentBatch.set(doc(db, "app_data", FIREBASE_DOC_ID, "students_history", event.id), stripUndefined(event), { merge: true });
        count++;
        if (count >= 490) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      for (const id of removedIds) {
        currentBatch.delete(doc(db, "app_data", FIREBASE_DOC_ID, "students_history", id));
        count++;
        if (count >= 490) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);

      // Remove studentHistory from the main document to free up space
      await setDoc(doc(db, "app_data", FIREBASE_DOC_ID), { studentHistory: [] }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}/students_history`);
    }
  },

  srsDecks: {},
  setSrsDecks: async (data: any) => {
    const state = get();
    let newData = typeof data === 'function' ? data(state.srsDecks) : data;
    localStorage.setItem("lms_srs_decks", JSON.stringify(newData));
    set({ srsDecks: newData });

    try {
      const batches: Promise<void>[] = [];
      let currentBatch = writeBatch(db);
      let count = 0;

      for (const [studentId, deck] of Object.entries(newData)) {
        currentBatch.set(
          doc(db, "app_data", FIREBASE_DOC_ID, "srs_decks", studentId),
          stripUndefined({ deck }),
          { merge: true }
        );
        count++;
        if (count >= 490) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);

      // Remove from main doc
      await setDoc(doc(db, "app_data", FIREBASE_DOC_ID), { srsDecks: {} }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}/srs_decks`);
    }
  },

  resetAllData: async () => {
    localStorage.removeItem("lms_students");
    localStorage.removeItem("lms_student_cursuses");
    localStorage.removeItem("lms_student_stats");
    localStorage.removeItem("lms_course_data");
    localStorage.removeItem("lms_lessons_list");
    localStorage.removeItem("lms_dictionary_data");
    localStorage.removeItem("lms_student_history");
    localStorage.removeItem("lms_srs_decks");
    localStorage.removeItem("lms_deleted_ids");
    set({
      deletedIds: [],
      studentsList: [],
      studentCursuses: {},
      studentStats: {},
      courseData: [],
      lessonsList: [],
      dictionaryWords: [],
      studentHistory: [],
      srsDecks: {}
    });

    try {
      await setDoc(doc(db, "app_data", FIREBASE_DOC_ID), stripUndefined({
        deletedIds: [],
        studentsList: [],
        studentCursuses: {},
        studentStats: {},
        courseData: [],
        lessonsList: [],
        studentHistory: [],
        srsDecks: {}
      }), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${FIREBASE_DOC_ID}`);
    }
  },

  seedDefaultData: async () => {
    localStorage.setItem("lms_deleted_ids", JSON.stringify([]));
    localStorage.setItem("lms_students", JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem("lms_student_cursuses", JSON.stringify(DEFAULT_CURSUSES));
    localStorage.setItem("lms_student_stats", JSON.stringify(DEFAULT_STATS));
    localStorage.setItem("lms_course_data", JSON.stringify(DEFAULT_COURSE_DATA));
    localStorage.setItem("lms_lessons_list", JSON.stringify(DEFAULT_LESSONS_LIST));
    const defaultHistory = [
      {
        id: "h1",
        studentId: "s_leo",
        lessonId: "u1_l1",
        unitId: "u1",
        type: "lesson_finish",
        timestamp: "2026-07-11T10:00:00.000Z"
      },
      {
        id: "h2",
        studentId: "s_leo",
        lessonId: "u1_l2",
        unitId: "u1",
        type: "lesson_finish",
        timestamp: "2026-07-12T09:00:00.000Z"
      },
      {
        id: "h3",
        studentId: "s_sarah",
        lessonId: "u1_l1",
        unitId: "u1",
        type: "lesson_finish",
        timestamp: "2026-07-12T08:30:00.000Z"
      }
    ];
    localStorage.setItem("lms_student_history", JSON.stringify(defaultHistory));

    set({
      deletedIds: [],
      studentsList: DEFAULT_STUDENTS,
      studentCursuses: DEFAULT_CURSUSES,
      studentStats: DEFAULT_STATS,
      courseData: DEFAULT_COURSE_DATA,
      lessonsList: DEFAULT_LESSONS_LIST,
      studentHistory: defaultHistory
    });

    try {
      await setDoc(doc(db, "app_data", FIREBASE_DOC_ID), { deletedIds: [] }, { merge: true });
      await get().setCourseData(DEFAULT_COURSE_DATA);
      await get().setLessonsList(DEFAULT_LESSONS_LIST);
      await get().setStudentsList(DEFAULT_STUDENTS);
      await get().setStudentCursuses(DEFAULT_CURSUSES);
      await get().setStudentStats(DEFAULT_STATS);
      await get().setStudentHistory(defaultHistory);
    } catch (error) {
      console.error("Firestore seeding failed, local state is still set:", error);
    }
  },

  initFirebaseSync: () => {
    // Attempt local storage fallback first
    const initialDeleted = JSON.parse(localStorage.getItem("lms_deleted_ids") || "[]");
    if (initialDeleted && Array.isArray(initialDeleted)) set({ deletedIds: initialDeleted });
    const initialCourses = JSON.parse(localStorage.getItem("lms_course_data") || "null");
    if (initialCourses) set({ courseData: initialCourses });
    const initialLessons = JSON.parse(localStorage.getItem("lms_lessons_list") || "null");
    if (initialLessons) set({ lessonsList: initialLessons });
    const initialStudents = JSON.parse(localStorage.getItem("lms_students") || "null");
    if (initialStudents) set({ studentsList: initialStudents });
    const initialCursuses = JSON.parse(localStorage.getItem("lms_student_cursuses") || "null");
    if (initialCursuses) set({ studentCursuses: initialCursuses });
    const initialStats = JSON.parse(localStorage.getItem("lms_student_stats") || "null");
    if (initialStats) set({ studentStats: initialStats });
    const initialHistory = JSON.parse(localStorage.getItem("lms_student_history") || "null");
    if (initialHistory) set({ studentHistory: initialHistory });
    const initialSrs = JSON.parse(localStorage.getItem("lms_srs_decks") || "null");
    if (initialSrs) set({ srsDecks: initialSrs });
    const initialParams = JSON.parse(localStorage.getItem("lms_machine_parameters") || "null");
    if (initialParams) set({ appParameters: { ...DEFAULT_APP_PARAMETERS, ...initialParams } });

    // Listen to Firebase Realtime Subcollections
    onSnapshot(collection(db, "app_data", FIREBASE_DOC_ID, "dictionary_words"), (snapshot) => {
      const words = snapshot.docs.map(doc => doc.data() as DictionaryEntry);
      const deletedIds = get().deletedIds || [];
      const filteredWords = words.filter(w => !deletedIds.includes(w.id));
      set({ dictionaryWords: filteredWords });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `app_data/${FIREBASE_DOC_ID}/dictionary_words`);
    });

    onSnapshot(collection(db, "app_data", FIREBASE_DOC_ID, "lessons"), (snapshot) => {
      const lessons = snapshot.docs.map(doc => doc.data() as any);
      const deletedIds = get().deletedIds || [];
      const mergedLessons = lessons.filter(l => !deletedIds.includes(l.id));
      DEFAULT_LESSONS_LIST.forEach((defaultLesson) => {
        if (!mergedLessons.some(l => l.id === defaultLesson.id) && !deletedIds.includes(defaultLesson.id)) {
          mergedLessons.push(defaultLesson);
        }
      });
      set({ lessonsList: mergedLessons });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `app_data/${FIREBASE_DOC_ID}/lessons`);
    });

    onSnapshot(collection(db, "app_data", FIREBASE_DOC_ID, "courses"), (snapshot) => {
      const courses = snapshot.docs.map(doc => doc.data() as any);
      const deletedIds = get().deletedIds || [];
      const mergedCourses = courses.filter(c => !deletedIds.includes(c.id));
      DEFAULT_COURSE_DATA.forEach((defaultCourse) => {
        if (!mergedCourses.some(c => c.id === defaultCourse.id) && !deletedIds.includes(defaultCourse.id)) {
          mergedCourses.push(defaultCourse);
        }
      });
      const sortedCourses = mergedCourses.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      set({ courseData: sortedCourses });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `app_data/${FIREBASE_DOC_ID}/courses`);
    });

    onSnapshot(collection(db, "app_data", FIREBASE_DOC_ID, "students"), (snapshot) => {
      const students = snapshot.docs.map(doc => doc.data() as any);
      const deletedIds = get().deletedIds || [];
      const mergedStudents = students.filter(s => !deletedIds.includes(s.id));
      DEFAULT_STUDENTS.forEach((defaultStudent) => {
        if (!mergedStudents.some(s => s.id === defaultStudent.id) && !deletedIds.includes(defaultStudent.id)) {
          mergedStudents.push(defaultStudent);
        }
      });
      set({ studentsList: mergedStudents });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `app_data/${FIREBASE_DOC_ID}/students`);
    });

    onSnapshot(collection(db, "app_data", FIREBASE_DOC_ID, "student_cursuses"), (snapshot) => {
      const cursuses: Record<string, any[]> = {};
      const deletedIds = get().deletedIds || [];
      snapshot.docs.forEach(doc => {
        if (!deletedIds.includes(doc.id)) {
          cursuses[doc.id] = doc.data().cursus || [];
        }
      });
      for (const [studentId, defaultCursus] of Object.entries(DEFAULT_CURSUSES)) {
        if (!cursuses[studentId] && !deletedIds.includes(studentId)) {
          cursuses[studentId] = defaultCursus;
        }
      }
      set({ studentCursuses: cursuses });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `app_data/${FIREBASE_DOC_ID}/student_cursuses`);
    });

    onSnapshot(collection(db, "app_data", FIREBASE_DOC_ID, "student_stats"), (snapshot) => {
      const stats: Record<string, any> = {};
      const deletedIds = get().deletedIds || [];
      snapshot.docs.forEach(doc => {
        if (!deletedIds.includes(doc.id)) {
          stats[doc.id] = doc.data();
        }
      });
      for (const [studentId, defaultStat] of Object.entries(DEFAULT_STATS)) {
        if (!stats[studentId] && !deletedIds.includes(studentId)) {
          stats[studentId] = defaultStat;
        }
      }
      set({ studentStats: stats });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `app_data/${FIREBASE_DOC_ID}/student_stats`);
    });

    onSnapshot(collection(db, "app_data", FIREBASE_DOC_ID, "students_history"), (snapshot) => {
      const history = snapshot.docs.map(doc => doc.data() as any);
      const defaultHistory = [
        {
          id: "h1",
          studentId: "s_leo",
          lessonId: "u1_l1",
          unitId: "u1",
          type: "lesson_finish",
          timestamp: "2026-07-11T10:00:00.000Z"
        },
        {
          id: "h2",
          studentId: "s_leo",
          lessonId: "u1_l2",
          unitId: "u1",
          type: "lesson_finish",
          timestamp: "2026-07-12T09:00:00.000Z"
        },
        {
          id: "h3",
          studentId: "s_sarah",
          lessonId: "u1_l1",
          unitId: "u1",
          type: "lesson_finish",
          timestamp: "2026-07-12T08:30:00.000Z"
        }
      ];
      const deletedIds = get().deletedIds || [];
      const mergedHistory = history.filter(h => !deletedIds.includes(h.id));
      defaultHistory.forEach((defEvent) => {
        if (!mergedHistory.some(h => h.id === defEvent.id) && !deletedIds.includes(defEvent.id)) {
          mergedHistory.push(defEvent);
        }
      });
      const sortedHistory = mergedHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      set({ studentHistory: sortedHistory });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `app_data/${FIREBASE_DOC_ID}/students_history`);
    });

    onSnapshot(collection(db, "app_data", FIREBASE_DOC_ID, "srs_decks"), (snapshot) => {
      const decks: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        decks[doc.id] = data.deck || [];
      });
      if (snapshot.docs.length > 0) {
        set({ srsDecks: decks });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `app_data/${FIREBASE_DOC_ID}/srs_decks`);
    });

    // Helper helper for array checking
    function coursesLength(arr: any[]) {
      return arr ? arr.length : 0;
    }

    // Listen to legacy main doc (used for parameters + data migrations + deletedIds)
    onSnapshot(doc(db, "app_data", FIREBASE_DOC_ID), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.deletedIds && Array.isArray(data.deletedIds)) {
          set((state) => {
            const mergedDeleted = Array.from(new Set([...(state.deletedIds || []), ...data.deletedIds]));
            localStorage.setItem("lms_deleted_ids", JSON.stringify(mergedDeleted));
            return {
              deletedIds: mergedDeleted,
              lessonsList: state.lessonsList.filter((l) => !mergedDeleted.includes(l.id)),
              courseData: state.courseData.filter((c) => !mergedDeleted.includes(c.id)),
              studentsList: state.studentsList.filter((s) => !mergedDeleted.includes(s.id)),
              studentHistory: state.studentHistory.filter((h) => !mergedDeleted.includes(h.id)),
            };
          });
        }
        if (data.appParameters) {
          localStorage.setItem("lms_machine_parameters", JSON.stringify(data.appParameters));
          set({ appParameters: data.appParameters });
        }

        // Migrate legacy data if present in main document to their respective subcollections
        let migratedAny = false;
        if (data.courseData && data.courseData.length > 0) {
          console.log("Migrating legacy courseData to subcollection...");
          await get().setCourseData(data.courseData);
          migratedAny = true;
        }
        if (data.studentsList && data.studentsList.length > 0) {
          console.log("Migrating legacy studentsList to subcollection...");
          await get().setStudentsList(data.studentsList);
          migratedAny = true;
        }
        if (data.studentCursuses && Object.keys(data.studentCursuses).length > 0) {
          console.log("Migrating legacy studentCursuses to subcollection...");
          await get().setStudentCursuses(data.studentCursuses);
          migratedAny = true;
        }
        if (data.studentStats && Object.keys(data.studentStats).length > 0) {
          console.log("Migrating legacy studentStats to subcollection...");
          await get().setStudentStats(data.studentStats);
          migratedAny = true;
        }
        if (data.studentHistory && data.studentHistory.length > 0) {
          console.log("Migrating legacy studentHistory to subcollection...");
          await get().setStudentHistory(data.studentHistory);
          migratedAny = true;
        }
        if (data.srsDecks && Object.keys(data.srsDecks).length > 0) {
          console.log("Migrating legacy srsDecks to subcollection...");
          await get().setSrsDecks(data.srsDecks);
          migratedAny = true;
        }

        if (migratedAny) {
          console.log("Legacy data migration complete!");
        }
      } else {
        // If it doesn't exist yet, we can populate it with default mock data
        const initialDict = [
          { id: "1", lemma: "Morning", senses: [{ sense_id: "1_1", gloss: "The first part of the day", translation_ar: "الصباح", examples: ['Good morning, how are you?'], cefr_level: "A1" }]},
          { id: "2", lemma: "Apple", senses: [{ sense_id: "2_1", gloss: "A round fruit", translation_ar: "تفاحة", examples: ['I eat an apple every day.'], cefr_level: "A1" }]}
        ];
        await get().updateDictionary(initialDict);
        await get().seedDefaultData();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `app_data/${FIREBASE_DOC_ID}`);
    });
  }
}));
