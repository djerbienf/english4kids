import { StudentStats, Lesson } from "../types";

export const MOCK_STATS: StudentStats = {
  xp: 1240,
  streak: 2,
  dailyGoalProgress: 1,
  dailyGoalTotal: 3,
};

export const SAMPLE_LESSON: Lesson = {
  id: "l1",
  title: "Greetings & Basics",
  xpReward: 20,
  activities: [
    {
      id: "v1",
      type: "video",
      title: "Introduction to Greetings",
      description: "Watch the video to learn how to say hello.",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
      id: "a1",
      type: "flashcard",
      word: "Morning",
      translation_ar: "الصباح",
      example: "Good morning, how are you?",
    },
    {
      id: "a2",
      type: "cloze",
      sentenceBeforeGap: "Good",
      sentenceAfterGap: ", my friend!",
      correctAnswer: "morning",
      distractors: ["night", "bye", "apple"],
    },
  ],
};

export const DEFAULT_STUDENTS: any[] = [];

export const DEFAULT_CURSUSES: {
  [studentId: string]: {
    id: string;
    type: "unit" | "lesson";
    title: string;
    status: string;
  }[];
} = {};

export const DEFAULT_STATS: { [studentId: string]: StudentStats } = {};

export const DEFAULT_COURSE_DATA = [
  {
    id: "u1",
    title: "Unit 1: Greetings",
    lessons: [
      {
        id: "u1_l1",
        title: "L1: Say Hello",
        status: "Published",
        videoUrl:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        videoTitle: "Greetings in English",
        videoDesc:
          "Watch this video carefully to learn how to greet other people.",
        flashcardWord: "Good morning",
        flashcardTrans: "صباح الخير",
        flashcardExample: 'Always greet your parents with "Good morning"!',
        clozeSentenceBefore: "How are you ",
        clozeSentenceAfter: "?",
        clozeCorrect: "today",
        clozeDistractors: "yesterday, tomorrow, night",
      },
    ],
  },
];
