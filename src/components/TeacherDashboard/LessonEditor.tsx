import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../Button";
import { TextScanner } from "./TextScanner";
import { ReadingActivityEditor } from "./ReadingActivityEditor";
import { DictionaryEntry } from "../../types";
import { LessonObjectivesEditor } from "./LessonObjectivesEditor";
import { LessonRunner } from "../../spaces/LessonRunner";
import { buildConfiguredLesson } from "../../utils/lessonRunnerBuilder";
import { generateActivityFromText } from "../../utils/activityGenerators";
import { printLesson } from "../../utils/printLesson";
import { getSyllables } from "../../utils/syllables";
import { useStore } from "../../store/useStore";
import { ClozeInteractiveEditor } from "./ClozeInteractiveEditor";
import { MatchingActivityEditor } from "./MatchingActivityEditor";
import { DictationActivityEditor } from "./DictationActivityEditor";
import { ListeningActivityEditor } from "./ListeningActivityEditor";
import { ListenAndRepeatActivityEditor } from "./ListenAndRepeatActivityEditor";
import { MultipleChoiceActivityEditor } from "./MultipleChoiceActivityEditor";
import { FlashcardsActivityEditor } from "./FlashcardsActivityEditor";
import { WatchingActivityEditor } from "./WatchingActivityEditor";
import { WritingActivityEditor } from "./WritingActivityEditor";
import { SpeakingActivityEditor } from "./SpeakingActivityEditor";

