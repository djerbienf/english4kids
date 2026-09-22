import React, { useState } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../Button";
import { AssetPickerModal } from "./AssetPickerModal";

interface DictationActivityEditorProps {
  activity: any;
  updateActivityField: (activityId: number, field: string | Record<string, any>, value?: any) => void;
}

export function DictationActivityEditor({ activity, updateActivityField }: DictationActivityEditorProps) {
  const [activePickerIndex, setActivePickerIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="space-y-6">
        {(activity.dictationSlides || []).map((slide: any, slideIndex: number) => (
          <div
            key={slideIndex}
            className="p-4 border border-primary-light rounded-lg bg-neutral-bg space-y-4 relative group"
          >
            <button
              onClick={() => {
                const newSlides = [...(activity.dictationSlides || [])];
                newSlides.splice(slideIndex, 1);
                updateActivityField(activity.id, "dictationSlides", newSlides);
              }}
              className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove segment"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>

            <div className="font-bold text-[14px] text-text-secondary">
              Segment {slideIndex + 1}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <label className="block text-[14px] font-medium text-text-primary mb-1">
                  Audio URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={slide.audioUrl || ""}
                    onChange={(e) => {
                      const newSlides = [...(activity.dictationSlides || [])];
                      newSlides[slideIndex] = {
                        ...newSlides[slideIndex],
                        audioUrl: e.target.value,
                      };
                      updateActivityField(activity.id, "dictationSlides", newSlides);
                    }}
                    className="flex-1 bg-white border border-primary-light rounded-lg p-2 text-[14px]"
                    placeholder="https://..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActivePickerIndex(slideIndex)}
                    className="text-xs px-2.5 bg-white border-primary-light flex items-center gap-1"
                  >
                    <FolderOpen size={13} /> Media
                  </Button>
                </div>
              </div>
              <div className="md:col-span-1">
                <label className="block text-[14px] font-medium text-text-primary mb-1">
                  Correct Text
                </label>
                <input
                  type="text"
                  value={slide.correctText || ""}
                  onChange={(e) => {
                    const newSlides = [...(activity.dictationSlides || [])];
                    newSlides[slideIndex] = {
                      ...newSlides[slideIndex],
                      correctText: e.target.value,
                    };
                    updateActivityField(activity.id, "dictationSlides", newSlides);
                  }}
                  className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
                  placeholder="What you hear"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[14px] font-medium text-text-primary mb-1">
                  Translation Support (Optional)
                </label>
                <input
                  type="text"
                  value={slide.translation || ""}
                  onChange={(e) => {
                    const newSlides = [...(activity.dictationSlides || [])];
                    newSlides[slideIndex] = {
                      ...newSlides[slideIndex],
                      translation: e.target.value,
                    };
                    updateActivityField(activity.id, "dictationSlides", newSlides);
                  }}
                  className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
                  placeholder="Helper translation"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            const slides = activity.dictationSlides || [];
            // Retrocompatibility: grab old single properties if array is empty
            if (slides.length === 0 && (activity.dictationAudioUrl || activity.dictationCorrectText)) {
              updateActivityField(activity.id, "dictationSlides", [
                {
                  audioUrl: activity.dictationAudioUrl,
                  correctText: activity.dictationCorrectText,
                  translation: activity.dictationTranslation,
                },
                {
                  audioUrl: "",
                  correctText: "",
                  translation: "",
                },
              ]);
            } else {
              updateActivityField(activity.id, "dictationSlides", [
                ...slides,
                {
                  audioUrl: "",
                  correctText: "",
                  translation: "",
                },
              ]);
            }
          }}
          className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-semibold text-[14px] px-2 py-1 rounded hover:bg-primary-light/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Dictation Segment
        </button>
      </div>

      {/* Dictation Settings */}
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
              value={activity.dictationTolerance || ""}
              onChange={(e) => updateActivityField(activity.id, "dictationTolerance", e.target.value)}
            >
              <option value="">Global Default</option>
              <option value="Stricte">Strict (0 mistakes)</option>
              <option value="Normale">Normal (1-2 mistakes)</option>
              <option value="Souple">Lenient (3+ mistakes)</option>
            </select>
          </div>
          <div className="flex items-center justify-between col-span-1 mt-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={activity.dictationShowTranslation !== false}
                onChange={(e) => updateActivityField(activity.id, "dictationShowTranslation", e.target.checked)}
              />
              <span className="text-[12px] font-bold text-text-secondary">
                Show Translation
              </span>
            </label>
          </div>
        </div>
      </div>

      <AssetPickerModal
        isOpen={activePickerIndex !== null}
        onClose={() => setActivePickerIndex(null)}
        filterType="audio"
        title="Select Dictation Audio Segment"
        onSelect={(url) => {
          if (activePickerIndex !== null) {
            const newSlides = [...(activity.dictationSlides || [])];
            newSlides[activePickerIndex] = {
              ...newSlides[activePickerIndex],
              audioUrl: url,
            };
            updateActivityField(activity.id, "dictationSlides", newSlides);
          }
        }}
      />
    </div>
  );
}
