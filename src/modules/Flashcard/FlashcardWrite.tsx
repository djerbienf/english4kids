import React, { RefObject, useState, useEffect } from "react";
import { FlashcardConfig } from "../../types";
import { ArrowRight, Volume2, HelpCircle } from "lucide-react";
import { playAudio } from "../../utils/audio";
import { Button } from "../../components/Button";
import { renderColoredWord, renderColoredSyllables } from "../../utils/wordUtils";
import { useStore } from "../../store/useStore";

interface ExtendedConfig extends Omit<FlashcardConfig, 'type'> {
  type: "flashcard" | "flashcard-sm2";
  pronunciation?: string;
  syllables?: string;
}

interface Props {
  config: ExtendedConfig;
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
  const storeParams = useStore((state) => state.appParameters);
  const initialTime = config.flashcardTimerSeconds || storeParams?.flashcardWriteTimerDuration || 12;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [timerActive, setTimerActive] = useState(config.type !== "flashcard-sm2");
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!timerActive || writeFeedback === 'correct' || noMoreAttempts) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, writeFeedback, noMoreAttempts]);

  useEffect(() => {
    if (timeLeft === 0 && timerActive && writeFeedback !== 'correct' && !noMoreAttempts) {
      setTimerActive(false);
      setWriteFeedback('wrong');
      if (config.type === 'flashcard-sm2') {
        setShowAnswer(true);
      }
    }
  }, [timeLeft, timerActive, writeFeedback, noMoreAttempts, setWriteFeedback, config.type]);

  useEffect(() => {
    if (config.type === 'flashcard-sm2' && writeFeedback === 'wrong') {
      setShowAnswer(true);
    }
  }, [writeFeedback, config.type]);

  const progress = (timeLeft / initialTime) * 100;
  const strokeDashoffset = 251.2 - (251.2 * progress) / 100;

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-md mx-auto">
      {/* Circular Step/Timer Indicator */}
      {config.type !== "flashcard-sm2" && (
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#F0F1F9"
              strokeWidth="8"
              fill="transparent"
              className="transition-all duration-300"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#534AB7"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[28px] font-black text-[#534AB7]">{timeLeft}</span>
          </div>
        </div>
      )}

      <div className="text-center mb-6 w-full flex flex-col items-center">
        <p className="text-[#8888aa] font-medium m-0 mb-4">English word for:</p>
        {config.imageUrl && config.flashcardShowImage !== false ? (
          <img src={config.imageUrl} alt="Prompt" className="h-40 object-contain mb-2 max-w-full" />
        ) : (
          <h2 className="text-[48px] font-black text-[#534AB7] m-0 mb-2" dir="rtl">
            {config.translation_ar}
          </h2>
        )}
      </div>

      <div className="relative w-full mb-6">
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
            if (e.key === 'Enter') {
              if (writeFeedback === 'correct' || noMoreAttempts) {
                onComplete();
              } else {
                handleCheckWord();
              }
            }
          }}
          disabled={writeFeedback === 'correct' || noMoreAttempts}
          className={`w-full border-2 rounded-[16px] p-4 text-[20px] text-center font-bold transition-colors shadow-sm
            ${writeFeedback === 'correct' ? 'border-[#5DCAA5] bg-[#E1F5EE] text-[#085041]' :
              writeFeedback === 'almost' ? 'border-[#FAC775] bg-[#FEF3DC] text-[#633806]' :
              writeFeedback === 'wrong' ? 'border-[#F09595] bg-[#FCEBEB] text-[#791F1F]' :
              noMoreAttempts ? 'border-[#E2E2F0] bg-neutral-bg text-text-secondary' :
              'border-[#E2E2F0] text-text-primary focus:border-[#534AB7] bg-white'}
          `}
        />
        
        {hint1Used && !typedValue && writeFeedback === null && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-1.5 opacity-40">
            {config.word.split('').map((char, i) => (
              <span key={i} className="text-[20px] font-mono font-bold tracking-[4px]">
                {(hint2Used && i === 0) ? char : "_"}
              </span>
            ))}
          </div>
        )}
      </div>

      {writeFeedback !== 'correct' && !noMoreAttempts && (
        <button 
          onClick={handleCheckWord} 
          disabled={!typedValue.trim()}
          className={`w-full py-[17px] px-6 rounded-[18px] font-extrabold text-[17px] flex items-center justify-center transition-all cursor-pointer border-2 mb-6
            ${typedValue.trim() 
              ? 'bg-[#534AB7] border-transparent text-white hover:-translate-y-[2px] active:scale-95 hover:shadow-[0_10px_28px_rgba(83,74,183,0.33)] shadow-[0_6px_20px_rgba(83,74,183,0.25)]' 
              : 'bg-white border-[#E2E2F0] text-[#8888aa] cursor-not-allowed'
            }
          `}
        >
          Submit
        </button>
      )}

      {writeFeedback === 'almost' && (
        <p className="text-[#633806] font-semibold text-[15px] mt-0 mb-4 animate-in fade-in zoom-in duration-300">
          Almost there! Watch your spelling.
        </p>
      )}

      {(writeFeedback === 'correct' || noMoreAttempts || showAnswer) && (
        <div className="w-full animate-in slide-in-from-bottom-2 fade-in duration-300">
          {( (noMoreAttempts && writeFeedback !== 'correct') || (showAnswer && writeFeedback !== 'correct') ) && (
            <div className="bg-[#FCEBEB] rounded-[16px] py-4 px-5 mb-4 text-center">
              <p className="text-[#791F1F] font-bold m-0 text-[18px]">
                The answer was: <br/>
                <span className="text-[48px] font-black block leading-tight mb-2">{config.word}</span>
                {config.syllables && (
                  <span className="block text-[20px] font-medium mt-1">
                    {renderColoredSyllables(config.syllables)}
                  </span>
                )}
                {config.pronunciation && (
                  <span className="block mt-1 text-[16px] font-mono opacity-80">{config.pronunciation}</span>
                )}
              </p>
            </div>
          )}
          
          {(writeFeedback === 'correct' || noMoreAttempts) && (
            <button 
              onClick={onComplete} 
              className="w-full py-[17px] px-6 rounded-[18px] bg-[#534AB7] hover:-translate-y-[2px] active:scale-95 hover:shadow-[0_10px_28px_rgba(83,74,183,0.33)] shadow-[0_6px_20px_rgba(83,74,183,0.25)] text-white font-extrabold text-[17px] flex items-center justify-center gap-[10px] transition-all border-none cursor-pointer group"
            >
              Continue <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
