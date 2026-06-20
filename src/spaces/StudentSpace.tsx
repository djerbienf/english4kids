import React, { useState } from "react";
import { Lesson, StudentStats } from "../types";
import { Button } from "../components/Button";
import { StudentDashboard } from "./StudentDashboard";
import { LessonRunner } from "./LessonRunner";
import { MOCK_STATS } from "../data/mockData";
import { ensureInitialized } from "../utils/initData";
import { buildConfiguredLesson } from "../utils/lessonRunnerBuilder";

export function StudentSpace() {
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

  const studentCursusesRaw = localStorage.getItem("lms_student_cursuses");
  const studentCursuses = studentCursusesRaw ? JSON.parse(studentCursusesRaw) : {};
  const currentStudentCursus = currentStudentId ? (studentCursuses[currentStudentId] || []) : [];

  const assignedCourseData = courseData.map((unit: any) => {
    // Has the entire unit been assigned?
    const hasUnitAssigned = currentStudentCursus.some((c: any) => c.type === 'unit' && c.unitId === unit.id);
    
    if (hasUnitAssigned) {
      return unit;
    }

    // Otherwise, check if specific lessons were assigned
    const assignedLessons = unit.lessons.filter((lesson: any) => {
      return currentStudentCursus.some((c: any) => c.type === 'lesson' && c.lessonId === lesson.id);
    });

    if (assignedLessons.length > 0) {
      return { ...unit, lessons: assignedLessons };
    }

    return null;
  }).filter(Boolean);

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

    let dictionaryWords: any[] = [];
    try {
      const stored = localStorage.getItem("lms_dictionary_data");
      if (stored) dictionaryWords = JSON.parse(stored);
    } catch {}

    const configuredLesson = buildConfiguredLesson(resolvedLesson, dictionaryWords);
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
      courseData={assignedCourseData}
      studentHistory={currentStudentHistory}
      onStartLesson={handleStartLesson}
      onLogout={handleLogout}
    />
  );
}
