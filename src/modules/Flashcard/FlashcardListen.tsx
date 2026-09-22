import React, { useState } from "react";
import { FlashcardConfig } from "../../types";
import { ArrowRight, Volume2, Check } from "lucide-react";
import { playAudio } from "../../utils/audio";
import { renderColoredWord, renderColoredSyllables } from "../../utils/wordUtils";

interface ExtendedConfig extends FlashcardConfig {
  pronunciation?: string;
  syllables?: string;
}

interface Props {
  config: ExtendedConfig;
  setPhase: (phase: 3) => void;
}

export function FlashcardListen({ config, setPhase }: Props) {
  const [listenReps, setListenReps] = useState(0);

  const handleRepeat = () => {
    if (listenReps >= 3) return;
    config.audioUrl ? playAudio(config.audioUrl, true) : playAudio(config.word);
    setListenReps(prev => prev + 1);
  };

  const isDone = listenReps >= 3;

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
        <p className="text-[20px] font-mono text-[#8888aa] text-center m-0 mb-8 opacity-80">
          {config.pronunciation}
        </p>
      )}

      <p className="text-[13px] font-bold text-[#8888aa] mb-4">
        {isDone ? "Perfect! Ready to continue." : `Listen, then repeat aloud — ${listenReps}/3`}
      </p>

      <button 
        onClick={handleRepeat}
        className={`w-20 h-20 rounded-[40px] border-none flex items-center justify-center mx-auto mb-5 text-[30px] transition-all duration-200 ${
          isDone 
            ? "bg-[#E1F5EE] text-[#085041] cursor-default" 
            : "bg-[#EEEDFE] text-[#534AB7] cursor-pointer hover:scale-105 active:scale-95"
        }`}
      >
        {isDone ? <Check size={40} strokeWidth={3} /> : <Volume2 size={40} />}
      </button>

      <div className="flex justify-center gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              i < listenReps ? "bg-[#534AB7]" : "bg-[#C8C8E0]"
            }`} 
          />
        ))}
      </div>

      <button 
        onClick={() => setPhase(3)} 
        disabled={!isDone}
        className="w-full py-[17px] px-6 rounded-[18px] bg-[#534AB7] disabled:bg-[#C8C8E0] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none hover:-translate-y-[2px] active:scale-95 hover:shadow-[0_10px_28px_rgba(83,74,183,0.33)] shadow-[0_6px_20px_rgba(83,74,183,0.25)] text-white font-extrabold text-[17px] flex items-center justify-center gap-[10px] transition-all border-none cursor-pointer group"
      >
        Continue <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}
