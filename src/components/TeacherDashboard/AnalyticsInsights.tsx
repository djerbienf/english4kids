import React from "react";
import { TrendingUp, Award, Brain, Target, CheckCircle2, Zap } from "lucide-react";
import { calculateRetentionRate, getSRSStats } from "../../utils/srs";

interface AnalyticsInsightsProps {
  studentId: string;
  studentHistory: any[];
  courseData: any[];
}

export function AnalyticsInsights({
  studentId,
  studentHistory,
  courseData,
}: AnalyticsInsightsProps) {
  const history = studentHistory.filter((h) => h.studentId === studentId);
  const srsStats = getSRSStats(studentId);
  const retention = calculateRetentionRate(studentId);

  // Group finished lessons
  const finishedLessons = history.filter((h) => h.type === "lesson_finish");
  const writingSubmissions = history.filter((h) => h.type === "writing_submission");

  const srsStageData = [
    { name: "Mastered (SRS 4+)", count: srsStats.mastery || 0, color: "bg-emerald-500", text: "text-emerald-700" },
    { name: "In Progress (SRS 1-3)", count: srsStats.learning || 0, color: "bg-blue-500", text: "text-blue-700" },
    { 
      name: "New / Review", 
      count: Math.max(0, srsStats.total - (srsStats.mastery || 0) - (srsStats.learning || 0)), 
      color: "bg-amber-500", 
      text: "text-amber-700" 
    },
  ];

  const totalWords = srsStats.total || 0;

  return (
    <div className="space-y-6 font-['Nunito']">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" /> Learning Analytics & Retention Diagnostic
        </h4>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Lessons Finished
            </span>
            <span className="text-lg font-black text-slate-800">
              {finishedLessons.length}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Brain size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Retention Rate
            </span>
            <span className={`text-lg font-black ${retention >= 80 ? 'text-emerald-600' : retention >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
              {totalWords === 0 ? "N/A" : `${retention}%`}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Target size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Vocabulary Words
            </span>
            <span className="text-lg font-black text-slate-800">
              {totalWords} terms
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Zap size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Writing Submissions
            </span>
            <span className="text-lg font-black text-slate-800">
              {writingSubmissions.length}
            </span>
          </div>
        </div>
      </div>

      {/* SRS Mastery Distribution Visualizer */}
      {totalWords > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Brain size={14} className="text-primary" /> Spaced Repetition (SRS) Mastery Distribution
            </span>
            <span className="text-xs text-slate-400 font-semibold">{totalWords} words in deck</span>
          </div>

          {/* Progress Stack Bar */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {srsStageData.map((stage, idx) => {
              const pct = totalWords > 0 ? (stage.count / totalWords) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={idx}
                  style={{ width: `${pct}%` }}
                  className={`${stage.color} h-full transition-all`}
                  title={`${stage.name}: ${stage.count} words (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {srsStageData.map((stage, idx) => {
              const pct = totalWords > 0 ? Math.round((stage.count / totalWords) * 100) : 0;
              return (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="text-xs font-bold text-slate-700">{stage.name}</span>
                  </div>
                  <span className={`text-xs font-black ${stage.text}`}>
                    {stage.count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
