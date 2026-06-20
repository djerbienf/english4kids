import React from "react";
import { Button } from "../Button";
import { TextScanner } from "./TextScanner";
import { ReadingActivityEditor } from "./ReadingActivityEditor";
import { DictionaryEntry } from "../../types";

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
  setEditingFlashcardTargetActivityId,
  dictionaryWords,
  updateDictionary
}: {
  editingLesson: { unitId: string; lessonId: string; unitTitle: string; lessonTitle: string };
  setEditingLesson: (lesson: any) => void;
  activeLessonObj: any;
  updateLessonField: (field: string, value: any) => void;
  isReorderingActivities: boolean;
  setIsReorderingActivities: (val: boolean) => void;
  currentActivities: any[];
  handleMoveActivity: (index: number, direction: 'up' | 'down') => void;
  handleDuplicateActivity: (activity: any, index: number) => void;
  handleDeleteActivity: (id: number) => void;
  handleAddActivity: (type: "Watching" | "Reading" | "Flashcards" | "Grammar Flashcards" | "Dictation" | "Listening" | "Speaking" | "Writing" | "Cloze" | "Matching") => void;
  setEditingFlashcardTargetActivityId: (id: number | null) => void;
  dictionaryWords: DictionaryEntry[];
  updateDictionary: (words: DictionaryEntry[]) => void;
}) {
  // Default values for fields
  const videoUrl =
    activeLessonObj?.videoUrl ??
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  const videoTitle =
    activeLessonObj?.videoTitle ??
    `Video Core: ${editingLesson.lessonTitle}`;
  const videoDesc =
    activeLessonObj?.videoDesc ??
    "Watch this video carefully to understand the lesson and do the exercises.";
  const videoStart = activeLessonObj?.videoStart ?? "";
  const videoEnd = activeLessonObj?.videoEnd ?? "";

  const flashcardWord = activeLessonObj?.flashcardWord ?? "Greetings vocab";
  const flashcardTrans =
    activeLessonObj?.flashcardTrans ?? "مفردات التحيات";
  const flashcardExample =
    activeLessonObj?.flashcardExample ??
    "Always start with a pleasant greeting.";
  const flashcardWordIds = activeLessonObj?.flashcardWordIds ?? [];

  const clozeSentenceBefore =
    activeLessonObj?.clozeSentenceBefore ?? "Have a great ";
  const clozeSentenceAfter =
    activeLessonObj?.clozeSentenceAfter ?? " head start of the day!";
  const clozeCorrect = activeLessonObj?.clozeCorrect ?? "morning";
  const clozeDistractors =
    activeLessonObj?.clozeDistractors ?? "automobile, vegetable, water";

  const readingType = activeLessonObj?.readingType ?? "text";
  const readingSlides = activeLessonObj?.readingSlides ?? [
    "Once upon a time...",
  ];
  const readingTitle = activeLessonObj?.readingTitle ?? "";
  const readingAudioUrl = activeLessonObj?.readingAudioUrl ?? "";
  const readingImageUrl = activeLessonObj?.readingImageUrl ?? "";
  const readingVocabulary = activeLessonObj?.readingVocabulary ?? [];
  const readingUnscrambleText =
    activeLessonObj?.readingUnscrambleText ?? "";

  const updateActivityField = (activityId: number, field: string, value: any) => {
    const newActivities = currentActivities.map((a: any) =>
      a.id === activityId ? { ...a, [field]: value } : a
    );
    updateLessonField("activities", newActivities);
  };

  return (
    <div className="max-w-7xl w-full mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setEditingLesson(null)}
          className="text-text-secondary hover:text-text-primary text-[14px]"
        >
          ← Back to Course Organization
        </button>
      </div>

      <div className="bg-card-bg border border-primary-light rounded-[20px] p-8 shadow-sm">
        <h2 className="text-[24px] font-bold text-primary-dark mb-2">
          Editing Lesson: {editingLesson.lessonTitle}
        </h2>
        <p className="text-text-secondary">
          Unit: {editingLesson.unitTitle}
        </p>

        <div className="mt-8 space-y-8">
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
                  onChange={(e) =>
                    updateLessonField("title", e.target.value)
                  }
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
            </div>
          </div>

          {/* Activities List */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-primary-light pb-2">
              <h3 className="font-bold text-[18px]">2. Lesson Activities</h3>
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  className={`text-sm px-3 py-1.5 ${isReorderingActivities ? 'bg-primary/10 border-primary shadow-inner' : ''}`}
                  onClick={() => setIsReorderingActivities(!isReorderingActivities)}
                >
                  {isReorderingActivities ? "Done Reordering" : "Reorder"}
                </Button>
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
                    <option value="Grammar Flashcards">Grammar Flashcards</option>
                    <option value="Listening">Listening</option>
                    <option value="Speaking">Speaking</option>
                    <option value="Dictation">Dictation</option>
                    <option value="Writing">Writing</option>
                    <option value="Cloze">Cloze</option>
                    <option value="Matching">Matching</option>
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
                    <div key={activity.id} className="bg-neutral-bg border border-primary-light rounded-[16px] overflow-hidden">
                      {/* HEADER */}
                      <div className="bg-primary-light/10 p-3 px-4 flex items-center justify-between border-b border-primary-light/50">
                        <div className="flex items-center gap-3">
                          {isReorderingActivities && (
                            <div className="flex flex-col gap-0.5 mr-2">
                              <button 
                                onClick={() => handleMoveActivity(index, 'up')}
                                disabled={index === 0}
                                className="text-text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                ▲
                              </button>
                              <button 
                                onClick={() => handleMoveActivity(index, 'down')}
                                disabled={index === currentActivities.length - 1}
                                className="text-text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                ▼
                              </button>
                            </div>
                          )}
                          <span className="font-bold text-primary-dark">Activity {index + 1}: {activity.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDuplicateActivity(activity, index)}
                            className="text-xs text-text-secondary hover:text-primary px-2"
                            title="Duplicate Activity"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="text-xs text-red-400 hover:text-red-600 px-2 uppercase tracking-wide font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* BODY */}
                      <div className="p-4 space-y-4">
                        {/* 1) Watching */}
                        {activity.type === "Watching" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-[14px] font-medium text-text-primary mb-1">
                                Video URL (YouTube, MP4)
                              </label>
                              <input
                                type="text"
                                value={activity.videoUrl || ""}
                                onChange={(e) => updateActivityField(activity.id, "videoUrl", e.target.value)}
                                className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
                                placeholder="https://..."
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[14px] font-medium text-text-primary mb-1">
                                Video Title
                              </label>
                              <input
                                type="text"
                                value={activity.videoTitle || ""}
                                onChange={(e) => updateActivityField(activity.id, "videoTitle", e.target.value)}
                                className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[14px] font-medium text-text-primary mb-1">
                                Description / Instructions
                              </label>
                              <textarea
                                value={activity.videoDesc || ""}
                                onChange={(e) => updateActivityField(activity.id, "videoDesc", e.target.value)}
                                className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
                                rows={2}
                              />
                            </div>
                          </div>
                        )}

                        {/* 2) Reading */}
                        {activity.type === "Reading" && (
                          <ReadingActivityEditor
                            readingType={activity.readingType || 'text'}
                            readingTitle={activity.readingTitle || ''}
                            readingSlides={activity.readingSlides || ['']}
                            updateLessonField={(field, value) => updateActivityField(activity.id, field.replace('reading', '') ? field : field, value)} 
                            dictionaryWords={dictionaryWords}
                            updateDictionary={updateDictionary}
                          />
                        )}

                        {/* 3) Flashcards */}
                        {activity.type === "Flashcards" && (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-4 items-end">
                              <div className="flex-1 min-w-[200px]">
                                <label className="block text-[14px] font-medium text-text-primary mb-1">
                                  Selected Words: {activity.flashcardWordIds?.length || 0}
                                </label>
                                <div className="text-xs text-text-secondary p-2 bg-white rounded border border-primary-light min-h-[40px]">
                                  {activity.flashcardWordIds && activity.flashcardWordIds.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {activity.flashcardWordIds.map((id: string) => {
                                        const w = dictionaryWords.find((w) => w.id === id);
                                        return w ? (
                                          <span key={id} className="bg-primary-light/20 text-primary-dark px-2 border border-primary-light rounded-full">
                                            {w.lemma || w.word}
                                          </span>
                                        ) : null;
                                      })}
                                    </div>
                                  ) : (
                                    "No words selected. Click 'Select Flow' or use Auto Generate."
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => setEditingFlashcardTargetActivityId(activity.id)}
                              >
                                Select Dictionary Words
                              </Button>
                              <Button
                                onClick={() => {
                                  alert("This will auto-extract likely vocabulary words from the previous reading/watching activities using AI. (Not implemented in demo)");
                                }}
                              >
                                Auto Generate
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* 4) Text / other types with minimal configs for now */}
                        {["Grammar Flashcards", "Listening", "Speaking", "Dictation", "Writing", "Cloze", "Matching"].includes(activity.type) && (
                          <div className="bg-white p-4 rounded-lg border border-primary-light/50 text-center text-text-secondary text-sm">
                            Configuration panel for {activity.type} is simplified. 
                            In a full app, you would configure specific fields here (e.g. grammar rules, cloze gaps, audio prompts).
                            <p className="mt-2 text-xs opacity-70">Standard title/description fields would appear here.</p>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
