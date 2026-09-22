import React, { useState } from "react";
import { Button } from "../../components/Button";
import { DictionaryEntry } from "../../types";

export function AddWordModal({
  initialWord = "",
  initialData,
  dictionaryWords = [],
  onClose,
  onSave,
  onDelete
}: {
  initialWord?: string;
  initialData?: DictionaryEntry;
  dictionaryWords?: DictionaryEntry[];
  onClose: () => void;
  onSave: (word: DictionaryEntry) => void;
  onDelete?: () => void;
}) {
  const [error, setError] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
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
    forms: initialData?.forms?.join(", ") || "",
    pronunciation: initialData?.pronunciation_uk || "",
    imageUrl: primarySense?.assets?.image || "",
    audioUrl: primarySense?.assets?.audio?.uk || "",
  });

  const handleAutoFill = async () => {
    const wordToLookup = newWordData.lemma.trim();
    if (!wordToLookup) return;

    // The internal dictionary is the SINGLE SOURCE OF TRUTH.
    // If the word already exists in the internal dictionary, populate from it instead of fetching externally.
    const existingInternalWord = dictionaryWords?.find(w => 
      (w.lemma?.toLowerCase() === wordToLookup.toLowerCase()) || 
      (w.word?.toLowerCase() === wordToLookup.toLowerCase())
    );

    if (existingInternalWord) {
      const primarySense = existingInternalWord.senses?.[0];
      setNewWordData(prev => ({
        ...prev,
        translation: primarySense?.translation_ar || existingInternalWord.translation || prev.translation,
        definition: primarySense?.gloss || existingInternalWord.definition || prev.definition,
        example: (primarySense?.examples && primarySense.examples.length > 0) ? primarySense.examples[0] : existingInternalWord.example || prev.example,
        part_of_speech: existingInternalWord.part_of_speech || prev.part_of_speech,
        cefr_level: primarySense?.cefr_level || prev.cefr_level,
        difficulty: primarySense?.difficulty?.toString() || prev.difficulty,
        category: primarySense?.category || prev.category,
        synonyms: primarySense?.relations?.synonyms?.join(", ") || prev.synonyms,
        antonyms: primarySense?.relations?.antonyms?.join(", ") || prev.antonyms,
        forms: existingInternalWord.forms?.join(", ") || prev.forms,
        pronunciation: existingInternalWord.pronunciation_uk || prev.pronunciation,
        imageUrl: primarySense?.assets?.image || prev.imageUrl,
        audioUrl: primarySense?.assets?.audio?.uk || prev.audioUrl,
      }));
      return;
    }

    setIsFetching(true);
    setError("");
    try {
      const dictPromise = fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordToLookup)}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      const transPromise = fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(wordToLookup)}&langpair=en|ar`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      const [dictResult, transResult] = await Promise.all([dictPromise, transPromise]);

      let autoTranslation = "";
      if (transResult && transResult.responseData && transResult.responseData.translatedText) {
        autoTranslation = transResult.responseData.translatedText.trim();
      }

      let autoDefinition = "";
      let autoExample = "";
      let autoPos = "";
      let autoPronunciation = "";
      let autoAudioUrl = "";
      let autoSynonyms: string[] = [];
      let autoAntonyms: string[] = [];

      if (dictResult && Array.isArray(dictResult) && dictResult.length > 0) {
        const entry = dictResult[0];
        autoPronunciation = entry.phonetic || (entry.phonetics && entry.phonetics.find((p: any) => p.text)?.text) || "";

        if (entry.phonetics && Array.isArray(entry.phonetics)) {
          const audioObj = entry.phonetics.find((p: any) => p.audio && p.audio.endsWith(".mp3"));
          if (audioObj) {
            autoAudioUrl = audioObj.audio;
          }
        }

        if (entry.meanings && Array.isArray(entry.meanings)) {
          const firstMeaning = entry.meanings[0];
          if (firstMeaning) {
            autoPos = firstMeaning.partOfSpeech || "";
            if (firstMeaning.definitions && Array.isArray(firstMeaning.definitions) && firstMeaning.definitions.length > 0) {
              const firstDef = firstMeaning.definitions[0];
              autoDefinition = firstDef.definition || "";
              autoExample = firstDef.example || "";
            }
            if (firstMeaning.synonyms && Array.isArray(firstMeaning.synonyms)) {
              autoSynonyms = firstMeaning.synonyms.slice(0, 5);
            }
            if (firstMeaning.antonyms && Array.isArray(firstMeaning.antonyms)) {
              autoAntonyms = firstMeaning.antonyms.slice(0, 5);
            }
          }

          entry.meanings.forEach((meaning: any) => {
            if (autoSynonyms.length === 0 && meaning.synonyms && Array.isArray(meaning.synonyms)) {
              autoSynonyms = meaning.synonyms.slice(0, 5);
            }
            if (autoAntonyms.length === 0 && meaning.antonyms && Array.isArray(meaning.antonyms)) {
              autoAntonyms = meaning.antonyms.slice(0, 5);
            }
            if (!autoExample && meaning.definitions && Array.isArray(meaning.definitions)) {
              const withEx = meaning.definitions.find((d: any) => d.example);
              if (withEx) {
                autoExample = withEx.example;
              }
            }
          });
        }
      }

      setNewWordData(prev => ({
        ...prev,
        translation: autoTranslation || prev.translation,
        definition: autoDefinition || prev.definition,
        example: autoExample || prev.example,
        part_of_speech: autoPos.toLowerCase() || prev.part_of_speech,
        pronunciation: autoPronunciation || prev.pronunciation,
        audioUrl: autoAudioUrl || prev.audioUrl,
        synonyms: autoSynonyms.length > 0 ? autoSynonyms.join(", ") : prev.synonyms,
        antonyms: autoAntonyms.length > 0 ? autoAntonyms.join(", ") : prev.antonyms,
      }));

      if (!dictResult && !autoTranslation) {
        setError("Word not found in online dictionary and translation APIs.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dictionary information. Please check your connection.");
    } finally {
      setIsFetching(false);
    }
  };

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
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Word (English) *"
              className="flex-1 bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
              value={newWordData.lemma}
              onChange={(e) => setNewWordData({ ...newWordData, lemma: e.target.value })}
              disabled={!!initialWord && !initialData}
            />
            {!initialData && (
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={isFetching || !newWordData.lemma.trim()}
                className="px-3 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Fetch definition & Arabic translation online"
              >
                {isFetching ? (
                  <span className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Fetch 🔍"
                )}
              </button>
            )}
          </div>
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
          <input
            type="text"
            list="categories-list"
            placeholder="Category / Word Family (e.g. Technology)"
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.category}
            onChange={(e) => setNewWordData({ ...newWordData, category: e.target.value })}
          />
          <datalist id="categories-list">
            {Array.from(new Set(dictionaryWords.map(w => w.senses?.[0]?.category).filter(Boolean))).map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
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
          <input
            type="text"
            placeholder="Forms/Derivations (e.g. goes, went, gone)"
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.forms}
            onChange={(e) => setNewWordData({ ...newWordData, forms: e.target.value })}
          />
          <input
            type="text"
            placeholder="Pronunciation (e.g. /haʊs/)"
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.pronunciation}
            onChange={(e) => setNewWordData({ ...newWordData, pronunciation: e.target.value })}
          />
          <input
            type="text"
            placeholder="Image URL"
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.imageUrl}
            onChange={(e) => setNewWordData({ ...newWordData, imageUrl: e.target.value })}
          />
          <input
            type="text"
            placeholder="Audio URL"
            className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            value={newWordData.audioUrl}
            onChange={(e) => setNewWordData({ ...newWordData, audioUrl: e.target.value })}
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

              // Duplication check only if we are creating a new word or changing the lemma
              if (!initialData || initialData.lemma !== newWordData.lemma) {
                const isDuplicateLemma = dictionaryWords.some(
                  (w) => w.lemma?.toLowerCase() === newWordData.lemma.toLowerCase()
                );
                const isDuplicateForm = dictionaryWords.find(
                  (w) => w.forms && w.forms.some(f => f.toLowerCase() === newWordData.lemma.toLowerCase())
                );
                
                if (isDuplicateLemma) {
                  setError("This word already exists in your dictionary as a main entry.");
                  return;
                }
                if (isDuplicateForm) {
                  setError(`This word already exists as a form/derivation of the word "${isDuplicateForm.lemma}".`);
                  return;
                }
              }

              setError("");
              
              const synonymsList = newWordData.synonyms.split(",").map(s => s.trim()).filter(Boolean);
              const antonymsList = newWordData.antonyms.split(",").map(s => s.trim()).filter(Boolean);
              const formsList = newWordData.forms.split(",").map(s => s.trim()).filter(Boolean);
              
              onSave({
                id: initialData ? initialData.id : Date.now().toString(),
                lemma: newWordData.lemma,
                part_of_speech: newWordData.part_of_speech || undefined,
                forms: formsList,
                pronunciation_uk: newWordData.pronunciation || undefined,
                senses: [{
                  sense_id: initialData?.senses?.[0]?.sense_id || (Date.now().toString() + "_sense"),
                  gloss: newWordData.definition,
                  translation_ar: newWordData.translation,
                  examples: newWordData.example ? [newWordData.example.replace(/["“”]/g, '')] : [],
                  cefr_level: newWordData.cefr_level,
                  difficulty: parseInt(newWordData.difficulty, 10) || undefined,
                  category: newWordData.category || undefined,
                  relations: {
                      synonyms: synonymsList.length > 0 ? synonymsList : undefined,
                      antonyms: antonymsList.length > 0 ? antonymsList : undefined,
                  },
                  assets: {
                    image: newWordData.imageUrl || undefined,
                    audio: {
                      uk: newWordData.audioUrl || undefined
                    }
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
