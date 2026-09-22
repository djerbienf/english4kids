import React, { RefObject } from "react";
import { FlashcardConfig } from "../../types";
import { ArrowRight, Check } from "lucide-react";
import { playAudio } from "../../utils/audio";
import { renderColoredWord, renderColoredSyllables } from "../../utils/wordUtils";

interface ExtendedConfig extends FlashcardConfig {
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
  setPhase: (p: 4) => void;
  inputRef: RefObject<HTMLInputElement>;
  highlightExample: () => React.ReactNode;
}

export function FlashcardCopy({
  config, hint1Used, setHint1Used, hint2Used, setHint2Used,
  typedValue, setTypedValue, writeFeedback, setWriteFeedback,
  noMoreAttempts, handleCheckWord, setPhase, inputRef, highlightExample
}: Props) {
  React.useEffect(() => {
    if (typedValue.trim().toLowerCase() === config.word.toLowerCase() && writeFeedback !== 'correct') {
      handleCheckWord();
    }
  }, [typedValue, config.word, writeFeedback, handleCheckWord]);

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300 w-full text-center max-w-md mx-auto">
      {config.imageUrl && config.flashcardShowImage !== false ? (
        <img src={config.imageUrl} alt={config.word} className="h-48 object-contain mb-6 max-w-full" />
      ) : (
        <div className="text-[48px] font-black text-[#534AB7] mb-6" dir="rtl">
          {config.translation_ar}
        </div>
      )}

      <h1 className="text-[64px] font-black text-[#534AB7] tracking-[-1.5px] leading-[1.1] m-0 mb-1 text-center">
        {config.word}
      </h1>

      {config.syllables && (
        <div className="text-[24px] font-medium mb-1">
          {renderColoredSyllables(config.syllables)}
        </div>
      )}
      
      {config.pronunciation && (
        <p className="text-[20px] font-mono text-[#8888aa] text-center m-0 mb-4 opacity-80">
          {config.pronunciation}
        </p>
      )}

      <input 
        ref={inputRef}
        type="text"
        placeholder="Copy the English word..."
        maxLength={config.word.length + 3}
        value={typedValue}
        onChange={(e) => {
          setTypedValue(e.target.value);
          if (writeFeedback === 'wrong' || writeFeedback === 'almost') setWriteFeedback(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (writeFeedback === 'correct') {
              setPhase(4);
            } else {
              handleCheckWord();
            }
          }
        }}
        disabled={writeFeedback === 'correct'}
        className={`w-full border-2 rounded-[16px] p-4 text-[20px] text-center font-bold transition-colors shadow-sm mb-4
          ${writeFeedback === 'correct' ? 'border-[#5DCAA5] bg-[#E1F5EE] text-[#085041]' :
            writeFeedback === 'almost' ? 'border-[#FAC775] bg-[#FEF3DC] text-[#633806]' :
            writeFeedback === 'wrong' ? 'border-[#F09595] bg-[#FCEBEB] text-[#791F1F]' :
            'border-[#E2E2F0] text-text-primary focus:border-[#534AB7] bg-white'}
        `}
      />

      {writeFeedback === 'correct' && (
        <button 
          onClick={() => setPhase(4)} 
          className="w-full py-[17px] px-6 rounded-[18px] bg-[#534AB7] hover:-translate-y-[2px] active:scale-95 hover:shadow-[0_10px_28px_rgba(83,74,183,0.33)] shadow-[0_6px_20px_rgba(83,74,183,0.25)] text-white font-extrabold text-[17px] flex items-center justify-center gap-[10px] transition-all border-none cursor-pointer group"
        >
          Continue <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
}
