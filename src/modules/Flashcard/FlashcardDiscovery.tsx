import React from "react";
import { Button } from "../../components/Button";
import { FlashcardConfig } from "../../types";

interface Props {
  config: FlashcardConfig;
  setPhase: (phase: 1 | 2) => void;
  highlightExample: () => React.ReactNode;
}

export function FlashcardDiscovery({ config, setPhase, highlightExample }: Props) {
  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-[36px] font-extrabold text-primary tracking-wide">{config.word}</div>
      
      {(!config.flashcardFeedback || config.flashcardFeedback === "audiosentence") && (
        <div className="bg-success-light/20 border border-success-light rounded-xl p-4 mt-4 w-full flex gap-3 text-[14px] text-success-dark">
          <div className="text-[20px]">💡</div>
          <div className="text-left">
            "{highlightExample()}"
            <div className="text-[12px] opacity-70 italic mt-1">Sentence from the text</div>
          </div>
        </div>
      )}

      <Button onClick={() => setPhase(1)} className="w-full mt-6 py-4 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary-mid text-white font-bold rounded-[16px] text-[16px] hover:translate-y-[-2px] transition-all">
        Memorized → Continue
      </Button>
    </div>
  );
}
