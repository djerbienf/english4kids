import React, { useState } from "react";
import { formatRelativeTime } from "../../utils/dateUtils";
import { FileText, Sparkles, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { useStore } from "../../store/useStore";

interface StudentWritingSubmissionsProps {
  selectedTrackingStudent: string;
}

export function StudentWritingSubmissions({
  selectedTrackingStudent,
}: StudentWritingSubmissionsProps) {
  const historyData = useStore((state) => state.studentHistory);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter writing submissions
  const writingSubmissions = historyData
    .filter(
      (h: any) =>
        h.studentId === selectedTrackingStudent &&
        (h.type === "writing_submission" || h.writingReport || h.studentText)
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  if (writingSubmissions.length === 0) {
    return (
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
        <div className="text-2xl">✍️</div>
        <h5 className="font-bold text-slate-800 text-sm">No Writing Submissions Yet</h5>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          When this student completes interactive writing exercises, their full essays, word counts, and AI evaluations will appear here for your review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          Student Writing Submissions & AI Feedback ({writingSubmissions.length})
        </h4>
      </div>

      <div className="space-y-3">
        {writingSubmissions.map((sub: any, idx: number) => {
          const id = sub.id || `sub_${idx}`;
          const isExpanded = expandedId === id;
          const report = sub.writingReport || sub.aiReport || {};
          const score = report.score ?? sub.score ?? 85;

          return (
            <div
              key={id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all"
            >
              {/* Submission Header Row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : id)}
                className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                    ✍️
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-800">
                      {sub.activityTitle || sub.lessonTitle || "Writing Exercise"}
                    </h5>
                    <p className="text-xs text-slate-500">
                      {formatRelativeTime(sub.timestamp)} • {sub.wordCount || (sub.studentText || "").split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                      score >= 80
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : score >= 60
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    Score: {score}/100
                  </span>

                  <button className="text-slate-400 hover:text-slate-600 p-1">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Expanded Detail View */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
                  {/* Prompt */}
                  {sub.prompt && (
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                        Writing Prompt:
                      </span>
                      <p className="font-medium text-slate-800">{sub.prompt}</p>
                    </div>
                  )}

                  {/* Student Essay */}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px] block">
                      Student Submission:
                    </span>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {sub.studentText || sub.text || "No text available"}
                    </div>
                  </div>

                  {/* AI Evaluation Report */}
                  {report && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary-dark uppercase tracking-wider">
                        <Sparkles size={14} className="text-amber-500" /> AI Evaluation Breakdown
                      </div>

                      {/* General Feedback */}
                      {report.generalFeedback && (
                        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 text-xs font-medium text-emerald-950">
                          {report.generalFeedback}
                        </div>
                      )}

                      {/* Strengths & Improvements Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {report.strengths && report.strengths.length > 0 && (
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                            <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                              <CheckCircle size={14} /> Strengths
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                              {report.strengths.map((s: string, i: number) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {report.areasForImprovement && report.areasForImprovement.length > 0 && (
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                            <span className="font-bold text-amber-700 flex items-center gap-1.5">
                              <AlertCircle size={14} /> Suggestions for Improvement
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-slate-700">
                              {report.areasForImprovement.map((a: string, i: number) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Model / Improved Version */}
                      {report.improvedVersion && (
                        <div className="bg-white p-3.5 rounded-xl border border-primary-light space-y-1">
                          <span className="font-bold text-primary-dark text-xs block">
                            ✨ Suggested Polished Version:
                          </span>
                          <p className="text-xs text-slate-700 italic leading-relaxed">
                            "{report.improvedVersion}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
