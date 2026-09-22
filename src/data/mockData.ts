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

export const DEFAULT_STUDENTS = [
  {
    id: "s_leo",
    name: "Leo Vance",
    username: "leo",
    password: "123",
    createdAt: "2026-07-10",
    avatarId: "avatar2"
  },
  {
    id: "s_sarah",
    name: "Sarah Jenkins",
    username: "sarah",
    password: "123",
    createdAt: "2026-07-11",
    avatarId: "avatar3"
  }
];

export const DEFAULT_CURSUSES: {
  [studentId: string]: {
    id: string;
    type: "unit" | "lesson";
    title: string;
    status: string;
    lessonId?: string;
    unitId?: string;
  }[];
} = {
  s_leo: [
    {
      id: "cur_1",
      type: "lesson",
      title: "L1: Say Hello",
      status: "completed",
      lessonId: "u1_l1",
      unitId: "u1"
    },
    {
      id: "cur_2",
      type: "lesson",
      title: "L2: Ordering Food",
      status: "completed",
      lessonId: "u1_l2",
      unitId: "u1"
    },
    {
      id: "cur_3",
      type: "lesson",
      title: "L3: Talking about the Past",
      status: "pending",
      lessonId: "u1_l3",
      unitId: "u1"
    }
  ],
  s_sarah: [
    {
      id: "cur_4",
      type: "lesson",
      title: "L1: Say Hello",
      status: "completed",
      lessonId: "u1_l1",
      unitId: "u1"
    }
  ]
};

export const DEFAULT_STATS: { [studentId: string]: StudentStats } = {
  s_leo: {
    xp: 450,
    streak: 4,
    dailyGoalProgress: 2,
    dailyGoalTotal: 3
  },
  s_sarah: {
    xp: 150,
    streak: 2,
    dailyGoalProgress: 1,
    dailyGoalTotal: 3
  }
};

export const DEFAULT_COURSE_DATA = [
  {
    id: "u1",
    title: "Unit 1: Greetings & Food",
    lessonIds: ["u1_l1", "u1_l2", "u1_l3"],
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
        activities: [
          {
            id: 1,
            type: "Watching"
          },
          {
            id: 2,
            type: "Flashcards"
          },
          {
            id: 3,
            type: "Cloze"
          },
          {
            id: 4,
            type: "Listening",
            title: "Morning Routine Listening",
            listeningAudioUrl: "https://d38j2q3oeblue7.cloudfront.net/audio/uk/good_morning_1.mp3",
            listeningTranscript: "Good morning! How are you today? It is a beautiful day.",
            listeningQuestions: [
              {
                id: "q1",
                question: "What time of day is it?",
                options: ["Morning", "Afternoon", "Evening", "Night"],
                correctAnswer: "Morning"
              }
            ]
          }
        ],
        objectives: [
          {
            id: "g1",
            category: "Grammar",
            subCategory: "Present Tenses",
            cognitiveAction: "Apply / Use in context",
            level: "A1",
            text: "Apply / Use in context of Present Tenses at A1 level: The student can correctly use the simple present tense to describe routine activities in gap-fill tasks."
          },
          {
            id: "v1",
            category: "Vocabulary",
            subCategory: "Daily Routine",
            cognitiveAction: "Recognize / Identify",
            level: "A1",
            text: "Recognize / Identify of Daily Routine at A1 level: The student can spot routine action words (e.g., 'wake up', 'have breakfast') in a basic multiple choice quiz."
          }
        ]
      },
      {
        id: "u1_l2",
        title: "L2: Ordering Food",
        status: "Published",
        videoUrl:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        videoTitle: "At the Restaurant",
        videoDesc: "Learn how to order food politely in English.",
        flashcardWord: "Delicious",
        flashcardTrans: "لذيذ",
        flashcardExample: "This pizza looks absolutely delicious!",
        clozeSentenceBefore: "I would like to ",
        clozeSentenceAfter: " some pasta, please.",
        clozeCorrect: "order",
        clozeDistractors: "speak, run, make",
        activities: [
          {
            id: 1,
            type: "Watching"
          },
          {
            id: 2,
            type: "Flashcards"
          },
          {
            id: 3,
            type: "Cloze"
          }
        ],
        objectives: [
          {
            id: "v2",
            category: "Vocabulary",
            subCategory: "Food & Dining",
            cognitiveAction: "Understand / Translate",
            level: "A2",
            text: "Understand / Translate of Food & Dining at A2 level: The student can match vocabulary related to restaurant menus and food preparation to their native meaning."
          },
          {
            id: "f1",
            category: "Functional Language",
            subCategory: "Ordering Food",
            cognitiveAction: "Produce / Create",
            level: "A2",
            text: "Produce / Create of Ordering Food at A2 level: The student can produce polite sentences to order a meal and ask for the bill at a restaurant."
          }
        ]
      },
      {
        id: "u1_l3",
        title: "L3: Talking about the Past",
        status: "Published",
        videoUrl:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        videoTitle: "Recounting Events",
        videoDesc: "Watch how characters talk about their weekends in the past simple.",
        flashcardWord: "Yesterday",
        flashcardTrans: "أمس",
        flashcardExample: "Yesterday, I went to the park and met my friends.",
        clozeSentenceBefore: "She ",
        clozeSentenceAfter: " a beautiful song at the party.",
        clozeCorrect: "sang",
        clozeDistractors: "sing, sings, singing",
        activities: [
          {
            id: 1,
            type: "Watching"
          },
          {
            id: 2,
            type: "Flashcards"
          },
          {
            id: 3,
            type: "Cloze"
          }
        ],
        objectives: [
          {
            id: "g2",
            category: "Grammar",
            subCategory: "Past Tenses",
            cognitiveAction: "Apply / Use in context",
            level: "A2",
            text: "Apply / Use in context of Past Tenses at A2 level: The student can correctly apply and use simple past tense endings to recount completed weekend activities."
          },
          {
            id: "p1",
            category: "Pronunciation",
            subCategory: "Word Stress",
            cognitiveAction: "Recognize / Identify",
            level: "A2",
            text: "Recognize / Identify of Word Stress at A2 level: The student can identify the stressed syllable in common two-syllable nouns and verbs."
          }
        ]
      }
    ],
  },
];

export const DEFAULT_LESSONS_LIST = DEFAULT_COURSE_DATA[0].lessons;

