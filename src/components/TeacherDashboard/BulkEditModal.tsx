import React, { useState } from "react";
import { DictionaryEntry } from "../../types";
import { Button } from "../Button";

interface BulkEditModalProps {
  selectedWordIds: Set<string>;
  dictionaryWords: DictionaryEntry[];
  onSave: (updatedWords: DictionaryEntry[]) => void;
  onClose: () => void;
}

export function BulkEditModal({ selectedWordIds, dictionaryWords, onSave, onClose }: BulkEditModalProps) {
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");

  const handleSave = () => {
    const updatedWords = dictionaryWords.map(word => {
      if (!selectedWordIds.has(word.id)) return word;
      
      const updatedWord = { ...word };
      
      if (partOfSpeech && partOfSpeech !== "No Change") {
        updatedWord.part_of_speech = partOfSpeech;
      }

      if (updatedWord.senses && updatedWord.senses.length > 0) {
        updatedWord.senses = updatedWord.senses.map(sense => {
          const newSense = { ...sense };
          if (level && level !== "No Change") newSense.cefr_level = level;
          if (category && category !== "No Change") newSense.category = category;
          if (partOfSpeech && partOfSpeech !== "No Change") (newSense as any).part_of_speech = partOfSpeech;
          return newSense;
        });
      }

      return updatedWord;
    });

    onSave(updatedWords);
  };

  const categories = Array.from(new Set(dictionaryWords.map(w => w.senses?.[0]?.category).filter(Boolean))) as string[];
  const partsOfSpeech = Array.from(new Set(dictionaryWords.map(w => w.part_of_speech || (w.senses?.[0] as any)?.part_of_speech).filter(Boolean))) as string[];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold mb-4">Bulk Edit ({selectedWordIds.size} words)</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">CEFR Level</label>
            <select 
              value={level} 
              onChange={e => setLevel(e.target.value)}
              className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
            >
              <option value="">No Change</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <div className="flex flex-col gap-2">
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
              >
                <option value="">No Change</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Or type a new category..."
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Part of Speech</label>
            <div className="flex flex-col gap-2">
              <select 
                value={partOfSpeech} 
                onChange={e => setPartOfSpeech(e.target.value)}
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
              >
                <option value="">No Change</option>
                {partsOfSpeech.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Or type a new part of speech..."
                value={partOfSpeech}
                onChange={e => setPartOfSpeech(e.target.value)}
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-primary text-white hover:bg-primary-dark" onClick={handleSave}>
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
