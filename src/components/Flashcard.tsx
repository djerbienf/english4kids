import React, { useState } from 'react';
import { FlashcardConfig } from '../types';
import { Button } from './Button';

interface FlashcardProps {
  config: FlashcardConfig;
  onComplete: () => void;
}

export function Flashcard({ config, onComplete }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col h-full items-center justify-center -mt-16 sm:mt-0 p-6 flex-1 w-full max-w-4xl mx-auto">
      <div 
        className={`w-full max-w-2xl bg-white flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ease-in-out min-h-[400px] mb-12 rounded-[40px]
          ${!flipped ? 'hover:-translate-y-2 shadow-lg shadow-primary/5 border border-primary-light/30' : 'bg-neutral-bg/50 border border-primary-light/20 scale-[1.02]'}
        `}
        style={{ perspective: 1000 }}
        onClick={() => setFlipped(!flipped)}
      >
        {!flipped ? (
           <div className="flex flex-col items-center p-12 text-center w-full">
             <h3 className="text-[64px] md:text-[80px] font-bold text-primary-dark tracking-tight mb-6">{config.word}</h3>
             <span className="px-6 py-2 bg-neutral-bg text-text-secondary font-bold text-[14px] uppercase tracking-widest rounded-full opacity-60">Tap to translate</span>
           </div>
        ) : (
           <div className="flex flex-col items-center p-12 text-center w-full">
             <h3 className="text-[48px] md:text-[64px] font-bold text-primary mb-10" style={{ fontFamily: 'system-ui, sans-serif' }}>{config.translation_ar}</h3>
             <p className="text-[28px] md:text-[32px] text-text-primary italic leading-relaxed font-medium">"{config.example}"</p>
           </div>
        )}
      </div>

      <div className="mt-auto md:mt-12 pb-8 flex flex-col items-center min-h-[100px]">
        {flipped && (
          <Button onClick={onComplete} className="text-[20px] py-4 px-12 shadow-lg shadow-success/30 bg-success hover:bg-success">
            Got it →
          </Button>
        )}
      </div>
    </div>
  );
}
