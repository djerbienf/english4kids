import React, { useState } from "react";
import { Button } from "../../components/Button";
import { DictionaryEntry } from "../../types";

export function AddWordModal({
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
