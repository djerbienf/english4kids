import React, { useState, useMemo, useEffect } from "react";
import { useStore } from "../../store/useStore";
import { Button } from "../Button";
import { 
  getStudentCompetencies, 
  saveStudentCompetencies, 
  getStudentRemediations, 
  saveStudentRemediations,
  SPIRAL_CONFIG 
} from "../../utils/spiralEngine";
import { StudentCompetency, StudentRemediation } from "../../types";
import { 
  Brain, 
  Settings, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Sliders, 
  Layers, 
  BookOpen, 
  Check, 
  User, 
  Trophy, 
  ShieldAlert 
} from "lucide-react";

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Listening Comprehension": return "🎧";
    case "Reading Comprehension": return "📖";
    case "Speaking & Oral Interaction": return "🗣️";
    case "Writing & Written Production": return "✍️";
    case "Vocabulary":
    case "Vocabulary & Semantics": return "📚";
    case "Grammar":
    case "Grammar & Syntax": return "⚙️";
    case "Pronunciation":
    case "Phonetics & Pronunciation": return "🗣️";
    case "Functional Language":
    case "Pragmatic & Cultural Competence": return "💬";
    default: return "🎯";
  }
};

export function SpiralTab() {
  const studentsList = useStore((state) => state.studentsList);
  const courseData = useStore((state) => state.courseData);
  const lessonsList = useStore((state) => state.lessonsList);
  
  // States
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [activeSubTab, setActiveSubTab] = useState<"remediations" | "map" | "config">("remediations");
  
  // Configuration thresholds states
  const [thresholdAcquisition, setThresholdAcquisition] = useState(SPIRAL_CONFIG.seuil_acquisition);
  const [thresholdFaible, setThresholdFaible] = useState(SPIRAL_CONFIG.seuil_faible);
  const [recallRatio, setRecallRatio] = useState(SPIRAL_CONFIG.recall_ratio);
  const [aiAutonomy, setAiAutonomy] = useState<"manual" | "auto">("manual");
  const [configSaved, setConfigSaved] = useState(false);

  // Load the first student by default
  useEffect(() => {
    if (studentsList.length > 0 && !selectedStudentId) {
      setSelectedStudentId(studentsList[0].id);
    }
  }, [studentsList, selectedStudentId]);

  // Load selected student's spiral data
  const { competencies, remediations } = useMemo(() => {
    if (!selectedStudentId) return { competencies: [], remediations: [] };
    return {
      competencies: getStudentCompetencies(selectedStudentId),
      remediations: getStudentRemediations(selectedStudentId),
    };
  }, [selectedStudentId, studentsList]);

  // Handle remediation approval
  const handleApproveRemediation = (remId: string) => {
    if (!selectedStudentId) return;
    const currentRems = getStudentRemediations(selectedStudentId);
    const updated = currentRems.map((r) => {
      if (r.id === remId) {
        return { ...r, status: "approved" as const, approvedAt: new Date().toISOString() };
      }
      return r;
    });
    saveStudentRemediations(selectedStudentId, updated);
    // Force re-evaluation by refreshing selectedStudentId trigger
    setSelectedStudentId(selectedStudentId);
  };

  // Handle remediation decline
  const handleDeclineRemediation = (remId: string) => {
    if (!selectedStudentId) return;
    const currentRems = getStudentRemediations(selectedStudentId);
    const updated = currentRems.filter((r) => r.id !== remId);
    saveStudentRemediations(selectedStudentId, updated);
    setSelectedStudentId(selectedStudentId);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    SPIRAL_CONFIG.seuil_acquisition = thresholdAcquisition;
    SPIRAL_CONFIG.seuil_faible = thresholdFaible;
    SPIRAL_CONFIG.recall_ratio = recallRatio;
    SPIRAL_CONFIG.new_ratio = 1 - recallRatio;
    
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  // List of all curriculum competencies to map
  const allCurriculumObjectives = useMemo(() => {
    const list: any[] = [];
    courseData.forEach((unit) => {
      const lessons = unit.lessonIds && unit.lessonIds.length > 0
        ? unit.lessonIds.map((id: string) => lessonsList.find(l => l.id === id)).filter(Boolean)
        : (unit.lessons || []);
        
      lessons.forEach((lesson: any) => {
        const objectives = lesson.objectives || [];
        objectives.forEach((obj: any) => {
          if (!list.some(o => o.text.toLowerCase() === obj.text.toLowerCase())) {
            list.push({ ...obj, lessonTitle: lesson.title });
          }
        });
      });
    });
    return list;
  }, [courseData, lessonsList]);

  const selectedStudent = studentsList.find((s) => s.id === selectedStudentId);

  return (
    <div className="space-y-6 font-['Nunito'] text-text-primary">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#534AB7] to-[#7165E3] text-white p-6 rounded-[24px] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌀</span>
            <span className="text-xs font-black uppercase tracking-widest text-primary-light bg-white/10 px-2.5 py-0.5 rounded-full">
              AI-Powered Spiral Pedagogy
            </span>
          </div>
          <h2 className="text-[26px] font-black tracking-tight">Adaptive Spiral Portal</h2>
          <p className="text-sm font-medium text-white/80 max-w-2xl leading-relaxed">
            Supervise the automatic spiral routes, monitor competency mastery over time, validate AI-proposed remediations, and configure decision thresholds.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-white/15 px-4 py-2.5 rounded-2xl border border-white/10">
          <Brain size={20} className="text-primary-light animate-pulse" />
          <div className="text-right">
            <span className="block text-[10px] font-black uppercase tracking-widest text-white/60">Algorithm Status</span>
            <span className="text-xs font-black">SPACING ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left pane: Student Selector */}
        <div className="lg:col-span-1 bg-white border border-primary-light/80 p-5 rounded-[20px] shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <User size={14} /> Active Students
          </h3>
          <div className="space-y-1.5">
            {studentsList.map((student) => {
              const isSelected = student.id === selectedStudentId;
              const studentRems = getStudentRemediations(student.id).filter(r => r.status === "pending");
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all duration-150 ${
                    isSelected 
                      ? "bg-primary/10 border-primary text-primary-dark font-extrabold pl-4" 
                      : "bg-card-bg border-primary-light/50 text-text-secondary hover:bg-neutral-bg hover:border-primary/30"
                  }`}
                >
                  <span className="truncate">{student.name}</span>
                  {studentRems.length > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-black h-5 px-1.5 rounded-full flex items-center justify-center animate-bounce">
                      {studentRems.length} rem
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right pane: Core Work Area */}
        <div className="lg:col-span-3 space-y-5">
          {/* Sub tabs selector */}
          <div className="flex border-b border-primary-light/40">
            <button
              onClick={() => setActiveSubTab("remediations")}
              className={`pb-3 px-5 text-sm font-black transition-all flex items-center gap-2 border-b-2 ${
                activeSubTab === "remediations" 
                  ? "border-primary text-primary-dark font-black" 
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Sparkles size={16} /> Remediations Queue ({remediations.filter(r => r.status === "pending").length})
            </button>
            <button
              onClick={() => setActiveSubTab("map")}
              className={`pb-3 px-5 text-sm font-black transition-all flex items-center gap-2 border-b-2 ${
                activeSubTab === "map" 
                  ? "border-primary text-primary-dark font-black" 
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Layers size={16} /> Competency Spiral Map
            </button>
            <button
              onClick={() => setActiveSubTab("config")}
              className={`pb-3 px-5 text-sm font-black transition-all flex items-center gap-2 border-b-2 ${
                activeSubTab === "config" 
                  ? "border-primary text-primary-dark font-black" 
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Sliders size={16} /> Engine Configuration
            </button>
          </div>

          {/* TAB 1: REMEDIATIONS QUEUE */}
          {activeSubTab === "remediations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-primary-dark flex items-center gap-1.5">
                    AI Remediation Proposals
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Mini-modules generated automatically by the AI when a student suffers a regression or demonstrates high fragility.
                  </p>
                </div>
              </div>

              {remediations.filter(r => r.status === "pending").length === 0 ? (
                <div className="bg-white border border-primary-light/50 p-8 rounded-2xl text-center space-y-2">
                  <span className="text-3xl block">🎉</span>
                  <h4 className="font-bold text-sm text-primary-dark">Remediation Queue Clean!</h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    {selectedStudent ? selectedStudent.name : "This student"} has no pending remediation actions. Their spiral memory holds strong!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {remediations.filter(r => r.status === "pending").map((rem) => (
                    <div key={rem.id} className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-bg pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-rose-50 text-rose-700 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md border border-rose-100">
                              AI Warning
                            </span>
                            <span className="text-[11px] text-text-secondary font-semibold">
                              Proposed {new Date(rem.proposedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-primary-dark mt-1">
                            Regression detected in: <strong className="text-rose-800">"{rem.competencyText}"</strong>
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 font-bold px-3 py-1.5"
                            onClick={() => handleApproveRemediation(rem.id)}
                          >
                            <Check size={14} /> Approve Module
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-text-secondary hover:text-red-600 hover:bg-red-50 font-bold px-2.5 py-1.5"
                            onClick={() => handleDeclineRemediation(rem.id)}
                          >
                            <X size={14} /> Decline
                          </Button>
                        </div>
                      </div>

                      {/* Remediation activities preview */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                          AI Proposed Remediation Content:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {rem.activities.map((act: any, idx: number) => (
                            <div key={act.id || idx} className="bg-neutral-bg/40 border border-primary-light/30 p-3.5 rounded-xl space-y-1 text-xs">
                              <span className="font-black text-primary-dark uppercase text-[9px] block">
                                Activity {idx + 1}: {act.type.toUpperCase()}
                              </span>
                              <p className="font-bold text-text-primary line-clamp-1">
                                {act.readingTitle || act.question || "Remediation content"}
                              </p>
                              <p className="text-text-secondary leading-normal text-[11px] line-clamp-2">
                                {act.readingSlides ? act.readingSlides[0].text : act.options?.join(" | ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* History of Completed Remediations */}
              {remediations.filter(r => r.status !== "pending").length > 0 && (
                <div className="space-y-2 pt-4 border-t border-primary-light/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-text-secondary">
                    Remediation Log history
                  </h4>
                  <div className="bg-white border border-primary-light/50 rounded-2xl p-4 divide-y divide-neutral-bg text-xs">
                    {remediations.filter(r => r.status !== "pending").map((rem) => (
                      <div key={rem.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-primary-dark">"{rem.competencyText}"</p>
                          <span className="text-[10px] text-text-secondary font-semibold">
                            Proposed: {new Date(rem.proposedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          rem.status === "approved" ? "bg-green-50 text-green-700 border border-green-100" : "bg-neutral-bg text-text-secondary"
                        }`}>
                          {rem.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPETENCY SPIRAL MAP */}
          {activeSubTab === "map" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-primary-dark">
                    Competency Alignment & Spacing Grid
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Real-time map showing the mastery levels and spacing scores of each pedagogical objective for {selectedStudent ? selectedStudent.name : "the student"}.
                  </p>
                </div>
              </div>

              {allCurriculumObjectives.length === 0 ? (
                <div className="bg-white border border-primary-light/50 p-8 rounded-2xl text-center text-xs text-text-secondary">
                  No pedagogical learning objectives configured in your syllabus yet! Add objectives inside the **Course Builder** or **Pedagogical Objectives** tab.
                </div>
              ) : (
                <div className="bg-white border border-primary-light/80 p-6 rounded-[24px] shadow-sm space-y-6">
                  {/* Color code Legend */}
                  <div className="flex flex-wrap items-center gap-4 border-b border-primary-light/30 pb-4 text-xs font-bold text-text-secondary">
                    <span className="text-[10px] uppercase tracking-widest block w-full sm:w-auto mb-1 sm:mb-0">Legend:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-emerald-500" />
                      <span>Mastered (Acquise) &gt;= {Math.round(thresholdAcquisition * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-amber-400" />
                      <span>Consolidating (En consolidation)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-rose-500 animate-pulse" />
                      <span>Fragile &lt; {Math.round(thresholdFaible * 100)}% / Regression</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-gray-100 border border-primary-light/40" />
                      <span>Not seen / Locked</span>
                    </div>
                  </div>

                  {/* Competencies Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allCurriculumObjectives.map((obj) => {
                      const studentComp = competencies.find(c => c.competency.toLowerCase() === obj.text.toLowerCase());
                      
                      let cardStyle = "border-primary-light bg-card-bg/30 text-text-secondary";
                      let badgeColor = "bg-gray-100 text-text-secondary border-primary-light/40";
                      
                      if (studentComp) {
                        if (studentComp.status === "acquise") {
                          cardStyle = "border-emerald-200 bg-emerald-50/20 text-emerald-900";
                          badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                        } else if (studentComp.status === "en_consolidation") {
                          cardStyle = "border-amber-200 bg-amber-50/20 text-amber-900";
                          badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                        } else {
                          cardStyle = "border-rose-200 bg-rose-50/20 text-rose-900";
                          badgeColor = "bg-rose-50 text-rose-800 border-rose-200";
                        }
                      }

                      return (
                        <div key={obj.id} className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${cardStyle}`}>
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-base">{getCategoryIcon(obj.category)}</span>
                              <span className={`text-[8px] font-black uppercase border px-1 rounded ${badgeColor}`}>
                                {obj.level} - {obj.category}
                              </span>
                            </div>
                            <h5 className="font-extrabold text-xs mt-2 line-clamp-2">
                              {obj.text}
                            </h5>
                          </div>

                          <div className="border-t border-current/10 pt-2.5 mt-3 flex items-center justify-between text-[10px] font-bold">
                            <span className="opacity-80">Lesson: {obj.lessonTitle || "General"}</span>
                            {studentComp ? (
                              <span className="font-black">
                                Score: {Math.round(studentComp.masteryScore * 100)}%
                              </span>
                            ) : (
                              <span className="opacity-60 italic font-semibold">Locked</span>
                            )}
                          </div>

                          {/* Render history steps if present */}
                          {studentComp && studentComp.history.length > 0 && (
                            <div className="mt-2 text-[9px] font-semibold flex items-center gap-1 opacity-70">
                              <span>Passed:</span>
                              <div className="flex items-center gap-1">
                                {studentComp.history.map((h, i) => (
                                  <span key={i} className="bg-white/50 border px-1 rounded" title={`Tested at step ${h.step}`}>
                                    {Math.round(h.score * 100)}%
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ENGINE CONFIGURATION */}
          {activeSubTab === "config" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-primary-dark">
                  Spiral Decision Thresholds
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Tune the underlying scoring thresholds and AI generation parameters driving the adaptive English learning paths.
                </p>
              </div>

              <form onSubmit={handleSaveConfig} className="bg-white border border-primary-light/80 p-6 rounded-[24px] shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Seuil d'acquisition */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-primary-dark flex items-center justify-between">
                      <span>Acquisition Threshold (Seuil d'acquisition)</span>
                      <span className="text-primary-dark font-black">{Math.round(thresholdAcquisition * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.60"
                      max="0.95"
                      step="0.05"
                      value={thresholdAcquisition}
                      onChange={(e) => setThresholdAcquisition(parseFloat(e.target.value))}
                      className="w-full accent-[#534AB7] cursor-pointer"
                    />
                    <span className="block text-[11px] text-text-secondary font-medium">
                      Minimum score needed to declare a competency **Mastered (Acquise)** and reduce its frequency in future spiral tests.
                    </span>
                  </div>

                  {/* Seuil faible */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-primary-dark flex items-center justify-between">
                      <span>Fragility Threshold (Seuil faible)</span>
                      <span className="text-primary-dark font-black">{Math.round(thresholdFaible * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.30"
                      max="0.70"
                      step="0.05"
                      value={thresholdFaible}
                      onChange={(e) => setThresholdFaible(parseFloat(e.target.value))}
                      className="w-full accent-[#534AB7] cursor-pointer"
                    />
                    <span className="block text-[11px] text-text-secondary font-medium">
                      Any score below this will flag the competency as **Fragile** and instantly request a remediation.
                    </span>
                  </div>

                  {/* Ratio Recall / Spacing */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-primary-dark flex items-center justify-between">
                      <span>Recall items weight (Proportion rappel)</span>
                      <span className="text-primary-dark font-black">{Math.round(recallRatio * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.20"
                      max="0.50"
                      step="0.05"
                      value={recallRatio}
                      onChange={(e) => setRecallRatio(parseFloat(e.target.value))}
                      className="w-full accent-[#534AB7] cursor-pointer"
                    />
                    <span className="block text-[11px] text-text-secondary font-medium">
                      Proportion of test questions that query old competencies (Recall) vs new competencies of the current lesson (65%).
                    </span>
                  </div>

                  {/* AI Autonomy */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-primary-dark">
                      AI Autonomy & Supervision
                    </label>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setAiAutonomy("manual")}
                        className={`p-3 border text-xs font-bold rounded-xl text-center transition-all ${
                          aiAutonomy === "manual" 
                            ? "bg-primary/10 border-primary text-primary-dark font-black" 
                            : "bg-card-bg border-primary-light/50 text-text-secondary"
                        }`}
                      >
                        Supervised (Propose)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiAutonomy("auto")}
                        className={`p-3 border text-xs font-bold rounded-xl text-center transition-all ${
                          aiAutonomy === "auto" 
                            ? "bg-primary/10 border-primary text-primary-dark font-black" 
                            : "bg-card-bg border-primary-light/50 text-text-secondary"
                        }`}
                      >
                        Autonomous (Inject)
                      </button>
                    </div>
                    <span className="block text-[11px] text-text-secondary font-medium pt-1">
                      **Supervised**: AI proposes remediation modules which remain locked until you click Approve. \n**Autonomous**: AI silently injects remediations.
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-primary-light/40">
                  {configSaved && (
                    <span className="text-green-600 font-extrabold text-xs flex items-center gap-1 animate-bounce">
                      <CheckCircle2 size={14} /> Decision thresholds saved successfully!
                    </span>
                  )}
                  <Button type="submit" className="ml-auto px-5 py-2">
                    Save Configuration
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
