import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ClozeConfig } from '../types';
import { Button } from './Button';
import { levenshtein } from '../utils/levenshtein';

interface ClozeProps {
  config: ClozeConfig;
  onComplete: () => void;
}

export function Cloze({ config, onComplete }: ClozeProps) {
  const [typedAnswers, setTypedAnswers] = useState<Record<number, string>>({});
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // To track which individual inputs are wrong so we can highlight them
  const [incorrectInputs, setIncorrectInputs] = useState<Record<number, boolean>>({});

  // 1. Reconstruct full sentence text and tokenize
  const beforeText = config.sentenceBeforeGap || "";
  const correctText = config.correctAnswer || "";
  const afterText = config.sentenceAfterGap || "";
  const fullText = config.clozeFullText || (beforeText + correctText + afterText);
  
  const tokens = fullText.split(/(\s+)/).filter(Boolean);

  // 2. Identify gap indices
  let gapIndices: number[] = [];
  if (Array.isArray(config.clozeGapIndices)) {
    gapIndices = config.clozeGapIndices;
  } else if (config.correctAnswer) {
    let currentLength = 0;
    for (let i = 0; i < tokens.length; i++) {
      if (currentLength === beforeText.length && tokens[i] === config.correctAnswer) {
        gapIndices = [i];
        break;
      }
      currentLength += tokens[i].length;
    }
  }

  // Focus the first input on load
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTypedAnswers({});
    setIsCorrect(null);
    setIncorrectInputs({});
    setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 100);
  }, [config]);

  // Choices list for distractors / helpers
  const correctAnswers = gapIndices.map(idx => tokens[idx]).filter(Boolean);
  const allChoices = Array.from(new Set([...correctAnswers, ...config.distractors])).sort();

  const handleSubmit = () => {
    // Check all gap indices
    let allValid = true;
    const newIncorrectInputs: Record<number, boolean> = {};
    const updatedAnswers = { ...typedAnswers };

    gapIndices.forEach((gapIdx) => {
      const val = (typedAnswers[gapIdx] || "").trim();
      const target = (tokens[gapIdx] || "").trim();
      
      if (!val) {
        allValid = false;
        newIncorrectInputs[gapIdx] = true;
        return;
      }

      let maxTolerance = target.length <= 4 ? 1 : 2;
      if (config.clozeTolerance === "Normale") maxTolerance = 1;
      if (config.clozeTolerance === "Stricte") maxTolerance = 0;

      const lev = levenshtein(val.toLowerCase(), target.toLowerCase());

      if (val.toLowerCase() === target.toLowerCase() || lev <= maxTolerance) {
        // Autocorrect spelling to match target perfectly
        updatedAnswers[gapIdx] = target;
      } else {
        allValid = false;
        newIncorrectInputs[gapIdx] = true;
      }
    });

    setTypedAnswers(updatedAnswers);
    setIncorrectInputs(newIncorrectInputs);

    if (allValid) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full p-6 mt-8 w-full max-w-3xl mx-auto">
      <div className="mb-10">
        <h3 className="text-[22px] font-bold text-primary-dark">Fill in the blanks</h3>
      </div>

      {config.clozeShowChoices !== false && allChoices.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-10 w-full">
          {allChoices.map(word => (
            <div
              key={word}
              className="py-2 px-6 rounded-full text-[16px] font-semibold bg-neutral-bg text-text-secondary border border-neutral-light/50"
            >
              {word}
            </div>
          ))}
        </div>
      )}

      <div className="mb-12 w-full space-y-4">
        <div className="text-[20px] md:text-[24px] leading-[2] text-text-primary flex flex-wrap items-center">
          {tokens.map((tok, index) => {
            const isGap = gapIndices.includes(index);
            if (!isGap) {
              return (
                <span key={index} className="whitespace-pre">
                  {tok}
                </span>
              );
            }

            const isInputIncorrect = incorrectInputs[index];
            const isFirstInput = index === gapIndices[0];

            return (
              <span key={index} className="mx-1.5 inline-flex items-center align-middle">
                <input
                  ref={isFirstInput ? firstInputRef : undefined}
                  type="text"
                  value={typedAnswers[index] || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypedAnswers((prev) => ({
                      ...prev,
                      [index]: val,
                    }));
                    if (isCorrect === false) {
                      setIsCorrect(null);
                      setIncorrectInputs((prev) => ({
                        ...prev,
                        [index]: false,
                      }));
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={isCorrect === true}
                  className={`min-w-[100px] font-bold px-2 py-0.5 pb-1 text-center focus:outline-none transition-all duration-300 bg-transparent border-0 border-b-2 rounded-none shadow-none leading-none
                    ${isCorrect === true
                      ? 'text-success border-success'
                      : isInputIncorrect
                      ? 'text-red-500 border-red-500 animate-shake bg-red-50'
                      : 'text-primary-dark border-primary-light focus:border-primary'}
                  `}
                  style={{
                    width: `${Math.max(8, (typedAnswers[index] || "").length) * 11}px`,
                  }}
                  placeholder="..."
                />
              </span>
            );
          })}
        </div>
        
        {isCorrect === false && (
          <p className="text-red-500 text-sm font-bold animate-pulse mt-4">Some answers are incorrect. Try again!</p>
        )}
      </div>

      <div className="flex flex-col items-center mt-6">
        {isCorrect !== true && (
          <Button
            onClick={handleSubmit}
            variant="primary"
            className="px-8 py-3 text-[16px] shadow-sm transform hover:-translate-y-0.5 transition-all w-48"
            disabled={gapIndices.length > 0 && gapIndices.every(idx => !(typedAnswers[idx] || "").trim())}
          >
            Check Answer
          </Button>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center min-h-[140px]">
        {isCorrect === true && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center flex flex-col items-center"
          >
            <div className="text-green-500 font-bold text-[20px] mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                ✓
              </div>
              Perfect!
            </div>
            <Button
              onClick={onComplete}
              variant="primary"
              className="px-10 py-3 text-[16px] shadow-md shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-1 transition-all"
            >
              Continue →
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
