import React, { useState, memo, useMemo } from "react";
import { Button } from "../Button";
import { Trash2, Plus, Wand2, FileQuestion, BookOpen, Layers } from "lucide-react";
import { useStore } from "../../store/useStore";

export const TestBuilderTab = memo(function TestBuilderTab({
  lessonsList,
  handleAddStandaloneLesson,
  handleDeleteStandaloneLesson,
  setEditingLesson
}: any) {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [targetType, setTargetType] = useState<"lesson" | "unit" | "all">("lesson");
  const [targetId, setTargetId] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [exerciseTypes, setExerciseTypes] = useState<string[]>(["multiple_choice"]);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [theme, setTheme] = useState<string>("General");
  const [creativity, setCreativity] = useState<string>("Medium");
  const [questionStyle, setQuestionStyle] = useState<string>("Playful");
  const courseData = useStore(state => state.courseData);
  
  const testsList = useMemo(() => {
    return lessonsList.filter((l: any) => l.isTest);
  }, [lessonsList]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [testToDelete, setTestToDelete] = useState<{ id: string; title: string } | null>(null);

  React.useEffect(() => {
    if (showGenerateModal) {
      setGenerationError(null);
    }
    if (showGenerateModal && !targetId) {
      if (targetType === "lesson") {
        const availableLessons = lessonsList.filter((l: any) => !l.isTest);
        if (availableLessons.length > 0) {
          setTargetId(availableLessons[0].id);
        }
      } else if (targetType === "unit") {
        if (courseData && courseData.length > 0) {
          setTargetId(courseData[0].id);
        }
      }
    }
  }, [showGenerateModal, targetType, courseData, lessonsList, targetId]);

  const handleGenerateTest = async () => {
    if (!targetId && targetType !== "all") return;
    
    setIsGenerating(true);
    setGenerationError(null);
    try {
      let targetContent = "";
      if (targetType === "unit") {
        const unit = courseData.find((u: any) => u.id === targetId);
        targetContent = unit ? JSON.stringify(unit) : "";
      } else if (targetType === "lesson") {
        const lesson = lessonsList.find((l: any) => l.id === targetId);
        targetContent = lesson ? JSON.stringify(lesson) : "";
      }

      // Extract existing questions for this specific target to avoid duplication
      const existingTests = lessonsList.filter(
        (l: any) => l.isTest && l.targetId === targetId && l.targetType === targetType
      );
      
      const existingQuestions: string[] = [];
      existingTests.forEach((test: any) => {
        if (test.activities && Array.isArray(test.activities)) {
          test.activities.forEach((act: any) => {
            if (act.type === "Multiple Choice" && act.multipleChoiceQuestion) {
              existingQuestions.push(act.multipleChoiceQuestion);
            } else if (act.type === "Matching" && act.matchingPairs) {
              const pairsStr = act.matchingPairs.map((p: any) => `${p.left} - ${p.right}`).join(", ");
              existingQuestions.push(`Matching elements: ${pairsStr}`);
            } else if (act.type === "Cloze") {
              existingQuestions.push(`Fill in the blank sentence: ${act.clozeSentenceBefore || ""} ___ ${act.clozeSentenceAfter || ""} with correct answer: ${act.clozeCorrect || ""}`);
            }
          });
        }
      });

      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetContent,
          questionCount,
          exerciseTypes: exerciseTypes.length > 0 ? exerciseTypes : ["Multiple Choice"],
          customPrompt,
          difficulty,
          theme,
          creativity,
          questionStyle,
          existingQuestions,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate evaluation test");
      }

      const data = await res.json();
      const newTestActivities = data.activities || [];

      if (newTestActivities.length === 0) {
        throw new Error("No activities were generated from the provided content. Please verify your lesson content.");
      }

      // Create descriptive title based on parameters
      const targetName = targetType === "lesson" 
        ? (lessonsList.find((l: any) => l.id === targetId)?.title || "Lesson")
        : targetType === "unit"
          ? (courseData.find((u: any) => u.id === targetId)?.title || "Unit")
          : "All Content";

      const title = `Test (${difficulty}) - ${targetName}`;
      const newTestId = handleAddStandaloneLesson({
        title,
        status: "Draft",
        isTest: true,
        xpReward: 50,
        activities: newTestActivities,
        targetType,
        targetId,
        difficulty,
        theme,
        questionStyle,
        creativity,
        createdAt: new Date().toISOString()
      });

      setEditingLesson({ lessonId: newTestId, lessonTitle: title });
      setShowGenerateModal(false);
    } catch (error: any) {
      console.error(error);
      setGenerationError(error.message || "Failed to generate test. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary-dark">Evaluations & Tests Builder</h2>
        <div className="flex gap-2">
            <Button onClick={() => {
              const newTestId = handleAddStandaloneLesson({ isTest: true, title: `New Test ${testsList.length + 1}` });
              setEditingLesson({ lessonId: newTestId, lessonTitle: `New Test ${testsList.length + 1}` });
            }} variant="secondary" className="flex items-center gap-1.5 font-extrabold text-xs">
            <Plus size={15} /> Create Empty Test
            </Button>
            <Button onClick={() => setShowGenerateModal(true)} variant="primary" className="flex items-center gap-1.5 font-extrabold text-xs bg-purple-600 hover:bg-purple-700 text-white border-none">
            <Wand2 size={15} /> Generate with AI
            </Button>
        </div>
      </div>

      <div className="space-y-4">
        {testsList.length === 0 ? (
          <div className="text-center py-12 bg-white border border-primary-light/50 rounded-2xl p-6 shadow-sm">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileQuestion size={28} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-primary-dark mb-2">No tests created yet</h3>
            <p className="text-sm text-text-secondary font-semibold max-w-md mx-auto">
                Generate dynamic tests using AI based on the content of your units and lessons. The generated questions will be saved to your bank.
            </p>
          </div>
        ) : (
          testsList.map((test: any) => (
            <div key={test.id} className="border border-purple-200 rounded-xl p-4 bg-purple-50/30 shadow-sm flex justify-between items-center cursor-pointer hover:border-purple-400 transition-all duration-200"
                 onClick={() => setEditingLesson({ lessonId: test.id, lessonTitle: test.title })}>
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                    <FileQuestion size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-primary-dark">{test.title}</h3>
                  <div className="flex gap-3 mt-1">
                    <p className="text-xs text-text-secondary font-semibold">Status: <span className="text-purple-700 font-extrabold">{test.status || "Draft"}</span></p>
                    <p className="text-xs text-text-secondary font-semibold">Activities: <span className="text-text-primary font-bold">{(test.activities || []).length}</span></p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="secondary"
                  size="xs"
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors bg-white border border-primary-light/60 cursor-pointer"
                  onClick={() => setTestToDelete({ id: test.id, title: test.title })}
                  title="Delete Test"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-primary-dark mb-2 flex items-center gap-2">
              <Wand2 className="text-purple-500" /> Generate Test
            </h3>
            <p className="text-text-secondary font-semibold text-sm mb-6">
              The AI will analyze the target content and generate appropriate evaluation questions.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">Target Content Type</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                        setTargetType("lesson");
                        setTargetId("");
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${targetType === "lesson" ? "bg-purple-100 text-purple-700 border-2 border-purple-500" : "bg-neutral-bg text-text-secondary border-2 border-transparent hover:bg-neutral-bg/80"}`}
                  >
                    <BookOpen size={16} /> Lesson
                  </button>
                  <button 
                    onClick={() => {
                        setTargetType("unit");
                        setTargetId("");
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${targetType === "unit" ? "bg-purple-100 text-purple-700 border-2 border-purple-500" : "bg-neutral-bg text-text-secondary border-2 border-transparent hover:bg-neutral-bg/80"}`}
                  >
                    <Layers size={16} /> Unit
                  </button>
                </div>
              </div>

              {targetType === "unit" && (
                  <div>
                      <label className="block text-sm font-bold text-text-primary mb-2">Select Target Unit</label>
                      <select 
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-primary-light/50 bg-neutral-bg/50 focus:bg-white focus:border-purple-400 focus:outline-none transition-all font-semibold text-sm"
                      >
                          <option value="">Select a unit...</option>
                          {(courseData || []).map((u: any) => (
                              <option key={u.id} value={u.id}>{u.title}</option>
                          ))}
                      </select>
                  </div>
              )}

              {targetType === "lesson" && (
                  <div>
                      <label className="block text-sm font-bold text-text-primary mb-2">Select Target Lesson</label>
                      <select 
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-primary-light/50 bg-neutral-bg/50 focus:bg-white focus:border-purple-400 focus:outline-none transition-all font-semibold text-sm"
                      >
                          <option value="">Select a lesson...</option>
                          {lessonsList.filter((l: any) => !l.isTest).map((l: any) => (
                              <option key={l.id} value={l.id}>{l.title}</option>
                          ))}
                      </select>
                  </div>
              )}

              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-text-primary mb-2">Number of Questions</label>
                  <input 
                    type="number"
                    min={1}
                    max={50}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-primary-light/50 bg-neutral-bg/50 focus:bg-white focus:border-purple-400 focus:outline-none transition-all font-semibold text-sm"
                  />
                </div>
                <div className="flex-[2]">
                  <label className="block text-sm font-bold text-text-primary mb-2">Custom Instructions (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. Focus on past tense, keep it easy..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-primary-light/50 bg-neutral-bg/50 focus:bg-white focus:border-purple-400 focus:outline-none transition-all font-semibold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-primary-light/50 bg-neutral-bg/50 focus:bg-white focus:border-purple-400 focus:outline-none transition-all font-semibold text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-primary-light/50 bg-neutral-bg/50 focus:bg-white focus:border-purple-400 focus:outline-none transition-all font-semibold text-sm"
                  >
                    <option value="General">General</option>
                    <option value="Animals">Animals</option>
                    <option value="Space">Space</option>
                    <option value="Sports">Sports</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Magic">Magic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">Question Style</label>
                  <select
                    value={questionStyle}
                    onChange={(e) => setQuestionStyle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-primary-light/50 bg-neutral-bg/50 focus:bg-white focus:border-purple-400 focus:outline-none transition-all font-semibold text-sm"
                  >
                    <option value="Playful">Playful / Fun</option>
                    <option value="Direct">Direct / Standard</option>
                    <option value="Scenario">Scenario-based</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">Creativity (Temperature)</label>
                  <select
                    value={creativity}
                    onChange={(e) => setCreativity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-primary-light/50 bg-neutral-bg/50 focus:bg-white focus:border-purple-400 focus:outline-none transition-all font-semibold text-sm"
                  >
                    <option value="Low">Low (Strict)</option>
                    <option value="Medium">Medium (Balanced)</option>
                    <option value="High">High (Creative)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">Exercise Types</label>
                <div className="flex flex-wrap gap-2">
                    {["Multiple Choice", "Matching", "Cloze"].map(type => (
                        <label key={type} className="flex items-center gap-2 bg-neutral-bg/50 px-3 py-2 rounded-lg cursor-pointer hover:bg-neutral-bg border border-transparent hover:border-purple-200 transition-colors">
                            <input
                                type="checkbox"
                                checked={exerciseTypes.includes(type)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setExerciseTypes([...exerciseTypes, type]);
                                    } else {
                                        setExerciseTypes(exerciseTypes.filter(t => t !== type));
                                    }
                                }}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-semibold text-text-primary">{type}</span>
                        </label>
                    ))}
                </div>
              </div>

              {generationError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                  {generationError}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-8">
              <Button onClick={() => setShowGenerateModal(false)} variant="secondary" className="px-6" disabled={isGenerating}>Cancel</Button>
              <Button onClick={handleGenerateTest} variant="primary" className="px-8 bg-purple-600 hover:bg-purple-700 text-white border-none disabled:opacity-50" disabled={(!targetId && targetType !== "all") || isGenerating}>
                {isGenerating ? "Generating..." : "Generate Test"}
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
              Are you sure you want to permanently delete <strong className="text-slate-800">"{testToDelete.title}"</strong>?
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
