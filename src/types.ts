export interface DictionarySense {
  sense_id: string;
  cefr_level?: string;
  difficulty?: number;
  gloss: string;
  translation_ar: string;
  category?: string;
  examples: string[];
  assets?: {
    image?: string;
    audio?: {
      us?: string;
      uk?: string;
    };
  };
  relations?: {
    synonyms?: string[];
    antonyms?: string[];
  };
}

export interface DictionaryEntry {
  id: string;
  lemma: string;
  part_of_speech?: string;
  inflections?: Record<string, string>;
  is_phrasal_verb?: boolean;
  is_idiom?: boolean;
  senses: DictionarySense[];
  system?: {
    dictionary_version?: string;
    created_at?: string;
    updated_at?: string;
  };
  // To keep backward compatibility with previous structure
  word?: string;
  translation?: string;
  definition?: string;
}

export type Role = "student" | "teacher" | null;

export type ActivityType =
  | "video"
  | "flashcard"
  | "cloze"
  | "reading"
  | "matching"
  | "dictation"
  | "grammar"
  | "conjugation"
  | "writing";

export interface BaseActivityConfig {
  id: string;
  type: ActivityType;
}

export interface VideoConfig extends BaseActivityConfig {
  type: "video";
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  description?: string;
  videoStart?: number | string;
  videoEnd?: number | string;
}

export interface FlashcardConfig extends BaseActivityConfig {
  type: "flashcard";
  word: string;
  translation_ar: string;
  example: string;
  showPhonetics?: boolean;
}

export interface ClozeConfig extends BaseActivityConfig {
  type: "cloze";
  sentenceBeforeGap: string;
  sentenceAfterGap: string;
  correctAnswer: string;
  distractors: string[];
}

export interface ReadingVocabulary {
  word: string;
  translation: string;
  definition?: string;
}

export interface ReadingCloze {
  sentenceBefore: string;
  sentenceAfter: string;
  correct: string;
  distractors: string[];
}

export interface ReadingSlideConfig {
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  unscrambleText?: string;
  unscrambleTexts?: string[];
  clozeSentenceBefore?: string;
  clozeSentenceAfter?: string;
  clozeCorrect?: string;
  clozeDistractors?: string[];
  clozes?: ReadingCloze[];
  vocabulary?: ReadingVocabulary[];
}

export interface ReadingConfig extends BaseActivityConfig {
  type: "reading";
  readingType: "text" | "dialogue" | "story";
  slides: string[]; // backward compat? No need if mapped in App.tsx
  readingTitle?: string;
  readingSlides: ReadingSlideConfig[];
}

export type ActivityConfig =
  | VideoConfig
  | FlashcardConfig
  | ClozeConfig
  | ReadingConfig; // Extend this as more are added

export interface Lesson {
  id: string;
  title: string;
  xpReward: number;
  activities: ActivityConfig[];
}

// System types
export interface StudentStats {
  xp: number;
  streak: number;
  dailyGoalProgress: number;
  dailyGoalTotal: number;
}
