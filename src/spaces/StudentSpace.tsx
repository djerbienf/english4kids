import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Lesson, StudentStats, SRSDeckItem } from "../types";
import { Button } from "../components/Button";
import { StudentDashboard } from "./StudentDashboard";
import { LessonRunner } from "./LessonRunner";
import { SRSRunner } from "./SRSRunner";
import { SpiralTestRunner } from "../components/SpiralTestRunner";
import { MOCK_STATS } from "../data/mockData";
import { ensureInitialized } from "../utils/initData";
import { buildConfiguredLesson } from "../utils/lessonRunnerBuilder";
import { addWordsToSRS, getDueCards, syncSRSSession } from "../utils/srs";
import { useStore } from "../store/useStore";

export function StudentSpace() {
  const appParameters = useStore((state) => state.appParameters);
  ensureInitialized();
  const dictionaryWords = useStore((state) => state.dictionaryWords);
  const studentsList = useStore((state) => state.studentsList);
  const studentStatsMap = useStore((state) => state.studentStats);
  const setStudentStatsMap = useStore((state) => state.setStudentStats);
  const studentHistoryAll = useStore((state) => state.studentHistory);
  const setStudentHistoryAll = useStore((state) => state.setStudentHistory);
  const courseData = useStore((state) => state.courseData);
  const studentCursuses = useStore((state) => state.studentCursuses);

  // Authentication states
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(
    () => {
      return localStorage.getItem("lms_current_student_id");
    },
  );
  const isLoggedIn = !!currentStudentId;

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTestLesson, setActiveTestLesson] = useState<Lesson | null>(null);
  const [isSRSMode, setIsSRSMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const currentStudent = studentsList.find((s: any) => s.id === currentStudentId);

  const stats = React.useMemo(() => {
    if (currentStudentId) {
      return (
        studentStatsMap[currentStudentId] || {
          xp: 0,
          streak: 1,
          dailyGoalProgress: 0,
          dailyGoalTotal: 3,
        }
      );
    }
    return MOCK_STATS;
  }, [currentStudentId, studentStatsMap]);

  const dueCards = React.useMemo(() => {
    return currentStudentId ? getDueCards(currentStudentId) : [];
  }, [currentStudentId, isSRSMode, useStore((state) => state.srsDecks)]);

  // Ensure daily SRS tick
  React.useEffect(() => {
    if (currentStudentId) {
      syncSRSSession(currentStudentId);
    }
  }, [currentStudentId]);

  const lessonsList = useStore((state) => state.lessonsList);

  const currentStudentCursus = currentStudentId ? (studentCursuses[currentStudentId] || []) : [];
  
  // 1. Process units assigned to the student
  const assignedCourseData = courseData.map((unit: any) => {
    // Has the entire unit been assigned?
    const hasUnitAssigned = currentStudentCursus.some((c: any) => c.type === 'unit' && c.unitId === unit.id);
    
    // Resolve lessons in the unit (checking both unit.lessonIds and inline unit.lessons)
    const lessonsInUnit = unit.lessonIds && unit.lessonIds.length > 0
      ? unit.lessonIds.map((id: string) => lessonsList.find(l => l.id === id)).filter(Boolean)
      : (unit.lessons || []);

    if (hasUnitAssigned) {
      // Show all lessons in the assigned unit (fall back to all if none are explicitly "Published")
      const publishedLessons = lessonsInUnit.filter((l: any) => l && l.status === 'Published');
      const lessonsToShow = publishedLessons.length > 0 ? publishedLessons : lessonsInUnit;
      
      if (lessonsToShow.length > 0) {
        return { ...unit, lessons: lessonsToShow };
      }
      return null;
    }
    
    // Check if specific lessons inside this unit were assigned directly
    const assignedLessons = lessonsInUnit.filter((lesson: any) => {
      return lesson && currentStudentCursus.some((c: any) => c.type === 'lesson' && c.lessonId === lesson.id);
    });

    if (assignedLessons.length > 0) {
      return { ...unit, lessons: assignedLessons };
    }
    return null;
  }).filter(Boolean);

  // 2. Process independent lessons assigned directly (not in any unit)
  const standaloneAssignedLessons = currentStudentCursus
    .filter((c: any) => c.type === 'lesson')
    .map((c: any) => lessonsList.find(l => l.id === c.lessonId))
    .filter(Boolean)
    .filter((lesson: any) => {
       // Only include it here if it's NOT already included in a unit above
       for (const u of assignedCourseData) {
         if (u.lessons.some((l: any) => l.id === lesson.id)) return false;
       }
       return true;
    });

  if (standaloneAssignedLessons.length > 0) {
    assignedCourseData.push({
      id: 'standalone_lessons',
      title: 'Independent Lessons',
      lessons: standaloneAssignedLessons
    });
  }

  // 3. Process tests assigned directly
  const assignedTests = currentStudentCursus
    .filter((c: any) => c.type === 'test')
    .map((c: any) => lessonsList.find(l => l.id === c.lessonId))
    .filter(Boolean);

  if (assignedTests.length > 0) {
    assignedCourseData.push({
      id: 'assigned_tests',
      title: 'Evaluations & Tests',
      lessons: assignedTests
    });
  }

  const currentStudentHistory = studentHistoryAll.filter(
    (h: any) => h.studentId === currentStudentId,
  );

  const handleFinishLesson = (xpEarned: number) => {
    if (!currentStudentId || !activeLesson) return;

    // Inject flashcard words to SRS Deck
    const flashcardActs = (activeLesson.activities || []).filter(a => a.type === "flashcard");
    if (flashcardActs.length > 0) {
       addWordsToSRS(currentStudentId, flashcardActs.map(a => ({
          word: (a as any).word || "",
          translation_ar: (a as any).translation_ar || "",
          example: (a as any).example || ""
       })));
    }

    // 1. Update visual and storage metrics
    const updatedStats = {
      ...stats,
      xp: stats.xp + xpEarned,
      streak: stats.streak + 1,
      dailyGoalProgress: stats.dailyGoalProgress + 1,
    };
    
    setStudentStatsMap({
      ...studentStatsMap,
      [currentStudentId]: updatedStats
    });

    // 2. Add to student's history indicating finish
    const newHistoryEvent = {
      id: Date.now().toString(),
      studentId: currentStudentId,
      lessonId: activeLesson.id,
      unitId: (activeLesson as any)._unitId,
      type: "lesson_finish",
      timestamp: new Date().toISOString(),
    };
    
    setStudentHistoryAll([...studentHistoryAll, newHistoryEvent]);

    setActiveLesson(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const matched = studentsList.find(
      (s: any) =>
        s.username.toLowerCase() === username.trim().toLowerCase() &&
        s.password === password,
    );
    if (matched) {
      localStorage.setItem("lms_current_student_id", matched.id);
      setCurrentStudentId(matched.id);
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
        setStudentHistoryAll([...studentHistoryAll, newHistoryEvent]);
      }
    }

    const configuredLesson = buildConfiguredLesson(resolvedLesson, dictionaryWords, appParameters);
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
            <Link
              to="/teacher"
              className="text-primary hover:underline text-[14px]"
            >
              Go to Teacher Portal
            </Link>
          </div>
        </form>
      </div>
    );
  }

  if (isSRSMode && currentStudentId) {
    return (
      <SRSRunner
         studentId={currentStudentId}
         dueCards={dueCards}
         onComplete={() => setIsSRSMode(false)}
         onExit={() => setIsSRSMode(false)}
      />
    );
  }

  if (activeTestLesson && currentStudentId) {
    return (
      <SpiralTestRunner
        studentId={currentStudentId}
        lesson={activeTestLesson}
        onFinish={(xpEarned) => {
          handleFinishLesson(xpEarned);
          setActiveTestLesson(null);
        }}
        onBack={() => setActiveTestLesson(null)}
      />
    );
  }

  if (activeLesson) {
    return (
      <LessonRunner
        lesson={activeLesson}
        onFinish={(xpEarned) => {
          setActiveTestLesson(activeLesson);
          setActiveLesson(null);
        }}
        onBack={() => setActiveLesson(null)}
      />
    );
  }

  return (
    <StudentDashboard
      studentId={currentStudentId}
      studentName={currentStudent?.name || username}
      stats={stats}
      courseData={assignedCourseData}
      studentHistory={currentStudentHistory}
      dueCards={dueCards}
      onStartLesson={handleStartLesson}
      onStartSRS={() => setIsSRSMode(true)}
      onLogout={handleLogout}
    />
  );
}
