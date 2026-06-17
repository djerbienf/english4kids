import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Role, Lesson, StudentStats } from "./types";
import { Button } from "./components/Button";
import { StudentDashboard } from "./spaces/StudentDashboard";
import { LessonRunner } from "./spaces/LessonRunner";
import { TeacherDashboard } from "./spaces/TeacherDashboard";

// Mock Data
const MOCK_STATS: StudentStats = {
  xp: 1240,
  streak: 2,
  dailyGoalProgress: 1,
  dailyGoalTotal: 3,
};

const SAMPLE_LESSON: Lesson = {
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

const DEFAULT_STUDENTS: any[] = [];

const DEFAULT_CURSUSES: {
  [studentId: string]: {
    id: string;
    type: "unit" | "lesson";
    title: string;
    status: string;
  }[];
} = {};

const DEFAULT_STATS: { [studentId: string]: StudentStats } = {};

const DEFAULT_COURSE_DATA = [
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

function ensureInitialized() {
  // One-time auto-wipe of old mock data so the user gets a fully clean start with custom courses
  if (!localStorage.getItem("lms_full_reset_v5")) {
    localStorage.removeItem("lms_students");
    localStorage.removeItem("lms_student_cursuses");
    localStorage.removeItem("lms_student_stats");
    localStorage.removeItem("lms_course_data");
    localStorage.removeItem("lms_current_student_id");
    localStorage.setItem("lms_full_reset_v5", "yes");
  }

  if (!localStorage.getItem("lms_students")) {
    localStorage.setItem("lms_students", JSON.stringify(DEFAULT_STUDENTS));
  }
  if (!localStorage.getItem("lms_student_cursuses")) {
    localStorage.setItem(
      "lms_student_cursuses",
      JSON.stringify(DEFAULT_CURSUSES),
    );
  }
  if (!localStorage.getItem("lms_student_stats")) {
    localStorage.setItem("lms_student_stats", JSON.stringify(DEFAULT_STATS));
  }
  if (!localStorage.getItem("lms_course_data")) {
    localStorage.setItem(
      "lms_course_data",
      JSON.stringify(DEFAULT_COURSE_DATA),
    );
  }
}

function StudentSpace() {
  ensureInitialized();

  // Authentication states
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(
    () => {
      return localStorage.getItem("lms_current_student_id");
    },
  );
  const isLoggedIn = !!currentStudentId;

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Read data families from localStorage
  const getStudents = () =>
    JSON.parse(localStorage.getItem("lms_students") || "[]");
  const getStats = () =>
    JSON.parse(localStorage.getItem("lms_student_stats") || "{}");
  const getStudentHistory = () =>
    JSON.parse(localStorage.getItem("lms_student_history") || "[]");

  const students = getStudents();
  const currentStudent = students.find((s: any) => s.id === currentStudentId);

  const [stats, setStats] = useState<StudentStats>(() => {
    if (currentStudentId) {
      const allStats = getStats();
      return (
        allStats[currentStudentId] || {
          xp: 0,
          streak: 1,
          dailyGoalProgress: 0,
          dailyGoalTotal: 3,
        }
      );
    }
    return MOCK_STATS;
  });

  // Track state changes to local storage
  React.useEffect(() => {
    if (currentStudentId) {
      const allStats = getStats();
      allStats[currentStudentId] = stats;
      localStorage.setItem("lms_student_stats", JSON.stringify(allStats));
    }
  }, [stats, currentStudentId]);

  const courseDataRaw = localStorage.getItem("lms_course_data");
  const courseData = courseDataRaw ? JSON.parse(courseDataRaw) : [];

  const studentHistoryAll = getStudentHistory();
  const currentStudentHistory = studentHistoryAll.filter(
    (h: any) => h.studentId === currentStudentId,
  );

  const handleFinishLesson = (xpEarned: number) => {
    if (!currentStudentId || !activeLesson) return;

    // 1. Update visual and storage metrics
    const updatedStats = {
      ...stats,
      xp: stats.xp + xpEarned,
      streak: stats.streak + 1,
      dailyGoalProgress: stats.dailyGoalProgress + 1,
    };
    setStats(updatedStats);

    const allStats = getStats();
    allStats[currentStudentId] = updatedStats;
    localStorage.setItem("lms_student_stats", JSON.stringify(allStats));

    // 2. Add to student's history indicating finish
    const newHistoryEvent = {
      id: Date.now().toString(),
      studentId: currentStudentId,
      lessonId: activeLesson.id,
      unitId: (activeLesson as any)._unitId,
      type: "lesson_finish",
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(
      "lms_student_history",
      JSON.stringify([...studentHistoryAll, newHistoryEvent]),
    );

    setActiveLesson(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const matched = getStudents().find(
      (s: any) =>
        s.username.toLowerCase() === username.trim().toLowerCase() &&
        s.password === password,
    );
    if (matched) {
      localStorage.setItem("lms_current_student_id", matched.id);
      setCurrentStudentId(matched.id);

      const allStats = getStats();
      setStats(
        allStats[matched.id] || {
          xp: 0,
          streak: 1,
          dailyGoalProgress: 0,
          dailyGoalTotal: 3,
        },
      );
      setLoginError("");
    } else {
      setLoginError(
        "Incorrect credentials. Please verify your student username or password.",
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lms_current_student_id");
    setCurrentStudentId(null);
  };

  const handleStartLesson = (resolvedLesson: any) => {
    if (!resolvedLesson) return;

    if (currentStudentId && resolvedLesson._unitId) {
      // Create unit start history event if it doesn't exist
      const hasStartedUnit = currentStudentHistory.some(
        (h: any) =>
          h.unitId === resolvedLesson._unitId && h.type === "unit_start",
      );
      if (!hasStartedUnit) {
        const newHistoryEvent = {
          id: Date.now().toString(),
          studentId: currentStudentId,
          unitId: resolvedLesson._unitId,
          type: "unit_start",
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(
          "lms_student_history",
          JSON.stringify([...getStudentHistory(), newHistoryEvent]),
        );
      }
    }

    const title = resolvedLesson.title;
    const isFamily =
      title.toLowerCase().includes("family") ||
      title.toLowerCase().includes("people");

    // Extract dynamic fields (with fallback if the teacher didn't edit them)
    const videoUrl =
      resolvedLesson?.videoUrl ||
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    const videoTitle = resolvedLesson?.videoTitle || `Video: ${title}`;
    const videoDesc =
      resolvedLesson?.videoDesc ||
      "Watch this video carefully to understand the lesson and do the exercises.";

    const flashcardWord =
      resolvedLesson?.flashcardWord ||
      (isFamily ? "Family Members" : "Greetings vocab");
    const flashcardTrans =
      resolvedLesson?.flashcardTrans ||
      (isFamily ? "أفراد العائلة" : "مفردات التحيات");
    const flashcardExample =
      resolvedLesson?.flashcardExample ||
      (isFamily
        ? "My family provides continuous support."
        : "Always start with a pleasant greeting.");

    const clozeSentenceBefore =
      resolvedLesson?.clozeSentenceBefore ||
      (isFamily ? "We are a close knit " : "Have a great ");
    const clozeSentenceAfter =
      resolvedLesson?.clozeSentenceAfter ||
      (isFamily ? " that shares everything." : " head start of the day!");
    const clozeCorrect =
      resolvedLesson?.clozeCorrect || (isFamily ? "family" : "morning");

    let clozeDistributors = ["automobile", "vegetable", "water"];
    if (resolvedLesson?.clozeDistractors) {
      clozeDistributors = Array.isArray(resolvedLesson.clozeDistractors)
        ? resolvedLesson.clozeDistractors
        : typeof resolvedLesson.clozeDistractors === 'string'
          ? resolvedLesson.clozeDistractors.split(",").map((s: string) => s.trim()).filter(Boolean)
          : ["automobile", "vegetable", "water"];
    }

    const readingType = resolvedLesson?.readingType || "text";
    let readingSlides = resolvedLesson?.readingSlides || [
      "Once upon a time...",
    ];

    const normalizedReadingSlides = readingSlides.map((slide: any) => {
      if (typeof slide === "string") {
         return {
            text: slide,
            imageUrl: resolvedLesson.readingImageUrl,
            audioUrl: resolvedLesson.readingAudioUrl,
            unscrambleText: resolvedLesson.readingUnscrambleText,
            vocabulary: resolvedLesson.readingVocabulary || [],
         };
      }
      return slide;
    });

    const teacherActivities = resolvedLesson?.activities || [
      { id: 1, type: "Watching" },
      { id: 2, type: "Flashcards" },
      { id: 3, type: "Cloze" },
      { id: 4, type: "Reading" },
    ];

    const mappedActivities = teacherActivities
      .map((act: any, idx: number) => {
        if (act.type === "Watching") {
          return {
            id: act.id || "v_step_" + resolvedLesson.id + "_" + idx,
            type: "video",
            title: act.videoTitle || act.title || videoTitle,
            description: act.videoDesc || act.description || videoDesc,
            videoUrl: act.videoUrl || videoUrl,
            videoStart: act.videoStart || resolvedLesson?.videoStart,
            videoEnd: act.videoEnd || resolvedLesson?.videoEnd,
          };
        }
        if (act.type === "Flashcards") {
          return {
            id: act.id || "f_step_" + resolvedLesson.id + "_" + idx,
            type: "flashcard",
            word: act.flashcardWord || flashcardWord,
            translation_ar: act.flashcardTrans || flashcardTrans,
            example: act.flashcardExample || flashcardExample,
          };
        }
        if (act.type === "Cloze") {
          let actDistractors = (act.clozeDistractors || clozeDistributors);
          if (typeof actDistractors === "string") {
            actDistractors = actDistractors.split(",").map((s: string) => s.trim()).filter(Boolean);
          }
          return {
            id: act.id || "c_step_" + resolvedLesson.id + "_" + idx,
            type: "cloze",
            sentenceBeforeGap: act.clozeSentenceBefore || clozeSentenceBefore,
            sentenceAfterGap: act.clozeSentenceAfter || clozeSentenceAfter,
            correctAnswer: act.clozeCorrect || clozeCorrect,
            distractors: actDistractors,
          };
        }
        if (act.type === "Reading") {
          let actSlides = act.readingSlides || normalizedReadingSlides;
          if (Array.isArray(act.readingSlides) && typeof act.readingSlides[0] === 'string') {
             actSlides = act.readingSlides.map((slide: string) => ({
                 text: slide,
                 imageUrl: act.readingImageUrl || resolvedLesson.readingImageUrl,
                 audioUrl: act.readingAudioUrl || resolvedLesson.readingAudioUrl,
                 unscrambleText: act.readingUnscrambleText || resolvedLesson.readingUnscrambleText,
                 vocabulary: act.readingVocabulary || resolvedLesson.readingVocabulary || [],
             }));
          }
          return {
            id: act.id || "r_step_" + resolvedLesson.id + "_" + idx,
            type: "reading",
            readingType: act.readingType || readingType,
            readingTitle: act.readingTitle || resolvedLesson.readingTitle,
            readingSlides: actSlides,
          };
        }
        return null;
      })
      .filter(Boolean);

    const configuredLesson: Lesson = {
      id: resolvedLesson.id,
      title: title,
      xpReward: 20,
      activities: mappedActivities,
    };
    (configuredLesson as any)._unitId = resolvedLesson._unitId;
    setActiveLesson(configuredLesson);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="bg-card-bg rounded-[24px] p-10 shadow-sm border border-primary-light max-w-sm w-full text-center"
        >
          <h1 className="text-[26px] font-bold text-primary-dark mb-2">
            Student Login
          </h1>
          <p className="text-text-secondary text-[14px] mb-8">
            Access your personalised training cursus
          </p>

          {loginError && (
            <div className="mb-4 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-200 text-left">
              ⚠️ {loginError}
            </div>
          )}

          <div className="space-y-4 mb-6 text-left">
            <div>
              <label className="block text-[14px] font-medium text-text-primary mb-1">
                Username / Identifier
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. ahmed.b"
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-text-primary mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Start Studying →
          </Button>
          <div className="mt-6">
            <a
              href="/teacher"
              className="text-primary hover:underline text-[14px]"
            >
              Go to Teacher Portal
            </a>
          </div>
        </form>
      </div>
    );
  }

  if (activeLesson) {
    return (
      <LessonRunner
        lesson={activeLesson}
        onFinish={handleFinishLesson}
        onBack={() => setActiveLesson(null)}
      />
    );
  }

  return (
    <StudentDashboard
      studentName={currentStudent?.name || username}
      stats={stats}
      courseData={courseData}
      studentHistory={currentStudentHistory}
      onStartLesson={handleStartLesson}
      onLogout={handleLogout}
    />
  );
}

function TeacherSpace() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="bg-card-bg rounded-[24px] p-10 shadow-sm border border-primary-light max-w-sm w-full text-center"
        >
          <h1 className="text-[26px] font-bold text-primary-dark mb-2">
            Teacher Space
          </h1>
          <p className="text-text-secondary text-[14px] mb-8">
            Sign in to manage your classes
          </p>
          <div className="space-y-4 mb-6 text-left">
            <div>
              <label className="block text-[14px] font-medium text-text-primary mb-1">
                Username / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-text-primary mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
          <div className="mt-6">
            <a href="/" className="text-primary hover:underline text-[14px]">
              Student Portal
            </a>
          </div>
        </form>
      </div>
    );
  }

  return <TeacherDashboard onLogout={() => setIsLoggedIn(false)} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentSpace />} />
        <Route path="/teacher" element={<TeacherSpace />} />
      </Routes>
    </BrowserRouter>
  );
}
