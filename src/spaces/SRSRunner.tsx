import React, { useState } from "react";
import { SRSDeckItem } from "../types";
import { Flashcard } from "../components/Flashcard";
import { updateSRSItem } from "../utils/srs";
import { Button } from "../components/Button";

interface SRSRunnerProps {
  studentId: string;
  dueCards: SRSDeckItem[];
  onComplete: () => void;
  onExit: () => void;
}

export function SRSRunner({ studentId, dueCards, onComplete, onExit }: SRSRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentCard = dueCards[currentIndex];

  const handleCardComplete = (grade = 4) => {
    updateSRSItem(studentId, currentCard.id, grade);

    if (currentIndex + 1 < dueCards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-neutral-bg">
         <h2 className="text-2xl font-bold text-green-500 mb-4">You're all caught up!</h2>
         <p className="text-text-secondary mb-8">You finished your daily review session.</p>
         <Button onClick={onExit}>Back to Dashboard</Button>
      </div>
    );
  }

  // We reuse Flashcard component
  // Map SRSDeckItem to FlashcardConfig
  const flashcardConfig = {
    id: currentCard.id,
    type: "flashcard-sm2" as const,
    word: currentCard.word,
    translation_ar: currentCard.translation_ar,
    example: currentCard.example,
    flashcardTolerance: "Normale",
    flashcardUseHints: true,
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col">
       <header className="bg-white px-6 py-4 border-b border-primary-light flex items-center justify-between sticky top-0 z-10 w-full max-w-[1200px] mx-auto rounded-b-[24px]">
         <div className="flex items-center gap-4">
           <button onClick={onExit} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-bg transition-colors text-text-secondary font-bold text-xl">
             ✕
           </button>
           <h2 className="font-bold text-[18px] text-primary-dark">Daily Review</h2>
         </div>
         <div className="text-sm font-bold text-primary bg-primary-light/20 px-3 py-1 rounded-full">
            {currentIndex + 1} / {dueCards.length}
         </div>
       </header>

       <main className="flex-1 overflow-y-auto w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
          <Flashcard 
            key={currentCard.id} // force remount 
            config={flashcardConfig as any} 
            onComplete={handleCardComplete} 
          />
       </main>
    </div>
  );
}
