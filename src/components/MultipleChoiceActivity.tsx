import React, { useState } from "react";
import { MultipleChoiceConfig } from "../types";
import { playAudio } from "../utils/audio";
import { Volume2 } from "lucide-react";
import { Button } from "./Button";

interface MultipleChoiceActivityProps {
  activity: MultipleChoiceConfig;
  onComplete: () => void;
}

export function MultipleChoiceActivity({
  activity,
  onComplete,
}: MultipleChoiceActivityProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const letters = ["A", "B", "C", "D"];

  const handleOptionClick = (option: string) => {
    if (isCorrect) return; // Prevent clicking after correct answer
    
    setSelectedAnswer(option);
    
    if (option.trim() === activity.correctAnswer.trim()) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-3xl w-full mx-auto px-4 py-8">
      <div className="w-full mb-8 flex justify-between items-center relative">
        <h3 className="text-[22px] font-bold text-primary-dark">
          Choose the correct meaning
        </h3>
        <button
          onClick={() => playAudio(activity.question, false)}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Volume2 className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full mb-12 flex flex-col items-center">
        <div className="bg-primary text-white px-4 py-4 rounded-[16px] shadow-sm w-full max-w-[320px] mx-auto flex items-center justify-center min-h-[88px]">
          <h2 className="text-[32px] font-bold text-center leading-none">
            {activity.question.toLowerCase()}
          </h2>
        </div>
      </div>

      <div className="w-full flex-1 flex flex-col gap-4">
        {activity.options
          .map((option, index) => ({ option, index }))
          .filter(({ option }) => isCorrect ? option.trim() === activity.correctAnswer.trim() : true)
          .map(({ option, index }) => {
          const isSelected = selectedAnswer === option;
          const isThisCorrect = isSelected && isCorrect;
          const isThisWrong = isSelected && isCorrect === false;

          let optionStyle = "bg-white border-primary-light text-text-primary hover:border-primary hover:bg-neutral-bg";
          let letterStyle = "bg-primary-light text-primary-dark";

          if (isThisCorrect) {
            optionStyle = "bg-success-light border-success text-success";
            letterStyle = "bg-success text-white";
          } else if (isThisWrong) {
            optionStyle = "bg-red-50 border-red-500 text-red-600";
            letterStyle = "bg-red-500 text-white";
          } else if (isSelected) {
            // Selected but not yet checked (though we check instantly, just in case)
            optionStyle = "bg-primary-light border-primary text-primary-dark";
            letterStyle = "bg-primary text-white";
          }

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className={`flex items-center gap-4 w-full max-w-[320px] mx-auto h-[72px] px-4 rounded-[16px] border-2 transition-all active:scale-[0.98] select-none ${optionStyle}`}
              disabled={isCorrect === true}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors flex-shrink-0 ${letterStyle}`}
              >
                {letters[index] || ""}
              </div>
              <div
                className="flex-1 flex items-center justify-center text-[24px] font-arabic font-bold text-center leading-normal"
                dir="rtl"
              >
                {option}
              </div>
            </button>
          );
        })}
      </div>

      {isCorrect && (
        <div className="w-full mt-8 flex justify-center animate-in fade-in zoom-in duration-300">
          <Button onClick={onComplete} className="w-full max-w-[320px]">
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
