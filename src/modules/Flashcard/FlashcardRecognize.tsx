import React from "react";
import { Button } from "../../components/Button";
import { FlashcardConfig } from "../../types";

interface Props {
  config: FlashcardConfig;
  mcqOptions: string[];
  mcqSelected: string | null;
  mcqStatus: 'correct' | 'wrong' | null;
  handleMcqClick: (opt: string) => void;
  setPhase: (phase: 2) => void;
  highlightExample: () => React.ReactNode;
}

export function FlashcardRecognize({
  config, mcqOptions, mcqSelected, mcqStatus, handleMcqClick, setPhase, highlightExample
}: Props) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-2 gap-3">
        {mcqOptions.map((opt) => {
          const isSelected = mcqSelected === opt;
          const isCorrect = opt.toLowerCase() === config.word.toLowerCase();
          
          let btnClass = "bg-neutral-bg border-2 border-primary-light rounded-[16px] p-4 text-[16px] font-bold text-text-primary hover:border-primary hover:bg-white transition-all";
          if (mcqStatus !== null) {
            if (isCorrect) {
              btnClass = "bg-success-light/20 border-2 border-success text-success-dark rounded-[16px] p-4 text-[16px] font-bold shadow-sm";
            } else if (isSelected && !isCorrect) {
              btnClass = "bg-red-50 border-2 border-red-400 text-red-800 rounded-[16px] p-4 text-[16px] font-bold";
            } else {
              btnClass = "bg-neutral-bg/50 border-2 border-primary-light/50 rounded-[16px] p-4 text-[16px] font-bold text-text-secondary opacity-50";
            }
          }

          return (
            <button 
              key={opt}
              disabled={mcqStatus !== null}
              onClick={() => handleMcqClick(opt)}
              className={btnClass}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {mcqStatus !== null && (
        <div className={`rounded-xl p-4 text-[14px] mt-2 flex gap-3 ${mcqStatus === 'correct' ? 'bg-success-light/20 text-success-dark border border-success/30' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="text-[20px]">{mcqStatus === 'correct' ? '🌟' : '🔍'}</div>
          <div className="text-left">
            {mcqStatus === 'correct' ? (
              <>Great job! <strong>{config.word}</strong> = {config.translation_ar}</>
            ) : (
              <>Almost! The correct answer is <strong>{config.word}</strong></>
            )}
            {(!config.flashcardFeedback || config.flashcardFeedback === "audiosentence") && (
              <div className="text-[12px] opacity-70 italic mt-1">"{highlightExample()}"</div>
            )}
          </div>
        </div>
      )}

      {mcqStatus !== null && (
          <Button onClick={() => setPhase(2)} className="w-full mt-2 py-4 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary-mid to-primary-dark text-white font-bold rounded-[16px] text-[16px] hover:translate-y-[-2px] transition-all">
            Continue →
          </Button>
      )}
    </div>
  );
}
