import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Button } from "./Button";
import { 
  Check, X, RefreshCw, Printer, BookOpen, Clock, ChevronRight, 
  HelpCircle, ArrowLeft, ExternalLink, Award 
} from "lucide-react";

export function TestPreviewPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const lessonsList = useStore(state => state.lessonsList);

  const test = useMemo(() => {
    return lessonsList.find((l: any) => l.id === testId);
  }, [lessonsList, testId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
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

  // Timer simulation
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  const activities = test?.activities || [];
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
      setShuffledOptions([...opts].sort(() => Math.random() - 0.5));
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

  const handleCloseWindow = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  if (!test) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-md space-y-4">
          <div className="text-4xl">🔍</div>
          <h2 className="text-xl font-bold text-slate-800">Test Not Found</h2>
          <p className="text-sm text-slate-500">The requested test could not be located in the database or test bank.</p>
          <Button onClick={handleCloseWindow} variant="secondary" className="w-full">
            Close Tab
          </Button>
        </div>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

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
    setElapsedSeconds(0);
  };

  const handlePrint = () => {
    window.print();
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

  const currentActivityType = String(currentActivity?.type || "").toLowerCase();

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans selection:bg-slate-200">
      {/* Simulation Header */}
      <header className="bg-white border-b border-slate-200 py-3 px-6 sticky top-0 z-50 shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 text-slate-100 rounded-xl flex items-center justify-center font-black shadow-sm">
              ✍️
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 leading-none flex items-center gap-2">
                {test.title}
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-slate-200">
                  {test.difficulty || "Medium"}
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">Student Portal Live Simulation</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-700">
              <Clock size={14} className="text-slate-500 animate-pulse" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            <button
              onClick={handlePrint}
              title="Print Test Paper"
              className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg border border-slate-200 bg-white transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold"
            >
              <Printer size={14} /> <span className="hidden sm:inline">Print</span>
            </button>

            <Button
              variant="secondary"
              className="text-xs font-bold"
              onClick={handleCloseWindow}
            >
              Exit Sandbox
            </Button>
          </div>
        </div>
      </header>

      {/* Main Simulation Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col justify-center print:block print:py-0">
        
        {isFinished ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-6 shadow-md max-w-xl mx-auto w-full">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-4xl mx-auto border-2 border-amber-200 shadow-sm animate-bounce">
              🏆
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Simulation Complete!</h3>
              <p className="text-sm font-semibold text-slate-500">
                You took this assessment precisely as an enrolled student would.
              </p>
            </div>

            <div className="relative w-36 h-36 mx-auto flex flex-col items-center justify-center rounded-full bg-slate-50 border-4 border-slate-800 shadow-inner">
              <span className="text-3xl font-black text-slate-900">{score} / {activities.length}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                {Math.round((score / activities.length) * 100)}% Score
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 max-w-sm mx-auto text-left text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span className="font-semibold">Time Spent:</span>
                <span className="font-mono font-bold">{formatTime(elapsedSeconds)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Accuracy rate:</span>
                <span className="font-mono font-bold">{Math.round((score / activities.length) * 100)}%</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button onClick={handleReset} variant="secondary" className="flex items-center gap-1.5 font-bold">
                <RefreshCw size={15} /> Restart Sandbox
              </Button>
              <Button onClick={handleCloseWindow} className="bg-slate-800 hover:bg-slate-900 text-white font-bold">
                Close Simulator
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 print:hidden">
            {/* Question Progress */}
            <div className="flex items-center justify-between text-xs font-black text-slate-500 uppercase tracking-wider px-1">
              <span className="text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <BookOpen size={13} className="text-slate-500" /> Lesson Activity
              </span>
              <span>Question {currentIndex + 1} of {activities.length}</span>
            </div>

            <div className="w-full bg-slate-200/70 h-3 rounded-full overflow-hidden border border-slate-300/40 shadow-inner">
              <div 
                className="bg-slate-800 h-full transition-all duration-300" 
                style={{ width: `${((currentIndex + 1) / activities.length) * 100}%` }}
              />
            </div>

            {/* Current Question Interface */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {currentActivityType === "multiple choice" && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Multiple Choice</span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                      {currentActivity.multipleChoiceQuestion}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {shuffledOptions.map((opt, oIdx) => {
                      const isSelected = selectedOption === opt;
                      const isCorrectOpt = opt === currentActivity.multipleChoiceCorrectAnswer;
                      const isIncorrectSel = isSelected && !isCorrectOpt;
                      const showCorrect = selectedOption !== null && isCorrectOpt;

                      let btnStyle = "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50/50 text-slate-800";
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
                          className={`flex items-center gap-4 p-4.5 rounded-2xl border-2 text-left transition-all active:scale-[0.99] cursor-pointer ${btnStyle}`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm border-2 shrink-0 ${circleStyle}`}>
                            {selectedOption !== null && showCorrect ? "✓" : selectedOption !== null && isIncorrectSel ? "✗" : String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="text-sm font-semibold">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedOption !== null && (
                    <div className={`p-4 rounded-xl border leading-relaxed ${isCorrect ? "bg-emerald-50/60 border-emerald-200 text-emerald-950" : "bg-rose-50/60 border-rose-200 text-rose-950"}`}>
                      <div className="font-extrabold text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                        {isCorrect ? "🎉 Correct Answer!" : "💡 Explanation:"}
                      </div>
                      <p className="text-xs font-semibold">{currentActivity.title || "Review this concept to master your skills."}</p>
                    </div>
                  )}
                </div>
              )}

              {currentActivityType === "matching" && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Matching Association</span>
                    <h3 className="text-base font-extrabold text-slate-800 mt-1">
                      Link the complementary values on the left with their translations or pairs on the right.
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="flex flex-col gap-2.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">French / Source Term</span>
                      {shuffledLeftItems.map((item, idx) => {
                        const isMatched = matchedPairs.includes(item.left);
                        const isSelected = selectedLeft === item.left;
                        const isError = matchingError?.[0] === item.left;

                        let itemStyle = "bg-white border-slate-200 text-slate-800 hover:border-slate-400";
                        if (isMatched) {
                          itemStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-black";
                        } else if (isError) {
                          itemStyle = "bg-rose-50 border-rose-300 text-rose-800 font-black";
                        } else if (isSelected) {
                          itemStyle = "bg-slate-100 border-slate-800 text-slate-900 font-black shadow-sm scale-[0.98]";
                        }

                        return (
                          <button
                            key={`L-${idx}`}
                            disabled={isMatched || !!matchingError}
                            onClick={() => handleLeftClick(item)}
                            className={`py-3.5 px-4 rounded-xl border-2 text-center text-sm font-semibold transition-all select-none cursor-pointer ${itemStyle}`}
                          >
                            {item.left}
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-2.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Arabic / Target Term</span>
                      {shuffledRightItems.map((item, idx) => {
                        const isMatched = matchedPairs.some((leftWord) => {
                          const pair = (currentActivity.matchingPairs || []).find((p: any) => p.left === leftWord);
                          return pair && pair.right === item.right;
                        });
                        const isSelected = selectedRight === item.right;
                        const isError = matchingError?.[1] === item.right;

                        let itemStyle = "bg-white border-slate-200 text-slate-800 hover:border-slate-400";
                        if (isMatched) {
                          itemStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-black";
                        } else if (isError) {
                          itemStyle = "bg-rose-50 border-rose-300 text-rose-800 font-black";
                        } else if (isSelected) {
                          itemStyle = "bg-slate-100 border-slate-800 text-slate-900 font-black shadow-sm scale-[0.98]";
                        }

                        return (
                          <button
                            key={`R-${idx}`}
                            disabled={isMatched || !!matchingError}
                            onClick={() => handleRightClick(item)}
                            className={`py-3.5 px-4 rounded-xl border-2 text-center text-sm font-semibold transition-all select-none cursor-pointer font-arabic leading-normal ${itemStyle}`}
                            dir="rtl"
                          >
                            {item.right}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-center text-xs font-bold text-slate-500 bg-slate-100/50 py-2 rounded-xl border border-slate-200/50">
                    Matches Formed: {matchedPairs.length} of {(currentActivity.matchingPairs || []).length} completed
                  </div>
                </div>
              )}

              {currentActivityType === "cloze" && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sentence Fill In The Blank</span>
                    
                    <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-4 leading-relaxed">
                      {currentActivity.clozeSentenceBefore || ""}
                      {clozeSelected ? (
                        <span className={`mx-2 px-3 py-1 rounded-xl border-2 font-black inline-block ${showClozeFeedback ? (clozeIsCorrect ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-rose-50 border-rose-300 text-rose-800") : "bg-slate-100 border-slate-400 text-slate-800"}`}>
                          {clozeSelected}
                        </span>
                      ) : (
                        <span className="mx-2 px-6 py-1 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold inline-block">
                          ? ? ?
                        </span>
                      )}
                      {currentActivity.clozeSentenceAfter || ""}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Select the correct card to insert</span>
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                      {shuffledOptions.map((word, idx) => {
                        const isClicked = clozeSelected === word;
                        
                        let chipStyle = "bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50/50 text-slate-800";
                        if (isClicked) {
                          if (showClozeFeedback) {
                            chipStyle = clozeIsCorrect 
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-black scale-95 opacity-80" 
                              : "bg-rose-50 border-rose-300 text-rose-800 font-black scale-95 opacity-80";
                          } else {
                            chipStyle = "bg-slate-100 border-slate-400 text-slate-800 font-black";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={showClozeFeedback}
                            onClick={() => handleClozeSelect(word)}
                            className={`px-4.5 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer ${chipStyle}`}
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
                        {clozeIsCorrect ? "🎉 Stellar comprehension!" : "💡 Answer breakdown:"}
                      </div>
                      <p className="text-xs font-semibold">
                        {clozeIsCorrect 
                          ? `Splendid work! "${currentActivity.clozeCorrect}" completes this syntactic flow perfectly.` 
                          : `The correct term is "${currentActivity.clozeCorrect}". Keep training to improve contextual accuracy!`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Bottom Navigation */}
            <div className="pt-2 flex justify-end">
              <Button
                disabled={
                  currentActivityType === "multiple choice" ? selectedOption === null :
                  currentActivityType === "matching" ? matchedPairs.length < (currentActivity.matchingPairs || []).length :
                  currentActivityType === "cloze" ? !clozeSelected : false
                }
                onClick={handleNext}
                className="flex items-center gap-2 text-xs px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-black rounded-xl shadow-md transition-all duration-150 active:scale-98"
              >
                {currentIndex < activities.length - 1 ? "Next Question" : "View Results"} <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        )}

        {/* Print-Only Representation */}
        <div className="hidden print:block space-y-8">
          <div className="border-b-4 border-slate-800 pb-4 text-center">
            <h1 className="text-2xl font-black text-slate-950 uppercase">{test.title}</h1>
            <p className="text-xs text-slate-600 mt-1 uppercase font-bold tracking-widest">
              Standalone Assessment • Difficulty: {test.difficulty || "Medium"} • {activities.length} Questions
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-left max-w-md mx-auto text-xs font-semibold border-t pt-3 border-slate-300">
              <div>Student Name: _______________________</div>
              <div>Date: _______________________</div>
            </div>
          </div>

          <div className="space-y-6">
            {activities.map((act: any, idx: number) => {
              const type = String(act.type).toLowerCase();
              return (
                <div key={idx} className="space-y-3 pb-6 border-b border-dashed border-slate-300 last:border-0 avoid-break">
                  <div className="font-black text-sm">
                    Q{idx + 1}. [{act.type}] {act.title || "Question"}
                  </div>

                  {type === "multiple choice" && (
                    <div className="space-y-2 pl-4">
                      <p className="font-bold text-xs mb-2 italic">"{act.multipleChoiceQuestion}"</p>
                      <div className="grid grid-cols-1 gap-1">
                        {(act.multipleChoiceOptions || []).map((opt: string, oIdx: number) => (
                          <div key={oIdx} className="text-xs flex items-center gap-2">
                            <span className="inline-block w-4 h-4 border border-slate-400 rounded-full text-center text-[9px] font-bold">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {type === "matching" && (
                    <div className="pl-4 space-y-2">
                      <p className="text-xs italic">Match the left column term with the correct item in the right column.</p>
                      <div className="grid grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                          <div className="font-bold text-[10px] uppercase border-b pb-1">Column A</div>
                          {(act.matchingPairs || []).map((p: any, pIdx: number) => (
                            <div key={pIdx} className="text-xs py-1">
                              ____ &nbsp; {p.left}
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2" dir="rtl">
                          <div className="font-bold text-[10px] uppercase border-b pb-1 text-left">Column B</div>
                          {(act.matchingPairs || []).map((p: any, pIdx: number) => (
                            <div key={pIdx} className="text-xs py-1 font-arabic">
                              {pIdx + 1}. {p.right}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {type === "cloze" && (
                    <div className="pl-4 space-y-2">
                      <p className="text-xs italic">Fill in the blank using the words provided below.</p>
                      <p className="text-xs font-bold bg-slate-50 p-3 rounded border border-slate-200 mt-2">
                        {act.clozeSentenceBefore || ""} _______________ {act.clozeSentenceAfter || ""}
                      </p>
                      <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="text-slate-500 text-[10px] uppercase self-center mr-1">Options:</span>
                        {Array.from(new Set([act.clozeCorrect, ...(act.clozeDistractors || "").split(",").map((s: string) => s.trim())]))
                          .filter(Boolean)
                          .map((word, wIdx) => (
                            <span key={wIdx} className="px-2 py-1 border border-slate-300 rounded bg-white">
                              {word as string}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Answer Key (Printed at bottom) */}
          <div className="pt-8 border-t-2 border-slate-800 mt-12 avoid-break">
            <h3 className="text-sm font-black uppercase text-center tracking-wider mb-4 text-slate-800">
              Answer Key (Teacher Use Only)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pl-4">
              {activities.map((act: any, idx: number) => {
                const type = String(act.type).toLowerCase();
                let ans = "";
                if (type === "multiple choice") ans = act.multipleChoiceCorrectAnswer;
                else if (type === "matching") ans = (act.matchingPairs || []).map((p: any) => `(${p.left} → ${p.right})`).join(", ");
                else if (type === "cloze") ans = act.clozeCorrect;

                return (
                  <div key={idx} className="text-xs">
                    <span className="font-bold">Q{idx + 1}:</span>{" "}
                    <span className="text-slate-700 italic">{ans}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
