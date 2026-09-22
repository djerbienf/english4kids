import React, { useState } from "react";
import { DictionaryEntry } from "../../types";
import { Button } from "../Button";
import { Sparkles, Check, Info } from "lucide-react";

export function TextScanner({
  text,
  dictionaryWords,
  onAddWord,
  onGenerateActivity,
}: {
  text: string;
  dictionaryWords: DictionaryEntry[];
  onAddWord: (word: string) => void;
  onGenerateActivity?: (
    activityType: "flashcard" | "matching" | "cloze",
  ) => void;
}) {
  const [selectedWordInfo, setSelectedWordInfo] = useState<{
    word: string;
    translation: string;
    definition?: string;
  } | null>(null);

  if (!text)
    return (
      <p className="text-sm text-text-secondary italic">
        No text to scan yet. Type or paste your text above...
      </p>
    );

  const sortedDict = [...dictionaryWords].sort(
    (a, b) => (b.lemma?.length || 0) - (a.lemma?.length || 0),
  );

  const regex = /([a-zA-ZÀ-ÿ]+)/g;
  const parts = text.split(regex);

  return (
    <div className="space-y-4 flex flex-col h-full font-['Nunito']">
      {/* Word information banner when clicking a recognized dictionary word */}
      {selectedWordInfo && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs flex items-center justify-between text-indigo-950 animate-fade-in">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-indigo-600 shrink-0" />
            <span>
              <strong className="text-indigo-700 font-bold">{selectedWordInfo.word}</strong> is in dictionary:{" "}
              <span className="font-arabic font-bold text-sm" dir="rtl">{selectedWordInfo.translation}</span>
              {selectedWordInfo.definition && ` — "${selectedWordInfo.definition}"`}
            </span>
          </div>
          <button
            onClick={() => setSelectedWordInfo(null)}
            className="text-indigo-500 hover:text-indigo-800 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto leading-relaxed text-[15px] text-text-primary whitespace-pre-wrap bg-white p-4 rounded-xl border border-primary-light/50">
        {parts.map((part, i) => {
          if (!part) return null;
          if (/^[a-zA-ZÀ-ÿ]+$/.test(part)) {
            const lowerWord = part.toLowerCase();
            const dictEntry = sortedDict.find(
              (d) => {
                if (d.lemma?.toLowerCase() === lowerWord) return true;
                if (d.forms && d.forms.includes(lowerWord)) return true;
                if (d.inflections && Object.values(d.inflections).some(v => v.toLowerCase() === lowerWord)) return true;
                return false;
              }
            );

            if (dictEntry) {
              const translation =
                dictEntry.senses?.[0]?.translation_ar || dictEntry.translation || "";
              const definition =
                dictEntry.senses?.[0]?.gloss || dictEntry.definition || "";
              return (
                <span
                  key={i}
                  className="text-primary font-bold bg-primary-light/15 px-1 py-0.5 rounded cursor-pointer hover:bg-primary-light/30 transition-colors"
                  title={`In Dictionary: ${translation}`}
                  onClick={() =>
                    setSelectedWordInfo({
                      word: dictEntry.lemma || part,
                      translation,
                      definition,
                    })
                  }
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

      {onGenerateActivity && (
        <div className="pt-3 border-t border-primary-light/50 flex flex-col gap-2">
          <p className="text-[12px] font-bold text-primary-dark flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            AI-Assisted Exercise Generator ✨
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="text-[12px] py-1.5 px-3 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              onClick={() => onGenerateActivity("matching")}
            >
              Generate Matching Pairs
            </Button>
            <Button
              variant="outline"
              className="text-[12px] py-1.5 px-3 border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100"
              onClick={() => onGenerateActivity("cloze")}
            >
              Generate Fill-in-the-Blanks (Cloze)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
