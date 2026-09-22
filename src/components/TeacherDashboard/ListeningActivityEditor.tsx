import React, { useState } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../Button";
import { AssetPickerModal } from "./AssetPickerModal";

interface ListeningActivityEditorProps {
  activity: any;
  updateActivityField: (activityId: number, field: string | Record<string, any>, value?: any) => void;
}

export function ListeningActivityEditor({ activity, updateActivityField }: ListeningActivityEditorProps) {
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[14px] font-bold text-text-secondary mb-1">
          Title
        </label>
        <input
          type="text"
          value={activity.title || ""}
          onChange={(e) =>
            updateActivityField(
              activity.id,
              "title",
              e.target.value,
            )
          }
          placeholder="E.g. Listen to the conversation"
          className="w-full border-2 border-primary-light/50 rounded-lg p-2 focus:border-primary outline-none text-[14px]"
        />
      </div>
      <div>
        <label className="block text-[14px] font-bold text-text-secondary mb-1">
          Audio URL <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={activity.listeningAudioUrl || ""}
            onChange={(e) =>
              updateActivityField(
                activity.id,
                "listeningAudioUrl",
                e.target.value,
              )
            }
            placeholder="https://.../audio.mp3"
            className="flex-1 border-2 border-primary-light/50 rounded-lg p-2 focus:border-primary outline-none text-[14px]"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAssetPicker(true)}
            className="text-xs px-3 border-primary-light bg-white flex items-center gap-1.5"
          >
            <FolderOpen size={14} /> Media
          </Button>
        </div>
      </div>
      <div>
        <label className="block text-[14px] font-bold text-text-secondary mb-1">
          Transcript (Optional)
        </label>
        <textarea
          value={activity.listeningTranscript || ""}
          onChange={(e) =>
            updateActivityField(
              activity.id,
              "listeningTranscript",
              e.target.value,
            )
          }
          placeholder="Full transcript of the audio..."
          className="w-full border-2 border-primary-light/50 rounded-lg p-2 focus:border-primary outline-none text-[14px] h-24"
        />
      </div>

      <AssetPickerModal
        isOpen={showAssetPicker}
        onClose={() => setShowAssetPicker(false)}
        filterType="audio"
        title="Select Listening Audio"
        onSelect={(url) => updateActivityField(activity.id, "listeningAudioUrl", url)}
      />
      
      <div className="pt-4 border-t border-primary-light/30">
        <h4 className="font-bold text-primary-dark mb-4 text-[16px]">
          Comprehension Questions
        </h4>
        <div className="space-y-4">
          {(!activity.listeningQuestions || activity.listeningQuestions.length === 0) && (
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-dashed border-primary/30 text-text-secondary text-sm">
              No questions yet. Click the button below to add one.
            </div>
          )}
          {(activity.listeningQuestions || []).map(
            (q: any, qIndex: number) => (
              <div key={qIndex} className="p-4 border border-primary-light rounded-lg bg-neutral-bg space-y-4 relative group">
                <button
                  onClick={() => {
                    const newQ = [...(activity.listeningQuestions || [])];
                    newQ.splice(qIndex, 1);
                    updateActivityField(activity.id, "listeningQuestions", newQ);
                  }}
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
                <div>
                  <label className="block text-[12px] font-bold text-text-secondary mb-1">Question</label>
                  <input
                    type="text"
                    value={q.question || ""}
                    onChange={(e) => {
                      const newQ = [...(activity.listeningQuestions || [])];
                      newQ[qIndex] = { ...newQ[qIndex], question: e.target.value };
                      updateActivityField(activity.id, "listeningQuestions", newQ);
                    }}
                    className="w-full border-2 border-primary-light/50 rounded-lg p-2 focus:border-primary outline-none text-[14px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-option-${activity.id}-${qIndex}`}
                        checked={q.correctAnswer === (q.options && q.options[optIndex])}
                        onChange={() => {
                          const newQ = [...(activity.listeningQuestions || [])];
                          newQ[qIndex] = { ...newQ[qIndex], correctAnswer: newQ[qIndex].options[optIndex] || "" };
                          updateActivityField(activity.id, "listeningQuestions", newQ);
                        }}
                      />
                      <input
                        type="text"
                        value={(q.options && q.options[optIndex]) || ""}
                        onChange={(e) => {
                          const newQ = [...(activity.listeningQuestions || [])];
                          const newOptions = [...(newQ[qIndex].options || ["", "", "", ""])];
                          newOptions[optIndex] = e.target.value;
                          newQ[qIndex] = { ...newQ[qIndex], options: newOptions };
                          if (q.correctAnswer === q.options[optIndex]) {
                              newQ[qIndex].correctAnswer = e.target.value;
                          }
                          updateActivityField(activity.id, "listeningQuestions", newQ);
                        }}
                        placeholder={`Option ${optIndex + 1}`}
                        className="w-full border border-primary-light/50 rounded-lg p-1.5 focus:border-primary outline-none text-[13px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
          <button
            onClick={() => {
              const newQ = [...(activity.listeningQuestions || []), { id: Date.now().toString(), question: "", options: ["", "", "", ""], correctAnswer: "" }];
              updateActivityField(activity.id, "listeningQuestions", newQ);
            }}
            className="flex items-center gap-2 text-primary hover:text-primary-dark font-bold text-[14px] bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors border border-primary/20 w-full justify-center"
          >
            + Add Question
          </button>
        </div>
      </div>
    </div>
  );
}
