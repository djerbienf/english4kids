import React, { useState, useMemo } from "react";
import { Button } from "../Button";
import { LessonObjectivesEditor } from "./LessonObjectivesEditor";
import { LessonObjective } from "../../types";

interface ObjectivesTabProps {
  lessonsList: any[];
  updateStandaloneLessonField: (lessonId: string, field: string, value: any) => Promise<void> | void;
  setActiveTab: (tab: any) => void;
  setEditingLesson: (lesson: { lessonId: string; lessonTitle: string } | null) => void;
}

export const ObjectivesTab = React.memo(function ObjectivesTab({
  lessonsList,
  updateStandaloneLessonField,
  setActiveTab,
  setEditingLesson,
}: ObjectivesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Filtered lessons list
  const filteredLessons = useMemo(() => {
    return lessonsList.filter((lesson) =>
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [lessonsList, searchTerm]);

  const selectedLesson = useMemo(() => {
    return lessonsList.find((l) => l.id === selectedLessonId);
  }, [lessonsList, selectedLessonId]);

  // Statistics calculations
  const stats = useMemo(() => {
    const totalLessons = lessonsList.length;
    const lessonsWithObjectives = lessonsList.filter(
      (l) => l.objectives && l.objectives.length > 0
    ).length;
    const totalObjectives = lessonsList.reduce(
      (sum, l) => sum + (l.objectives?.length || 0),
      0
    );

    // Distribution by CEFR levels
    const levelCounts: Record<string, number> = {};
    lessonsList.forEach((l) => {
      (l.objectives || []).forEach((obj: LessonObjective) => {
        levelCounts[obj.level] = (levelCounts[obj.level] || 0) + 1;
      });
    });

    return {
      totalLessons,
      lessonsWithObjectives,
      totalObjectives,
      averageObjectives: totalLessons > 0 ? (totalObjectives / totalLessons).toFixed(1) : "0.0",
      levelCounts,
    };
  }, [lessonsList]);

  const handleEditActivities = (lesson: any) => {
    setEditingLesson({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
    });
    setActiveTab("builder");
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary-light pb-4">
        <div>
          <h2 className="text-[22px] font-bold text-primary-dark">
            🎯 Pedagogical Objectives Manager
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Define learning outcomes, language areas, and CEFR competencies for each curriculum lesson.
          </p>
        </div>
        {/* Quick Summary Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-primary-light/10 border border-primary-light/40 rounded-xl px-4 py-2 text-center min-w-[100px]">
            <span className="block text-xs text-text-secondary font-medium">Total Objectives</span>
            <span className="text-lg font-extrabold text-primary-dark">{stats.totalObjectives}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 text-center min-w-[100px]">
            <span className="block text-xs text-text-secondary font-medium">Coverage</span>
            <span className="text-lg font-extrabold text-emerald-700">
              {stats.lessonsWithObjectives} / {stats.totalLessons} Lessons
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Lessons List */}
        <div className="lg:col-span-5 space-y-4 bg-neutral-bg/30 border border-primary-light/40 p-4 rounded-2xl h-[calc(100vh-280px)] flex flex-col">
          <div className="space-y-2 shrink-0">
            <h3 className="font-bold text-[15px] text-text-primary">Curriculum Lessons</h3>
            <input
              type="text"
              placeholder="🔍 Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-primary-light rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredLessons.length === 0 ? (
              <div className="text-center py-8 text-xs text-text-secondary italic bg-white rounded-xl p-4 border border-dashed border-primary-light/60">
                No lessons found matching "{searchTerm}"
              </div>
            ) : (
              filteredLessons.map((lesson) => {
                const objectivesCount = lesson.objectives?.length || 0;
                const isSelected = lesson.id === selectedLessonId;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center ${
                      isSelected
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "bg-white border-primary-light hover:border-primary/60 text-text-primary"
                    }`}
                  >
                    <div className="space-y-1 pr-3">
                      <p className="text-[13px] font-bold leading-tight line-clamp-1">
                        {lesson.title}
                      </p>
                      <p
                        className={`text-[11px] font-medium ${
                          isSelected ? "text-white/80" : "text-text-secondary"
                        }`}
                      >
                        {lesson.activities?.length || 0} activities • Status: {lesson.status || "Draft"}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border shrink-0 ${
                        objectivesCount > 0
                          ? isSelected
                            ? "bg-white/20 border-white/30 text-white"
                            : "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : isSelected
                            ? "bg-white/10 border-white/20 text-white/90"
                            : "bg-amber-50 border-amber-100 text-amber-700"
                      }`}
                    >
                      {objectivesCount} objective{objectivesCount !== 1 ? "s" : ""}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Selected Lesson Editor or General Metrics */}
        <div className="lg:col-span-7 bg-white border border-primary-light rounded-2xl p-6 h-[calc(100vh-280px)] overflow-y-auto">
          {selectedLesson ? (
            <div className="space-y-6">
              {/* Selected Lesson Info Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary-light/10 border border-primary-light/40 rounded-2xl p-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-dark">
                    Active Lesson
                  </span>
                  <h3 className="text-base font-extrabold text-text-primary mt-0.5">
                    {selectedLesson.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Manage pedagogical taxonomy descriptors linked to this lesson.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleEditActivities(selectedLesson)}
                  className="bg-white border-primary-light/60 hover:bg-primary-light/20 text-xs py-1.5 px-3 font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <span>🛠️</span> Edit Activities
                </Button>
              </div>

              {/* Learning Objectives Editor */}
              <div className="border border-primary-light/30 rounded-2xl p-4 bg-white shadow-sm">
                <LessonObjectivesEditor
                  objectives={selectedLesson.objectives || []}
                  onChange={(updatedObjectives) =>
                    updateStandaloneLessonField(selectedLesson.id, "objectives", updatedObjectives)
                  }
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-8">
              <div className="w-16 h-16 bg-primary-light/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl text-primary-dark">🎯</span>
              </div>
              <h3 className="font-extrabold text-[17px] text-text-primary">
                Select a Lesson
              </h3>
              <p className="text-sm text-text-secondary max-w-sm mt-1 mb-8">
                Choose a lesson from the left panel to define, customize, and align its pedagogical learning objectives.
              </p>

              {/* Statistics & Guidance Bento Box */}
              <div className="w-full max-w-md bg-neutral-bg border border-primary-light/40 rounded-2xl p-4 text-left space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary border-b border-primary-light/40 pb-1.5">
                  Objectives Distribution
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-text-primary">
                  <div className="space-y-1">
                    <span className="text-text-secondary">Average / Lesson:</span>
                    <span className="block text-sm font-bold text-primary-dark">
                      {stats.averageObjectives} objectives
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-text-secondary">Unconfigured:</span>
                    <span className="block text-sm font-bold text-amber-700">
                      {stats.totalLessons - stats.lessonsWithObjectives} lessons
                    </span>
                  </div>
                </div>

                {Object.keys(stats.levelCounts).length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] text-text-secondary font-bold block mb-1">
                      CEFR Competency Breakdown:
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(stats.levelCounts).map(([lvl, count]) => (
                        <span
                          key={lvl}
                          className="bg-white border border-primary-light px-2 py-0.5 rounded text-[10px] font-bold text-text-primary uppercase"
                        >
                          {lvl}: <strong className="text-primary-dark">{count}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
