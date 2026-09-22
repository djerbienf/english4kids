import React from "react";

interface MultipleChoiceActivityEditorProps {
  activity: any;
  updateActivityField: (activityId: number, field: string | Record<string, any>, value?: any) => void;
}

export function MultipleChoiceActivityEditor({ activity, updateActivityField }: MultipleChoiceActivityEditorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-[14px] font-medium text-text-primary mb-1">
            Question
          </label>
          <input
            type="text"
            value={activity.multipleChoiceQuestion || ""}
            onChange={(e) =>
              updateActivityField(
                activity.id,
                "multipleChoiceQuestion",
                e.target.value,
              )
            }
            className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
            placeholder="Mot en français"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[14px] font-medium text-text-primary mb-2">
            Options
          </label>
          <div className="space-y-2">
            {((activity.multipleChoiceOptions as string[]) || []).map((option: string, optIdx: number) => (
              <div key={optIdx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(activity.multipleChoiceOptions || [])];
                    newOptions[optIdx] = e.target.value;
                    updateActivityField(
                      activity.id,
                      "multipleChoiceOptions",
                      newOptions,
                    );
                  }}
                  className="flex-1 bg-white border border-primary-light rounded-lg p-2 text-[14px] font-arabic"
                  dir="rtl"
                  placeholder={`خيار ${optIdx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = [...(activity.multipleChoiceOptions || [])];
                    newOptions.splice(optIdx, 1);
                    updateActivityField(
                      activity.id,
                      "multipleChoiceOptions",
                      newOptions,
                    );
                  }}
                  className="text-red-400 hover:text-red-600 font-bold p-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newOptions = [...(activity.multipleChoiceOptions || []), ""];
                updateActivityField(
                  activity.id,
                  "multipleChoiceOptions",
                  newOptions,
                );
              }}
              className="mt-2 text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span> Add Option
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-[14px] font-medium text-text-primary mb-1">
            Correct Answer
          </label>
          <select
            value={activity.multipleChoiceCorrectAnswer || ""}
            onChange={(e) =>
              updateActivityField(
                activity.id,
                "multipleChoiceCorrectAnswer",
                e.target.value,
              )
            }
            className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px] font-semibold"
          >
            <option value="" disabled>Select correct answer</option>
            {((activity.multipleChoiceOptions as string[]) || []).map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-[14px] font-medium text-text-primary mb-1">
            Pedagogical Explanation & Hint (Optional)
          </label>
          <input
            type="text"
            value={activity.explanation || ""}
            onChange={(e) =>
              updateActivityField(
                activity.id,
                "explanation",
                e.target.value,
              )
            }
            className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
            placeholder="Explain why the correct answer is right (e.g. 'Past continuous is required for actions in progress')."
          />
        </div>
      </div>
    </div>
  );
}
