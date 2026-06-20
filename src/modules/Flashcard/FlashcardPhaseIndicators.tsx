import React from "react";

export function FlashcardPhaseIndicators({ phase }: { phase: number }) {
  return (
    <div className="flex gap-4 justify-center items-center my-6">
      <div className="flex flex-col items-center gap-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all ${phase === 0 ? 'bg-white border-primary text-primary shadow-[0_0_0_4px_rgba(99,102,241,0.15)]' : 'bg-primary border-primary text-white'}`}>
          {phase > 0 ? '✓' : '1'}
        </div>
        <span className="text-[11px] text-text-secondary font-medium">Discovery</span>
      </div>
      <div className="w-8 h-[2px] bg-primary-light/50 -mt-5" />
      <div className="flex flex-col items-center gap-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all ${phase === 1 ? 'bg-white border-primary text-primary shadow-[0_0_0_4px_rgba(99,102,241,0.15)]' : phase > 1 ? 'bg-primary border-primary text-white' : 'bg-neutral-bg border-primary-light text-text-secondary'}`}>
          {phase > 1 ? '✓' : '2'}
        </div>
        <span className="text-[11px] text-text-secondary font-medium">Recognize</span>
      </div>
      <div className="w-8 h-[2px] bg-primary-light/50 -mt-5" />
      <div className="flex flex-col items-center gap-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all ${phase === 2 ? 'bg-white border-primary text-primary shadow-[0_0_0_4px_rgba(99,102,241,0.15)]' : 'bg-neutral-bg border-primary-light text-text-secondary'}`}>
            3
        </div>
        <span className="text-[11px] text-text-secondary font-medium">Write</span>
      </div>
    </div>
  );
}
