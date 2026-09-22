import React, { memo } from "react";

export const OverviewTab = memo(function OverviewTab({
  courseData,
  lessonsList,
  dictionaryWords,
  onNavigate,
}: {
  courseData: any[];
  lessonsList: any[];
  dictionaryWords: any[];
  onNavigate: (tab: string) => void;
}) {
  const totalUnits = courseData.length;
  const totalLessons = lessonsList?.length || 0;
  const totalDictionary = dictionaryWords.length;
  const totalStudents = 3; // Mock default students

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-[20px] font-bold text-primary-dark">
          Teacher Overview
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-light/50 to-primary-light/20 p-6 rounded-2xl border border-primary-light shadow-sm text-center">
          <div className="text-[32px] font-bold text-primary-dark mb-1">
            {totalUnits}
          </div>
          <div className="text-text-secondary text-[14px] font-medium uppercase tracking-wider">
            Total Units
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-2xl border border-blue-200 shadow-sm text-center">
          <div className="text-[32px] font-bold text-blue-900 mb-1">
            {totalLessons}
          </div>
          <div className="text-blue-700 text-[14px] font-medium uppercase tracking-wider">
            Total Lessons
          </div>
        </div>
        <div className="bg-gradient-to-br from-success-light to-white p-6 rounded-2xl border border-success/30 shadow-sm text-center">
          <div className="text-[32px] font-bold text-success mb-1">
            {totalStudents}
          </div>
          <div className="text-success text-[14px] font-medium uppercase tracking-wider">
            Active Students
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-white p-6 rounded-2xl border border-purple-200 shadow-sm text-center">
          <div className="text-[32px] font-bold text-purple-900 mb-1">
            {totalDictionary}
          </div>
          <div className="text-purple-700 text-[14px] font-medium uppercase tracking-wider">
            Dictionary Words
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card-bg p-6 rounded-2xl border border-primary-light shadow-sm">
          <h3 className="text-[16px] font-bold text-primary-dark mb-6">
            Recent Activity Highlights
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-success-light text-success flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <div className="font-bold text-[14px] text-text-primary">
                  Mia Wong completed "Food & Drinks"
                </div>
                <div className="text-[12px] text-text-secondary">
                  2 hours ago • Score: 95%
                </div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                !
              </div>
              <div>
                <div className="font-bold text-[14px] text-text-primary">
                  Devon Lane struggled with "Travel" Flashcards
                </div>
                <div className="text-[12px] text-text-secondary">
                  4 hours ago • Score: 60%
                </div>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-light/50 text-primary-dark flex items-center justify-center font-bold">
                ✏️
              </div>
              <div>
                <div className="font-bold text-[14px] text-text-primary">
                  You updated "Introductions" Unit
                </div>
                <div className="text-[12px] text-text-secondary">Yesterday</div>
              </div>
            </li>
          </ul>
        </div>
        <div className="bg-card-bg p-6 rounded-2xl border border-primary-light shadow-sm">
          <h3 className="text-[16px] font-bold text-primary-dark mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate("organization")}
              className="w-full text-left p-4 rounded-xl border border-neutral-light hover:border-primary-light hover:bg-neutral-bg transition-colors flex items-center gap-3"
            >
              <span className="text-primary text-xl">📚</span>
              <span className="font-medium text-text-primary">
                Create a new course unit
              </span>
            </button>
            <button
              onClick={() => onNavigate("tracking")}
              className="w-full text-left p-4 rounded-xl border border-neutral-light hover:border-primary-light hover:bg-neutral-bg transition-colors flex items-center gap-3"
            >
              <span className="text-warning text-xl">👥</span>
              <span className="font-medium text-text-primary">
                Assign courses to students
              </span>
            </button>
            <button
              onClick={() => onNavigate("dictionary")}
              className="w-full text-left p-4 rounded-xl border border-neutral-light hover:border-primary-light hover:bg-neutral-bg transition-colors flex items-center gap-3"
            >
              <span className="text-success text-xl">📖</span>
              <span className="font-medium text-text-primary">
                Add words to global dictionary
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
