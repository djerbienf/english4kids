import React from "react";
import { DictionaryEntry } from "../../types";

export function TextScanner({
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
