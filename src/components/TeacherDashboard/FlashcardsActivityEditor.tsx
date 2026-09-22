import React from "react";
import { Button } from "../Button";

interface FlashcardsActivityEditorProps {
  activity: any;
  updateActivityField: (activityId: number, field: string | Record<string, any>, value?: any) => void;
  dictionaryWords: any[];
  setEditingFlashcardTargetActivityId: (id: number) => void;
  handleAutoGenerateWords: (id: number) => void;
}

export function FlashcardsActivityEditor({
  activity,
  updateActivityField,
  dictionaryWords,
  setEditingFlashcardTargetActivityId,
  handleAutoGenerateWords,
}: FlashcardsActivityEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[14px] font-medium text-text-primary mb-1">
            Selected Words:{" "}
            {activity.flashcardWordIds?.length || 0}
          </label>
          <div className="text-xs text-text-secondary p-2 bg-white rounded border border-primary-light min-h-[40px]">
            {activity.flashcardWordIds &&
            activity.flashcardWordIds.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {activity.flashcardWordIds.map(
                  (id: string) => {
                    const w = dictionaryWords.find(
                      (w) => w.id === id,
                    );
                    return w ? (
                      <span
                        key={id}
                        className="bg-primary-light/20 text-primary-dark pl-2 pr-1 py-0.5 border border-primary-light rounded-full flex items-center gap-1"
                      >
                        <span>{w.lemma || w.word}</span>
                        <button
                          onClick={() => {
                            const newWordIds = activity.flashcardWordIds.filter((wordId: string) => wordId !== id);
                            updateActivityField(activity.id, "flashcardWordIds", newWordIds);
                          }}
                          className="hover:bg-red-100 hover:text-red-600 text-primary-dark/60 rounded-full w-4 h-4 flex items-center justify-center font-bold text-sm leading-none transition-colors"
                          title="Remove word"
                        >
                          &times;
                        </button>
                      </span>
                    ) : null;
                  },
                )}
              </div>
            ) : (
              "No words selected. Click 'Select Flow' or use Auto Generate."
            )}
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            setEditingFlashcardTargetActivityId(
              activity.id,
            )
          }
        >
          Select Dictionary Words
        </Button>
        <Button
          onClick={() => handleAutoGenerateWords(activity.id)}
        >
          Auto Generate
        </Button>
      </div>

        {/* Flashcard Settings */}
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
              value={
                activity.flashcardTolerance || "Normale"
              }
              onChange={(e) =>
                updateActivityField(
                  activity.id,
                  "flashcardTolerance",
                  e.target.value,
                )
              }
            >
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
          <div>
            <label className="block text-[12px] font-bold text-text-secondary mb-1">
              Attempts Mode
            </label>
            <select
              className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
              value={
                activity.flashcardAttemptsMode ||
                "infinite"
              }
              onChange={(e) =>
                updateActivityField(
                  activity.id,
                  "flashcardAttemptsMode",
                  e.target.value,
                )
              }
            >
              <option value="infinite">Infinite</option>
              <option value="limited">Limited</option>
            </select>
          </div>
          {activity.flashcardAttemptsMode ===
            "limited" && (
            <div>
              <label className="block text-[12px] font-bold text-text-secondary mb-1">
                Max Attempts
              </label>
              <input
                type="number"
                className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
                value={
                  activity.flashcardMaxAttempts || 3
                }
                onChange={(e) =>
                  updateActivityField(
                    activity.id,
                    "flashcardMaxAttempts",
                    parseInt(e.target.value, 10),
                  )
                }
              />
            </div>
          )}
          <div className="flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-1 mt-2">
            <span className="text-[12px] font-bold text-text-secondary">
              Allow Hints
            </span>
            <input
              type="checkbox"
              className="w-4 h-4 accent-primary"
              checked={
                activity.flashcardUseHints !== false
              }
              onChange={(e) =>
                updateActivityField(
                  activity.id,
                  "flashcardUseHints",
                  e.target.checked,
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