export function LessonEditor({
  editingLesson,
  setEditingLesson,
  activeLessonObj,
  updateLessonField,
  isReorderingActivities,
  setIsReorderingActivities,
  currentActivities,
  handleMoveActivity,
  handleDuplicateActivity,
  handleDeleteActivity,
  handleAddActivity,
  handleDeleteLesson,
  setEditingFlashcardTargetActivityId,
  dictionaryWords,
  updateDictionary,
  onGoToObjectives,
}: {
  editingLesson: {
    lessonId: string;
    lessonTitle: string;
  };
  setEditingLesson: (lesson: any) => void;
  activeLessonObj: any;
  updateLessonField: (field: string, value: any) => void;
  isReorderingActivities: boolean;
  setIsReorderingActivities: (val: boolean) => void;
  currentActivities: any[];
  handleMoveActivity: (index: number, direction: "up" | "down") => void;
  handleDuplicateActivity: (activity: any, index: number) => void;
  handleDeleteActivity: (id: number) => void;
  handleAddActivity: (
    type:
      | "Watching"
      | "Reading"
      | "Flashcards"
      | "Flashcards-sm2"
      | "Grammar Flashcards"
      | "Dictation"
      | "Listening"
      | "Speaking"
      | "Writing"
      | "Cloze"
      | "Matching"
      | "Multiple Choice",
  ) => void;
  handleDeleteLesson: (lessonId: string) => void;
  setEditingFlashcardTargetActivityId: (id: number | null) => void;
  dictionaryWords: DictionaryEntry[];
  updateDictionary: (words: DictionaryEntry[] | DictionaryEntry) => Promise<void> | void;
  onGoToObjectives?: () => void;
}) {
  const appParameters = useStore((state) => state.appParameters);


  const [expandedActivities, setExpandedActivities] = useState<Record<number, boolean>>({});
  const [isConfirmingRemoveLesson, setIsConfirmingRemoveLesson] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);

  // Auto-expand newly added activities
  const prevActivitiesLengthRef = useRef(currentActivities.length);
  useEffect(() => {
    if (currentActivities.length > prevActivitiesLengthRef.current) {
      const newActivity = currentActivities[currentActivities.length - 1];
      setExpandedActivities(prev => ({ ...prev, [newActivity.id]: true }));
    }
    prevActivitiesLengthRef.current = currentActivities.length;
  }, [currentActivities]);

  const toggleActivityCollapse = useCallback((activityId: number) => {
    setExpandedActivities(prev => ({
      ...prev,
      [activityId]: !prev[activityId]
    }));
  }, []);

  const updateActivityField = useCallback((
    activityId: number,
    field: string | Record<string, any>,
    value?: any,
  ) => {
    const newActivities = currentActivities.map((a: any) => {
      if (a.id === activityId) {
        if (typeof field === "object") {
          return { ...a, ...field };
        } else {
          return { ...a, [field]: value };
        }
      }
      return a;
    });
    updateLessonField("activities", newActivities);
  }, [currentActivities, updateLessonField]);

  const handleGenerateActivityFromText = useCallback((
    type: "flashcard" | "matching" | "cloze",
    text: string,
  ) => {
    const result = generateActivityFromText(type, text, dictionaryWords);
    
    if (result.error) {
      alert(result.error);
      return;
    }

    const newActivities = [...currentActivities, result.activity];
    alert(result.message);

    updateLessonField("activities", newActivities);
  }, [currentActivities, dictionaryWords, updateLessonField]);

  const handleAutoGenerateWords = useCallback((activityId: number) => {
    const currentIndex = currentActivities.findIndex((a: any) => a.id === activityId);
    if (currentIndex === -1) return;
    
    let sourceText = "";
    for (let i = 0; i < currentIndex; i++) {
      const a = currentActivities[i];
      if (a.type === "Reading" && a.readingSlides) {
        sourceText += a.readingSlides.join(" ") + " ";
      }
      if (a.type === "Video" && a.videoDesc) {
        sourceText += a.videoDesc + " ";
      }
    }

    let selectedWordIds: string[] = [];
    
    if (sourceText.trim().length > 0) {
      const textLower = sourceText.toLowerCase();
      const matchedWords = dictionaryWords.filter(dw => {
        const wordToMatch = dw.word || dw.lemma || "";
        return wordToMatch && textLower.includes(wordToMatch.toLowerCase());
      }).map(dw => dw.id);
      selectedWordIds = matchedWords.slice(0, 10);
    }

    if (selectedWordIds.length === 0) {
      selectedWordIds = [...dictionaryWords].sort(() => 0.5 - Math.random()).slice(0, 6).map(dw => dw.id);
    }

    if (selectedWordIds.length > 0) {
      updateActivityField(activityId, "flashcardWordIds", selectedWordIds);
    } else {
      alert("No words available in dictionary to generate from.");
    }
  }, [currentActivities, dictionaryWords, updateActivityField]);

  const [showPreview, setShowPreview] = useState(false);

  return (
    <div
      className={
        showPreview
          ? "fixed inset-0 z-[100] bg-white flex w-full h-full overflow-hidden"
          : "max-w-7xl w-full mx-auto space-y-6 relative pb-12"
      }
    >
      {/* Editor Side */}
      <div
        className={
          showPreview
            ? "w-1/2 h-full overflow-y-auto border-r border-primary-light flex flex-col bg-white"
            : "w-full"
        }
      >
        {/* Sticky Action Bar */}
        <div
          className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border border-primary-light p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${showPreview ? "border-t-0 border-l-0 border-r-0 border-b border-primary-light/50" : "rounded-2xl mb-6"}`}
        >
          <div>
            <button
              onClick={() => setEditingLesson(null)}
              className="text-text-secondary hover:text-text-primary text-[14px] font-medium transition-colors mb-1"
            >
              ← Back to Course Builder
            </button>
            <div className="font-bold text-[18px] text-primary-dark">
              Editing: {activeLessonObj?.title || editingLesson.lessonTitle}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Controls */}
            <div className="flex items-center bg-neutral-bg p-1 rounded-xl border border-primary-light/50 hidden sm:flex">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${showPreview ? "bg-white text-primary-dark shadow-sm border border-primary-light/50" : "text-text-secondary hover:text-text-primary"}`}
              >
                <span>👁️</span> {showPreview ? "Close Split View" : "Split View"}
              </button>
              <button
                onClick={() => printLesson(activeLessonObj, dictionaryWords)}
                className="px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <span>🖨️</span> Print PDF
              </button>
            </div>

            {/* Status Selector */}
            <select
              value={activeLessonObj?.status || "Draft"}
              onChange={(e) => updateLessonField("status", e.target.value)}
              className="px-3 py-2 bg-white border border-primary-light rounded-xl text-sm font-bold text-primary-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="Draft">📝 Draft</option>
              <option value="Published">✅ Published</option>
            </select>

            <div className="h-6 w-px bg-primary-light/50 hidden sm:block"></div>

            {/* Main Action */}
            <Button
              variant="primary"
              onClick={() => setEditingLesson(null)}
              className="shadow-sm"
            >
              <span className="mr-2">✓</span> Save & Close
            </Button>

            {/* Delete Button */}
            {isConfirmingRemoveLesson ? (
              <div className="flex items-center gap-1.5 bg-red-50 p-1.5 rounded-xl border border-red-200">
                <span className="text-xs font-bold text-red-700 px-1">Delete?</span>
                <Button
                  variant="primary"
                  className="bg-red-500 hover:bg-red-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs shadow-sm transition-colors"
                  onClick={() => {
                    handleDeleteLesson(
                      editingLesson.lessonId
                    );
                    setEditingLesson(null);
                    setIsConfirmingRemoveLesson(false);
                  }}
                >
                  Yes
                </Button>
                <Button
                  variant="outline"
                  className="bg-white hover:bg-neutral-bg text-text-secondary border border-primary-light/50 font-semibold px-3 py-1.5 rounded-lg text-xs shadow-sm transition-colors"
                  onClick={() => setIsConfirmingRemoveLesson(false)}
                >
                  No
                </Button>
              </div>
            ) : (
              <button
                className="p-2 text-text-secondary hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                onClick={() => setIsConfirmingRemoveLesson(true)}
                title="Delete lesson"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        <div
          className={`bg-card-bg border-primary-light p-8 shadow-sm ${showPreview ? "border-0 shadow-none py-6 px-8" : "border rounded-[20px]"}`}
        >
          <div className="mt-2 space-y-8">
            {/* Lesson Metadata */}
            <div>
              <h3 className="font-bold text-[18px] mb-4 border-b border-primary-light pb-2">
                1. General Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-text-primary mb-2">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={activeLessonObj?.title || ""}
                    onChange={(e) => updateLessonField("title", e.target.value)}
                    className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-text-primary mb-2">
                    Short Description
                  </label>
                  <textarea
                    className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px] min-h-[80px]"
                    placeholder="What will students learn in this lesson?..."
                    value={activeLessonObj?.desc || ""}
                    onChange={(e) => updateLessonField("desc", e.target.value)}
                  />
                </div>
                <div className="pt-4 border-t border-primary-light/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[14px] text-text-primary flex items-center gap-1.5">
                      <span>🎯</span> Learning Objectives
                    </h4>
                    <span className="text-[11px] font-extrabold bg-primary-light/20 text-primary-dark px-2 py-0.5 rounded-full uppercase">
                      {(activeLessonObj?.objectives || []).length} linked
                    </span>
                  </div>
                  
                  {(!activeLessonObj?.objectives || activeLessonObj.objectives.length === 0) ? (
                    <div className="p-3 bg-neutral-bg/60 border border-dashed border-primary-light rounded-xl text-center">
                      <p className="text-[12px] text-text-secondary">
                        No pedagogical objectives specified for this lesson yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {activeLessonObj.objectives.slice(0, 3).map((obj: any) => (
                        <div key={obj.id} className="text-xs font-semibold text-text-secondary flex items-start gap-1.5 bg-neutral-bg/30 p-2 rounded-lg border border-primary-light/20">
                          <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-100 px-1 rounded font-bold shrink-0">
                            {obj.level}
                          </span>
                          <span className="line-clamp-1">{obj.text}</span>
                        </div>
                      ))}
                      {activeLessonObj.objectives.length > 3 && (
                        <p className="text-[10px] text-primary font-bold italic pl-1">
                          + {activeLessonObj.objectives.length - 3} more objectives...
                        </p>
                      )}
                    </div>
                  )}

                  {onGoToObjectives && (
                    <Button
                      variant="outline"
                      onClick={onGoToObjectives}
                      className="w-full text-xs py-1.5 font-bold hover:bg-primary-light/25 border-primary-light/80 text-primary flex items-center justify-center gap-1.5"
                    >
                      <span>🎯</span> Manage Pedagogical Objectives
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Activities List */}
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-primary-light pb-2">
                <h3 className="font-bold text-[18px]">2. Lesson Activities</h3>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <select
                      id="add-activity-select"
                      className="bg-neutral-bg border border-primary-light rounded-lg p-1.5 text-[14px]"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddActivity(e.target.value as any);
                          e.target.value = ""; // Reset
                        }
                      }}
                    >
                      <option value="">+ Add Activity...</option>
                      <option value="Watching">Watching</option>
                      <option value="Reading">Reading</option>
                      <option value="Flashcards">Flashcards</option>
                      <option value="Grammar Flashcards">
                        Grammar Flashcards
                      </option>
                      <option value="Listening">Listening</option>
                      <option value="Listen and Repeat">Listen and Repeat</option>
                      <option value="Speaking">Speaking</option>
                      <option value="Dictation">Dictation</option>
                      <option value="Writing">Writing</option>
                      <option value="Cloze">Cloze</option>
                      <option value="Matching">Matching</option>
                      <option value="Multiple Choice">Multiple Choice</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentActivities.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary bg-neutral-bg rounded-[16px] border border-dashed border-primary-light">
                    No activities in this lesson yet. Add one to get started!
                  </div>
                ) : (
                  currentActivities.map((activity: any, index: number) => {
                    return (
                      <div
                        key={activity.id}
                        className="bg-neutral-bg border border-primary-light rounded-[16px] relative"
                      >
                        {/* HEADER */}
                        <div 
                          className={`bg-primary-light/10 p-3 px-4 flex items-center justify-between cursor-pointer hover:bg-primary-light/20 transition-colors ${!expandedActivities[activity.id] ? 'rounded-[15px]' : 'rounded-t-[15px] border-b border-primary-light/50'}`}
                          onClick={() => toggleActivityCollapse(activity.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-primary-dark/60 font-bold w-4 flex justify-center text-[10px]">
                              {!expandedActivities[activity.id] ? '▶' : '▼'}
                            </span>
                            <div className="flex flex-col gap-0.5 mr-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveActivity(index, "up");
                                }}
                                disabled={index === 0}
                                className="text-text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                ▲
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveActivity(index, "down");
                                }}
                                disabled={
                                  index === currentActivities.length - 1
                                }
                                className="text-text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                ▼
                              </button>
                            </div>
                            <span className="font-bold text-primary-dark">
                              Activity {index + 1}: {activity.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateActivity(activity, index);
                              }}
                              className="text-xs text-text-secondary hover:text-primary px-2"
                              title="Duplicate Activity"
                            >
                              Copy
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivityToDelete(activity.id);
                              }}
                              className="text-xs text-red-400 hover:text-red-600 px-2 uppercase tracking-wide font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* BODY */}
                        {expandedActivities[activity.id] && (
                          <div className="p-4 space-y-4">
                            {/* 1) Watching */}
                          {activity.type === "Watching" && (
                            <WatchingActivityEditor
                              activity={activity}
                              updateActivityField={updateActivityField}
                            />
                          )}

                          {/* 2) Reading */}
                          {activity.type === "Reading" && (
                            <ReadingActivityEditor
                              readingType={activity.readingType || "text"}
                              readingTitle={activity.readingTitle || ""}
                              readingSlides={activity.readingSlides || [""]}
                              updateLessonField={(field, value) =>
                                updateActivityField(
                                  activity.id,
                                  field.replace("reading", "") ? field : field,
                                  value,
                                )
                              }
                              dictionaryWords={dictionaryWords}
                              updateDictionary={updateDictionary}
                              onGenerateActivity={
                                handleGenerateActivityFromText
                              }
                            />
                          )}

                          {/* 3) Flashcards */}
                          {(activity.type === "Flashcards" ||
                            activity.type === "Flashcards-sm2" ||
                            activity.type === "Grammar Flashcards") && (
                            <FlashcardsActivityEditor
                              activity={activity}
                              updateActivityField={updateActivityField}
                              dictionaryWords={dictionaryWords}
                              setEditingFlashcardTargetActivityId={setEditingFlashcardTargetActivityId}
                              handleAutoGenerateWords={handleAutoGenerateWords}
                            />
                          )}

                          {/* 4) Cloze */}
                          {activity.type === "Cloze" && (
                            <div className="space-y-4">
                              <ClozeInteractiveEditor
                                activity={activity}
                                updateActivityField={updateActivityField}
                              />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                  <label className="block text-[14px] font-medium text-text-primary mb-1">
                                    Distractors (comma separated)
                                  </label>
                                  <input
                                    type="text"
                                    value={activity.clozeDistractors || ""}
                                    onChange={(e) =>
                                      updateActivityField(
                                        activity.id,
                                        "clozeDistractors",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
                                    placeholder="apple, banana, orange"
                                  />
                                </div>
                              </div>

                              {/* Cloze Settings */}
                              <div className="mt-4 pt-4 border-t border-primary-light">
                                <h4 className="font-bold text-[14px] mb-3 text-primary-dark">
                                  Activity Configurations
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                      Typo Tolerance
                                    </label>
                                    <select
                                      className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
                                      value={activity.clozeTolerance || ""}
                                      onChange={(e) =>
                                        updateActivityField(
                                          activity.id,
                                          "clozeTolerance",
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="">Global Default</option>
                                      <option value="Stricte">
                                        Strict (0 mistakes)
                                      </option>
                                      <option value="Normale">
                                        Normal (1-2 mistakes)
                                      </option>
                                      <option value="Souple">
                                        Lenient (3+ mistakes)
                                      </option>
                                    </select>
                                  </div>
                                  <div className="flex items-center justify-between col-span-1 mt-6">
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-primary"
                                        checked={
                                          activity.clozeShowChoices !== false
                                        }
                                        onChange={(e) =>
                                          updateActivityField(
                                            activity.id,
                                            "clozeShowChoices",
                                            e.target.checked,
                                          )
                                        }
                                      />
                                      <span className="text-[12px] font-bold text-text-secondary">
                                        Show Options
                                      </span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 5) Dictation */}
                          {activity.type === "Dictation" && (
                            <DictationActivityEditor
                              activity={activity}
                              updateActivityField={updateActivityField}
                            />
                          )}

                          {/* 6) Matching */}
                          {activity.type === "Matching" && (
                            <MatchingActivityEditor
                              activity={activity}
                              updateActivityField={updateActivityField}
                              dictionaryWords={dictionaryWords}
                              setEditingFlashcardTargetActivityId={setEditingFlashcardTargetActivityId}
                            />
                          )}

                          {/* Multiple Choice */}
                          {activity.type === "Multiple Choice" && (
                            <MultipleChoiceActivityEditor
                              activity={activity}
                              updateActivityField={updateActivityField}
                            />
                          )}

                          {/* 7) Listening */}
                          {activity.type === "Listening" && (
                            <ListeningActivityEditor
                              activity={activity}
                              updateActivityField={updateActivityField}
                            />
                          )}

                          {/* 8) Listen and Repeat */}
                          {activity.type === "Listen and Repeat" && (
                            <ListenAndRepeatActivityEditor
                              activity={activity}
                              updateActivityField={updateActivityField}
                              dictionaryWords={dictionaryWords}
                            />
                          )}

                          {/* Writing Activity */}
                          {(activity.type === "Writing" || activity.type === "writing") && (
                            <WritingActivityEditor
                              activity={activity}
                              updateActivityField={updateActivityField}
                              dictionaryWords={dictionaryWords}
                            />
                          )}

                          {/* Speaking Activity */}
                          {activity.type === "Speaking" && (
                            <SpeakingActivityEditor
                              activity={activity}
                              updateActivityField={updateActivityField}
                              dictionaryWords={dictionaryWords}
                            />
                          )}
                        </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Side */}
      {showPreview && activeLessonObj && (
        <div className="w-1/2 h-full bg-neutral-bg flex flex-col relative shrink-0">
          <div className="bg-white border-b border-primary-light p-4 flex justify-between items-center shadow-sm z-10 shrink-0">
            <div className="font-bold text-primary-dark flex items-center gap-2">
              <span className="text-xl">📱</span> Live Preview:{" "}
              {activeLessonObj.title}
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowPreview(false)}
              className="text-text-secondary hover:bg-neutral-bg"
            >
              Close ✕
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto bg-neutral-bg relative h-full">
            {activeLessonObj.activities &&
            activeLessonObj.activities.length > 0 ? (
              <LessonRunner
                lesson={buildConfiguredLesson(activeLessonObj, dictionaryWords, appParameters)}
                onFinish={() => setShowPreview(false)}
                onBack={() => setShowPreview(false)}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center text-text-secondary">
                <div className="bg-white p-8 rounded-2xl border border-primary-light max-w-md">
                  <div className="text-4xl mb-4">📭</div>
                  <h3 className="text-xl font-bold text-primary-dark mb-2">
                    No activities yet
                  </h3>
                  <p>
                    Add some activities to this lesson to see the live preview.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activityToDelete !== null && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-primary-light/30">
            <h3 className="text-[20px] font-bold text-primary-dark mb-4">Delete Activity</h3>
            <p className="text-text-secondary mb-8">Are you sure you want to delete this activity? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setActivityToDelete(null)}
                className="text-text-secondary hover:text-primary font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-500 hover:bg-red-600 text-white font-bold"
                onClick={() => {
                  handleDeleteActivity(activityToDelete);
                  setActivityToDelete(null);
                }}
              >
                Delete Activity
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
