import React, { RefObject } from "react";
import { Button } from "../../components/Button";
import { FlashcardConfig } from "../../types";

interface Props {
  config: FlashcardConfig;
  hint1Used: boolean;
  setHint1Used: (b: boolean) => void;
  hint2Used: boolean;
  setHint2Used: (b: boolean) => void;
  typedValue: string;
  setTypedValue: (val: string) => void;
  writeFeedback: 'correct' | 'almost' | 'wrong' | null;
  setWriteFeedback: (fb: 'correct' | 'almost' | 'wrong' | null) => void;
  noMoreAttempts: boolean;
  handleCheckWord: () => void;
  onComplete: () => void;
  inputRef: RefObject<HTMLInputElement>;
  highlightExample: () => React.ReactNode;
}

export function FlashcardWrite({
  config, hint1Used, setHint1Used, hint2Used, setHint2Used,
  typedValue, setTypedValue, writeFeedback, setWriteFeedback,
  noMoreAttempts, handleCheckWord, onComplete, inputRef, highlightExample
}: Props) {
  const answerLetters = config.word.split('');
  const typedLetters = typedValue.split('');

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {config.flashcardUseHints !== false && (
        <div className="flex justify-center gap-2 mb-2">
          {config.flashcardHintLength !== false && (
            <button 
              onClick={() => setHint1Used(true)}
              disabled={hint1Used}
              className="px-4 py-1.5 text-[13px] rounded-full bg-primary-light/30 text-primary font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:bg-neutral-bg disabled:text-text-secondary disabled:cursor-not-allowed"
            >
              💡 Letter count
            </button>
          )}
          {config.flashcardHintFirstLetter !== false && (
            <button 
                onClick={() => {
                  setHint2Used(true);
                  if (!typedValue) {
                    setTypedValue(config.word[0] || "");
                  }
                  inputRef.current?.focus();
                }}
                disabled={hint2Used}
                className="px-4 py-1.5 text-[13px] rounded-full bg-primary-light/30 text-primary font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:bg-neutral-bg disabled:text-text-secondary disabled:cursor-not-allowed"
            >
              🔤 1st letter
            </button>
          )}
          {config.flashcardHintWholeWord && (
            <button 
                onClick={() => {
                  setTypedValue(config.word);
                  handleCheckWord();
                }}
                className="px-4 py-1.5 text-[13px] rounded-full bg-primary-light/30 text-primary font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:bg-neutral-bg disabled:text-text-secondary disabled:cursor-not-allowed"
            >
              👁️ Show Word
            </button>
          )}
        </div>
      )}

      {(hint1Used || typedValue.length > 0 || config.flashcardHintLength !== false) && (
        <div className={`flex flex-wrap gap-2 justify-center transition-all ${hint1Used ? 'outline outline-2 outline-dashed outline-primary-light/50 p-3 rounded-[16px]' : ''}`}>
          {answerLetters.map((_, i) => {
          const isFilled = i < typedLetters.length;
          let boxClass = "w-10 h-12 border-2 border-primary-light rounded-lg flex items-center justify-center text-[22px] font-bold text-primary bg-neutral-bg transition-all";
          if (writeFeedback === 'correct') {
            boxClass = "w-10 h-12 border-2 border-success bg-success-light/20 text-success-dark rounded-lg flex items-center justify-center text-[22px] font-bold transition-all";
          } else if (writeFeedback === 'wrong') {
            boxClass = "w-10 h-12 border-2 border-red-400 bg-red-50 text-red-800 rounded-lg flex items-center justify-center text-[22px] font-bold transition-all";
          } else if (isFilled) {
            boxClass = "w-10 h-12 border-2 border-primary bg-primary-light/10 text-primary rounded-lg flex items-center justify-center text-[22px] font-bold transition-all";
          }
          
          return (
            <div key={i} className={boxClass}>
              {typedLetters[i] ? typedLetters[i].toUpperCase() : ''}
            </div>
          );
        })}
        </div>
      )}

      <input 
        ref={inputRef}
        type="text"
        placeholder="Type in English..."
        maxLength={config.word.length + 3}
        value={typedValue}
        onChange={(e) => {
          setTypedValue(e.target.value);
          if (writeFeedback === 'wrong' || writeFeedback === 'almost') setWriteFeedback(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCheckWord();
        }}
        disabled={writeFeedback === 'correct' || noMoreAttempts}
        className={`w-full border-2 rounded-[16px] p-4 text-[20px] text-center tracking-[4px] outline-none font-bold transition-colors shadow-sm
          ${writeFeedback === 'correct' ? 'border-success bg-success-light/10 text-success-dark' :
            writeFeedback === 'almost' ? 'border-amber-400 bg-amber-50 text-amber-800' :
            writeFeedback === 'wrong' ? 'border-red-400 bg-red-50 text-red-800' :
            'border-primary-light/50 text-text-primary focus:border-primary'}
        `}
      />

      {(writeFeedback || noMoreAttempts) && (
        <div className={`rounded-xl p-4 text-[14px] flex gap-3 text-left ${
          writeFeedback === 'correct' ? 'bg-success-light/20 text-success-dark border border-success/30' : 
          writeFeedback === 'almost' ? 'bg-amber-100/50 text-amber-800 border border-amber-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="text-[20px]">
            {writeFeedback === 'correct' ? '🌟' : writeFeedback === 'almost' ? '🔍' : '💪'}
          </div>
          <div>
            {writeFeedback === 'correct' && <>Perfect!</>}
            {writeFeedback === 'almost' && !noMoreAttempts && <>Almost! Check the spelling and try again...</>}
            {writeFeedback === 'wrong' && !noMoreAttempts && <>Not quite — use a hint and try again!</>}
            {noMoreAttempts && <>Out of attempts! The word was <strong>{config.word}</strong>.</>}
            {writeFeedback === 'correct' && (!config.flashcardFeedback || config.flashcardFeedback === "audiosentence") && <div className="text-[12px] opacity-70 italic mt-1">"{highlightExample()}"</div>}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-2">
        {writeFeedback !== 'correct' && !noMoreAttempts ? (
            <Button onClick={handleCheckWord} variant="outline" className="flex-1 py-4 rounded-[16px] border-2">
              Check
            </Button>
        ) : (
            <Button onClick={onComplete} className="flex-1 py-4 shadow-lg shadow-success/30 bg-gradient-to-r from-success to-emerald-500 hover:from-success hover:to-emerald-600 text-white font-bold rounded-[16px] text-[16px]">
              {writeFeedback === 'correct' ? 'Success! Next →' : 'Continue →'}
            </Button>
        )}
      </div>
    </div>
  );
}
