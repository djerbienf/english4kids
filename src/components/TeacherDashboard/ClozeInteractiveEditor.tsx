import React, { useState, useEffect } from "react";
import { EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

interface ClozeInteractiveEditorProps {
  activity: any;
  updateActivityField: (id: number, field: string | Record<string, any>, value?: any) => void;
}

export function ClozeInteractiveEditor({
  activity,
  updateActivityField,
}: ClozeInteractiveEditorProps) {
  const beforeText = activity.clozeSentenceBefore || "";
  const correctText = activity.clozeCorrect || "";
  const afterText = activity.clozeSentenceAfter || "";
  
  // Local state for the complete text input
  const [inputText, setInputText] = useState(() => {
    return activity.clozeFullText || (beforeText + correctText + afterText);
  });

  // Keep local state in sync when external activity changes
  useEffect(() => {
    setInputText(activity.clozeFullText || (beforeText + correctText + afterText));
  }, [activity.clozeFullText, beforeText, correctText, afterText]);

  // Split text by whitespace while preserving it
  const tokens = inputText.split(/(\s+)/).filter((t) => t !== "");

  // Resolve current gap indices
  let gapIndices: number[] = [];
  if (Array.isArray(activity.clozeGapIndices)) {
    gapIndices = activity.clozeGapIndices;
  } else if (correctText) {
    // Reconstruct the index from old format
    let currentLength = 0;
    for (let i = 0; i < tokens.length; i++) {
      if (currentLength === beforeText.length && tokens[i] === correctText) {
        gapIndices = [i];
        break;
      }
      currentLength += tokens[i].length;
    }
  }

  // Handle manual typing or pasting in the textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    
    // Reset indices because the underlying words and whitespace changed
    updateActivityField(activity.id, {
      clozeFullText: val,
      clozeGapIndices: [],
      clozeCorrect: "",
      clozeSentenceBefore: val,
      clozeSentenceAfter: "",
    });
  };

  // Build structured token list for UI rendering
  const tokenObjects = tokens.map((token, i) => {
    const isWord = /\S/.test(token);
    const isSelected = gapIndices.includes(i);
    
    return {
      text: token,
      isWord,
      isSelected,
      index: i,
    };
  });

  // Handle word token click to toggle selection state
  const handleTokenClick = (clickedIndex: number) => {
    const clickedToken = tokenObjects[clickedIndex];
    if (!clickedToken.isWord) return;

    let newGapIndices = [...gapIndices];
    if (newGapIndices.includes(clickedIndex)) {
      newGapIndices = newGapIndices.filter((idx) => idx !== clickedIndex);
    } else {
      newGapIndices.push(clickedIndex);
    }

    // Sort to keep index ordering logical
    const sortedIndices = [...newGapIndices].sort((a, b) => a - b);
    
    // Backward compatibility fields using the first selected gap
    let clozeCorrect = "";
    let clozeSentenceBefore = "";
    let clozeSentenceAfter = "";

    if (sortedIndices.length > 0) {
      const firstGapIdx = sortedIndices[0];
      clozeCorrect = tokens[firstGapIdx] || "";
      clozeSentenceBefore = tokens.slice(0, firstGapIdx).join("");
      clozeSentenceAfter = tokens.slice(firstGapIdx + 1).join("");
    } else {
      clozeSentenceBefore = inputText;
    }

    updateActivityField(activity.id, {
      clozeFullText: inputText,
      clozeGapIndices: sortedIndices,
      clozeCorrect,
      clozeSentenceBefore,
      clozeSentenceAfter,
    });
  };

  // List of words that are currently hidden
  const hiddenWords = gapIndices.map((idx) => tokens[idx]).filter(Boolean);

  return (
    <div className="space-y-4 bg-primary-light/5 border border-primary-light/20 p-5 rounded-2xl">
      <div>
        <label className="block text-[14px] font-bold text-primary-dark mb-1.5">
          1. Type or paste your sentence/paragraph:
        </label>
        <textarea
          value={inputText}
          onChange={handleTextChange}
          placeholder="Paste or type your full text here..."
          className="w-full bg-white border border-primary-light/60 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-[14px] h-24 resize-none transition-all focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-[14px] font-bold text-primary-dark mb-2">
          2. Click on the words you want to hide (you can select multiple words):
        </label>

        {inputText.trim() ? (
          <div className="bg-white border border-neutral-light rounded-xl p-4 min-h-[80px] flex flex-wrap items-center gap-y-2 leading-relaxed">
            {tokenObjects.map((tok, i) => {
              if (!tok.isWord) {
                return (
                  <span key={i} className="whitespace-pre">
                    {tok.text}
                  </span>
                );
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleTokenClick(tok.index)}
                  className={`inline-flex items-center px-2 py-0.5 mx-0.5 rounded-md text-[14px] font-medium transition-all duration-200 cursor-pointer ${
                    tok.isSelected
                      ? "bg-primary text-white scale-105 shadow-sm font-bold ring-2 ring-primary/20"
                      : "bg-neutral-light/30 text-text-primary hover:bg-primary-light/30 hover:text-primary"
                  }`}
                >
                  {tok.text}
                  {tok.isSelected && <EyeOff className="w-3.5 h-3.5 ml-1 inline" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-neutral-light/10 border border-dashed border-neutral-light/60 rounded-xl p-5 text-center text-xs text-text-secondary italic">
            Please enter some text in the textarea above first.
          </div>
        )}
      </div>

      {/* Visual Feedback of Selected Gaps */}
      {hiddenWords.length > 0 ? (
        <div className="flex items-start gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-2 rounded-xl border border-green-200 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <span>
              Success! {hiddenWords.length} {hiddenWords.length === 1 ? "word has" : "words have"} been hidden:
            </span>{" "}
            <span className="flex flex-wrap gap-1.5 mt-1">
              {hiddenWords.map((word, i) => (
                <span key={i} className="bg-green-100 text-green-800 px-2 py-0.5 rounded border border-green-300 font-bold font-mono">
                  "{word}"
                </span>
              ))}
            </span>
          </div>
        </div>
      ) : (
        inputText.trim() && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-2 rounded-xl border border-amber-200 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>No words are currently hidden. Click one or more words above to hide them.</span>
          </div>
        )
      )}

      {/* Distractors & Pedagogical Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-primary-light/20">
        <div>
          <label className="block text-[13px] font-bold text-text-primary mb-1">
            Distractors (comma-separated wrong choices)
          </label>
          <input
            type="text"
            value={activity.clozeDistractors || ""}
            onChange={(e) =>
              updateActivityField(
                activity.id,
                "clozeDistractors",
                e.target.value,
              )
            }
            className="w-full bg-white border border-primary-light/60 rounded-xl p-2.5 text-[13px] focus:outline-none focus:border-primary"
            placeholder="e.g. cat, dog, rabbit"
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-text-primary mb-1">
            Pedagogical Explanation & Context
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
            placeholder="e.g. 'The singular noun is needed after the article a'."
          />
        </div>
      </div>
    </div>
  );
}
