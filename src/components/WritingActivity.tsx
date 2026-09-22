import React, { useState, useMemo } from "react";
import { WritingConfig } from "../types";
import { Button } from "./Button";
import { useStore } from "../store/useStore";
import { 
  FileText, CheckCircle2, Sparkles, AlertCircle, 
  HelpCircle, CheckSquare, RefreshCw, Send, Image as ImageIcon,
  BookOpen, Eye, ArrowRight
} from "lucide-react";

interface WritingActivityProps {
  config: WritingConfig | any;
  onComplete: () => void;
}

export function WritingActivity({ config, onComplete }: WritingActivityProps) {
  const promptText = config.writingPrompt || config.prompt || "Write a short paragraph responding to the prompt.";
  const title = config.writingTitle || config.title || "Writing Activity";
  const instructions = config.writingInstructions || config.instructions || "";
  const starterText = config.writingStarterText || config.starterText || "";
  const minWords = config.minWords ?? 20;
  const maxWords = config.maxWords ?? 0;
  const imageUrl = config.imageUrl || config.writingImageUrl || "";
  const sampleAnswer = config.sampleAnswer || "";
  const allowAiFeedback = config.allowAiFeedback !== false;

  const requiredKeywords: string[] = useMemo(() => {
    if (Array.isArray(config.requiredKeywords)) return config.requiredKeywords;
    if (typeof config.requiredKeywords === "string") {
      return config.requiredKeywords.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  }, [config.requiredKeywords]);

  const evaluationCriteria: string[] = useMemo(() => {
    if (Array.isArray(config.evaluationCriteria)) return config.evaluationCriteria;
    return [];
  }, [config.evaluationCriteria]);

  // State
  const [text, setText] = useState("");
  const [checkedRubrics, setCheckedRubrics] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Compute Word Count & Keyword usage
  const wordCount = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }, [text]);

  const charCount = text.length;

  // Check keyword matches in user text (case-insensitive)
  const keywordMatches = useMemo(() => {
    const lowerText = text.toLowerCase();
    const result: Record<string, boolean> = {};
    requiredKeywords.forEach((kw) => {
      if (!kw) return;
      const lowerKw = kw.toLowerCase();
      result[kw] = lowerText.includes(lowerKw);
    });
    return result;
  }, [text, requiredKeywords]);

  const matchedKeywordsCount = useMemo(() => {
    return Object.values(keywordMatches).filter(Boolean).length;
  }, [keywordMatches]);

  // Progress percentage towards minWords
  const progressPercent = useMemo(() => {
    if (minWords <= 0) return 100;
    return Math.min(100, Math.round((wordCount / minWords) * 100));
  }, [wordCount, minWords]);

  const handleToggleRubric = (index: number) => {
    setCheckedRubrics((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleInsertStarterText = () => {
    if (starterText && !text.includes(starterText)) {
      setText((prev) => (prev ? `${starterText} ${prev}` : starterText));
    }
  };

  const handleSubmit = async () => {
    if (minWords > 0 && wordCount < minWords) {
      setValidationError(`Please write at least ${minWords} words before submitting (currently ${wordCount} words).`);
      return;
    }
    setValidationError(null);
    setSubmitted(true);

    let calculatedAiReport = null;
    if (allowAiFeedback) {
      setIsGrading(true);
      try {
        const response = await fetch("/api/grade-writing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            writingPrompt: promptText,
            writingInstructions: instructions,
            studentText: text,
            minWords,
            requiredKeywords,
            sampleAnswer,
            evaluationCriteria,
          }),
        });

        if (response.ok) {
          calculatedAiReport = await response.json();
          setAiReport(calculatedAiReport);
        }
      } catch (err) {
        console.error("AI writing grading error:", err);
      } finally {
        setIsGrading(false);
      }
    }

    // Save submission to studentHistory for teacher dashboard tracking
    try {
      const activeStudentId = localStorage.getItem("active_student_id") || "student_1";
      const curHistory = useStore.getState().studentHistory || [];
      const newRecord = {
        id: `write_${Date.now()}`,
        studentId: activeStudentId,
        type: "writing_submission",
        activityTitle: title,
        prompt: promptText,
        studentText: text,
        wordCount,
        score: calculatedAiReport?.score ?? 85,
        writingReport: calculatedAiReport || null,
        timestamp: new Date().toISOString(),
      };
      useStore.getState().setStudentHistory([newRecord, ...curHistory]);
    } catch {
      // ignore
    }
  };

  // Fallback heuristic score if AI is not available
  const feedbackScore = useMemo(() => {
    if (aiReport && typeof aiReport.score === "number") {
      return aiReport.score;
    }
    let score = 75;
    if (minWords > 0 && wordCount >= minWords) score += 15;
    if (requiredKeywords.length > 0) {
      const kwRatio = matchedKeywordsCount / requiredKeywords.length;
      score += Math.round(kwRatio * 10);
    }
    return Math.min(100, score);
  }, [aiReport, wordCount, minWords, requiredKeywords, matchedKeywordsCount]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 font-['Nunito']">
      {/* Activity Card */}
      <div className="bg-white rounded-[24px] border border-primary-light p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary-light/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold">
              ✍️
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                Writing Exercise
              </span>
              <h2 className="text-xl font-black text-slate-800 mt-0.5">{title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Target: {minWords > 0 ? `Min. ${minWords} words` : "Free length"}
            </span>
          </div>
        </div>

        {/* Prompt & Guidelines Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-primary" /> Prompt Question / Topic
          </h3>
          <p className="text-sm font-bold text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
            {promptText}
          </p>

          {instructions && (
            <div className="text-xs font-semibold text-slate-600 space-y-1">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Instructions & Guidelines:
              </span>
              <p className="whitespace-pre-line leading-relaxed">{instructions}</p>
            </div>
          )}

          {/* Optional Image Stimulus */}
          {imageUrl && (
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 max-h-64 flex justify-center bg-black/5">
              <img src={imageUrl} alt="Writing Stimulus" className="object-contain max-h-64 w-full" />
            </div>
          )}
        </div>

        {/* Target Vocabulary / Required Keywords Badges */}
        {requiredKeywords.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-700">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <BookOpen size={14} className="text-primary" /> Recommended Vocabulary ({matchedKeywordsCount}/{requiredKeywords.length})
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Include these in your writing
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {requiredKeywords.map((kw, i) => {
                const isUsed = keywordMatches[kw];
                return (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border transition-all ${
                      isUsed
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    <span>{isUsed ? "✓" : "○"}</span>
                    <span>{kw}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Sentence Starter Button */}
        {starterText && !submitted && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleInsertStarterText}
              className="text-xs font-bold text-primary hover:text-primary-dark bg-primary-light/20 hover:bg-primary-light/40 px-3 py-1.5 rounded-xl border border-primary-light/50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} /> Insert Sentence Starter
            </button>
          </div>
        )}

        {/* Textarea & Live Meter */}
        <div className="space-y-2">
          <div className="relative">
            <textarea
              disabled={submitted}
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your response here..."
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-primary rounded-2xl p-4 text-sm font-medium text-slate-800 leading-relaxed outline-none transition-all disabled:bg-slate-100 disabled:text-slate-600 resize-y"
            />
          </div>

          {/* Meter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500 px-1">
            <div className="flex items-center gap-3">
              <span>
                Words: <strong className={wordCount >= minWords ? "text-emerald-600 font-extrabold" : "text-amber-600 font-extrabold"}>{wordCount}</strong>
                {minWords > 0 && ` / ${minWords} min`}
              </span>
              <span className="text-slate-300">|</span>
              <span>Characters: {charCount}</span>
            </div>

            {/* Visual Progress Bar */}
            {minWords > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      progressPercent >= 100 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-black">{progressPercent}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Validation Error Toast */}
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Self-Check Rubric Checklist */}
        {evaluationCriteria.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CheckSquare size={14} className="text-emerald-600" /> Self-Assessment Checklist
            </h4>
            <div className="space-y-1.5">
              {evaluationCriteria.map((criterion, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    checkedRubrics[idx] ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={submitted}
                    checked={!!checkedRubrics[idx]}
                    onChange={() => handleToggleRubric(idx)}
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                  <span>{criterion}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Submit Action or Loading or Feedback */}
        {!submitted ? (
          <div className="pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={16} /> Submit Writing
            </Button>
          </div>
        ) : isGrading ? (
          /* Loading AI Evaluation state */
          <div className="p-8 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-center space-y-3 animate-pulse">
            <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-md animate-spin">
              <RefreshCw size={24} />
            </div>
            <h4 className="text-base font-black text-amber-950">AI Teacher is evaluating your writing...</h4>
            <p className="text-xs font-semibold text-amber-800">
              Analyzing grammar, vocabulary, topic relevance, and rubric criteria...
            </p>
          </div>
        ) : (
          /* Submission Feedback & AI Results Card */
          <div className="space-y-6 pt-4 border-t border-slate-200 animate-in fade-in duration-300">
            {/* Header Result */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl font-black shadow-sm">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-950">Writing Submitted & Evaluated!</h3>
                  <p className="text-xs font-semibold text-emerald-700">
                    Word count: {wordCount} words • Keywords used: {matchedKeywordsCount}/{requiredKeywords.length}
                  </p>
                </div>
              </div>

              <div className="text-right bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">AI Score</span>
                <span className={`text-2xl font-black ${
                  feedbackScore >= 80 ? "text-emerald-600" : feedbackScore >= 60 ? "text-amber-600" : "text-purple-600"
                }`}>
                  {feedbackScore}/100
                </span>
              </div>
            </div>

            {/* AI Report Breakdown */}
            {aiReport ? (
              <div className="space-y-4">
                {/* 1. Summary & General Feedback */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                    <Sparkles size={16} className="text-amber-600" /> Teacher Feedback Summary
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-amber-200/60">
                    {aiReport.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* Strengths */}
                    {aiReport.strengths?.length > 0 && (
                      <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl space-y-2">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-600" /> Key Strengths
                        </span>
                        <ul className="space-y-1 text-xs font-bold text-emerald-950">
                          {aiReport.strengths.map((str: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-500">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Areas for Improvement */}
                    {aiReport.areasForImprovement?.length > 0 && (
                      <div className="bg-amber-100/60 border border-amber-200 p-3.5 rounded-xl space-y-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                          <AlertCircle size={14} className="text-amber-600" /> Areas to Improve
                        </span>
                        <ul className="space-y-1 text-xs font-bold text-amber-950">
                          {aiReport.areasForImprovement.map((area: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-500">•</span>
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Detailed Line-by-Line Corrections */}
                {aiReport.corrections && aiReport.corrections.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FileText size={15} className="text-primary" /> Grammar & Style Corrections ({aiReport.corrections.length})
                    </h4>
                    <div className="space-y-2.5">
                      {aiReport.corrections.map((corr: any, idx: number) => (
                        <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                            <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-md line-through">
                              {corr.original}
                            </span>
                            <span className="text-slate-400">➔</span>
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-extrabold">
                              {corr.corrected}
                            </span>
                          </div>
                          {corr.explanation && (
                            <p className="text-[11px] font-semibold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              💡 {corr.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. AI Improved Version */}
                {aiReport.improvedVersion && (
                  <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-blue-600" /> Polished / Improved Version
                    </h4>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-blue-200/60 whitespace-pre-line">
                      {aiReport.improvedVersion}
                    </p>
                  </div>
                )}
              </div>
            ) : allowAiFeedback ? (
              /* Basic AI Feedback Card fallback */
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles size={16} className="text-amber-600" /> Automated Assessment
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-700 leading-relaxed">
                  <p className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Word Count Target:</strong> Great work reaching {wordCount} words!</span>
                  </p>
                  {requiredKeywords.length > 0 && (
                    <p className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Vocabulary Usage:</strong> You incorporated {matchedKeywordsCount} of {requiredKeywords.length} required keywords.
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {/* Model Answer Toggle */}
            {sampleAnswer && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="text-xs font-black text-primary hover:text-primary-dark flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye size={14} /> {showModelAnswer ? "Hide Model Answer" : "View Model Reference Answer"}
                </button>

                {showModelAnswer && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 leading-relaxed animate-in fade-in">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">
                      Model / Sample Answer:
                    </span>
                    <p className="whitespace-pre-line">{sampleAnswer}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setAiReport(null);
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} /> Edit & Re-submit
              </button>
              <Button
                onClick={onComplete}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue to Next Activity <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
