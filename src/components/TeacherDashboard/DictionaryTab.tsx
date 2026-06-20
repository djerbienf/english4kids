import React from "react";
import { Button } from "../Button";
import { AddWordModal } from "./AddWordModal";
import { DictionaryEntry } from "../../types";

export function DictionaryTab({
  dictionaryWords,
  updateDictionary,
  showAddWordForm,
  setShowAddWordForm,
  editingWord,
  setEditingWord
}: {
  dictionaryWords: DictionaryEntry[];
  updateDictionary: (words: DictionaryEntry[]) => void;
  showAddWordForm: boolean;
  setShowAddWordForm: (show: boolean) => void;
  editingWord: DictionaryEntry | null;
  setEditingWord: (word: DictionaryEntry | null) => void;
}) {
  return (
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
                <th className="pb-2 font-medium text-text-secondary">Word (English)</th>
                <th className="pb-2 font-medium text-text-secondary">Translation (Arabic)</th>
                <th className="pb-2 font-medium text-text-secondary">Definition</th>
                <th className="pb-2 font-medium text-text-secondary">Example</th>
                <th className="pb-2 font-medium text-text-secondary w-24">Actions</th>
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
                  <td className="py-4 font-bold text-primary-dark">{wordObj.lemma || wordObj.word}</td>
                  <td className="py-4 font-arabic text-lg" dir="rtl">{translation}</td>
                  <td className="py-4 text-text-secondary">{definition}</td>
                  <td className="py-4 text-text-secondary italic">
                    {example || <span className="opacity-50">No example</span>}
                  </td>
                  <td className="py-4">
                    <button
                      className="text-primary hover:underline text-xs"
                      onClick={() => setEditingWord(wordObj)}
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
  );
}
