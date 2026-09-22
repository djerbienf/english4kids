import React, { useState, useMemo } from "react";
import { Lesson, LessonObjective, StudentCompetency, StudentRemediation } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./Button";
import { 
  ArrowRight, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  RefreshCw, 
  ChevronRight, 
  Activity, 
  Award as TrophyIcon 
} from "lucide-react";
import { 
  selectRecallCompetencies, 
  generateSpiralTestQuestions, 
  processSpiralTestResults,
  SPIRAL_CONFIG 
} from "../utils/spiralEngine";

interface SpiralTestRunnerProps {
  studentId: string;
  lesson: Lesson;
  onFinish: (xpEarned: number, recommendedReview: boolean) => void;
  onBack: () => void;
}

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

const getLevelStyle = (level: string) => {
  switch (level) {
    case "A1": return "bg-green-100 text-green-700 border-green-200";
    case "A2": return "bg-blue-100 text-blue-700 border-blue-200";
    case "B1": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "B2": return "bg-orange-100 text-orange-700 border-orange-200";
    case "C1":
    case "C2":
    case "C1/C2": return "bg-purple-100 text-purple-700 border-purple-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export function SpiralTestRunner({ studentId, lesson, onFinish, onBack }: SpiralTestRunnerProps) {
  const [testState, setTestState] = useState<"intro" | "questions" | "results">("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // questionId -> chosenOption
  
  // 1. Select the recall objectives to mix into the test
  const newObjectives = useMemo(() => lesson.objectives || [], [lesson]);
  
  const recallCompetencies = useMemo(() => {
    return selectRecallCompetencies(studentId, newObjectives, lesson.id, 2);
  }, [studentId, newObjectives, lesson.id]);

  const recallObjectives = useMemo<LessonObjective[]>(() => {
    return recallCompetencies.map(rc => ({
      id: rc.id,
      category: rc.category,
      level: rc.level,
      text: rc.competency,
    }));
  }, [recallCompetencies]);

  // 2. Generate the dynamic test questions
  const testQuestions = useMemo(() => {
    return generateSpiralTestQuestions(newObjectives, recallObjectives);
  }, [newObjectives, recallObjectives]);

  // 3. Process the results when the test is finished
  const testResults = useMemo(() => {
    if (testState !== "results") return null;

    // Calculate score per competency text
    const scoresByComp: Record<string, { correct: number; total: number }> = {};
    
    // Initialize all tested competencies
    newObjectives.forEach(o => {
      scoresByComp[o.text] = { correct: 0, total: 0 };
    });
    recallObjectives.forEach(o => {
      scoresByComp[o.text] = { correct: 0, total: 0 };
    });

    // Score questions
    testQuestions.forEach(q => {
      const chosen = userAnswers[q.id];
      const isCorrect = chosen === q.correctAnswer;
      
      if (!scoresByComp[q.competencyText]) {
        scoresByComp[q.competencyText] = { correct: 0, total: 0 };
      }
      
      scoresByComp[q.competencyText].total += 1;
      if (isCorrect) {
        scoresByComp[q.competencyText].correct += 1;
      }
    });

    const finalTestScores: Record<string, number> = {};
    for (const [comp, stats] of Object.entries(scoresByComp)) {
      finalTestScores[comp] = stats.total > 0 ? Number((stats.correct / stats.total).toFixed(2)) : 0;
    }

    // Process through the spiral pedagogy engine
    const { updatedCompetencies, newRemediations } = processSpiralTestResults(
      studentId,
      lesson.id,
      finalTestScores,
      [...newObjectives, ...recallObjectives]
    );

    // Calculate cumulative test score
    const totalQuestions = testQuestions.length;
    const totalCorrect = testQuestions.filter(q => userAnswers[q.id] === q.correctAnswer).length;
    const overallScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Check if the student failed the new objectives (average score < 0.85)
    const newCompScores = newObjectives.map(o => finalTestScores[o.text] ?? 0);
    const avgNewScore = newCompScores.length > 0 ? newCompScores.reduce((a, b) => a + b, 0) / newCompScores.length : 1;
    const recommendedReview = avgNewScore < SPIRAL_CONFIG.seuil_acquisition;

    return {
      overallScore,
      totalCorrect,
      totalQuestions,
      finalTestScores,
      newRemediations,
      recommendedReview,
      updatedCompetencies
    };
  }, [testState, testQuestions, userAnswers, studentId, lesson.id, newObjectives, recallObjectives]);

  const handleSelectOption = (option: string) => {
    if (selectedAnswer !== null) return; // Prevent double select
    setSelectedAnswer(option);
    setUserAnswers(prev => ({ ...prev, [testQuestions[currentQuestionIndex].id]: option }));
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setTestState("results");
    }
  };

  const currentQuestion = testQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center p-4 md:p-6 font-['Nunito'] text-text-primary">
      <AnimatePresence mode="wait">
        
        {/* INTRO SCREEN */}
        {testState === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl bg-white border border-primary-light/80 p-8 rounded-[24px] shadow-sm space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary-light/40 text-primary-dark rounded-full flex items-center justify-center text-3xl mx-auto mb-2 animate-pulse">
                🌀
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-primary">Spiral Pedagogy System</span>
              <h1 className="text-[28px] font-black text-primary-dark">Adaptive Spiral Test</h1>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                Evaluate your immediate skills and reactivate older ones through dynamic spaced repetition to solidfy your memory!
              </p>
            </div>

            {/* Syllabus breakdown */}
            <div className="space-y-4">
              {/* New Content (60-70%) */}
              <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-2xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  🟢 Immediate Evaluation (65% of test)
                </span>
                <div className="space-y-2">
                  {newObjectives.map(o => (
                    <div key={o.id} className="flex items-start gap-2.5">
                      <span className="text-base mt-0.5">{getCategoryIcon(o.category)}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold border px-1 rounded uppercase ${getLevelStyle(o.level)}`}>
                            {o.level}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">
                            {o.category}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-text-primary mt-0.5">
                          {o.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recall Content (30-40%) */}
              {recallObjectives.length > 0 ? (
                <div className="bg-cyan-50/40 border border-cyan-100 p-4 rounded-2xl space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-800 flex items-center gap-1">
                    🌀 Spaced Memory Recall (35% of test)
                  </span>
                  <div className="space-y-2">
                    {recallObjectives.map(o => (
                      <div key={o.id} className="flex items-start gap-2.5">
                        <span className="text-base mt-0.5">{getCategoryIcon(o.category)}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-bold border px-1 rounded uppercase ${getLevelStyle(o.level)}`}>
                              {o.level}
                            </span>
                            <span className="text-[10px] font-bold text-cyan-700 uppercase">
                              {o.category}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-text-primary mt-0.5">
                            {o.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-bg p-4 rounded-2xl border border-primary-light/50 text-center text-xs text-text-secondary">
                  No memory recalls active yet. As you complete more lessons, previous concepts will be spiralled back automatically!
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button onClick={() => setTestState("questions")} className="w-full py-3.5">
                Start Spiral Test! <ArrowRight size={16} />
              </Button>
              <button onClick={onBack} className="text-xs text-text-secondary hover:underline text-center">
                Cancel and return to dashboard
              </button>
            </div>
          </motion.div>
        )}

        {/* QUESTIONS RUNNER */}
        {testState === "questions" && currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-2xl bg-white border border-primary-light/80 p-8 rounded-[24px] shadow-sm space-y-6"
          >
            {/* Top header progress */}
            <div className="flex items-center justify-between border-b border-primary-light/30 pb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{getCategoryIcon(currentQuestion.category)}</span>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${currentQuestion.id.startsWith("recall") ? "text-cyan-700" : "text-emerald-700"}`}>
                    {currentQuestion.id.startsWith("recall") ? "🌀 Memory Recall" : "🟢 New Concept"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold border px-1 rounded uppercase ${getLevelStyle(currentQuestion.level)}`}>
                      {currentQuestion.level}
                    </span>
                    <span className="text-xs font-bold text-text-secondary uppercase">
                      {currentQuestion.category}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-text-secondary">
                Question {currentQuestionIndex + 1} of {testQuestions.length}
              </span>
            </div>

            {/* The Question Text */}
            <div className="space-y-2">
              <h2 className="text-lg md:text-xl font-extrabold text-primary-dark leading-snug">
                {currentQuestion.question}
              </h2>
              {currentQuestion.translationAr && (
                <p className="text-sm font-semibold text-text-secondary/90 text-right font-sans leading-relaxed" dir="rtl">
                  {currentQuestion.translationAr}
                </p>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === currentQuestion.correctAnswer;
                const showExplanation = selectedAnswer !== null;

                let optStyle = "border-primary-light bg-card-bg hover:border-primary/40 hover:shadow-sm";
                if (showExplanation) {
                  if (isCorrect) {
                    optStyle = "border-green-500 bg-green-50 text-green-800 font-bold";
                  } else if (isSelected) {
                    optStyle = "border-red-500 bg-red-50 text-red-800 font-bold";
                  } else {
                    optStyle = "border-primary-light/30 bg-card-bg/40 opacity-60";
                  }
                } else if (isSelected) {
                  optStyle = "border-primary bg-primary-light/30";
                }

                return (
                  <button
                    key={opt}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-semibold transition-all duration-200 flex items-center justify-between ${optStyle}`}
                  >
                    <span>{opt}</span>
                    {showExplanation && isCorrect && <CheckCircle size={16} className="text-green-600 shrink-0 ml-2" />}
                    {showExplanation && isSelected && !isCorrect && <AlertCircle size={16} className="text-red-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation card after submit */}
            {selectedAnswer !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                  selectedAnswer === currentQuestion.correctAnswer 
                    ? "bg-green-50/50 border-green-200/50 text-green-800" 
                    : "bg-red-50/50 border-red-200/50 text-red-800"
                }`}
              >
                <div className="font-extrabold uppercase tracking-wider text-[10px]">
                  {selectedAnswer === currentQuestion.correctAnswer ? "🎉 Correct!" : "💡 Explanation:"}
                </div>
                <p className="font-semibold">{currentQuestion.explanation}</p>
              </motion.div>
            )}

            {/* Action button */}
            <div className="pt-2">
              <Button
                disabled={selectedAnswer === null}
                onClick={handleNextQuestion}
                className="w-full py-3"
              >
                {currentQuestionIndex < testQuestions.length - 1 ? (
                  <>Next Question <ArrowRight size={16} /></>
                ) : (
                  <>Finish Test & View Analysis <CheckCircle size={16} /></>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* DETAILED RESULTS AND AI DIAGNOSTICS */}
        {testState === "results" && testResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl bg-white border border-primary-light/80 p-8 rounded-[24px] shadow-sm space-y-6"
          >
            <div className="text-center space-y-1 border-b border-primary-light/40 pb-5">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-2 border border-amber-200">
                🏆
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-600">Adaptive Spiral Test Complete</span>
              <h1 className="text-[28px] font-black text-primary-dark">AI Diagnostic Breakdown</h1>
              <p className="text-sm text-text-secondary font-semibold">
                You answered <strong className="text-primary-dark">{testResults.totalCorrect}</strong> out of <strong className="text-primary-dark">{testResults.totalQuestions}</strong> questions correctly.
              </p>

              {/* Dynamic Score indicator */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="bg-[#FFF4E0] border border-amber-200 px-6 py-2.5 rounded-full">
                  <span className="block text-[10px] font-black text-amber-800 uppercase tracking-wider">Overall Score</span>
                  <span className="text-2xl font-black text-amber-900">{testResults.overallScore}%</span>
                </div>
                <div className="bg-primary-light/25 border border-primary-light/50 px-6 py-2.5 rounded-full">
                  <span className="block text-[10px] font-black text-primary-dark uppercase tracking-wider">Rewards Earned</span>
                  <span className="text-2xl font-black text-primary-dark">+{lesson.xpReward + 15} XP</span>
                </div>
              </div>
            </div>

            {/* Diagnostic breakdown by competency */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary/90 flex items-center gap-1.5">
                <Activity size={14} /> Pedagogical Competency Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NEW OBJECTIVES SCORES */}
                <div className="bg-emerald-50/20 border border-emerald-100 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <span>🟢</span> Current Step Competencies
                  </h4>
                  <div className="space-y-3">
                    {newObjectives.map((obj) => {
                      const compScore = testResults.finalTestScores[obj.text] ?? 0;
                      const masterComp = testResults.updatedCompetencies.find(c => c.competency.toLowerCase() === obj.text.toLowerCase());
                      const isAcquired = compScore >= SPIRAL_CONFIG.seuil_acquisition;
                      
                      return (
                        <div key={obj.id} className="border-b border-emerald-100/30 pb-2.5 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                            <span className="truncate max-w-[200px]">{obj.text}</span>
                            <span className={isAcquired ? "text-emerald-600" : "text-amber-600"}>
                              {Math.round(compScore * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-text-secondary font-semibold mt-1">
                            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded uppercase font-bold text-[9px] border border-emerald-100">
                              {obj.category}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded-full font-bold uppercase text-[8px] ${
                              isAcquired ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {masterComp?.status || "fragile"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RECALL OBJECTIVES SCORES */}
                <div className="bg-cyan-50/20 border border-cyan-100 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[11px] font-black text-cyan-800 uppercase tracking-wider flex items-center gap-1">
                    <span>🌀</span> Spaced Memory Recalls
                  </h4>
                  {recallObjectives.length > 0 ? (
                    <div className="space-y-3">
                      {recallObjectives.map((obj) => {
                        const compScore = testResults.finalTestScores[obj.text] ?? 0;
                        const masterComp = testResults.updatedCompetencies.find(c => c.competency.toLowerCase() === obj.text.toLowerCase());
                        const previousHistory = masterComp?.history && masterComp.history.length > 1 
                          ? masterComp.history[masterComp.history.length - 2].score 
                          : null;
                        
                        const isRegression = previousHistory !== null && compScore < previousHistory - 0.05;

                        return (
                          <div key={obj.id} className="border-b border-cyan-100/30 pb-2.5 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                              <span className="truncate max-w-[200px]">{obj.text}</span>
                              <div className="flex items-center gap-1.5">
                                {isRegression ? (
                                  <span className="text-red-500 flex items-center text-[10px] gap-0.5" title="Regression detected!">
                                    <TrendingDown size={12} /> Regr.
                                  </span>
                                ) : (
                                  previousHistory !== null && (
                                    <span className="text-emerald-500 flex items-center text-[10px] gap-0.5">
                                      <TrendingUp size={12} /> Keep Up
                                    </span>
                                  )
                                )}
                                <span className={compScore >= SPIRAL_CONFIG.seuil_acquisition ? "text-cyan-600" : "text-amber-600"}>
                                  {Math.round(compScore * 100)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-text-secondary font-semibold mt-1">
                              <span className="bg-cyan-50 text-cyan-700 px-1.5 py-0.2 rounded uppercase font-bold text-[9px] border border-cyan-100">
                                {obj.category}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded-full font-bold uppercase text-[8px] ${
                                isRegression ? "bg-red-100 text-red-800 animate-pulse" : "bg-cyan-100 text-cyan-800"
                              }`}>
                                {masterComp?.status || "en_consolidation"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[120px] text-center text-xs text-text-secondary/70">
                      <span>🌸</span> No memory recalls tested in this step.
                    </div>
                  )}
                </div>
              </div>

              {/* Remediations proposed or recommended review warning */}
              <div className="space-y-3">
                {testResults.newRemediations.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="text-rose-600 shrink-0 mt-0.5 animate-bounce" size={18} />
                    <div>
                      <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider">AI Remediation Proposed</h4>
                      <p className="text-[11px] text-rose-700 font-semibold leading-relaxed mt-1">
                        Our algorithm identified fragility or regression on: 
                        <strong className="text-rose-900 block mt-0.5">
                          {testResults.newRemediations.map(r => `"${r.competencyText}"`).join(", ")}
                        </strong>
                        We have prepared specialized remediation activities. Your teacher has been notified to approve these personalized learning modules!
                      </p>
                    </div>
                  </div>
                )}

                {testResults.recommendedReview ? (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                    <RefreshCw className="text-amber-600 shrink-0 mt-0.5 animate-spin" size={18} />
                    <div>
                      <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">Reviewing Current Lesson Recommended</h4>
                      <p className="text-[11px] text-amber-700 font-semibold leading-relaxed mt-0.5">
                        Your score for today's new competencies did not meet the acquisition threshold ({Math.round(SPIRAL_CONFIG.seuil_acquisition * 100)}%).
                        We highly recommend reviewing the lesson activities to consolidate your understanding!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3">
                    <TrophyIcon className="text-emerald-600 shrink-0 mt-0.5 animate-bounce" size={18} />
                    <div>
                      <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider">Perfect Alignment!</h4>
                      <p className="text-[11px] text-emerald-700 font-semibold leading-relaxed mt-0.5">
                        Excellent work! You've perfectly mastered this step's competencies. Your learning spiral is healthy and expanding!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => onFinish(lesson.xpReward + 15, testResults.recommendedReview)}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-black rounded-xl text-sm"
              >
                Conclude Test & Update Spiral Route →
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
