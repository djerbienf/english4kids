import React, { useState } from "react";
import { Button } from "../components/Button";
import avatar1 from "../assets/images/avatar_girl_purple_1781191819306.jpg";
import avatar2 from "../assets/images/avatar_boy_glasses_1781191832381.jpg";
import avatar3 from "../assets/images/avatar_girl_pigtails_1781191844201.jpg";
import avatar4 from "../assets/images/avatar_boy_curly_1781191857600.jpg";
import { InteractiveText } from "../components/ReadingActivity";
import { DictionaryEntry } from "../types";

const AVATARS = [
  { id: "avatar1", src: avatar1, label: "Girl with purple shirt" },
  { id: "avatar2", src: avatar2, label: "Boy with glasses" },
  { id: "avatar3", src: avatar3, label: "Girl with pigtails" },
  { id: "avatar4", src: avatar4, label: "Boy with green shirt" },
];

interface TeacherDashboardProps {
  onLogout: () => void;
}

type Tab =
  | "organization"
  | "parameters"
  | "tracking"
  | "dictionary"
  | "students";

function AddWordModal({
  initialWord = "",
  initialData,
  onClose,
  onSave,
  onDelete
}: {
  initialWord?: string;
  initialData?: DictionaryEntry;
  onClose: () => void;
  onSave: (word: DictionaryEntry) => void;
  onDelete?: () => void;
}) {
  const [error, setError] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const primarySense = initialData?.senses?.[0];
  const [newWordData, setNewWordData] = useState({
    lemma: initialData?.lemma || initialData?.word || initialWord,
    translation: primarySense?.translation_ar || initialData?.translation || "",
    definition: primarySense?.gloss || initialData?.definition || "",
    example: (primarySense?.examples && primarySense.examples.length > 0) ? primarySense.examples[0] : initialData?.example || "",
    part_of_speech: initialData?.part_of_speech || "",
    cefr_level: primarySense?.cefr_level || "A1",
    difficulty: primarySense?.difficulty?.toString() || "1",
    category: primarySense?.category || "",
    synonyms: primarySense?.relations?.synonyms?.join(", ") || "",
    antonyms: primarySense?.relations?.antonyms?.join(", ") || "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-primary-dark">
            {initialData ? "Edit Word" : "Add New Word"}
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl leading-none">
            &times;
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Word (English) *"
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.lemma}
            onChange={(e) => setNewWordData({ ...newWordData, lemma: e.target.value })}
            disabled={!!initialWord && !initialData}
          />
          <input
            type="text"
            placeholder="Translation (Arabic) *"
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] text-right"
            value={newWordData.translation}
            onChange={(e) => setNewWordData({ ...newWordData, translation: e.target.value })}
            autoFocus
          />
          <select
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.part_of_speech}
            onChange={(e) => setNewWordData({ ...newWordData, part_of_speech: e.target.value })}
          >
            <option value="">Select Part of Speech...</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
            <option value="pronoun">Pronoun</option>
            <option value="preposition">Preposition</option>
            <option value="conjunction">Conjunction</option>
            <option value="interjection">Interjection</option>
          </select>
          <input
            type="text"
            placeholder="Definition (Optional)"
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.definition}
            onChange={(e) => setNewWordData({ ...newWordData, definition: e.target.value })}
          />
          <input
            type="text"
            placeholder="Example (Optional)"
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.example}
            onChange={(e) => setNewWordData({ ...newWordData, example: e.target.value })}
          />
          <select
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.cefr_level}
            onChange={(e) => setNewWordData({ ...newWordData, cefr_level: e.target.value })}
          >
            <option value="A1">CEFR: A1</option>
            <option value="A2">CEFR: A2</option>
            <option value="B1">CEFR: B1</option>
            <option value="B2">CEFR: B2</option>
            <option value="C1">CEFR: C1</option>
            <option value="C2">CEFR: C2</option>
          </select>
          <select
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.difficulty}
            onChange={(e) => setNewWordData({ ...newWordData, difficulty: e.target.value })}
          >
            <option value="1">Difficulty: 1 (Very Easy)</option>
            <option value="2">Difficulty: 2 (Easy)</option>
            <option value="3">Difficulty: 3 (Medium)</option>
            <option value="4">Difficulty: 4 (Hard)</option>
            <option value="5">Difficulty: 5 (Very Hard)</option>
          </select>
          <select
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.category}
            onChange={(e) => setNewWordData({ ...newWordData, category: e.target.value })}
          >
            <option value="">Select Category...</option>
            <option value="Family">Family</option>
            <option value="Food">Food</option>
            <option value="Colors">Colors</option>
            <option value="Numbers">Numbers</option>
            <option value="Animals">Animals</option>
            <option value="Body Parts">Body Parts</option>
            <option value="Clothes">Clothes</option>
            <option value="House and Rooms">House and Rooms</option>
            <option value="School">School</option>
            <option value="Toys and Games">Toys and Games</option>
            <option value="Weather and Seasons">Weather and Seasons</option>
            <option value="Nature">Nature</option>
            <option value="Transportation">Transportation</option>
            <option value="Actions">Actions</option>
            <option value="Feelings">Feelings</option>
            <option value="Time and Days">Time and Days</option>
            <option value="Places in Town">Places in Town</option>
            <option value="Shapes">Shapes</option>
            <option value="Opposites">Opposites</option>
            <option value="Daily Routine">Daily Routine</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Synonyms (comma separated)"
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.synonyms}
            onChange={(e) => setNewWordData({ ...newWordData, synonyms: e.target.value })}
          />
          <input
            type="text"
            placeholder="Antonyms (comma separated)"
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.antonyms}
            onChange={(e) => setNewWordData({ ...newWordData, antonyms: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 mt-8 border-t border-primary-light pt-6">
          {onDelete && (
             <div className="mr-auto flex items-center gap-2">
              {showConfirmDelete ? (
                <>
                  <span className="text-sm font-medium text-red-600">Are you sure?</span>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-4 py-1.5 rounded-full font-bold transition-all bg-red-600 text-white border border-red-700 hover:bg-red-700 hover:border-red-800"
                  >
                    Yes, remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-4 py-1.5 rounded-full font-bold transition-all bg-neutral-100 text-text-secondary border border-neutral-300 hover:bg-neutral-200"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="px-6 py-2 rounded-full font-bold transition-all bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                >
                  Remove
                </button>
              )}
            </div>
          )}
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full font-bold transition-all bg-white border-2 border-primary-light text-primary hover:bg-neutral-bg"
          >
            Cancel
          </button>
          <Button
            type="button"
            onClick={() => {
              if (!newWordData.lemma || !newWordData.translation) {
                setError("Word and Translation are required.");
                return;
              }
              setError("");
              
              const synonymsList = newWordData.synonyms.split(",").map(s => s.trim()).filter(Boolean);
              const antonymsList = newWordData.antonyms.split(",").map(s => s.trim()).filter(Boolean);
              
              onSave({
                id: initialData ? initialData.id : Date.now().toString(),
                lemma: newWordData.lemma,
                part_of_speech: newWordData.part_of_speech || undefined,
                senses: [{
                  sense_id: initialData?.senses?.[0]?.sense_id || (Date.now().toString() + "_sense"),
                  gloss: newWordData.definition,
                  translation_ar: newWordData.translation,
                  examples: newWordData.example ? [newWordData.example] : [],
                  cefr_level: newWordData.cefr_level,
                  difficulty: parseInt(newWordData.difficulty, 10) || undefined,
                  category: newWordData.category || undefined,
                  relations: {
                      synonyms: synonymsList.length > 0 ? synonymsList : undefined,
                      antonyms: antonymsList.length > 0 ? antonymsList : undefined,
                  }
                }],
                word: newWordData.lemma,
                translation: newWordData.translation,
                definition: newWordData.definition
              });
            }}
          >
            {initialData ? "Update Word" : "Save Word"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TextScanner({
  text,
  dictionaryWords,
  onAddWord
}: {
  text: string;
  dictionaryWords: DictionaryEntry[];
  onAddWord: (word: string) => void;
}) {
  if (!text) return <p className="text-sm text-text-secondary italic">No text to scan yet. Type above...</p>;

  const sortedDict = [...dictionaryWords].sort((a, b) => (b.lemma?.length || 0) - (a.lemma?.length || 0));
  
  const regex = /([a-zA-ZÀ-ÿ]+)/g;
  const parts = text.split(regex);

  return (
    <div className="leading-relaxed text-[16px] text-text-primary whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^[a-zA-ZÀ-ÿ]+$/.test(part)) {
          const lowerWord = part.toLowerCase();
          const dictEntry = sortedDict.find(d => d.lemma?.toLowerCase() === lowerWord);
          
          if (dictEntry) {
            const translation = dictEntry.senses?.[0]?.translation_ar || dictEntry.translation;
            return (
              <span 
                key={i} 
                className="text-primary font-bold bg-primary-light/10 px-1 py-0.5 rounded cursor-pointer hover:bg-primary-light/30 transition-colors"
                title={`In Dictionary: ${translation}`}
                onClick={() => alert(`This word is already in the dictionary: ${translation}`)}
              >
                {part}
              </span>
            );
          } else {
            return (
              <span 
                key={i} 
                className="cursor-pointer hover:bg-neutral-bg hover:text-primary transition-colors border-b border-transparent hover:border-primary border-dotted"
                title="Click to add to Dictionary"
                onClick={() => onAddWord(part)}
              >
                {part}
              </span>
            );
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

function ReadingActivityEditor({
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

            {activeTab === "interaction" && (() => {
              const unscrambles = slide.unscrambleTexts || (slide.unscrambleText ? [slide.unscrambleText] : []);
              const clozesList = slide.clozes || (slide.clozeSentenceBefore || slide.clozeCorrect ? [{
                sentenceBefore: slide.clozeSentenceBefore || "",
                sentenceAfter: slide.clozeSentenceAfter || "",
                correct: slide.clozeCorrect || "",
                distractors: slide.clozeDistractors || []
              }] : []);

              return (
              <div className="space-y-6 h-full flex flex-col overflow-y-auto pr-2 pb-4">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <label className="block text-[13px] font-bold text-primary-dark mb-1">Drag & Drop Unscramble</label>
                      <p className="text-xs text-text-secondary">Students must unscramble these sentences.</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const newSlides = [...rawSlides];
                        newSlides[currentSafeSlideIndex] = { 
                          ...newSlides[currentSafeSlideIndex], 
                          unscrambleTexts: [...unscrambles, ""]
                        };
                        updateLessonField("readingSlides", newSlides);
                      }}
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary-dark transition-colors"
                    >
                      + Add Sentence
                    </button>
                  </div>
                  <div className="space-y-3">
                    {unscrambles.map((text: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 relative">
                        <input
                          type="text"
                          placeholder="Ex: Le petit chaperon rouge marche dans la forêt."
                          value={text}
                          onChange={(e) => {
                            const newArr = [...unscrambles];
                            newArr[i] = e.target.value;
                            const newSlides = [...rawSlides];
                            newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], unscrambleTexts: newArr };
                            updateLessonField("readingSlides", newSlides);
                          }}
                          className="w-full bg-neutral-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => {
                            const newArr = [...unscrambles];
                            newArr.splice(i, 1);
                            const newSlides = [...rawSlides];
                            newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], unscrambleTexts: newArr };
                            updateLessonField("readingSlides", newSlides);
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                          title="Remove Unscramble"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {unscrambles.length === 0 && <p className="text-xs text-text-secondary italic">No unscramble sentences added.</p>}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-primary-light/50">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <label className="block text-[13px] font-bold text-primary-dark mb-1">Cloze Interactions</label>
                      <p className="text-xs text-text-secondary">Ask students to guess a missing word.</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const newSlides = [...rawSlides];
                        newSlides[currentSafeSlideIndex] = { 
                          ...newSlides[currentSafeSlideIndex], 
                          clozes: [...clozesList, { sentenceBefore: "", sentenceAfter: "", correct: "", distractors: [] }]
                        };
                        updateLessonField("readingSlides", newSlides);
                      }}
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary-dark transition-colors"
                    >
                      + Add Cloze
                    </button>
                  </div>
                  <div className="space-y-4">
                    {clozesList.map((cloze: any, i: number) => (
                      <div key={i} className="bg-neutral-bg/50 p-4 rounded-xl border border-primary-light relative pt-8">
                        <button
                          onClick={() => {
                            const newArr = [...clozesList];
                            newArr.splice(i, 1);
                            const newSlides = [...rawSlides];
                            newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], clozes: newArr };
                            updateLessonField("readingSlides", newSlides);
                          }}
                          className="absolute top-2 right-2 text-red-500 bg-red-50 hover:bg-red-100 w-6 h-6 rounded-full flex items-center justify-center transition-colors text-xs"
                          title="Remove Cloze"
                        >
                          ✕
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-text-secondary mb-1">Sentence BEFORE</label>
                            <input
                              type="text"
                              placeholder="Ex: Have a great "
                              value={cloze.sentenceBefore || ""}
                              onChange={(e) => {
                                const newArr = [...clozesList];
                                newArr[i] = { ...newArr[i], sentenceBefore: e.target.value };
                                const newSlides = [...rawSlides];
                                newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], clozes: newArr };
                                updateLessonField("readingSlides", newSlides);
                              }}
                              className="w-full bg-white border border-primary-light rounded-xl p-2.5 text-[13px] focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-text-secondary mb-1">Correct Word</label>
                            <input
                              type="text"
                              placeholder="Ex: morning"
                              value={cloze.correct || ""}
                              onChange={(e) => {
                                const newArr = [...clozesList];
                                newArr[i] = { ...newArr[i], correct: e.target.value };
                                const newSlides = [...rawSlides];
                                newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], clozes: newArr };
                                updateLessonField("readingSlides", newSlides);
                              }}
                              className="w-full bg-white border border-primary-light rounded-xl p-2.5 text-[13px] font-bold text-primary focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-text-secondary mb-1">Sentence AFTER</label>
                            <input
                              type="text"
                              placeholder="Ex: head start of the day!"
                              value={cloze.sentenceAfter || ""}
                              onChange={(e) => {
                                const newArr = [...clozesList];
                                newArr[i] = { ...newArr[i], sentenceAfter: e.target.value };
                                const newSlides = [...rawSlides];
                                newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], clozes: newArr };
                                updateLessonField("readingSlides", newSlides);
                              }}
                              className="w-full bg-white border border-primary-light rounded-xl p-2.5 text-[13px] focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-text-secondary mb-1">Distractors (Comma separated)</label>
                            <input
                              type="text"
                              placeholder="Ex: automobile, vegetable"
                              value={Array.isArray(cloze.distractors) ? cloze.distractors.join(", ") : cloze.distractors || ""}
                              onChange={(e) => {
                                const newArr = [...clozesList];
                                const str = e.target.value;
                                // We can just store it as a string so that typing commas works 
                                newArr[i] = { ...newArr[i], distractors: str };
                                const newSlides = [...rawSlides];
                                newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], clozes: newArr };
                                updateLessonField("readingSlides", newSlides);
                              }}
                              className="w-full bg-white border border-primary-light rounded-xl p-2.5 text-[13px] focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {clozesList.length === 0 && <p className="text-xs text-text-secondary italic">No cloze interactions added.</p>}
                  </div>
                </div>
              </div>
              );
            })()}

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

