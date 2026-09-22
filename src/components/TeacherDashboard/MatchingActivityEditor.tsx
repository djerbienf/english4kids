import React, { useState } from "react";
import { Button } from "../../components/Button";
import { DictionaryEntry } from "../../types";

interface MatchingActivityEditorProps {
  activity: any;
  updateActivityField: (activityId: number, field: string | Record<string, any>, value?: any) => void;
  dictionaryWords: DictionaryEntry[];
  setEditingFlashcardTargetActivityId: (id: number | null) => void;
}

export function MatchingActivityEditor({
  activity,
  updateActivityField,
  dictionaryWords,
  setEditingFlashcardTargetActivityId,
}: MatchingActivityEditorProps) {
  const [activeAutocomplete, setActiveAutocomplete] = useState<{ activityId: number; pairIndex: number; field: "left" | "right" } | null>(null);

  const renderAutocompleteDropdown = (pairIndex: number, pair: any, field: "left" | "right") => {
    const query = (pair[field] || "").toLowerCase().trim();
    if (!query) {
      return (
        <div className="text-[12px] text-gray-400 p-2 text-center">
          Type to search...
        </div>
      );
    }

    const scored = dictionaryWords.map(word => {
      const text = (word.lemma || word.word || "").toLowerCase();
      const translation = (word.senses?.[0]?.translation_ar || word.translation || "").toLowerCase();
      const gloss = (word.senses?.[0]?.gloss || word.definition || "").toLowerCase();

      let score = 0;
      
      const primaryMatch = field === "left" ? text : translation;
      const secondaryMatch = field === "left" ? translation : text;

      if (primaryMatch === query) {
        score = 1000;
      } else if (primaryMatch.startsWith(query)) {
        score = 900 - primaryMatch.length;
      } else if (primaryMatch.includes(query)) {
        score = 700 - primaryMatch.indexOf(query);
      } else if (secondaryMatch === query) {
        score = 800;
      } else if (secondaryMatch.startsWith(query)) {
        score = 600 - secondaryMatch.length;
      } else if (secondaryMatch.includes(query)) {
        score = 500 - secondaryMatch.indexOf(query);
      } else if (gloss.includes(query)) {
        score = 100 - gloss.indexOf(query);
      }

      return { word, score };
    });

    const filtered = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.word);

    if (filtered.length === 0) {
      return (
        <div className="text-[12px] text-gray-400 p-2 text-center">
          No matching words in dictionary
        </div>
      );
    }

    return filtered.slice(0, 8).map((word) => {
      const leftText = word.lemma || word.word || "";
      const rightText = word.senses?.[0]?.translation_ar || word.translation || word.senses?.[0]?.gloss || "";
      return (
        <button
          key={word.id}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            const newPairs = [...(activity.matchingPairs || [])];
            newPairs[pairIndex] = {
              ...newPairs[pairIndex],
              left: leftText,
              right: rightText,
            };
            updateActivityField(activity.id, "matchingPairs", newPairs);
            setActiveAutocomplete(null);
          }}
          className="w-full text-left px-2.5 py-1.5 hover:bg-indigo-50 rounded text-[13px] flex justify-between items-center transition-colors cursor-pointer"
        >
          <div>
            <span className="font-semibold text-[#534AB7]">{field === "left" ? leftText : rightText}</span>
            {word.part_of_speech && (
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded ml-2">
                {word.part_of_speech}
              </span>
            )}
          </div>
          <span className="text-gray-500 text-[11px] truncate max-w-[140px] font-medium">{field === "left" ? rightText : leftText}</span>
        </button>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[14px] font-medium text-text-primary mb-1">
            Selected Dictionary Words: {activity.dictionaryWordIds?.length || 0}
          </label>
          <div className="text-xs text-text-secondary p-2 bg-white rounded border border-primary-light min-h-[40px]">
            {activity.dictionaryWordIds && activity.dictionaryWordIds.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {activity.dictionaryWordIds.map((id: string) => {
                  const w = dictionaryWords.find((w) => w.id === id);
                  return w ? (
                    <span
                      key={id}
                      className="bg-primary-light/20 text-primary-dark pl-2 pr-1 py-0.5 border border-primary-light rounded-full flex items-center gap-1"
                    >
                      <span>{w.lemma || w.word}</span>
                      <button
                        onClick={() => {
                          const newWordIds = activity.dictionaryWordIds.filter((wordId: string) => wordId !== id);
                          updateActivityField(activity.id, "dictionaryWordIds", newWordIds);
                        }}
                        className="hover:bg-red-100 hover:text-red-600 text-primary-dark/60 rounded-full w-4 h-4 flex items-center justify-center font-bold text-sm leading-none transition-colors"
                        title="Remove word"
                      >
                        &times;
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            ) : (
              "No words selected. Click 'Select Dictionary Words'."
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditingFlashcardTargetActivityId(activity.id)}>
          Select Dictionary Words
        </Button>
      </div>

      <h4 className="font-bold text-[14px] text-primary-dark mt-4 border-t border-primary-light pt-4">Manual Pairs (Grammar / Sentences)</h4>
      
      <div className="space-y-4">
        {(activity.matchingPairs || []).map((pair: any, pairIndex: number) => (
          <div
            key={pairIndex}
            className="p-4 border border-primary-light rounded-lg bg-neutral-bg space-y-4 relative group"
          >
            <button
              onClick={() => {
                const newPairs = [...(activity.matchingPairs || [])];
                newPairs.splice(pairIndex, 1);
                updateActivityField(activity.id, "matchingPairs", newPairs);
              }}
              className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove pair"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>

            <div className="font-bold text-[14px] text-text-secondary">Pair {pairIndex + 1}</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <label className="block text-[14px] font-medium text-text-primary mb-1">Left (e.g., Word)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={pair.left || ""}
                    onFocus={() => setActiveAutocomplete({ activityId: activity.id, pairIndex, field: "left" })}
                    onBlur={() => {
                      setTimeout(() => {
                        setActiveAutocomplete(prev => {
                          if (prev?.activityId === activity.id && prev?.pairIndex === pairIndex && prev?.field === "left") {
                            return null;
                          }
                          return prev;
                        });
                      }, 200);
                    }}
                    onChange={(e) => {
                      const newPairs = [...(activity.matchingPairs || [])];
                      newPairs[pairIndex] = { ...newPairs[pairIndex], left: e.target.value };
                      updateActivityField(activity.id, "matchingPairs", newPairs);
                      setActiveAutocomplete({ activityId: activity.id, pairIndex, field: "left" });
                    }}
                    className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                    placeholder="Type English word..."
                  />
                  {activeAutocomplete?.activityId === activity.id && activeAutocomplete?.pairIndex === pairIndex && activeAutocomplete?.field === "left" && (
                    <div className="absolute left-0 right-0 z-[100] mt-1 max-h-48 overflow-y-auto bg-white border border-indigo-200 rounded-lg shadow-lg p-1 space-y-0.5">
                      {renderAutocompleteDropdown(pairIndex, pair, "left")}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-[14px] font-medium text-text-primary mb-1">Right (e.g., Translation)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={pair.right || ""}
                    onFocus={() => setActiveAutocomplete({ activityId: activity.id, pairIndex, field: "right" })}
                    onBlur={() => {
                      setTimeout(() => {
                        setActiveAutocomplete(prev => {
                          if (prev?.activityId === activity.id && prev?.pairIndex === pairIndex && prev?.field === "right") {
                            return null;
                          }
                          return prev;
                        });
                      }, 200);
                    }}
                    onChange={(e) => {
                      const newPairs = [...(activity.matchingPairs || [])];
                      newPairs[pairIndex] = { ...newPairs[pairIndex], right: e.target.value };
                      updateActivityField(activity.id, "matchingPairs", newPairs);
                      setActiveAutocomplete({ activityId: activity.id, pairIndex, field: "right" });
                    }}
                    className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#534AB7]"
                    placeholder="Type translation or English word..."
                  />
                  {activeAutocomplete?.activityId === activity.id && activeAutocomplete?.pairIndex === pairIndex && activeAutocomplete?.field === "right" && (
                    <div className="absolute left-0 right-0 z-[100] mt-1 max-h-48 overflow-y-auto bg-white border border-indigo-200 rounded-lg shadow-lg p-1 space-y-0.5">
                      {renderAutocompleteDropdown(pairIndex, pair, "right")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              const pairs = activity.matchingPairs || [];
              const newId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
              updateActivityField(activity.id, "matchingPairs", [...pairs, { id: newId, left: "", right: "" }]);
            }}
            className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-semibold text-[14px] px-2 py-1 rounded hover:bg-primary-light/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Matching Pair
          </button>
        </div>

        <div className="pt-3 border-t border-primary-light/30">
          <label className="block text-[13px] font-bold text-text-primary mb-1">
            Pedagogical Explanation / Guidelines (Optional)
          </label>
          <input
            type="text"
            value={activity.explanation || ""}
            onChange={(e) =>
              updateActivityField(
                activity.id,
                "explanation",
                e.target.value,
              )
            }
            className="w-full bg-white border border-primary-light/60 rounded-xl p-2.5 text-[13px] focus:outline-none focus:border-primary"
            placeholder="Explain the relationship between the pairs (e.g. 'Match verbs to their past participle forms')."
          />
        </div>
      </div>
    </div>
  );
}
