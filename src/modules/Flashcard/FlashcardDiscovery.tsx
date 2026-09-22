import React from "react";
import { FlashcardConfig } from "../../types";
import { ArrowRight } from "lucide-react";
import { playAudio } from "../../utils/audio";
import { renderColoredWord, renderColoredSyllables } from "../../utils/wordUtils";

interface ExtendedConfig extends FlashcardConfig {
  pronunciation?: string;
  syllables?: string;
}

interface Props {
  config: ExtendedConfig;
  setPhase: (phase: 1 | 2) => void;
  highlightExample: () => React.ReactNode;
}

export function FlashcardDiscovery({ config, setPhase, highlightExample }: Props) {
  return (
    <div className="flex flex-col items-center animate-in fade-in w-full text-center">
      {config.imageUrl && config.flashcardShowImage !== false ? (
        <img src={config.imageUrl} alt={config.word} className="h-48 object-contain mb-6 max-w-full" />
      ) : (
        <div className="text-[48px] font-black text-[#534AB7] mb-6" dir="rtl">
          {config.translation_ar}
        </div>
      )}

      <h1 className="text-[64px] font-black text-[#534AB7] tracking-[-1.5px] leading-[1.1] m-0 mb-1 text-center animate-in zoom-in duration-300">
        {config.word}
      </h1>

      {config.syllables && (
        <div className="text-[24px] font-medium mb-1">
          {renderColoredSyllables(config.syllables)}
        </div>
      )}

      {config.pronunciation && (
        <p className="text-[20px] font-mono text-[#8888aa] text-center m-0 mb-8 opacity-80">
          {config.pronunciation}
        </p>
      )}

      {config.part_of_speech && (
        <div className="bg-[#F0F1F9] rounded-[16px] py-3 px-5 mb-6 text-center max-w-sm w-full mx-auto border border-primary-light/40">
          <p className="text-[14px] text-[#3C3489] font-bold m-0 leading-relaxed uppercase tracking-wider">
            🏷️ {config.part_of_speech}
          </p>
        </div>
      )}

      <button 
        onClick={() => setPhase(1)} 
        className="w-full max-w-md mt-1 py-[17px] px-6 rounded-[18px] bg-[#534AB7] hover:-translate-y-[2px] active:scale-95 hover:shadow-[0_10px_28px_rgba(83,74,183,0.33)] shadow-[0_6px_20px_rgba(83,74,183,0.25)] text-white font-extrabold text-[17px] flex items-center justify-center gap-[10px] transition-all border-none cursor-pointer group mx-auto"
      >
        Continue <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}