function SelectFlashcardWordsModal({
  selectedWordIds,
  dictionaryWords,
  onClose,
  onSave,
}: {
  selectedWordIds: string[];
  dictionaryWords: DictionaryEntry[];
  onClose: () => void;
  onSave: (wordIds: string[]) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedWordIds));

  const filteredWords = dictionaryWords.filter(w => {
    if (searchTerm) {
      if (!w.lemma && !w.word) return false;
      const term = searchTerm.toLowerCase();
      const matchWord = (w.lemma || w.word || "").toLowerCase().includes(term);
      const matchTrans = (w.translation || w.senses?.[0]?.translation_ar || "").toLowerCase().includes(term);
      if (!matchWord && !matchTrans) return false;
    }
    const sense = w.senses?.[0];
    if (filterCategory && sense?.category !== filterCategory) return false;
    if (filterLevel && sense?.cefr_level !== filterLevel) return false;
    return true;
  });

  const categories = Array.from(new Set(dictionaryWords.map(w => w.senses?.[0]?.category).filter(Boolean))) as string[];
  const levels = Array.from(new Set(dictionaryWords.map(w => w.senses?.[0]?.cefr_level).filter(Boolean))) as string[];

  const toggleWord = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-primary-dark">Select Words for Flashcards</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="flex gap-4 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Search word..."
            className="bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px] flex-1 min-w-[200px]"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-auto border border-primary-light rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-bg sticky top-0 z-10 border-b border-primary-light">
              <tr>
                <th className="p-3 font-bold text-[14px] w-12 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary"
                    checked={filteredWords.length > 0 && filteredWords.every(w => selectedIds.has(w.id))}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      if (e.target.checked) {
                        filteredWords.forEach(w => next.add(w.id));
                      } else {
                        filteredWords.forEach(w => next.delete(w.id));
                      }
                      setSelectedIds(next);
                    }}
                  />
                </th>
                <th className="p-3 font-bold text-[14px]">Word</th>
                <th className="p-3 font-bold text-[14px]">Level & Cat</th>
                <th className="p-3 font-bold text-[14px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map(w => (
                <tr key={w.id} className="border-b border-primary-light/50 hover:bg-neutral-bg/50 transition-colors">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-primary"
                      checked={selectedIds.has(w.id)}
                      onChange={() => toggleWord(w.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-primary-dark">{w.lemma || w.word}</div>
                    <div className="text-sm font-arabic text-text-secondary" dir="rtl">{w.senses?.[0]?.translation_ar || w.translation}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-[13px] font-medium text-primary">{w.senses?.[0]?.cefr_level || "-"}</div>
                    <div className="text-xs text-text-secondary">{w.senses?.[0]?.category || "-"}</div>
                  </td>
                  <td className="p-3">
                    {/* Mock Status */}
                    <span className="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-[11px] font-bold uppercase tracking-wider">
                      In Progress
                    </span>
                  </td>
                </tr>
              ))}
              {filteredWords.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-secondary italic">No words found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-primary-light">
          <button onClick={onClose} className="px-6 py-2 rounded-full font-bold transition-all bg-white border-2 border-primary-light text-primary hover:bg-neutral-bg">
            Cancel
          </button>
          <Button onClick={() => onSave(Array.from(selectedIds))}>
            Save Selection ({selectedIds.size})
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("organization");
  const [editingLesson, setEditingLesson] = useState<{
    unitId: string;
    lessonId: string;
    unitTitle: string;
    lessonTitle: string;
  } | null>(null);

  const [studentsList, setStudentsList] = useState<
    {
      id: string;
      name: string;
      username: string;
      password: string;
      createdAt: string;
      avatarId: string;
    }[]
  >(() => {
    const persisted = localStorage.getItem("lms_students");
    return persisted ? JSON.parse(persisted) : [];
  });
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    username: "",
    password: "",
    avatarId: "avatar1",
  });
  const [selectedTrackingStudent, setSelectedTrackingStudent] = useState<
    string | null
  >(null);
  const [isAssigningFlow, setIsAssigningFlow] = useState(false);

  const [studentCursuses, setStudentCursuses] = useState<{
    [studentId: string]: {
      id: string;
      type: "unit" | "lesson";
      title: string;
      status: string;
    }[];
  }>(() => {
    const persisted = localStorage.getItem("lms_student_cursuses");
    return persisted ? JSON.parse(persisted) : {};
  });

  const [studentStats, setStudentStats] = useState<{
    [id: string]: {
      xp: number;
      streak: number;
      dailyGoalProgress: number;
      dailyGoalTotal: number;
    };
  }>(() => {
    const persisted = localStorage.getItem("lms_student_stats");
    return persisted ? JSON.parse(persisted) : {};
  });

  // Sync states to localStorage
  React.useEffect(() => {
    localStorage.setItem("lms_students", JSON.stringify(studentsList));
  }, [studentsList]);

  React.useEffect(() => {
    localStorage.setItem(
      "lms_student_cursuses",
      JSON.stringify(studentCursuses),
    );
  }, [studentCursuses]);

  React.useEffect(() => {
    localStorage.setItem("lms_student_stats", JSON.stringify(studentStats));
  }, [studentStats]);

  const addToCursus = (
    studentId: string,
    item: {
      type: "unit" | "lesson";
      title: string;
      lessonId?: string;
      unitId?: string;
    },
  ) => {
    setStudentCursuses((prev) => {
      const current = prev[studentId] || [];
      return {
        ...prev,
        [studentId]: [
          ...current,
          {
            id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: item.type,
            title: item.title,
            status: "pending",
            lessonId: item.lessonId,
            unitId: item.unitId,
          },
        ],
      };
    });
  };

  const removeFromCursus = (studentId: string, itemId: string) => {
    setStudentCursuses((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] || []).filter((i) => i.id !== itemId),
    }));
  };

  const moveCursusItem = (
    studentId: string,
    index: number,
    direction: "up" | "down",
  ) => {
    setStudentCursuses((prev) => {
      const current = [...(prev[studentId] || [])];
      if (direction === "up" && index > 0) {
        [current[index - 1], current[index]] = [
          current[index],
          current[index - 1],
        ];
      } else if (direction === "down" && index < current.length - 1) {
        [current[index + 1], current[index]] = [
          current[index],
          current[index + 1],
        ];
      }
      return { ...prev, [studentId]: current };
    });
  };

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.username && newStudent.password) {
      const addedId = Date.now().toString();
      setStudentsList([
        ...studentsList,
        {
          id: addedId,
          name: newStudent.name,
          username: newStudent.username,
          password: newStudent.password,
          createdAt: new Date().toLocaleDateString(),
          avatarId: newStudent.avatarId,
        },
      ]);
      // Also register initial stats for new student
      setStudentStats((prev) => ({
        ...prev,
        [addedId]: {
          xp: 0,
          streak: 1,
          dailyGoalProgress: 0,
          dailyGoalTotal: 3,
        },
      }));
      setNewStudent({
        name: "",
        username: "",
        password: "",
        avatarId: "avatar1",
      });
      setShowAddStudentForm(false);
    }
  };

  const handleResetAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL students, courses, paths, and scores? This action cannot be undone.",
      )
    ) {
      localStorage.removeItem("lms_students");
      localStorage.removeItem("lms_student_cursuses");
      localStorage.removeItem("lms_student_stats");
      localStorage.removeItem("lms_course_data");
      localStorage.removeItem("lms_current_student_id");

      setStudentsList([]);
      setStudentCursuses({});
      setStudentStats({});
      setCourseData([]);
      setSelectedTrackingStudent(null);
      setEditingLesson(null);

      alert(
        "All data has been successfully reset! You can now create new students and courses.",
      );
    }
  };

  const [dictionaryWords, setDictionaryWords] = useState<DictionaryEntry[]>(() => {
    const persisted = localStorage.getItem("lms_dictionary_data");
    if (persisted) return JSON.parse(persisted);
    return [
      {
        id: "1",
        lemma: "Morning",
        senses: [{ sense_id: "1_1", gloss: "The first part of the day", translation_ar: "الصباح", examples: ['"Good morning, how are you?"'], cefr_level: "A1" }]
      },
      {
        id: "2",
        lemma: "Apple",
        senses: [{ sense_id: "2_1", gloss: "A round fruit", translation_ar: "تفاحة", examples: ['"I eat an apple every day."'], cefr_level: "A1" }]
      },
      {
        id: "3",
        lemma: "Family",
        senses: [{ sense_id: "3_1", gloss: "A group of parents and children", translation_ar: "عائلة", examples: ['"My family is big."'], cefr_level: "A1" }]
      },
      {
        id: "4",
        lemma: "Hello",
        senses: [{ sense_id: "4_1", gloss: "A greeting used to begin a conversation.", translation_ar: "مرحباً", examples: ['"Hello, nice to meet you."'], cefr_level: "A1" }]
      },
      {
        id: "5",
        lemma: "Water",
        senses: [{ sense_id: "5_1", gloss: "A clear liquid essential for life.", translation_ar: "ماء", examples: ['"Can I have a glass of water?"'], cefr_level: "A1" }]
      },
    ];
  });

  const updateDictionary = (newWords: typeof dictionaryWords) => {
    setDictionaryWords(newWords);
    localStorage.setItem("lms_dictionary_data", JSON.stringify(newWords));
  };

  const [showAddWordForm, setShowAddWordForm] = useState(false);
  const [editingWord, setEditingWord] = useState<DictionaryEntry | null>(null);
  const [editingFlashcardTargetActivityId, setEditingFlashcardTargetActivityId] = useState<number | null>(null);

  const [courseData, setCourseData] = useState<
    {
      id: string;
      title: string;
      lessons: {
        id: string;
        title: string;
        status: string;
        videoUrl?: string;
        videoTitle?: string;
        videoDesc?: string;
        videoStart?: string;
        videoEnd?: string;
        flashcardWord?: string;
        flashcardTrans?: string;
        flashcardExample?: string;
        flashcardWordIds?: string[];
        clozeSentenceBefore?: string;
        clozeSentenceAfter?: string;
        clozeCorrect?: string;
        clozeDistractors?: string;
        readingType?: string;
        readingSlides?: string[];
        readingTitle?: string;
        readingAudioUrl?: string;
        readingImageUrl?: string;
        readingUnscrambleText?: string;
        readingVocabulary?: {
          word: string;
          translation: string;
          definition?: string;
        }[];
        activities?: any[];
      }[];
    }[]
  >(() => {
    const persisted = localStorage.getItem("lms_course_data");
    return persisted ? JSON.parse(persisted) : [];
  });

  const updateLessonField = (field: string, value: any) => {
    if (!editingLesson) return;
    setCourseData((prev) =>
      prev.map((unit) => {
        if (unit.id === editingLesson.unitId) {
          return {
            ...unit,
            lessons: unit.lessons.map((lesson) => {
              if (lesson.id === editingLesson.lessonId) {
                return {
                  ...lesson,
                  [field]: value,
                };
              }
              return lesson;
            }),
          };
        }
        return unit;
      }),
    );
  };

  React.useEffect(() => {
    localStorage.setItem("lms_course_data", JSON.stringify(courseData));
  }, [courseData]);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  const handleCreateUnit = () => {
    const newUnit = {
      id: `u${Date.now()}`,
      title: `Unit ${courseData.length + 1}: New Unit`,
      lessons: [],
    };
    setCourseData([...courseData, newUnit]);
    setEditingUnitId(newUnit.id);
  };

  const handleAddLesson = (unitId: string) => {
    setCourseData(
      courseData.map((unit) => {
        if (unit.id === unitId) {
          return {
            ...unit,
            lessons: [
              ...unit.lessons,
              {
                id: `l${Date.now()}`,
                title: `New Lesson ${unit.lessons.length + 1}`,
                status: "Draft",
              },
            ],
          };
        }
        return unit;
      }),
    );
  };

  const handleMoveLessonUp = (unitId: string, index: number) => {
    if (index === 0) return;
    setCourseData(
      courseData.map((unit) => {
        if (unit.id === unitId) {
          const newLessons = [...unit.lessons];
          [newLessons[index - 1], newLessons[index]] = [
            newLessons[index],
            newLessons[index - 1],
          ];
          return { ...unit, lessons: newLessons };
        }
        return unit;
      }),
    );
  };

  const handleMoveLessonDown = (unitId: string, index: number) => {
    setCourseData(
      courseData.map((unit) => {
        if (unit.id === unitId) {
          if (index === unit.lessons.length - 1) return unit;
          const newLessons = [...unit.lessons];
          [newLessons[index + 1], newLessons[index]] = [
            newLessons[index],
            newLessons[index + 1],
          ];
          return { ...unit, lessons: newLessons };
        }
        return unit;
      }),
    );
  };

  const handleMoveUnitUp = (unitId: string) => {
    const index = courseData.findIndex((u) => u.id === unitId);
    if (index > 0) {
      const newCourseData = [...courseData];
      [newCourseData[index - 1], newCourseData[index]] = [
        newCourseData[index],
        newCourseData[index - 1],
      ];
      setCourseData(newCourseData);
    }
  };

  const handleMoveUnitDown = (unitId: string) => {
    const index = courseData.findIndex((u) => u.id === unitId);
    if (index < courseData.length - 1) {
      const newCourseData = [...courseData];
      [newCourseData[index + 1], newCourseData[index]] = [
        newCourseData[index],
        newCourseData[index + 1],
      ];
      setCourseData(newCourseData);
    }
  };

  const handleDeleteUnit = (unitId: string) => {
    setCourseData(courseData.filter((u) => u.id !== unitId));
  };

  const handleUpdateUnitTitle = (unitId: string, newTitle: string) => {
    setCourseData(
      courseData.map((u) => (u.id === unitId ? { ...u, title: newTitle } : u)),
    );
  };

  const [expandedActivityId, setExpandedActivityId] = useState<number | null>(
    null,
  );
  const [showReadingPreview, setShowReadingPreview] = useState<boolean>(false);
  const [readingTab, setReadingTab] = useState<"general" | "content" | "activities" | "vocabulary">("general");

  const activeUnit = editingLesson
    ? courseData.find((u) => u.id === editingLesson.unitId)
    : undefined;
  const activeLessonObj = editingLesson
    ? activeUnit?.lessons.find((l) => l.id === editingLesson.lessonId)
    : undefined;

  const currentActivities = activeLessonObj?.activities ?? [
    { id: 1, type: "Watching", title: "Video Activity", icon: "📺" },
    { id: 2, type: "Flashcards", title: "Vocab Practice", icon: "🎴" },
    { id: 3, type: "Cloze", title: "Grammar Practice", icon: "📝" },
    { id: 4, type: "Reading", title: "Text / Story Reading", icon: "📖" },
  ];

  const moveActivityUp = (index: number) => {
    if (index === 0) return;
    const newActivities = [...currentActivities];
    [newActivities[index - 1], newActivities[index]] = [
      newActivities[index],
      newActivities[index - 1],
    ];
    updateLessonField("activities", newActivities);
  };

  const moveActivityDown = (index: number) => {
    if (index === currentActivities.length - 1) return;
    const newActivities = [...currentActivities];
    [newActivities[index + 1], newActivities[index]] = [
      newActivities[index],
      newActivities[index + 1],
    ];
    updateLessonField("activities", newActivities);
  };

  const handleAddActivity = (act: string) => {
    const icons: Record<string, string> = {
      Watching: "📺",
      Listening: "🎧",
      Reading: "📖",
      Flashcards: "🎴",
      "Grammar Flashcards": "🧠",
      Matching: "🔗",
      Dictation: "✍️",
      Cloze: "📝",
      Speaking: "🗣️",
      Writing: "✍️",
    };
    updateLessonField("activities", [
      ...currentActivities,
      {
        id: Date.now(),
        type: act,
        title: `Draft: Configure ${act}...`,
        icon: icons[act] || "🧩",
      },
    ]);
  };

  const handleRemoveActivity = (id: number) => {
    updateLessonField(
      "activities",
      currentActivities.filter((a: any) => a.id !== id),
    );
  };

  const handlePublishLesson = () => {
    if (editingLesson) {
      setCourseData(
        courseData.map((unit) =>
          unit.id === editingLesson.unitId
            ? {
                ...unit,
                lessons: unit.lessons.map((lesson) =>
                  lesson.id === editingLesson.lessonId
                    ? { ...lesson, status: "Published" }
                    : lesson,
                ),
              }
            : unit,
        ),
      );
      setEditingLesson(null);
    }
  };

  const renderOrganizationTab = () => {
    if (editingLesson) {
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
              ← Back to Courses
            </button>
            <div>
              <h2 className="text-[20px] font-bold">
                {editingLesson.lessonTitle}
              </h2>
              <span className="text-[14px] text-text-secondary">
                {editingLesson.unitTitle}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="w-full space-y-4">
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-[16px]">Lesson Activities</h3>
                  <div className="flex items-center gap-3">
                    <select
                      className="bg-neutral-bg border border-primary-light rounded-lg px-3 py-1.5 text-[14px] font-medium text-text-primary focus:outline-none focus:border-primary shadow-sm"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddActivity(e.target.value);
                          e.target.value = "";
                        }
                      }}
                    >
                      <option value="" disabled>+ Add Module...</option>
                      {[
                        "Watching",
                        "Listening",
                        "Reading",
                        "Flashcards",
                        "Grammar Flashcards",
                        "Matching",
                        "Dictation",
                        "Cloze",
                        "Speaking",
                        "Writing",
                      ].map((act) => (
                        <option key={act} value={act}>{act}</option>
                      ))}
                    </select>
                    <span className="px-3 py-1 bg-neutral-bg text-text-secondary rounded-full text-xs font-bold">
                      Draft
                    </span>
                  </div>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {currentActivities.length === 0 ? (
                    <div className="w-full h-32 border-2 border-dashed border-primary-light rounded-xl flex items-center justify-center text-text-secondary text-[14px] bg-neutral-bg/50">
                      Select a module from the dropdown above to build your lesson.
                    </div>
                  ) : (
                    currentActivities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="bg-card-bg border border-primary-light rounded-[16px] overflow-hidden shadow-sm transition-colors"
                      >
                        <div
                          className="p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-bg"
                          onClick={() =>
                            setExpandedActivityId(
                              expandedActivityId === activity.id
                                ? null
                                : activity.id,
                            )
                          }
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-text-secondary font-bold text-[14px] min-w-[20px] text-center">
                              {index + 1}
                            </span>
                            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary-dark shrink-0">
                              {activity.icon}
                            </div>
                            <div className="text-left">
                              <span className="font-bold block text-[14px] text-primary-dark">
                                {activity.type}
                              </span>
                              <span className="text-xs text-text-secondary line-clamp-1">
                                {activity.type === "Watching"
                                  ? `Video: ${activity.videoTitle ?? videoTitle}`
                                  : activity.type === "Flashcards"
                                    ? `Flashcard: ${(activity.flashcardWordIds ?? flashcardWordIds).length} words selected`
                                    : activity.type === "Cloze"
                                      ? `Cloze: ${activity.clozeSentenceBefore ?? clozeSentenceBefore} [${activity.clozeCorrect ?? clozeCorrect}] ${activity.clozeSentenceAfter ?? clozeSentenceAfter}`
                                      : activity.type === "Reading"
                                        ? `Reading: ${activity.readingType ?? readingType} (${(activity.readingSlides ?? readingSlides).length} slides)`
                                        : activity.title}
                              </span>
                            </div>
                          </div>
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              disabled={index === 0}
                              onClick={() => moveActivityUp(index)}
                              className="p-1 text-text-secondary disabled:opacity-30 hover:text-primary transition-colors text-lg"
                              title="Move Up"
                            >
                              ↑
                            </button>
                            <button
                              disabled={index === currentActivities.length - 1}
                              onClick={() => moveActivityDown(index)}
                              className="p-1 text-text-secondary disabled:opacity-30 hover:text-primary transition-colors text-lg"
                              title="Move Down"
                            >
                              ↓
                            </button>
                            <div className="w-[1px] h-4 bg-primary-light mx-2"></div>
                            <button
                              onClick={() => handleRemoveActivity(activity.id)}
                              className="p-1 text-text-secondary hover:text-red-500 transition-colors"
                              title="Remove Activity"
                            >
                              🗑
                            </button>
                          </div>
                        </div>

                        {expandedActivityId === activity.id && (
                          <div className="border-t border-primary-light p-4 bg-neutral-bg/30 text-left">
                            {activity.type === "Watching" && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-[13px] font-bold text-primary-dark mb-1">
                                    Video URL (Direct MP4 or YouTube)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: https://www.youtube.com/watch?v=8irSFvoyLHQ&t=450s"
                                    value={activity.videoUrl ?? videoUrl}
                                    onChange={(e) =>
                                      updateActivityField(
                                        activity.id,
                                        "videoUrl",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-card-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                                  />
                                  <p className="text-xs text-text-secondary mt-1">
                                    • Supports YouTube links with specific start times.
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[13px] font-bold text-primary-dark mb-1 font-sans">
                                      Start Second (Optional)
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Ex: 450"
                                      value={activity.videoStart ?? videoStart}
                                      onChange={(e) =>
                                        updateActivityField(
                                          activity.id,
                                          "videoStart",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full bg-card-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                                    />
                                    <p className="text-[11px] text-text-secondary mt-1 font-normal text-left">
                                      Playback starts at (sec).
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block text-[13px] font-bold text-primary-dark mb-1 font-sans">
                                      End Second (Optional)
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Ex: 500"
                                      value={activity.videoEnd ?? videoEnd}
                                      onChange={(e) =>
                                        updateActivityField(
                                          activity.id,
                                          "videoEnd",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full bg-card-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                                    />
                                    <p className="text-[11px] text-text-secondary mt-1 font-normal text-left font-sans">
                                      Playback ends at (sec).
                                    </p>
                                  </div>
                                </div>

                                <div className="hidden">
                                  <p></p>
                                </div>
                                <div>
                                  <label className="block text-[13px] font-bold text-primary-dark mb-1">
                                    Video Title
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: Greetings Course"
                                    value={activity.videoTitle ?? videoTitle}
                                    onChange={(e) =>
                                      updateActivityField(
                                        activity.id,
                                        "videoTitle",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-card-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[13px] font-bold text-primary-dark mb-1">
                                    Student Instructions
                                  </label>
                                  <textarea
                                    placeholder="Watch this video carefully..."
                                    value={activity.videoDesc ?? videoDesc}
                                    onChange={(e) =>
                                      updateActivityField(
                                        activity.id,
                                        "videoDesc",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-card-bg border border-primary-light rounded-xl p-3 text-[14px] min-h-[70px] focus:outline-none focus:border-primary"
                                  />
                                </div>
                              </div>
                            )}
                            {activity.type === "Flashcards" && (
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between items-end mb-1">
                                    <label className="block text-[13px] font-bold text-primary-dark">
                                      Selected Flashcard Words
                                    </label>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setEditingFlashcardTargetActivityId(activity.id);
                                      }}
                                      className="text-primary hover:underline font-bold text-[13px] flex items-center gap-1"
                                    >
                                      <span>+ Select Words</span>
                                    </button>
                                  </div>
                                  
                                  <div className="bg-neutral-bg border border-primary-light rounded-xl p-3 min-h-[60px]">
                                    {(activity.flashcardWordIds ?? flashcardWordIds).length === 0 ? (
                                      <div className="text-text-secondary text-sm italic text-center py-2">
                                        No words selected. Click '+ Select Words' to browse the dictionary.
                                      </div>
                                    ) : (
                                      <div className="flex flex-wrap gap-2">
                                        {(activity.flashcardWordIds ?? flashcardWordIds).map((id: string) => {
                                          const word = dictionaryWords.find((w) => w.id === id);
                                          if (!word) return null;
                                          return (
                                            <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary-light rounded-lg text-sm shadow-sm">
                                              <span className="font-bold text-primary-dark">{word.lemma || word.word}</span>
                                              <span className="text-text-secondary text-xs">•</span>
                                              <span className="text-text-secondary text-xs font-arabic" dir="rtl">{word.senses?.[0]?.translation_ar || word.translation}</span>
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            {activity.type === "Cloze" && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-[13px] font-bold text-primary-dark mb-1">
                                    Sentence BEFORE the word to guess
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: Have a great "
                                    value={activity.clozeSentenceBefore ?? clozeSentenceBefore}
                                    onChange={(e) =>
                                      updateActivityField(
                                        activity.id,
                                        "clozeSentenceBefore",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-card-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[13px] font-bold text-primary-dark mb-1">
                                    The Correct Word (to guess)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: morning"
                                    value={activity.clozeCorrect ?? clozeCorrect}
                                    onChange={(e) =>
                                      updateActivityField(
                                        activity.id,
                                        "clozeCorrect",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-card-bg border border-primary-light rounded-xl p-3 text-[14px] font-bold text-primary focus:outline-none focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[13px] font-bold text-primary-dark mb-1">
                                    Sentence AFTER the word to guess
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: head start of the day!"
                                    value={activity.clozeSentenceAfter ?? clozeSentenceAfter}
                                    onChange={(e) =>
                                      updateActivityField(
                                        activity.id,
                                        "clozeSentenceAfter",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-card-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[13px] font-bold text-primary-dark mb-1">
                                    Distractors (other choices, separated by
                                    commas)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: automobile, vegetable, water"
                                    value={Array.isArray(activity.clozeDistractors || clozeDistractors) ? (activity.clozeDistractors || clozeDistractors).join(", ") : (activity.clozeDistractors || clozeDistractors)}
                                    onChange={(e) =>
                                      updateActivityField(
                                        activity.id,
                                        "clozeDistractors",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-card-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                                  />
                                </div>
                              </div>
                            )}
                            {activity.type === "Reading" && (
                              <ReadingActivityEditor
                                readingType={activity.readingType ?? readingType}
                                readingTitle={activity.readingTitle ?? readingTitle}
                                readingSlides={activity.readingSlides ?? readingSlides}
                                updateLessonField={(field: string, value: any) => {
                                  updateActivityField(activity.id, field, value);
                                }}
                                dictionaryWords={dictionaryWords}
                                updateDictionary={updateDictionary}
                              />
                            )}
                            {activity.type !== "Watching" &&
                              activity.type !== "Flashcards" &&
                              activity.type !== "Cloze" &&
                              activity.type !== "Reading" && (
                                <div className="space-y-3">
                                  <label className="block text-[14px] font-medium text-text-primary">
                                    Content Configuration
                                  </label>
                                  <textarea
                                    placeholder={`Enter content or text for ${activity.type}...`}
                                    className="w-full bg-card-bg border border-primary-light rounded-lg p-2 text-[14px] min-h-[80px]"
                                  ></textarea>
                                </div>
                              )}
                            <div className="mt-4 flex justify-end">
                              <Button
                                variant="ghost"
                                onClick={() => setExpandedActivityId(null)}
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-primary-light flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setEditingLesson(null)}
                  >
                    Save Draft
                  </Button>
                  <Button onClick={handlePublishLesson}>
                    Publish to Student
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl w-full mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-[20px] font-bold">Courses & Modules</h2>
          <Button onClick={handleCreateUnit}>+ Create Unit</Button>
        </div>

        {courseData.length === 0 && (
          <div className="text-text-secondary text-center p-8 bg-card-bg rounded-xl border border-primary-light">
            No course units created. Click "+ Create Unit" to get started.
          </div>
        )}

        {courseData.map((unit) => (
          <div
            key={unit.id}
            className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm"
          >
            <div className="flex justify-between items-start border-b border-primary-light pb-4 mb-4">
              {editingUnitId === unit.id ? (
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={unit.title}
                    onChange={(e) =>
                      handleUpdateUnitTitle(unit.id, e.target.value)
                    }
                    className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[16px] font-bold text-primary-dark"
                    autoFocus
                    onBlur={() => setEditingUnitId(null)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setEditingUnitId(null)
                    }
                  />
                </div>
              ) : (
                <div>
                  <h3 className="font-bold text-[16px] text-primary-dark">
                    {unit.title}
                  </h3>
                  <span className="text-text-secondary text-[14px]">
                    {unit.lessons.length} Lessons
                  </span>
                </div>
              )}
              <div className="flex gap-2 items-center">
                {editingUnitId === unit.id ? (
                  <Button
                    variant="ghost"
                    onClick={() => setEditingUnitId(null)}
                  >
                    Done
                  </Button>
                ) : (
                  <>
                    <div className="flex gap-1 items-center mr-2 text-text-secondary opacity-60 hover:opacity-100 transition-opacity">
                      <button
                        disabled={courseData.indexOf(unit) === 0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMoveUnitUp(unit.id);
                        }}
                        className="p-1 hover:text-primary disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        disabled={
                          courseData.indexOf(unit) === courseData.length - 1
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMoveUnitDown(unit.id);
                        }}
                        className="p-1 hover:text-primary disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={(e: any) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingUnitId(unit.id);
                      }}
                    >
                      Edit Title
                    </Button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteUnit(unit.id);
                      }}
                      className="text-text-secondary hover:text-red-500 transition-colors p-2 text-lg"
                    >
                      🗑
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {unit.lessons.length === 0 && (
                <div className="text-text-secondary text-[14px] text-center p-4 bg-neutral-bg/50 rounded-xl border border-dashed border-primary-light">
                  No lessons in this unit yet.
                </div>
              )}
              {unit.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  onClick={() =>
                    setEditingLesson({
                      unitId: unit.id,
                      lessonId: lesson.id,
                      unitTitle: unit.title,
                      lessonTitle: lesson.title,
                    })
                  }
                  className={`group flex justify-between items-center p-3 rounded-xl border relative cursor-pointer transition-colors ${lesson.status === "Published" ? "bg-primary-light/30 border-primary-light hover:border-primary" : "bg-neutral-bg border-primary-light opacity-80 hover:opacity-100 hover:border-primary-light"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-text-secondary font-bold text-[14px]">
                      #{index + 1}
                    </span>
                    <span
                      className={`font-medium text-[14px] ${lesson.status === "Published" ? "text-primary-dark font-bold" : ""}`}
                    >
                      {lesson.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${lesson.status === "Published" ? "bg-success-light text-success" : "text-text-secondary"}`}
                    >
                      {lesson.status}
                    </span>
                    <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                      <button
                        disabled={index === 0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMoveLessonUp(unit.id, index);
                        }}
                        className="p-1 text-text-secondary disabled:opacity-30 hover:text-primary transition-colors text-lg"
                        title="Move Lesson Up"
                      >
                        ↑
                      </button>
                      <button
                        disabled={index === unit.lessons.length - 1}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMoveLessonDown(unit.id, index);
                        }}
                        className="p-1 text-text-secondary disabled:opacity-30 hover:text-primary transition-colors text-lg"
                        title="Move Lesson Down"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCourseData(
                          courseData.map((u) =>
                            u.id === unit.id
                              ? {
                                  ...u,
                                  lessons: u.lessons.filter(
                                    (l) => l.id !== lesson.id,
                                  ),
                                }
                              : u,
                          ),
                        );
                      }}
                      className="text-text-secondary hover:text-red-500 transition-all text-lg ml-2"
                      title="Delete Lesson"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={() => handleAddLesson(unit.id)}
                className="border border-dashed border-primary-light w-full hover:border-primary hover:bg-primary-light/10 transition-colors text-text-secondary hover:text-primary"
              >
                + Add Lesson to Unit
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col p-8 text-text-primary">
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <h1 className="text-[26px] font-bold text-primary-dark">
          Teacher Space
        </h1>
        <div className="flex items-center gap-3">
          <button
            id="teacher-reset-data-btn"
            onClick={handleResetAllData}
            className="px-4 py-2 text-[13px] font-bold text-red-500 hover:text-white border border-red-200 hover:bg-red-500 rounded-xl transition-all duration-200"
          >
            🗑 Delete all data
          </button>
          <Button variant="ghost" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-primary-light pb-2">
        <button
          onClick={() => setActiveTab("organization")}
          className={`px-4 py-2 text-[16px] font-bold transition-colors ${activeTab === "organization" ? "text-primary border-b-2 border-primary -mb-[10px]" : "text-text-secondary hover:text-text-primary"}`}
        >
          Course Organization
        </button>
        <button
          onClick={() => setActiveTab("parameters")}
          className={`px-4 py-2 text-[16px] font-bold transition-colors ${activeTab === "parameters" ? "text-primary border-b-2 border-primary -mb-[10px]" : "text-text-secondary hover:text-text-primary"}`}
        >
          Modules
        </button>
        <button
          onClick={() => setActiveTab("tracking")}
          className={`px-4 py-2 text-[16px] font-bold transition-colors ${activeTab === "tracking" ? "text-primary border-b-2 border-primary -mb-[10px]" : "text-text-secondary hover:text-text-primary"}`}
        >
          Student Cursus
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 text-[16px] font-bold transition-colors ${activeTab === "students" ? "text-primary border-b-2 border-primary -mb-[10px]" : "text-text-secondary hover:text-text-primary"}`}
        >
          Students
        </button>
        <button
          onClick={() => setActiveTab("dictionary")}
          className={`px-4 py-2 text-[16px] font-bold transition-colors ${activeTab === "dictionary" ? "text-primary border-b-2 border-primary -mb-[10px]" : "text-text-secondary hover:text-text-primary"}`}
        >
          Dictionary Management
        </button>
      </div>

      <div className="flex-1">
        {activeTab === "organization" && renderOrganizationTab()}

        {activeTab === "parameters" && (
          <div className="max-w-7xl w-full mx-auto space-y-8">
            <h2 className="text-[20px] font-bold">Modules Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Watching */}
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <h3 className="font-bold text-[16px] mb-4">Watching (Video)</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      Prevent Skipping Ahead
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      defaultChecked
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      Show English Subtitles
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      defaultChecked
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      Show Transcript
                    </span>
                    <input type="checkbox" className="w-5 h-5 accent-primary" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      Allow Playback Speed Control
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      defaultChecked
                    />
                  </label>
                  <div className="pt-2">
                    <span className="text-[14px] text-text-secondary block mb-2">
                      Max Replays Allowed
                    </span>
                    <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                      <option>1 replay</option>
                      <option>3 replays</option>
                      <option>Unlimited</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Listening */}
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <h3 className="font-bold text-[16px] mb-4">Listening</h3>
                <div className="space-y-4">
                  <div className="pt-2">
                    <span className="text-[14px] text-text-secondary block mb-2">
                      Max Replays Allowed
                    </span>
                    <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                      <option>3 replays</option>
                      <option>5 replays</option>
                      <option>Unlimited</option>
                    </select>
                  </div>
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      Show Transcript After
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      defaultChecked
                    />
                  </label>
                </div>
              </div>

              {/* Reading */}
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <h3 className="font-bold text-[16px] mb-4">Reading</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      Tap for Translation
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      defaultChecked
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      Auto-play Audio
                    </span>
                    <input type="checkbox" className="w-5 h-5 accent-primary" />
                  </label>
                </div>
              </div>

              {/* Flashcards */}
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <h3 className="font-bold text-[16px] mb-4">Flashcards</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      Enable Audio
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      defaultChecked
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      Show Phonetics
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      defaultChecked
                    />
                  </label>
                  <div className="pt-2">
                    <span className="text-[14px] text-text-secondary block mb-2">
                      Display Order
                    </span>
                    <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                      <option>Sequential</option>
                      <option>Random Shuffle</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grammar Flashcards */}
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <h3 className="font-bold text-[16px] mb-4">
                  Grammar Flashcards
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      Show Rule Before
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      defaultChecked
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      AI Explanation
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      defaultChecked
                    />
                  </label>
                </div>
              </div>

              {/* Matching */}
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <h3 className="font-bold text-[16px] mb-4">Matching</h3>
                <div className="space-y-4">
                  <div className="pt-2">
                    <span className="text-[14px] text-text-secondary block mb-2">
                      Display Mode
                    </span>
                    <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                      <option>Text / Text</option>
                      <option>Text / Image</option>
                    </select>
                  </div>
                  <div className="pt-2">
                    <span className="text-[14px] text-text-secondary block mb-2">
                      Time Limit
                    </span>
                    <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                      <option>None (Learn Mode)</option>
                      <option>30 seconds</option>
                      <option>60 seconds</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dictation */}
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <h3 className="font-bold text-[16px] mb-4">Dictation</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      Strict Spelling Check
                    </span>
                    <input type="checkbox" className="w-5 h-5 accent-primary" />
                  </label>
                  <div className="pt-2">
                    <span className="text-[14px] text-text-secondary block mb-2">
                      Max Replays Allowed
                    </span>
                    <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                      <option>3 replays</option>
                      <option>5 replays</option>
                      <option>Unlimited</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cloze */}
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <h3 className="font-bold text-[16px] mb-4">Cloze</h3>
                <div className="space-y-4">
                  <div className="pt-2">
                    <span className="text-[14px] text-text-secondary block mb-2">
                      Number of Distractors
                    </span>
                    <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                      <option>3 distractors</option>
                      <option>4 distractors</option>
                      <option>5 distractors</option>
                    </select>
                  </div>
                  <label className="flex items-center justify-between pt-2">
                    <span className="text-[14px] text-text-primary">
                      Case Sensitive
                    </span>
                    <input type="checkbox" className="w-5 h-5 accent-primary" />
                  </label>
                </div>
              </div>

              {/* Speaking */}
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <h3 className="font-bold text-[16px] mb-4">Speaking</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">
                      AI Pronunciation Scoring
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      defaultChecked
                    />
                  </label>
                  <div className="pt-2">
                    <span className="text-[14px] text-text-secondary block mb-2">
                      Recording Limit
                    </span>
                    <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                      <option>10 seconds</option>
                      <option>30 seconds</option>
                      <option>None</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Writing */}
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <h3 className="font-bold text-[16px] mb-4">Writing</h3>
                <div className="space-y-4">
                  <div className="pt-2">
                    <span className="text-[14px] text-text-secondary block mb-2">
                      Minimum Words
                    </span>
                    <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                      <option>None</option>
                      <option>20 words</option>
                      <option>50 words</option>
                    </select>
                  </div>
                  <label className="flex items-center justify-between pt-2">
                    <span className="text-[14px] text-text-primary">
                      Show Model Answer After
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary"
                      defaultChecked
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tracking" && (
          <div className="space-y-8">
            <h2 className="text-[20px] font-bold">
              Student Progress & History
            </h2>

            {selectedTrackingStudent ? (
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => {
                      setSelectedTrackingStudent(null);
                      setIsAssigningFlow(false);
                    }}
                    className="text-text-secondary hover:text-text-primary px-3 py-1 rounded bg-neutral-bg border border-primary-light font-medium text-[14px]"
                  >
                    ← Back
                  </button>
                  <h3 className="font-bold text-[20px] flex items-center gap-3">
                    {studentsList.find((s) => s.id === selectedTrackingStudent)
                      ?.avatarId && (
                      <img
                        src={
                          AVATARS.find(
                            (a) =>
                              a.id ===
                              studentsList.find(
                                (s) => s.id === selectedTrackingStudent,
                              )?.avatarId,
                          )?.src
                        }
                        alt="Avatar"
                        className="w-12 h-12 rounded-full border-2 border-primary-light object-cover"
                      />
                    )}
                    {studentsList.find((s) => s.id === selectedTrackingStudent)
                      ?.name || "Student Details"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-neutral-bg p-4 rounded-[16px] border border-primary-light">
                    <span className="text-text-secondary text-[14px] font-medium">
                      Experience Points
                    </span>
                    <p className="text-[18px] font-bold mt-1 text-primary">
                      💎{" "}
                      {(studentStats[selectedTrackingStudent] || { xp: 0 }).xp}{" "}
                      XP
                    </p>
                  </div>
                  <div className="bg-neutral-bg p-4 rounded-[16px] border border-primary-light">
                    <span className="text-text-secondary text-[14px] font-medium">
                      Daily Streak
                    </span>
                    <p className="text-[18px] font-bold mt-1 text-reward-dark">
                      🔥{" "}
                      {
                        (studentStats[selectedTrackingStudent] || { streak: 1 })
                          .streak
                      }{" "}
                      Days
                    </p>
                  </div>
                </div>

                <div className="mb-6 border-t border-primary-light pt-6">
                  <h4 className="font-bold text-[18px] mb-4 text-primary-dark">
                    Learning History
                  </h4>
                  <div className="space-y-3">
                    {(() => {
                      const historyData = JSON.parse(
                        localStorage.getItem("lms_student_history") || "[]",
                      );
                      const studentHistory = historyData
                        .filter(
                          (h: any) => h.studentId === selectedTrackingStudent,
                        )
                        .sort(
                          (a: any, b: any) =>
                            new Date(b.timestamp).getTime() -
                            new Date(a.timestamp).getTime(),
                        );

                      if (studentHistory.length === 0) {
                        return (
                          <p className="text-text-secondary italic">
                            No learning history recorded yet.
                          </p>
                        );
                      }

                      return studentHistory.map((item: any, index: number) => {
                        let entityName = "Unknown Element";

                        // Look up the name from courseData
                        for (const unit of courseData) {
                          if (
                            item.type === "unit_start" &&
                            item.unitId === unit.id
                          ) {
                            entityName = unit.title;
                            break;
                          }
                          const foundLesson = unit.lessons.find(
                            (l: any) => l.id === item.lessonId,
                          );
                          if (item.type === "lesson_finish" && foundLesson) {
                            entityName = foundLesson.title;
                            break;
                          }
                        }

                        return (
                          <div
                            key={item.id || index}
                            className="flex items-center justify-between bg-neutral-bg p-3 rounded-[12px] border border-primary-light/50 pb-3"
                          >
                            <div className="flex flex-col">
                              <span className="text-[14px] font-bold">
                                {item.type === "unit_start"
                                  ? "🚀 Started Unit: "
                                  : "✅ Finished Lesson: "}{" "}
                                {entityName}
                              </span>
                              <span className="text-[12px] text-text-secondary mt-1">
                                {new Date(item.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <h3 className="font-bold text-[16px] mb-4">
                  Student Progress Overview
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[14px]">
                    <thead>
                      <tr className="border-b border-primary-light">
                        <th className="pb-2 font-medium text-text-secondary">
                          Student
                        </th>
                        <th className="pb-2 font-medium text-text-secondary">
                          Completed Lessons
                        </th>
                        <th className="pb-2 font-medium text-text-secondary">
                          Total XP
                        </th>
                        <th className="pb-2 font-medium text-text-secondary">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-light/50">
                      {studentsList.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-text-secondary italic"
                          >
                            No students found. Go to the "Students" tab to
                            create students.
                          </td>
                        </tr>
                      ) : (
                        studentsList.map((student, idx) => {
                          const historyData = JSON.parse(
                            localStorage.getItem("lms_student_history") || "[]",
                          );
                          const studentHist = historyData.filter(
                            (h: any) =>
                              h.studentId === student.id &&
                              h.type === "lesson_finish",
                          );
                          return (
                            <tr key={student.id}>
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  {student.avatarId && (
                                    <img
                                      src={
                                        AVATARS.find(
                                          (a) => a.id === student.avatarId,
                                        )?.src
                                      }
                                      alt="Avatar"
                                      className="w-8 h-8 rounded-full border border-primary-light object-cover"
                                    />
                                  )}
                                  <button
                                    onClick={() =>
                                      setSelectedTrackingStudent(student.id)
                                    }
                                    className="font-bold hover:text-primary hover:underline"
                                  >
                                    {student.name}
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 font-medium">
                                {studentHist.length} Lessons Finished
                              </td>
                              <td className="py-3 font-medium text-primary-dark">
                                {(studentStats[student.id] || { xp: 0 }).xp} XP
                              </td>
                              <td className="py-3">
                                <button
                                  onClick={() =>
                                    setSelectedTrackingStudent(student.id)
                                  }
                                  className="text-primary hover:underline font-bold text-xs"
                                >
                                  View Details / History
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "dictionary" && (
          <div className="max-w-7xl w-full mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-bold">Vocabulary Dictionary</h2>
              <Button
                onClick={() => setShowAddWordForm(!showAddWordForm)}
              >
                {showAddWordForm ? "Cancel" : "+ Add Word"}
              </Button>
            </div>

            {(showAddWordForm || editingWord) && (
              <AddWordModal 
                initialData={editingWord || undefined}
                onClose={() => {
                  setShowAddWordForm(false);
                  setEditingWord(null);
                }} 
                onSave={(word) => {
                  if (editingWord) {
                    updateDictionary(dictionaryWords.map(w => w.id === word.id ? word : w));
                  } else {
                    updateDictionary([...dictionaryWords, word]);
                  }
                  setShowAddWordForm(false);
                  setEditingWord(null);
                }}
                onDelete={editingWord ? () => {
                  updateDictionary(dictionaryWords.filter(w => w.id !== editingWord.id));
                  setEditingWord(null);
                } : undefined}
              />
            )}

            <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search dictionary..."
                  className="flex-1 bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
                />
                <select className="bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] min-w-[150px]">
                  <option>All Levels</option>
                  <option>A1</option>
                  <option>A2</option>
                  <option>B1</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-primary-light">
                      <th className="pb-2 font-medium text-text-secondary">
                        Word (English)
                      </th>
                      <th className="pb-2 font-medium text-text-secondary">
                        Translation (Arabic)
                      </th>
                      <th className="pb-2 font-medium text-text-secondary">
                        Definition
                      </th>
                      <th className="pb-2 font-medium text-text-secondary">
                        Example
                      </th>
                      <th className="pb-2 font-medium text-text-secondary w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-light/50">
                    {dictionaryWords.map((wordObj) => {
                      const primarySense = wordObj.senses?.[0];
                      const translation = primarySense?.translation_ar || wordObj.translation || "";
                      const definition = primarySense?.gloss || wordObj.definition || "";
                      const example = (primarySense?.examples && primarySense.examples.length > 0) ? primarySense.examples[0] : wordObj.example || "";
                      return (
                      <tr key={wordObj.id}>
                        <td className="py-4 font-bold text-primary-dark">
                          {wordObj.lemma || wordObj.word}
                        </td>
                        <td className="py-4 font-arabic text-lg" dir="rtl">
                          {translation}
                        </td>
                        <td className="py-4 text-text-secondary">
                          {definition}
                        </td>
                        <td className="py-4 text-text-secondary italic">
                          {example || (
                            <span className="opacity-50">No example</span>
                          )}
                        </td>
                        <td className="py-4">
                          <button
                            className="text-primary hover:underline text-xs"
                            onClick={() => {
                              setEditingWord(wordObj);
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="max-w-7xl w-full mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-bold">Students</h2>
              <Button onClick={() => setShowAddStudentForm(true)}>
                + Add Student
              </Button>
            </div>

            {showAddStudentForm && (
              <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
                <h3 className="font-bold text-[16px] mb-4">Add New Student</h3>
                <div className="mb-6">
                  <label className="block text-[14px] font-medium text-text-primary mb-2">
                    Select Avatar
                  </label>
                  <div className="flex gap-4">
                    {AVATARS.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() =>
                          setNewStudent({ ...newStudent, avatarId: avatar.id })
                        }
                        className={`w-16 h-16 rounded-full overflow-hidden border-4 transition-all focus:outline-none ${newStudent.avatarId === avatar.id ? "border-primary ring-2 ring-primary ring-offset-2 scale-110" : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"}`}
                      >
                        <img
                          src={avatar.src}
                          alt={avatar.label}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-[14px] font-medium text-text-primary mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newStudent.name}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, name: e.target.value })
                      }
                      placeholder="Student Name"
                      className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-text-primary mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={newStudent.username}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          username: e.target.value,
                        })
                      }
                      placeholder="Username"
                      className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-text-primary mb-2">
                      Password
                    </label>
                    <input
                      type="text"
                      value={newStudent.password}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          password: e.target.value,
                        })
                      }
                      placeholder="Password"
                      className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAddStudentForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddStudent}>Save Student</Button>
                </div>
              </div>
            )}

            <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-primary-light">
                      <th className="pb-2 font-medium text-text-secondary">
                        Student Name
                      </th>
                      <th className="pb-2 font-medium text-text-secondary">
                        Username
                      </th>
                      <th className="pb-2 font-medium text-text-secondary">
                        Password
                      </th>
                      <th className="pb-2 font-medium text-text-secondary">
                        Created At
                      </th>
                      <th className="pb-2 font-medium text-text-secondary w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-light/50">
                    {studentsList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-text-secondary italic"
                        >
                          No students in your class. Click "+ Add Student" above
                          to enroll a first student.
                        </td>
                      </tr>
                    ) : (
                      studentsList.map((student) => (
                        <tr key={student.id}>
                          <td className="py-4 font-bold text-primary-dark">
                            <div className="flex items-center gap-3">
                              {student.avatarId && (
                                <img
                                  src={
                                    AVATARS.find(
                                      (a) => a.id === student.avatarId,
                                    )?.src
                                  }
                                  alt="Avatar"
                                  className="w-10 h-10 rounded-full border-2 border-primary-light object-cover"
                                />
                              )}
                              {student.name}
                            </div>
                          </td>
                          <td className="py-4">{student.username}</td>
                          <td className="py-4">{student.password}</td>
                          <td className="py-4 text-text-secondary">
                            {student.createdAt}
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => {
                                setStudentsList(
                                  studentsList.filter(
                                    (s) => s.id !== student.id,
                                  ),
                                );
                              }}
                              className="text-text-secondary hover:text-red-500 transition-colors text-lg"
                              title="Remove Student"
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {editingFlashcardTargetActivityId !== null && editingLesson !== null && (
        <SelectFlashcardWordsModal
          dictionaryWords={dictionaryWords}
          selectedWordIds={
            activeLessonObj?.activities.find(
              (a) => a.id === editingFlashcardTargetActivityId
            )?.flashcardWordIds || []
          }
          onClose={() => setEditingFlashcardTargetActivityId(null)}
          onSave={(wordIds) => {
            if (activeLessonObj) {
              const newActivities = activeLessonObj.activities.map((a) =>
                a.id === editingFlashcardTargetActivityId
                  ? { ...a, flashcardWordIds: wordIds }
                  : a
              );
              
              const updatedCourses = courseData.map((course) => {
                if (course.id === editingLesson.unitId) {
                  return {
                    ...course,
                    lessons: course.lessons.map((lesson) => {
                      if (lesson.id === editingLesson.lessonId) {
                        return { ...lesson, activities: newActivities };
                      }
                      return lesson;
                    }),
                  };
                }
                return course;
              });

              setCourseData(updatedCourses);
              localStorage.setItem("lms_course_data", JSON.stringify(updatedCourses));
            }
            setEditingFlashcardTargetActivityId(null);
          }}
        />
      )}

    </div>
  );
}
