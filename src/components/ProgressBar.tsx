import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="w-full flex gap-1 mb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-2 rounded-[10px] transition-colors duration-300 ${
            i < current - 1 ? 'bg-[#534AB7]' : i === current - 1 ? 'bg-[#AFA9EC]' : 'bg-[#EEEEF8]'
          }`}
        />
      ))}
    </div>
  );
}
