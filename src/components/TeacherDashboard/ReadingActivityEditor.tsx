import React from "react";
import { DictionaryEntry } from "../../types";
import { AddWordModal } from "./AddWordModal";
import { TextScanner } from "./TextScanner";
import { InteractionTab } from "./ReadingActivityTabs/InteractionTab";

export function ReadingActivityEditor({
  readingType,
  readingTitle,
  readingSlides,
  updateLessonField,
  dictionaryWords,
  updateDictionary
}: {
  readingType: string;
  readingTitle: string;
  readingSlides: any[];
  updateLessonField: (field: string, value: any) => void;
  dictionaryWords: DictionaryEntry[];
  updateDictionary: (words: DictionaryEntry[]) => void;
}) {
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<"content" | "media" | "interaction" | "vocabulary">("content");
  const [wordToAdd, setWordToAdd] = React.useState<string | null>(null);

  const rawSlides = readingSlides.map((s: any) => typeof s === "string" ? { text: s } : s);
  
  if (rawSlides.length === 0) {
    updateLessonField("readingSlides", [{ text: "" }]);
    return null; // wait for re-render
  }

  // Handle case where activeSlide might be out of bounds if slide is deleted
  const currentSafeSlideIndex = Math.min(activeSlide, Math.max(0, rawSlides.length - 1));
  const slide = rawSlides[currentSafeSlideIndex] || { text: "" };

  return (
    <div className="space-y-6">
      <p className="text-sm font-medium text-text-secondary mb-4 italic">Configure the Reading activity</p>
      
      {/* General Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 border border-primary-light rounded-xl shadow-sm">
        <div>
          <label className="block text-[13px] font-bold text-primary-dark mb-1">Global Text Format</label>
          <select
            value={readingType}
            onChange={(e) => updateLessonField("readingType", e.target.value)}
            className="w-full bg-neutral-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
          >
            <option value="text">Text (Article/Passage)</option>
            <option value="dialogue">Dialogue (Conversation)</option>
            <option value="story">Story (Narrative)</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-primary-dark mb-1">Reading Title (Optional)</label>
          <input
            type="text"
            placeholder="Ex: Le petit chaperon rouge"
            value={readingTitle}
            onChange={(e) => updateLessonField("readingTitle", e.target.value)}
            className="w-full bg-neutral-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Slides Sidebar */}
        <div className="w-full md:w-1/4 flex flex-col gap-2">
          <div className="font-bold text-primary-dark text-sm mb-2">Slides</div>
          {rawSlides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${currentSafeSlideIndex === idx ? "border-primary bg-primary-light/10 text-primary-dark" : "border-primary-light/50 bg-white text-text-secondary hover:bg-neutral-bg"}`}
            >
              Slide {idx + 1}
            </button>
          ))}
          <button
            onClick={() => {
              updateLessonField("readingSlides", [...rawSlides, { text: "" }]);
              setActiveSlide(rawSlides.length);
            }}
            className="text-left px-4 py-3 rounded-lg border border-dashed border-primary text-primary font-bold text-sm bg-white hover:bg-primary-light/10 transition-colors"
          >
            + Add Slide
          </button>
        </div>

        {/* Slide Editor Workspace */}
        <div className="w-full md:w-3/4 bg-white border border-primary-light rounded-xl shadow-sm flex flex-col min-h-[400px]">
          {/* Header Action Menu */}
          <div className="flex justify-between items-center p-4 border-b border-primary-light/50">
            <h3 className="font-bold text-primary-dark">Editing Slide {currentSafeSlideIndex + 1}</h3>
            {rawSlides.length > 1 && (
              <button
                onClick={() => {
                  const newSlides = [...rawSlides];
                  newSlides.splice(currentSafeSlideIndex, 1);
                  updateLessonField("readingSlides", newSlides);
                  setActiveSlide(Math.max(0, currentSafeSlideIndex - 1));
                }}
                className="text-red-500 hover:text-red-700 text-[13px] font-medium"
              >
                Delete Slide
              </button>
            )}
          </div>
          
          {/* Internal Tabs */}
          <div className="flex border-b border-primary-light/50 px-4">
            {(["content", "media", "interaction", "vocabulary"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-[13px] font-bold border-b-2 transition-colors capitalize ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-primary-dark"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 flex-1">
            {activeTab === "content" && (
              <div className="flex flex-col h-full">
                <label className="block text-[13px] font-bold text-primary-dark mb-2">Text Content</label>
                <textarea
                  placeholder="Enter slide content here..."
                  value={slide.text || ""}
                  onChange={(e) => {
                    const newSlides = [...rawSlides];
                    const oldSlide = newSlides[currentSafeSlideIndex];
                    const baseSlide = typeof oldSlide === 'string' ? { text: oldSlide } : oldSlide || { text: "" };
                    newSlides[currentSafeSlideIndex] = { ...baseSlide, text: e.target.value };
                    updateLessonField("readingSlides", newSlides);
                  }}
                  className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] flex-1 min-h-[350px] focus:outline-none focus:border-primary resize-none"
                />
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-[13px] font-bold text-primary-dark mb-1">Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://...png"
                    value={slide.imageUrl || ""}
                    onChange={(e) => {
                      const newSlides = [...rawSlides];
                      const oldSlide = newSlides[currentSafeSlideIndex];
                      const baseSlide = typeof oldSlide === 'string' ? { text: oldSlide } : oldSlide || { text: "" };
                      newSlides[currentSafeSlideIndex] = { ...baseSlide, imageUrl: e.target.value };
                      updateLessonField("readingSlides", newSlides);
                    }}
                    className="w-full bg-neutral-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-primary-dark mb-1">Audio URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://...mp3"
                    value={slide.audioUrl || ""}
                    onChange={(e) => {
                      const newSlides = [...rawSlides];
                      const oldSlide = newSlides[currentSafeSlideIndex];
                      const baseSlide = typeof oldSlide === 'string' ? { text: oldSlide } : oldSlide || { text: "" };
                      newSlides[currentSafeSlideIndex] = { ...baseSlide, audioUrl: e.target.value };
                      updateLessonField("readingSlides", newSlides);
                    }}
                    className="w-full bg-neutral-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {activeTab === "interaction" && (
              <InteractionTab 
                slide={slide} 
                rawSlides={rawSlides} 
                currentSafeSlideIndex={currentSafeSlideIndex} 
                updateLessonField={updateLessonField} 
              />
            )}

            {activeTab === "vocabulary" && (
              <div className="space-y-6 h-full flex flex-col">
                <div className="flex flex-col bg-white border border-primary-light rounded-lg overflow-hidden flex-shrink-0 min-h-[250px] max-h-[400px]">
                  <div className="bg-neutral-bg border-b border-primary-light px-3 py-3 flex-shrink-0 flex items-center justify-between">
                    <div>
                      <label className="block text-[13px] font-bold text-primary-dark">Dictionary Scanner</label>
                      <p className="text-[11px] text-text-secondary">Click any unhighlighted word from your text to add it to the global dictionary.</p>
                    </div>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto">
                    <TextScanner text={slide.text || ""} dictionaryWords={dictionaryWords} onAddWord={(pwd) => {
                      setWordToAdd(pwd);
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {wordToAdd && (
        <AddWordModal 
          initialWord={wordToAdd} 
          onClose={() => setWordToAdd(null)} 
          onSave={(word) => {
            updateDictionary([...dictionaryWords, word]);
            setWordToAdd(null);
          }} 
        />
      )}
    </div>
  );
}
