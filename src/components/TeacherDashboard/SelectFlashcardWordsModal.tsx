import React, { useState } from "react";
import { DictionaryEntry } from "../../types";
import { Button } from "../Button";

export function SelectFlashcardWordsModal({
  selectedWordIds,
  dictionaryWords,
  alreadyUsedWordIds,
  onClose,
  onSave,
}: {
  selectedWordIds: string[];
  dictionaryWords: DictionaryEntry[];
  alreadyUsedWordIds: Set<string>;
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
                <th className="p-3 font-bold text-[14px]">Level &amp; Cat</th>
                <th className="p-3 font-bold text-[14px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map(w => {
                const isAlreadyUsed = alreadyUsedWordIds.has(w.id);
                return (
                  <tr key={w.id} className={`border-b border-primary-light/50 transition-colors ${isAlreadyUsed && !selectedIds.has(w.id) ? 'bg-orange-50/30' : 'hover:bg-neutral-bg/50'}`}>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-primary"
                        checked={selectedIds.has(w.id)}
                        onChange={() => toggleWord(w.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className={`font-medium ${isAlreadyUsed && !selectedIds.has(w.id) ? 'text-orange-900' : 'text-primary-dark'}`}>
                        {w.lemma || w.word}
                      </div>
                      <div className="text-sm font-arabic text-text-secondary" dir="rtl">{w.senses?.[0]?.translation_ar || w.translation}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-[13px] font-medium text-primary">{w.senses?.[0]?.cefr_level || "-"}</div>
                      <div className="text-xs text-text-secondary">{w.senses?.[0]?.category || "-"}</div>
                    </td>
                    <td className="p-3">
                      {isAlreadyUsed ? (
                        <span className="px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-[11px] font-bold uppercase tracking-wider">
                          Used in another activity
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-neutral-bg text-text-secondary rounded-full text-[11px] font-bold uppercase tracking-wider">
                          Available
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
