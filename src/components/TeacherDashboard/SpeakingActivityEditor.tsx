import React, { useState } from "react";
import { Mic, Volume2, Sparkles, FolderOpen, HelpCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../Button";
import { DictionaryEntry } from "../../types";
import { AssetPickerModal } from "./AssetPickerModal";
import { getSyllables } from "../../utils/syllables";

interface SpeakingActivityEditorProps {
  activity: any;
  updateActivityField: (
    activityId: number,
    field: string | Record<string, any>,
    value?: any
  ) => void;
  dictionaryWords: DictionaryEntry[];
}

export function SpeakingActivityEditor({
  activity,
  updateActivityField,
  dictionaryWords,
}: SpeakingActivityEditorProps) {
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showDictPicker, setShowDictPicker] = useState(false);
  const [dictSearch, setDictSearch] = useState("");

  const filteredDict = dictionaryWords.filter((w) => {
    const text = (w.lemma || w.word || "").toLowerCase();
    return text.includes(dictSearch.toLowerCase());
  });

  const handleSelectDictWord = (w: DictionaryEntry) => {
    const text = w.lemma || w.word || "";
    const audio =
      w.senses?.find((s) => s.assets?.audio?.us || s.assets?.audio?.uk)?.assets?.audio?.us ||
      w.senses?.find((s) => s.assets?.audio?.us || s.assets?.audio?.uk)?.assets?.audio?.uk ||
      "";
    const pronunciation = w.pronunciation_us || w.pronunciation_uk || "";
    const syllables = getSyllables(text, pronunciation);

    updateActivityField(activity.id, {
      title: activity.title || `Speaking: ${text}`,
      speakingPrompt: activity.speakingPrompt || `Pronounce the word clearly: "${text}"`,
      speakingTargetText: text,
      speakingAudioUrl: audio || activity.speakingAudioUrl || "",
      speakingSyllables: syllables,
    });
    setShowDictPicker(false);
  };

  return (
    <div className="space-y-6 font-['Nunito']">
      {/* Title & Quick Fill */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Activity Title
            </label>
            <input
              type="text"
              value={activity.title || ""}
              onChange={(e) => updateActivityField(activity.id, "title", e.target.value)}
              placeholder="e.g., Pronunciation Practice: Introductions"
              className="w-full border-2 border-primary-light/50 rounded-xl p-2.5 text-sm focus:border-primary outline-none bg-white font-medium"
            />
          </div>

          <div className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDictPicker(true)}
              className="text-xs font-bold flex items-center gap-1.5 border-primary/40 text-primary"
            >
              <Sparkles size={14} /> Fill from Dictionary
            </Button>
          </div>
        </div>

        {/* Dictionary Word Quick Selection Modal */}
        {showDictPicker && (
          <div className="p-4 bg-primary/5 border border-primary-light rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-primary-dark uppercase tracking-wider">
                Choose a vocabulary word for speaking practice:
              </h5>
              <button
                type="button"
                onClick={() => setShowDictPicker(false)}
                className="text-xs text-text-secondary hover:text-text-primary"
              >
                Cancel ✕
              </button>
            </div>
            <input
              type="text"
              value={dictSearch}
              onChange={(e) => setDictSearch(e.target.value)}
              placeholder="Search dictionary words..."
              className="w-full border border-primary-light rounded-lg px-3 py-1.5 text-xs outline-none bg-white"
            />
            <div className="max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredDict.slice(0, 12).map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleSelectDictWord(w)}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-white border border-primary-light hover:border-primary text-xs font-bold text-primary-dark truncate transition-colors"
                >
                  {w.lemma || w.word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prompt & Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            Speaking Prompt / Scenario for Student
          </label>
          <textarea
            rows={3}
            value={activity.speakingPrompt || ""}
            onChange={(e) => updateActivityField(activity.id, "speakingPrompt", e.target.value)}
            placeholder="e.g. Listen carefully, then click the microphone and say: Good morning, nice to meet you!"
            className="w-full border-2 border-primary-light/50 rounded-xl p-2.5 text-sm focus:border-primary outline-none bg-white font-medium resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            Target Speech Phrase (Expected Speech Recognition)
          </label>
          <textarea
            rows={3}
            value={activity.speakingTargetText || ""}
            onChange={(e) => updateActivityField(activity.id, "speakingTargetText", e.target.value)}
            placeholder="e.g. Good morning, nice to meet you!"
            className="w-full border-2 border-primary-light/50 rounded-xl p-2.5 text-sm focus:border-primary outline-none bg-white font-medium resize-none"
          />
        </div>
      </div>

      {/* Audio & Phonetics Configuration */}
      <div className="p-5 bg-neutral-bg border border-primary-light rounded-2xl space-y-4">
        <h4 className="font-bold text-primary-dark text-sm flex items-center gap-2">
          <Volume2 size={16} className="text-primary" /> Audio Reference & Phonetics Guide
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">
              Pronunciation Audio Guide URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={activity.speakingAudioUrl || ""}
                onChange={(e) => updateActivityField(activity.id, "speakingAudioUrl", e.target.value)}
                placeholder="https://... audio sample"
                className="flex-1 border border-primary-light rounded-xl p-2 text-xs outline-none bg-white focus:border-primary"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAssetPicker(true)}
                className="text-xs px-3 border-primary-light bg-white"
                title="Select from Media Library"
              >
                <FolderOpen size={14} /> Media
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">
              Phonetics / Syllables Breakdown (Optional)
            </label>
            <input
              type="text"
              value={activity.speakingSyllables || ""}
              onChange={(e) => updateActivityField(activity.id, "speakingSyllables", e.target.value)}
              placeholder="e.g. Good morn-ing, nice to meet you"
              className="w-full border border-primary-light rounded-xl p-2 text-xs outline-none bg-white focus:border-primary"
            />
          </div>
        </div>

        {/* Evaluation Tolerance & Hint */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-primary-light/40">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">
              Speech Recognition Strictness
            </label>
            <select
              value={activity.speakingTolerance || "Normal"}
              onChange={(e) => updateActivityField(activity.id, "speakingTolerance", e.target.value)}
              className="w-full border border-primary-light rounded-xl p-2 text-xs outline-none bg-white focus:border-primary font-medium"
            >
              <option value="Strict">Strict (High phonetic precision required)</option>
              <option value="Normal">Normal (Balanced speech tolerance)</option>
              <option value="Lenient">Lenient (Forgiving for beginners)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">
              Student Hint / Tip (Optional)
            </label>
            <input
              type="text"
              value={activity.speakingHint || ""}
              onChange={(e) => updateActivityField(activity.id, "speakingHint", e.target.value)}
              placeholder="e.g. Pay attention to the linking sound between 'meet' and 'you'"
              className="w-full border border-primary-light rounded-xl p-2 text-xs outline-none bg-white focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={showAssetPicker}
        onClose={() => setShowAssetPicker(false)}
        filterType="audio"
        title="Select Reference Audio"
        onSelect={(url) => {
          updateActivityField(activity.id, "speakingAudioUrl", url);
        }}
      />
    </div>
  );
}
