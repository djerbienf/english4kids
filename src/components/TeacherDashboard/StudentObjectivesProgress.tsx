import React, { useMemo } from "react";
import { LessonObjective } from "../../types";

interface StudentObjectivesProgressProps {
  studentId: string;
  courseData: any[];
  studentHistory: any[];
}

const CATEGORY_ICONS: Record<string, string> = {
  Grammar: "⚙️",
  Vocabulary: "📚",
  "Functional Language": "💬",
  Pronunciation: "🗣️",
  // Backward compatibility:
  "Grammar & Syntax": "⚙️",
  "Vocabulary & Semantics": "📚",
  "Phonetics & Pronunciation": "🗣️",
  "Listening Comprehension": "🎧",
  "Reading Comprehension": "📖",
  "Speaking & Oral Interaction": "🗣️",
  "Writing & Written Production": "✍️",
  "Pragmatic & Cultural Competence": "🌍"
};

const MAIN_CATEGORIES = ["Grammar", "Vocabulary", "Functional Language", "Pronunciation"];

export function StudentObjectivesProgress({
  studentId,
  courseData = [],
  studentHistory = [],
}: StudentObjectivesProgressProps) {
  // 1. Get all completed lesson IDs for this student
  const completedLessonIds = useMemo(() => {
    return new Set(
      studentHistory
        .filter((h) => h.studentId === studentId && h.type === "lesson_finish")
        .map((h) => h.lessonId)
    );
  }, [studentId, studentHistory]);

  // 2. Gather all lessons, separating "Mastered" vs "Available" objectives
  const objectivesStats = useMemo(() => {
    // Collect all objectives from courseData
    const allObjectivesMap = new Map<string, LessonObjective>();
    const masteredObjectivesMap = new Map<string, LessonObjective>();

    courseData.forEach((unit) => {
      unit.lessons?.forEach((lesson: any) => {
        const hasCompleted = completedLessonIds.has(lesson.id);
        const objectives: LessonObjective[] = lesson.objectives || [];

        objectives.forEach((obj) => {
          // Unique key to prevent duplicates across different lessons with same objective content
          const uniqueKey = `${obj.category}-${obj.level}-${obj.text}`;
          allObjectivesMap.set(uniqueKey, obj);
          if (hasCompleted) {
            masteredObjectivesMap.set(uniqueKey, obj);
          }
        });
      });
    });

    const allObjectives = Array.from(allObjectivesMap.values());
    const masteredObjectives = Array.from(masteredObjectivesMap.values());

    // Dynamically identify all categories present to ensure backward compatibility
    const categoriesToRender = [...MAIN_CATEGORIES];
    allObjectives.forEach((o) => {
      if (o.category && !categoriesToRender.includes(o.category)) {
        categoriesToRender.push(o.category);
      }
    });

    // Group by Category
    const categoryBreakdown = categoriesToRender.map((category) => {
      const totalInCat = allObjectives.filter((o) => o.category === category).length;
      const masteredInCat = masteredObjectives.filter((o) => o.category === category).length;
      return {
        category,
        total: totalInCat,
        mastered: masteredInCat,
        percentage: totalInCat > 0 ? Math.round((masteredInCat / totalInCat) * 100) : 0,
      };
    });

    // Group by CEFR Level
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    // Also include old "C1/C2" format if present in existing objectives
    if (allObjectives.some((o) => o.level === "C1/C2")) {
      levels.push("C1/C2");
    }

    const levelBreakdown = levels.map((level) => {
      const totalInLvl = allObjectives.filter((o) => o.level === level).length;
      const masteredInLvl = masteredObjectives.filter((o) => o.level === level).length;
      return {
        level,
        total: totalInLvl,
        mastered: masteredInLvl,
        percentage: totalInLvl > 0 ? Math.round((masteredInLvl / totalInLvl) * 100) : 0,
      };
    });

    return {
      totalAvailable: allObjectives.length,
      totalMastered: masteredObjectives.length,
      masteredObjectives,
      categoryBreakdown,
      levelBreakdown,
    };
  }, [courseData, completedLessonIds]);

  const {
    totalAvailable,
    totalMastered,
    masteredObjectives,
    categoryBreakdown,
    levelBreakdown,
  } = objectivesStats;

  if (totalAvailable === 0) {
    return (
      <div className="bg-neutral-bg/40 border border-primary-light/50 p-6 rounded-2xl text-center">
        <span className="text-2xl mb-2 block">🎯</span>
        <h4 className="font-bold text-[15px] text-primary-dark">No Objectives Configured</h4>
        <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
          Add learning objectives to lessons in the **Course Builder** tab to view objective-based progression stats for this student.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-primary-light/80 p-6 rounded-[24px] shadow-sm space-y-6">
      {/* Header section with cumulative stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary-light/40 pb-5">
        <div>
          <h4 className="font-extrabold text-[16px] text-primary-dark flex items-center gap-2">
            <span>🎯</span> Pedagogical Objectives Mastery
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            Scientific performance metrics mapped to the CEFR language framework.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-primary-light/10 border border-primary-light/30 px-4 py-2 rounded-2xl">
          <div className="text-center">
            <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Mastered</span>
            <span className="text-xl font-black text-primary-dark">
              {totalMastered} <span className="text-xs font-bold text-text-secondary">/ {totalAvailable}</span>
            </span>
          </div>
          <div className="w-px h-8 bg-primary-light/40" />
          <div className="text-center">
            <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Completion</span>
            <span className="text-xl font-black text-green-600">
              {totalAvailable > 0 ? Math.round((totalMastered / totalAvailable) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Aspect-by-aspect progress bars */}
        <div className="space-y-4">
          <h5 className="text-xs font-extrabold text-primary-dark uppercase tracking-wider">
            Language Dimensions & Skills:
          </h5>
          <div className="space-y-3.5">
            {categoryBreakdown.map(({ category, total, mastered, percentage }) => (
              <div key={category} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-text-primary flex items-center gap-2">
                    <span className="text-sm">{CATEGORY_ICONS[category] || "🎯"}</span>
                    {category}
                  </span>
                  <span className="font-semibold text-text-secondary">
                    {total > 0 ? (
                      <>
                        <strong className="text-primary-dark">{mastered}</strong> / {total} ({percentage}%)
                      </>
                    ) : (
                      <span className="text-text-secondary/50 font-normal">Not present in course</span>
                    )}
                  </span>
                </div>
                {total > 0 ? (
                  <div className="w-full bg-neutral-bg h-2 rounded-full overflow-hidden border border-primary-light/30">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage === 100
                          ? "bg-green-500"
                          : percentage > 50
                          ? "bg-primary"
                          : percentage > 0
                          ? "bg-primary-light"
                          : "bg-transparent"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                ) : (
                  <div className="w-full bg-neutral-bg/30 h-1.5 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column: CEFR Level Badges and checklist of mastered achievements */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h5 className="text-xs font-extrabold text-primary-dark uppercase tracking-wider">
              CEFR Level Mastery Progress:
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
              {levelBreakdown.map(({ level, total, mastered, percentage }) => {
                const getLvlColors = (lvl: string, percent: number) => {
                  if (percent === 100 && total > 0) return "bg-green-100 border-green-300 text-green-800";
                  if (percent > 0) return "bg-primary-light/10 border-primary-light/60 text-primary-dark";
                  return "bg-neutral-bg border-primary-light/30 text-text-secondary/60";
                };

                return (
                  <div
                    key={level}
                    className={`border rounded-xl p-2 text-center flex flex-col items-center justify-center ${getLvlColors(
                      level,
                      percentage
                    )}`}
                  >
                    <span className="text-sm font-black tracking-wide">{level}</span>
                    <span className="text-[10px] font-bold mt-1">
                      {total > 0 ? `${mastered}/${total}` : "0/0"}
                    </span>
                    {total > 0 && (
                      <span className="text-[9px] font-semibold opacity-80 mt-0.5">
                        {percentage}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick achievements log */}
          <div className="bg-neutral-bg/40 border border-primary-light/50 p-4 rounded-2xl flex-1 mt-2 flex flex-col justify-center">
            <h6 className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-2">
              Recent Mastered Competencies:
            </h6>
            {masteredObjectives.length === 0 ? (
              <p className="text-xs text-text-secondary/80 italic py-4">
                No competency objectives unlocked yet. Once the student completes lessons containing objectives, they will appear here!
              </p>
            ) : (
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {masteredObjectives.slice(-4).reverse().map((obj, i) => (
                  <div key={i} className="flex gap-2 items-start text-xs font-medium text-text-primary leading-tight">
                    <span className="text-green-500 shrink-0">✓</span>
                    <div>
                      <span className="font-bold text-[10px] uppercase text-text-secondary mr-1.5 bg-white px-1.5 py-0.5 rounded border border-primary-light/40">
                        {obj.level}
                      </span>
                      <span className="font-bold text-[10px] text-primary-dark mr-1">
                        {obj.category}
                        {obj.subCategory ? ` (${obj.subCategory})` : ""}:
                      </span>
                      <span className="text-text-primary font-medium">{obj.text}</span>
                    </div>
                  </div>
                ))}
                {masteredObjectives.length > 4 && (
                  <p className="text-[10px] text-primary font-bold hover:underline cursor-pointer mt-1">
                    + {masteredObjectives.length - 4} more mastered competencies
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
