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
  forms?: string[];
  is_phrasal_verb?: boolean;
  is_idiom?: boolean;
  senses: DictionarySense[];
  pronunciation_uk?: string;
  pronunciation_us?: string;
  syllables?: string;
  system?: {
    dictionary_version?: string;
    created_at?: string;
    updated_at?: string;
  };
  // To keep backward compatibility with previous structure
  word?: string;
  translation?: string;
  definition?: string;
  example?: string;
}
export type Role = "student" | "teacher" | null;
export type ActivityType =
  | "video"
  | "flashcard"
  | "flashcard-sm2"
  | "cloze"
  | "reading"
  | "matching"
  | "dictation"
  | "grammar"
  | "conjugation"
  | "writing"
  | "listening"
  | "listen_and_repeat"
  | "multiple_choice";
export interface BaseActivityConfig {
  id: string;
  type: ActivityType;
  audioUrl?: string;
  imageUrl?: string;
}
export interface VideoConfig extends BaseActivityConfig {
  type: "video";
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  description?: string;
  videoStart?: number | string;
  videoEnd?: number | string;
  videoPreventSkipping?: boolean;
  videoShowSubtitles?: boolean;
  videoShowTranscript?: boolean;
  videoAllowSpeedControl?: boolean;
  videoMaxReplays?: number | string;
}
export interface FlashcardConfig extends BaseActivityConfig {
  type: "flashcard";
  word: string;
  translation_ar: string;
  example: string;
  part_of_speech?: string;
  dictionaryExamples?: string[];
  // Teacher configuration parameters
  flashcardTolerance?: string;
  flashcardUseHints?: boolean;
  flashcardHintLength?: boolean;
  flashcardHintFirstLetter?: boolean;
  flashcardHintWholeWord?: boolean;
  flashcardHintPenalty?: string;
  flashcardShowImage?: boolean;
  flashcardShowWord?: boolean;
  flashcardShowPhonetics?: boolean;
  flashcardShowAudio?: boolean;
  flashcardFeedback?: string;
  flashcardUseTimer?: boolean;
  flashcardTimerSeconds?: number;
  flashcardReward?: string;
  flashcardPassingScore?: number;
  flashcardAttemptsMode?: string;
  flashcardMaxAttempts?: number;
}
export interface FlashcardSm2Config extends Omit<FlashcardConfig, 'type'> {
  type: "flashcard-sm2";
}
export interface ClozeConfig extends BaseActivityConfig {
  type: "cloze";
  sentenceBeforeGap: string;
  sentenceAfterGap: string;
  correctAnswer: string;
  distractors: string[];
  clozeTolerance?: string;
  clozeShowChoices?: boolean;
  clozeFullText?: string;
  clozeGapIndices?: number[];
}
export interface DictationSlideConfig {
  audioUrl: string;
  correctText: string;
  translation?: string;
}
export interface DictationConfig extends BaseActivityConfig {
  type: "dictation";
  dictationSlides: DictationSlideConfig[];
  dictationTolerance?: string; // e.g. "Stricte", "Normale", "Souple"
  dictationShowTranslation?: boolean;
}
export interface MatchingPair {
  id: string; // Add ID for stable rendering/matching
  left: string;
  right: string;
  imageUrl?: string;
  audioUrl?: string;
}
export interface MatchingConfig extends BaseActivityConfig {
  type: "matching";
  pairs: MatchingPair[];
}
export interface ListeningQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}
export interface ListeningConfig extends BaseActivityConfig {
  type: "listening";
  title?: string;
  audioUrl: string;
  transcript?: string;
  questions: ListeningQuestion[];
}
export interface ReadingVocabulary {
  word: string;
  translation: string;
  definition?: string;
  example?: string;
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
  readingTapForTranslation?: boolean;
  readingAutoPlayAudio?: boolean;
}
// Settings for the "Machine Room" (Global Configurations)
export interface AppParameters {
  // Flashcards & Grammar Flashcards
  flashcardTolerance: string; // "Stricte" | "Normale" | "Souple"
  flashcardAttemptsMode: string; // "infinite" | "limited"
  flashcardMaxAttempts: number;
  flashcardUseHints: boolean;
  // Video (Watching)
  videoPreventSkipping: boolean;
  videoShowSubtitles: boolean;
  videoShowTranscript: boolean;
  videoAllowSpeedControl: boolean;
  videoMaxReplays: number | string; // e.g. 1, 3, "unlimited"
  // Reading
  readingTapForTranslation: boolean;
  readingAutoPlayAudio: boolean;
  // Cloze
  clozeTolerance: string;
  clozeShowChoices: boolean;
  // Dictation
  dictationTolerance: string;
  dictationShowTranslation: boolean;
  // Timers
  flashcardWriteTimerDuration: number;
}
export interface ListenAndRepeatItem {
  id: string;
  word: string;
  syllables?: string;
  pronunciation?: string;
  audioUrl?: string;
}
export interface ListenAndRepeatConfig extends BaseActivityConfig {
  type: "listen_and_repeat";
  title?: string;
  items: ListenAndRepeatItem[];
}
export interface MultipleChoiceConfig extends BaseActivityConfig {
  type: "multiple_choice";
  question: string;
  options: string[];
  correctAnswer: string;
}
export interface WritingConfig extends BaseActivityConfig {
  type: "writing";
  writingTitle?: string;
  writingPrompt: string;
  writingInstructions?: string;
  writingStarterText?: string;
  minWords?: number;
  maxWords?: number;
  requiredKeywords?: string[];
  sampleAnswer?: string;
  evaluationCriteria?: string[];
  allowAiFeedback?: boolean;
}
export type ActivityConfig =
  | VideoConfig
  | FlashcardConfig
  | FlashcardSm2Config
  | ClozeConfig
  | ReadingConfig
  | DictationConfig
  | MatchingConfig
  | ListeningConfig
  | ListenAndRepeatConfig
  | MultipleChoiceConfig
  | WritingConfig;
export interface LessonObjective {
  id: string;
  category: string;
  level: string;
  text: string;
  isCustom?: boolean;
  subCategory?: string;
  cognitiveAction?: string;
}

export interface Lesson {
  id: string;
  title: string;
  xpReward: number;
  activities: ActivityConfig[];
  status?: "Draft" | "Published" | "Archived";
  desc?: string;
  objectives?: LessonObjective[];
  isTest?: boolean;
}
// System types
export interface StudentStats {
  xp: number;
  streak: number;
  dailyGoalProgress: number;
  dailyGoalTotal: number;
}
export interface SRSDeckItem {
  id: string; // usually the word
  word: string;
  translation_ar: string;
  example: string;
  interval: number;
  repetition: number;
  efactor: number;
  nextReviewSession: number;
  lastReviewSession: number;
  nextReviewDate?: string;
  lastReviewDate?: string;
}

export interface CompetencyHistoryItem {
  step: string; // lessonId
  score: number;
  timestamp: string;
}

export interface StudentCompetency {
  id: string; // competency objective text / unique key
  competency: string; // text
  category: string;
  level: string;
  firstSeenStep: string; // lessonId
  lastTestedStep: string; // lessonId
  masteryScore: number;
  status: "nouvelle" | "en_consolidation" | "acquise" | "fragile";
  history: CompetencyHistoryItem[];
}

export interface StudentRemediation {
  id: string;
  studentId: string;
  competencyId: string;
  competencyText: string;
  category: string;
  status: "pending" | "approved" | "completed";
  proposedAt: string;
  approvedAt?: string;
  completedAt?: string;
  activities: any[];
}

