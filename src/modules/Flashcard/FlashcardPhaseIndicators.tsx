import React from "react";

export function FlashcardPhaseIndicators({ phase }: { phase: number }) {
  const steps = [
    { label: "Discovery", p: 0 },
    { label: "Recognize", p: 1 },
    { label: "Listen", p: 2 },
    { label: "Copy", p: 3 },
    { label: "Write", p: 4 },
  ];

  return (
    <div className="flex gap-2 sm:gap-4 justify-center items-center my-6 max-w-full overflow-x-auto px-2">
      {steps.map((step, idx) => (
        <React.Fragment key={step.p}>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all ${
              phase === step.p 
                ? 'bg-white border-[#534AB7] text-[#534AB7] shadow-[0_0_0_4px_rgba(83,74,183,0.15)]' 
                : phase > step.p 
                  ? 'bg-[#534AB7] border-[#534AB7] text-white' 
                  : 'bg-[#f5f5fb] border-[#E2E2F0] text-[#8888aa]'
            }`}>
              {phase > step.p ? '✓' : (idx + 1)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#44445e] font-bold">{step.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-3 sm:w-6 h-[2px] -mt-5 shrink-0 ${phase > step.p ? 'bg-[#534AB7]' : 'bg-[#E2E2F0]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
