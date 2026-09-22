import React from "react";
import { FlashcardConfig } from "../../types";
import { ArrowRight } from "lucide-react";
import { renderColoredWord, renderColoredSyllables } from "../../utils/wordUtils";

interface ExtendedConfig extends FlashcardConfig {
  pronunciation?: string;
  syllables?: string;
  dictionaryExamples?: string[];
}

function highlightWord(text: string, word: string) {
  if (!text) return null;
  const cleanText = text.replace(/["“”]/g, '');
  const regex = new RegExp(`(${word})`, 'gi');
  const parts = cleanText.split(regex);
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === word.toLowerCase() ? (
          <strong key={i} className="text-[#534AB7] font-black">{part}</strong>
        ) : (
          part
        )
      )}
    </>
  );
}

interface Props {
  config: ExtendedConfig;
  mcqOptions: string[];
  mcqWrongOptions: string[];
  mcqStatus: 'correct' | 'wrong' | null;
  handleMcqClick: (opt: string) => void;
  setPhase: (phase: 2) => void;
  highlightExample: () => React.ReactNode;
  noMoreAttempts: boolean;
}

export function FlashcardRecognize({ config, mcqOptions, mcqWrongOptions, mcqStatus, handleMcqClick, setPhase, highlightExample, noMoreAttempts }: Props) {
  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300 w-full text-center max-w-md mx-auto">
      {config.imageUrl && config.flashcardShowImage !== false ? (
        <img src={config.imageUrl} alt={config.word} className="h-48 object-contain mb-6 max-w-full" />
      ) : (
        <div className="text-[48px] font-black text-[#534AB7] mb-6" dir="rtl">
          {config.translation_ar}
        </div>
      )}
      <h2 className="text-[64px] font-black text-[#534AB7] mb-1 tracking-[-1px]">
        {config.word}
      </h2>
      {config.syllables && (
        <div className="text-[20px] font-medium mb-1">
          {renderColoredSyllables(config.syllables)}
        </div>
      )}
      {config.pronunciation && (
        <p className="text-[20px] font-mono text-[#8888aa] text-center m-0 mb-6 opacity-80">
          {config.pronunciation}
        </p>
      )}
      
      {config.dictionaryExamples && config.dictionaryExamples.length > 0 && (
        <div className="flex flex-col gap-2.5 w-full max-w-sm mx-auto mb-6">
          {config.dictionaryExamples.map((ex, idx) => (
            <div key={idx} className="bg-[#EEEDFE] rounded-[16px] py-3.5 px-5 text-center shadow-sm border border-[#534AB7]/10 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-[15px] text-[#3C3489] font-semibold m-0 leading-relaxed">
                "{highlightWord(ex, config.word)}"
              </p>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => setPhase(2)} 
        className="w-full mt-4 py-[17px] px-6 rounded-[18px] bg-[#534AB7] hover:-translate-y-[2px] active:scale-95 hover:shadow-[0_10px_28px_rgba(83,74,183,0.33)] shadow-[0_6px_20px_rgba(83,74,183,0.25)] text-white font-extrabold text-[17px] flex items-center justify-center gap-[10px] transition-all border-none cursor-pointer group"
      >
        Got it <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}
