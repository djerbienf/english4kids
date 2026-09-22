import React, { useState, useEffect } from "react";
import { getAppParameters } from "../../utils/parameters";
import { AppParameters } from "../../types";
import { Button } from "../Button";
import { useStore } from "../../store/useStore";

export const ParametersTab = React.memo(function ParametersTab() {
  const storeParams = useStore((state) => state.appParameters);
  const setAppParameters = useStore((state) => state.setAppParameters);
  const [params, setParams] = useState<AppParameters>(storeParams || getAppParameters());
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  useEffect(() => {
    if (storeParams) {
      setParams(storeParams);
    }
  }, [storeParams]);

  const handleChange = (field: keyof AppParameters, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setAppParameters(params);
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2000);
  };

  const resetAllData = useStore((state) => state.resetAllData);
  const seedDefaultData = useStore((state) => state.seedDefaultData);

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-[20px] font-bold">Machine Room configuration (Global)</h2>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
            onClick={async () => {
              await seedDefaultData();
              setShowSavedMsg(true);
              setTimeout(() => setShowSavedMsg(false), 3000);
            }}
          >
            Load Default Lessons
          </Button>
          <Button 
            variant="outline" 
            className="text-red-500 border-red-500 hover:bg-red-50"
            onClick={() => {
              resetAllData();
              setShowSavedMsg(true);
              setTimeout(() => setShowSavedMsg(false), 3000);
            }}
          >
            Reset Database
          </Button>
          {showSavedMsg && <span className="text-green-600 text-[14px]">Saved seamlessly!</span>}
          <Button onClick={handleSave}>Save Parameters</Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-[14px] text-blue-800">
        These are the fallback global parameters applied globally to all lessons across the platform. Note that local parameters configured explicitly inside a specific lesson activity will override these settings.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Flashcards & Grammar */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Flashcards & Grammar</h3>
          <div className="space-y-4">
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Typo Tolerance (Levenshtein)</span>
              <select 
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
                value={params.flashcardTolerance}
                onChange={(e) => handleChange("flashcardTolerance", e.target.value)}
              >
                <option value="Stricte">Strict (0 mistakes)</option>
                <option value="Normale">Normal (1-2 mistakes)</option>
                <option value="Souple">Lenient (3+ mistakes)</option>
              </select>
            </div>

            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Attempts allowed</span>
              <select 
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
                value={params.flashcardAttemptsMode}
                onChange={(e) => handleChange("flashcardAttemptsMode", e.target.value)}
              >
                <option value="infinite">Infinite attempts</option>
                <option value="limited">Limited attempts</option>
              </select>
            </div>

            {params.flashcardAttemptsMode === "limited" && (
              <div className="pt-2">
                <span className="text-[14px] text-text-secondary block mb-2">Max attempts</span>
                <input 
                  type="number"
                  min="1"
                  className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
                  value={params.flashcardMaxAttempts}
                  onChange={(e) => handleChange("flashcardMaxAttempts", parseInt(e.target.value, 10))}
                />
              </div>
            )}

            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Allow smart hints</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-primary" 
                checked={params.flashcardUseHints}
                onChange={(e) => handleChange("flashcardUseHints", e.target.checked)}
              />
            </label>

            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Write Phase Timer (seconds)</span>
              <div className="flex items-center gap-3">
                <input 
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  className="flex-1 accent-primary"
                  value={params.flashcardWriteTimerDuration}
                  onChange={(e) => handleChange("flashcardWriteTimerDuration", parseInt(e.target.value, 10))}
                />
                <span className="text-[14px] font-bold w-8 text-center">{params.flashcardWriteTimerDuration}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Watching */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Watching (Video)</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Prevent Skipping Ahead</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-primary" 
                checked={params.videoPreventSkipping}
                onChange={(e) => handleChange("videoPreventSkipping", e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Show Subtitles</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-primary" 
                checked={params.videoShowSubtitles}
                onChange={(e) => handleChange("videoShowSubtitles", e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Show Transcript</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-primary" 
                checked={params.videoShowTranscript}
                onChange={(e) => handleChange("videoShowTranscript", e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Allow Playback Speed Control</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-primary" 
                checked={params.videoAllowSpeedControl}
                onChange={(e) => handleChange("videoAllowSpeedControl", e.target.checked)}
              />
            </label>
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Max Replays Allowed</span>
              <select 
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
                value={params.videoMaxReplays.toString()}
                onChange={(e) => handleChange("videoMaxReplays", e.target.value)}
              >
                <option value="1">1 replay</option>
                <option value="3">3 replays</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reading */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Reading</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Tap for Translation</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-primary" 
                checked={params.readingTapForTranslation}
                onChange={(e) => handleChange("readingTapForTranslation", e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Auto-play Audio</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-primary" 
                checked={params.readingAutoPlayAudio}
                onChange={(e) => handleChange("readingAutoPlayAudio", e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Cloze */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Cloze (Fill-in-the-blanks)</h3>
          <div className="space-y-4">
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Typo Tolerance (Levenshtein)</span>
              <select 
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
                value={params.clozeTolerance}
                onChange={(e) => handleChange("clozeTolerance", e.target.value)}
              >
                <option value="Stricte">Strict (0 mistakes)</option>
                <option value="Normale">Normal (1-2 mistakes)</option>
                <option value="Souple">Lenient (3+ mistakes)</option>
              </select>
            </div>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Show distractors</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-primary" 
                checked={params.clozeShowChoices}
                onChange={(e) => handleChange("clozeShowChoices", e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Dictation */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Dictation</h3>
          <div className="space-y-4">
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Typo Tolerance (Levenshtein)</span>
              <select 
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
                value={params.dictationTolerance}
                onChange={(e) => handleChange("dictationTolerance", e.target.value)}
              >
                <option value="Stricte">Strict (0 mistakes)</option>
                <option value="Normale">Normal (1-2 mistakes)</option>
                <option value="Souple">Lenient (3+ mistakes)</option>
              </select>
            </div>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Show Support Translation</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-primary" 
                checked={params.dictationShowTranslation}
                onChange={(e) => handleChange("dictationShowTranslation", e.target.checked)}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
});
