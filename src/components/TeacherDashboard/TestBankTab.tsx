import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../Button";
import { 
  Search, Trash2, Edit3, Download, 
  BookOpen, Layers, SlidersHorizontal, BarChart3, HelpCircle, 
  Sparkles, Check, CheckSquare, RefreshCw, Eye
} from "lucide-react";

interface InteractiveStudentPreviewProps {
  activities: any[];
  testTitle: string;
}

export function InteractiveStudentPreview({ activities, testTitle }: InteractiveStudentPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // Selection states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Matching states
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // list of matched left keys/words
  const [matchingError, setMatchingError] = useState<[string, string] | null>(null);
  
  // Cloze states
  const [clozeSelected, setClozeSelected] = useState<string | null>(null);
  const [showClozeFeedback, setShowClozeFeedback] = useState<boolean>(false);
  const [clozeIsCorrect, setClozeIsCorrect] = useState<boolean | null>(null);
  
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [shuffledLeftItems, setShuffledLeftItems] = useState<any[]>([]);
  const [shuffledRightItems, setShuffledRightItems] = useState<any[]>([]);

  const currentActivity = activities[currentIndex];

  // Initialize and shuffle options on question load
  useEffect(() => {
    if (!currentActivity) return;
    const type = String(currentActivity.type).toLowerCase();
    
    // Reset individual question states
    setSelectedOption(null);
    setIsCorrect(null);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setMatchingError(null);
    setClozeSelected(null);
    setShowClozeFeedback(false);
    setClozeIsCorrect(null);

    if (type === "multiple choice") {
      const opts = currentActivity.multipleChoiceOptions || [];
      setShuffledOptions(opts);
    } else if (type === "matching") {
      const pairs = currentActivity.matchingPairs || [];
      const lefts = [...pairs].sort(() => Math.random() - 0.5);
      const rights = [...pairs].sort(() => Math.random() - 0.5);
      setShuffledLeftItems(lefts);
      setShuffledRightItems(rights);
    } else if (type === "cloze") {
      const correct = currentActivity.clozeCorrect || "";
      let distractors: string[] = [];
      if (typeof currentActivity.clozeDistractors === "string") {
        distractors = currentActivity.clozeDistractors.split(",").map((s: string) => s.trim());
      } else if (Array.isArray(currentActivity.clozeDistractors)) {
        distractors = currentActivity.clozeDistractors;
      }
      const allOpts = Array.from(new Set([correct, ...distractors])).filter(Boolean).sort(() => Math.random() - 0.5);
      setShuffledOptions(allOpts);
    }
  }, [currentIndex, currentActivity]);

  if (!currentActivity) {
    return (
      <div className="text-center py-6 text-text-secondary">
        No questions available in this test.
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
  };

  // Multiple choice submission
  const handleMultipleChoiceSelect = (opt: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(opt);
    const correct = opt === currentActivity.multipleChoiceCorrectAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
    }
  };

  // Matching actions
  const handleLeftClick = (item: any) => {
    if (matchedPairs.includes(item.left) || matchingError) return;
    setSelectedLeft(item.left);
    if (selectedRight) {
      checkMatch(item.left, selectedRight);
    }
  };

  const handleRightClick = (item: any) => {
    if (matchedPairs.includes(item.left) || matchingError) return;
    setSelectedRight(item.right);
    if (selectedLeft) {
      checkMatch(selectedLeft, item.right);
    }
  };

  const checkMatch = (leftVal: string, rightVal: string) => {
    const pairs = currentActivity.matchingPairs || [];
    const pair = pairs.find((p: any) => p.left === leftVal);
    
    if (pair && pair.right === rightVal) {
      setMatchedPairs(prev => [...prev, leftVal]);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (matchedPairs.length + 1 === pairs.length) {
        setScore(s => s + 1);
      }
    } else {
      setMatchingError([leftVal, rightVal]);
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setMatchingError(null);
      }, 1000);
    }
  };

  // Cloze actions
  const handleClozeSelect = (word: string) => {
    if (showClozeFeedback) return;
    setClozeSelected(word);
    const correct = word.toLowerCase() === (currentActivity.clozeCorrect || "").toLowerCase();
    setClozeIsCorrect(correct);
    setShowClozeFeedback(true);
    if (correct) {
      setScore(s => s + 1);
    }
  };

  if (isFinished) {
    const scorePct = Math.round((score / activities.length) * 100);
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 rounded-2xl p-8 text-center max-w-xl mx-auto my-4 space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-3xl mx-auto border border-slate-300 shadow-sm">
          🏆
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900">Simulator Finished!</h3>
          <p className="text-xs font-semibold text-slate-500">
            You evaluated this standalone test exactly as a student would experience it.
          </p>
        </div>

        <div className="relative w-28 h-28 mx-auto flex flex-col items-center justify-center rounded-full bg-white border-2 border-slate-700 shadow-inner">
          <span className="text-2xl font-black text-slate-800">{score} / {activities.length}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{scorePct}% Score</span>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Button onClick={handleReset} variant="secondary" className="flex items-center gap-1.5 font-bold text-xs bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700">
            <RefreshCw size={14} /> Restart Simulator
          </Button>
        </div>
      </div>
    );
  }

  const type = String(currentActivity.type).toLowerCase();

  return (
    <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 max-w-2xl mx-auto my-4 shadow-sm relative">
      <div className="flex items-center justify-between text-xs text-slate-500 font-black uppercase tracking-wider mb-4">
        <span className="text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
          🎮 Interactive Student Simulator
        </span>
        <span>Question {currentIndex + 1} of {activities.length}</span>
      </div>

      <div className="w-full bg-slate-200/50 h-2.5 rounded-full overflow-hidden mb-6 border border-slate-200/50">
        <div 
          className="bg-slate-700 h-full transition-all duration-300" 
          style={{ width: `${((currentIndex + 1) / activities.length) * 100}%` }}
        />
      </div>

      <div className="space-y-6">
        
        {type === "multiple choice" && (
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multiple Choice</span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1 leading-snug">
                {currentActivity.multipleChoiceQuestion}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shuffledOptions.map((opt, oIdx) => {
                const isSelected = selectedOption === opt;
                const isCorrectOpt = opt === currentActivity.multipleChoiceCorrectAnswer;
                const isIncorrectSel = isSelected && !isCorrectOpt;
                const showCorrect = selectedOption !== null && isCorrectOpt;

                let btnStyle = "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-800";
                let circleStyle = "border-slate-300 bg-slate-50 text-slate-500";

                if (selectedOption !== null) {
                  if (showCorrect) {
                    btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold shadow-sm";
                    circleStyle = "bg-emerald-500 border-emerald-500 text-white";
                  } else if (isIncorrectSel) {
                    btnStyle = "bg-rose-50 border-rose-400 text-rose-800 font-bold shadow-sm";
                    circleStyle = "bg-rose-500 border-rose-500 text-white";
                  } else {
                    btnStyle = "bg-white border-slate-100 text-slate-400 opacity-60";
                    circleStyle = "border-slate-100 text-slate-300";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    disabled={selectedOption !== null}
                    onClick={() => handleMultipleChoiceSelect(opt)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98] cursor-pointer ${btnStyle}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border-2 shrink-0 ${circleStyle}`}>
                      {selectedOption !== null && showCorrect ? "✓" : selectedOption !== null && isIncorrectSel ? "✗" : String.fromCharCode(65 + oIdx)}
                    </div>
                    <span className="text-sm font-semibold">{opt}</span>
                  </button>
                );
              })}
            </div>

            {selectedOption !== null && (
              <div className={`p-4 rounded-xl border leading-relaxed ${isCorrect ? "bg-emerald-50/60 border-emerald-200 text-emerald-950" : "bg-rose-50/60 border-rose-200 text-rose-950"}`}>
                <div className="font-extrabold text-xs uppercase tracking-wider mb-1">
                  {isCorrect ? "🎉 Correct Answer" : "💡 Pedagogical Explanation:"}
                </div>
                <p className="text-xs font-semibold">
                  {currentActivity.explanation 
                    ? currentActivity.explanation 
                    : (currentActivity.title || "Review this topic to master the grammar and vocabulary patterns.")}
                </p>
              </div>
            )}
          </div>
        )}

        {type === "matching" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matching Association</span>
              <h3 className="text-base font-extrabold text-slate-800 mt-0.5">
                Match each element on the left with its correct translation on the right!
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Left Item</span>
                {shuffledLeftItems.map((item, idx) => {
                  const isMatched = matchedPairs.includes(item.left);
                  const isSelected = selectedLeft === item.left;
                  const isError = matchingError?.[0] === item.left;

                  let itemStyle = "bg-white border-slate-200 text-slate-800 hover:border-slate-400";
                  if (isMatched) {
                    itemStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
                  } else if (isError) {
                    itemStyle = "bg-rose-50 border-rose-300 text-rose-800 font-bold";
                  } else if (isSelected) {
                    itemStyle = "bg-slate-100 border-slate-700 text-slate-900 font-bold shadow-sm";
                  }

                  return (
                    <button
                      key={`L-${idx}`}
                      disabled={isMatched || !!matchingError}
                      onClick={() => handleLeftClick(item)}
                      className={`py-3 px-4 rounded-xl border-2 text-center text-sm font-semibold transition-all select-none cursor-pointer ${itemStyle}`}
                    >
                      {item.left}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Right Match</span>
                {shuffledRightItems.map((item, idx) => {
                  const isMatched = matchedPairs.some((leftWord) => {
                    const pair = (currentActivity.matchingPairs || []).find((p: any) => p.left === leftWord);
                    return pair && pair.right === item.right;
                  });
                  const isSelected = selectedRight === item.right;
                  const isError = matchingError?.[1] === item.right;

                  let itemStyle = "bg-white border-slate-200 text-slate-800 hover:border-slate-400";
                  if (isMatched) {
                    itemStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
                  } else if (isError) {
                    itemStyle = "bg-rose-50 border-rose-300 text-rose-800 font-bold";
                  } else if (isSelected) {
                    itemStyle = "bg-slate-100 border-slate-700 text-slate-900 font-bold shadow-sm";
                  }

                  return (
                    <button
                      key={`R-${idx}`}
                      disabled={isMatched || !!matchingError}
                      onClick={() => handleRightClick(item)}
                      className={`py-3 px-4 rounded-xl border-2 text-center text-sm font-semibold transition-all select-none font-arabic leading-normal cursor-pointer ${itemStyle}`}
                      dir="rtl"
                    >
                      {item.right}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-center text-xs font-bold text-slate-500 bg-slate-100/50 py-2 rounded-xl border border-slate-200/40">
              Matched Items: {matchedPairs.length} / {(currentActivity.matchingPairs || []).length}
            </div>
          </div>
        )}

        {type === "cloze" && (
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fill In The Blanks (Cloze)</span>
              
              <p className="text-base font-extrabold text-slate-800 mt-3 leading-relaxed">
                {currentActivity.clozeSentenceBefore || ""}
                {clozeSelected ? (
                  <span className={`mx-2 px-3 py-1 rounded-lg border-2 font-black ${showClozeFeedback ? (clozeIsCorrect ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-rose-50 border-rose-300 text-rose-800") : "bg-slate-100 border-slate-400 text-slate-800"}`}>
                    {clozeSelected}
                  </span>
                ) : (
                  <span className="mx-2 px-6 py-1 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 font-bold">
                    ? ? ?
                  </span>
                )}
                {currentActivity.clozeSentenceAfter || ""}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Click a card to fill the blank</span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {shuffledOptions.map((word, idx) => {
                  const isClicked = clozeSelected === word;
                  
                  let chipStyle = "bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-800";
                  if (isClicked) {
                    if (showClozeFeedback) {
                      chipStyle = clozeIsCorrect 
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-black scale-95 opacity-80" 
                        : "bg-rose-50 border-rose-300 text-rose-800 font-black scale-95 opacity-80";
                    } else {
                      chipStyle = "bg-slate-100 border-slate-400 text-slate-800 font-bold";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={showClozeFeedback}
                      onClick={() => handleClozeSelect(word)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer ${chipStyle}`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>

            {showClozeFeedback && (
              <div className={`p-4 rounded-xl border leading-relaxed ${clozeIsCorrect ? "bg-emerald-50/60 border-emerald-200 text-emerald-950" : "bg-rose-50/60 border-rose-200 text-rose-950"}`}>
                <div className="font-extrabold text-xs uppercase tracking-wider mb-1">
                  {clozeIsCorrect ? "🎉 Great Job!" : "💡 Pedagogical Explanation:"}
                </div>
                <p className="text-xs font-semibold">
                  {currentActivity.explanation 
                    ? currentActivity.explanation
                    : (clozeIsCorrect 
                        ? `Excellent! "${currentActivity.clozeCorrect}" completes this statement beautifully.` 
                        : `Correct answer was "${currentActivity.clozeCorrect}". Continue practicing to consolidate your skills!`
                      )
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {type === "writing" && (
          <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-amber-200">Writing Exercise</span>
            <h3 className="text-base font-extrabold text-slate-800 mt-2">
              {currentActivity.writingTitle || currentActivity.title || "Writing Exercise"}
            </h3>
            <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {currentActivity.writingPrompt || currentActivity.prompt || "Write a paragraph responding to the prompt."}
            </p>
            {currentActivity.writingInstructions && (
              <p className="text-xs text-slate-500 italic">
                {currentActivity.writingInstructions}
              </p>
            )}
            <textarea
              rows={4}
              placeholder="Student response preview area..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none"
            />
          </div>
        )}

      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
        <Button
          disabled={
            type === "multiple choice" ? selectedOption === null :
            type === "matching" ? matchedPairs.length < (currentActivity.matchingPairs || []).length :
            type === "cloze" ? !clozeSelected : false
          }
          onClick={handleNext}
          className="flex items-center gap-1 text-xs px-5 py-2.5 font-black bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-sm cursor-pointer"
        >
          {currentIndex < activities.length - 1 ? "Next Question" : "View Results"} <Check size={14} />
        </Button>
      </div>
    </div>
  );
}

interface TestBankTabProps {
  lessonsList: any[];
  courseData: any[];
  handleDeleteStandaloneLesson: (id: string) => void;
  setEditingLesson: (lesson: any) => void;
}

export const TestBankTab = React.memo(function TestBankTab({
  lessonsList,
  courseData,
  handleDeleteStandaloneLesson,
  setEditingLesson
}: TestBankTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");
  const [previewModalTest, setPreviewModalTest] = useState<any | null>(null);
  const [previewModalMode, setPreviewModalMode] = useState<"interactive" | "corrected">("interactive");
  const [testToDelete, setTestToDelete] = useState<{ id: string; title: string } | null>(null);

  // Extract all standalone lessons that are tests
  const testsList = useMemo(() => {
    return lessonsList.filter((l: any) => l.isTest);
  }, [lessonsList]);

  // Unique themes present in tests
  const themes = useMemo(() => {
    const list = new Set<string>();
    testsList.forEach((t: any) => {
      if (t.theme) list.add(t.theme);
    });
    return Array.from(list);
  }, [testsList]);

  // Statistics calculation
  const stats = useMemo(() => {
    let totalQuestions = 0;
    let mcCount = 0;
    let matchingCount = 0;
    let clozeCount = 0;

    testsList.forEach((test: any) => {
      const activities = test.activities || [];
      totalQuestions += activities.length;
      activities.forEach((act: any) => {
        const type = String(act.type).toLowerCase();
        if (type === "multiple choice") mcCount++;
        else if (type === "matching") matchingCount++;
        else if (type === "cloze") clozeCount++;
      });
    });

    return {
      totalTests: testsList.length,
      totalQuestions,
      mcCount,
      matchingCount,
      clozeCount,
    };
  }, [testsList]);

  // Filter tests list based on selected filter values
  const filteredTests = useMemo(() => {
    return testsList.filter((test: any) => {
      const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (test.theme && test.theme.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesDifficulty = difficultyFilter === "all" || test.difficulty === difficultyFilter;
      const matchesTargetType = targetTypeFilter === "all" || test.targetType === targetTypeFilter;
      const matchesTheme = themeFilter === "all" || test.theme === themeFilter;

      return matchesSearch && matchesDifficulty && matchesTargetType && matchesTheme;
    });
  }, [testsList, searchQuery, difficultyFilter, targetTypeFilter, themeFilter]);

  const exportToJSON = (test: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(test, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${test.title.replace(/\s+/g, "_")}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getTargetLabel = (test: any) => {
    if (!test.targetType) return "Unknown Target";
    if (test.targetType === "all") return "Entire Syllabus";
    
    if (test.targetType === "lesson") {
      const lessonObj = lessonsList.find((l: any) => l.id === test.targetId);
      return lessonObj ? `Lesson: ${lessonObj.title}` : `Lesson ID: ${test.targetId}`;
    }
    
    if (test.targetType === "unit") {
      const unitObj = courseData.find((u: any) => u.id === test.targetId);
      return unitObj ? `Unit: ${unitObj.title}` : `Unit ID: ${test.targetId}`;
    }

    return "Unknown Target";
  };

  return (
    <div id="test-bank-container" className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary-dark flex items-center gap-2">
            <span>🏦</span> Evaluation & Test Bank
          </h2>
          <p className="text-sm text-text-secondary">
            Manage, review, and filter all AI-generated evaluation tests stored securely in your dashboard.
          </p>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-bg/40 p-4 rounded-2xl border border-primary-light/50 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Total Tests</p>
            <h4 className="text-2xl font-black text-text-primary">{stats.totalTests}</h4>
          </div>
        </div>

        <div className="bg-neutral-bg/40 p-4 rounded-2xl border border-primary-light/50 flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-xl text-slate-700">
            <SlidersHorizontal size={24} />
          </div>
          <div>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Total Questions</p>
            <h4 className="text-2xl font-black text-slate-800">{stats.totalQuestions}</h4>
          </div>
        </div>

        <div className="bg-neutral-bg/40 p-4 rounded-2xl border border-primary-light/50 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-600">
            <CheckSquare size={24} />
          </div>
          <div>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Multiple Choice</p>
            <h4 className="text-2xl font-black text-green-600">{stats.mcCount}</h4>
          </div>
        </div>

        <div className="bg-neutral-bg/40 p-4 rounded-2xl border border-primary-light/50 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <RefreshCw size={24} />
          </div>
          <div>
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Matching & Cloze</p>
            <h4 className="text-2xl font-black text-blue-600">{stats.matchingCount + stats.clozeCount}</h4>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-primary-light/60 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search tests by title, theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-primary-light/40 bg-neutral-bg/30 focus:bg-white focus:border-slate-400 focus:outline-none text-sm transition-all font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 md:w-[450px]">
            <div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-primary-light/40 bg-neutral-bg/30 text-xs font-bold focus:bg-white focus:border-slate-400 focus:outline-none cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <select
                value={targetTypeFilter}
                onChange={(e) => setTargetTypeFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-primary-light/40 bg-neutral-bg/30 text-xs font-bold focus:bg-white focus:border-slate-400 focus:outline-none cursor-pointer"
              >
                <option value="all">All Targets</option>
                <option value="lesson">Lessons Only</option>
                <option value="unit">Units Only</option>
                <option value="all">Entire Syllabus</option>
              </select>
            </div>

            <div>
              <select
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-primary-light/40 bg-neutral-bg/30 text-xs font-bold focus:bg-white focus:border-slate-400 focus:outline-none cursor-pointer"
              >
                <option value="all">All Themes</option>
                {themes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tests Table List */}
      <div className="bg-white rounded-2xl border border-primary-light/60 shadow-sm overflow-hidden">
        {filteredTests.length === 0 ? (
          <div className="text-center py-16 bg-neutral-bg/20 p-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-600">
              <Sparkles size={28} />
            </div>
            <h4 className="text-lg font-bold text-text-primary">No Tests Found</h4>
            <p className="text-sm text-text-secondary mt-1">
              {testsList.length === 0 
                ? "No evaluation tests have been generated yet. Head over to the Test Builder to make one!"
                : "No tests match your filter criteria. Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-bg/40 border-b border-primary-light/50 text-[11px] font-black uppercase text-text-secondary tracking-widest">
                  <th className="py-3 px-4 w-12 text-center">Preview</th>
                  <th className="py-3 px-4 min-w-[200px]">Test Title</th>
                  <th className="py-3 px-4">Target Coverage</th>
                  <th className="py-3 px-4 w-28">Difficulty</th>
                  <th className="py-3 px-4 w-32">Theme</th>
                  <th className="py-3 px-4 w-24 text-center">Questions</th>
                  <th className="py-3 px-4 w-28">Date</th>
                  <th className="py-3 px-4 w-44 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-light/30">
                {filteredTests.map((test: any) => {
                  const activities = test.activities || [];
                  
                  return (
                    <tr 
                      key={test.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer text-sm bg-white"
                      onClick={() => {
                        setPreviewModalTest(test);
                        setPreviewModalMode("interactive");
                      }}
                    >
                      {/* Eye Preview Icon */}
                      <td className="py-2 px-3 text-center">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-all text-slate-500 hover:text-slate-700 cursor-pointer">
                          <Eye size={16} />
                        </button>
                      </td>

                      {/* Title */}
                      <td className="py-2 px-4 font-bold text-slate-800">
                        <span className="hover:text-slate-900 transition-colors">{test.title}</span>
                      </td>

                      {/* Target */}
                      <td className="py-2 px-4 text-xs font-semibold text-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <Layers size={13} className="text-slate-500 shrink-0" />
                          <span className="truncate max-w-[180px]">{getTargetLabel(test)}</span>
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-2 px-4">
                        <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          test.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                          test.difficulty === "Hard" ? "bg-red-100 text-red-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {test.difficulty || "Medium"}
                        </span>
                      </td>

                      {/* Theme */}
                      <td className="py-2 px-4 text-xs font-bold text-text-secondary">
                        {test.theme ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            🎨 {test.theme}
                          </span>
                        ) : (
                          <span className="text-text-secondary/50">-</span>
                        )}
                      </td>

                      {/* Count */}
                      <td className="py-2 px-4 text-center text-xs font-extrabold text-slate-700">
                        {activities.length} Qs
                      </td>

                      {/* Date */}
                      <td className="py-2 px-4 text-xs text-text-secondary">
                        {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : "Saved"}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-2 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setEditingLesson({ lessonId: test.id, lessonTitle: test.title })}
                            title="Edit test"
                            className="p-1.5 hover:bg-slate-100 text-slate-700 hover:text-slate-800 rounded-lg border border-slate-200 bg-white transition-all shadow-sm cursor-pointer"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => exportToJSON(test)}
                            title="Export to JSON"
                            className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg border border-blue-100 bg-white transition-all shadow-sm cursor-pointer"
                          >
                            <Download size={14} />
                          </button>
                          <button 
                            onClick={() => setTestToDelete({ id: test.id, title: test.title })}
                            title="Delete test"
                            className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg border border-red-100 bg-white transition-all shadow-sm cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Overlay Modal Preview Window */}
      {previewModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {previewModalTest.difficulty || "Medium"} • {previewModalTest.theme || "No Theme"}
                </span>
                <h3 className="text-base font-black text-slate-800 mt-1">
                  {previewModalTest.title}
                </h3>
              </div>
              
              {/* Toggle Mode Buttons inside the Modal */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                <button
                  onClick={() => setPreviewModalMode("interactive")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${previewModalMode === "interactive" ? "bg-slate-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  🎮 Student View
                </button>
                <button
                  onClick={() => setPreviewModalMode("corrected")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${previewModalMode === "corrected" ? "bg-slate-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  📝 Corrected Key
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
              {previewModalMode === "interactive" ? (
                <InteractiveStudentPreview 
                  activities={previewModalTest.activities || []} 
                  testTitle={previewModalTest.title} 
                />
              ) : (
                <div className="space-y-4">
                  {(previewModalTest.activities || []).map((activity: any, index: number) => {
                    const type = String(activity.type).toLowerCase();
                    return (
                      <div 
                        key={activity.id || index} 
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] uppercase font-black tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            Q{index + 1}: {activity.type}
                          </span>
                          <span className="font-semibold text-slate-800 ml-2 truncate max-w-[240px]">
                            {activity.title}
                          </span>
                        </div>

                        {/* Multiple Choice question details */}
                        {type === "multiple choice" && (
                          <div className="space-y-1.5">
                            <p className="font-bold text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                              {activity.multipleChoiceQuestion}
                            </p>
                            <div className="grid grid-cols-2 gap-1.5 pl-1">
                              {(activity.multipleChoiceOptions || []).map((opt: string, oIdx: number) => {
                                const isCorrect = opt === activity.multipleChoiceCorrectAnswer;
                                return (
                                  <div 
                                    key={oIdx} 
                                    className={`px-2 py-1 rounded border flex items-center gap-1 text-[11px] ${isCorrect ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold" : "bg-slate-50/50 border-slate-200 text-slate-500"}`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[8px] shrink-0 ${isCorrect ? "bg-emerald-500 border-emerald-600 text-white" : "border-slate-300"}`}>
                                      {isCorrect ? <Check size={8} /> : String.fromCharCode(65 + oIdx)}
                                    </div>
                                    <span className="truncate">{opt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Matching question details */}
                        {type === "matching" && (
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 bg-slate-100/60 px-2 py-1 rounded border border-slate-200/40">
                              <span>Left / Item</span>
                              <span>Right / Answer</span>
                            </div>
                            <div className="space-y-1 pl-1">
                              {(activity.matchingPairs || []).map((pair: any, pIdx: number) => (
                                <div key={pIdx} className="grid grid-cols-2 gap-2 py-0.5 border-b border-slate-100 text-[11px] last:border-b-0">
                                  <span className="font-semibold text-slate-800 truncate">{pair.left}</span>
                                  <span className="text-emerald-700 font-bold flex items-center gap-1 truncate">
                                    <Check size={10} /> {pair.right}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Cloze question details */}
                        {type === "cloze" && (
                          <div className="space-y-1.5">
                            <p className="font-semibold text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                              {activity.clozeSentenceBefore || ""} 
                              <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-bold mx-1">
                                {activity.clozeCorrect || ""}
                              </span>
                              {activity.clozeSentenceAfter || ""}
                            </p>
                            {activity.clozeDistractors && (
                              <p className="text-[10px] text-slate-500 pl-1">
                                <span className="font-bold">Distractors:</span> {activity.clozeDistractors}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <Button 
                onClick={() => setPreviewModalTest(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs px-5 py-2 font-black cursor-pointer shadow-sm"
              >
                Close Preview
              </Button>
            </div>
            
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {testToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">Delete Test</h3>
                <p className="text-xs text-slate-500 font-semibold">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to permanently delete <strong className="text-slate-800">"{testToDelete.title}"</strong> from the test bank?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setTestToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteStandaloneLesson(testToDelete.id);
                  setTestToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer shadow-sm"
              >
                Yes, Delete Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
