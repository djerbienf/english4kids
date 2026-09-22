import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MatchingConfig, MatchingPair } from "../types";
import { Button } from "./Button";
import { playAudio } from "../utils/audio";

interface MatchingProps {
  config: MatchingConfig;
  onComplete: () => void;
}

export function Matching({ config, onComplete }: MatchingProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // array of IDs
  const [errorPair, setErrorPair] = useState<[string, string] | null>(null);

  // Shuffle items initially
  const [leftItems, setLeftItems] = useState<MatchingPair[]>([]);
  const [rightItems, setRightItems] = useState<MatchingPair[]>([]);

  useEffect(() => {
    const rawPairs = config.pairs || [];
    // Basic shuffle
    const shuffledLeft = [...rawPairs].sort(() => Math.random() - 0.5);
    const shuffledRight = [...rawPairs].sort(() => Math.random() - 0.5);
    setLeftItems(shuffledLeft);
    setRightItems(shuffledRight);

    // Reset state
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setErrorPair(null);
  }, [config]);

  if (!config.pairs || config.pairs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-primary-light text-center max-w-lg mx-auto font-['Nunito'] space-y-4">
        <div className="text-4xl">🧩</div>
        <h3 className="text-lg font-bold text-primary-dark">No Matching Pairs Configured</h3>
        <p className="text-xs text-text-secondary">This matching activity does not have any pairs yet.</p>
        <Button onClick={onComplete}>Continue →</Button>
      </div>
    );
  }

  const handleLeftClick = (item: MatchingPair) => {
    if (matchedPairs.includes(item.id)) return;
    
    // Play audio for French/English item
    if (item.audioUrl) {
      playAudio(item.audioUrl, true);
    } else {
      playAudio(item.left, false);
    }
    
    setSelectedLeft(item.id);
    if (selectedRight) {
      checkMatch(item.id, selectedRight);
    }
  };

  const handleRightClick = (item: MatchingPair) => {
    if (matchedPairs.includes(item.id)) return;
    
    setSelectedRight(item.id);
    if (selectedLeft) {
      checkMatch(selectedLeft, item.id);
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      setMatchedPairs((prev) => [...prev, leftId]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setErrorPair(null);
    } else {
      setErrorPair([leftId, rightId]);
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setErrorPair(null);
      }, 800);
    }
  };

  const isComplete =
    matchedPairs.length === config.pairs.length && config.pairs.length > 0;

  return (
    <div className="flex flex-col items-center max-w-3xl w-full mx-auto px-4 py-8">
      <div className="w-full mb-8">
        <h3 className="text-[22px] font-bold text-primary-dark">
          Match the pairs
        </h3>
      </div>

      <div className="w-full flex-1 flex gap-8 mb-8">
        {/* Left Column (French/English) */}
        <div className="flex-1 flex flex-col gap-4">
          {leftItems.map((item) => {
            const isMatched = matchedPairs.includes(item.id);
            const isSelected = selectedLeft === item.id;
            const isError = errorPair?.[0] === item.id;

            return (
              <button
                key={`L-${item.id}`}
                onClick={() => handleLeftClick(item)}
                disabled={isMatched || errorPair !== null}
                className={`h-[88px] w-full px-6 rounded-[20px] text-center border-2 text-[24px] font-bold transition-all flex items-center justify-center gap-3 select-none ${
                  isMatched
                    ? "bg-[#e8fcd4] border-[#84d824] text-[#58cc02]"
                    : isError
                      ? "bg-[#ffdfe0] border-[#ff4b4b] text-[#ff4b4b]"
                      : isSelected
                        ? "bg-[#ddf4ff] border-[#1899d6] text-[#1899d6] shadow-sm"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50/50 active:scale-[0.98]"
                }`}
              >
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.left} className="w-12 h-12 object-cover rounded-xl" />
                )}
                <span>{item.left}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column (Arabic) */}
        <div className="flex-1 flex flex-col gap-4">
          {rightItems.map((item) => {
            const isMatched = matchedPairs.includes(item.id);
            const isSelected = selectedRight === item.id;
            const isError = errorPair?.[1] === item.id;

            return (
              <button
                key={`R-${item.id}`}
                onClick={() => handleRightClick(item)}
                disabled={isMatched || errorPair !== null}
                className={`h-[88px] w-full px-6 rounded-[20px] border-2 text-[30px] font-arabic font-bold transition-all flex items-center justify-center text-center select-none leading-normal ${
                  isMatched
                    ? "bg-[#e8fcd4] border-[#84d824] text-[#58cc02]"
                    : isError
                      ? "bg-[#ffdfe0] border-[#ff4b4b] text-[#ff4b4b]"
                      : isSelected
                        ? "bg-[#ddf4ff] border-[#1899d6] text-[#1899d6] shadow-sm"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50/50 active:scale-[0.98]"
                }`}
                dir="rtl"
              >
                <span>{item.right}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        {isComplete ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Button onClick={onComplete} className="w-full">
              Continue
            </Button>
          </motion.div>
        ) : (
          <Button
            disabled
            className="w-full bg-neutral-light text-text-secondary border-none"
          >
            {matchedPairs.length} / {config.pairs.length} Matched
          </Button>
        )}
      </div>
    </div>
  );
}
