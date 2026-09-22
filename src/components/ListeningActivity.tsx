import React, { useState, useRef } from "react";
import { Button } from "./Button";
import { ListeningConfig } from "../types";

interface ListeningActivityProps {
  config: ListeningConfig;
  onComplete: () => void;
}

export function ListeningActivity({ config, onComplete }: ListeningActivityProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const questions = config.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  
  const hasQuestions = questions.length > 0;
  
  const handleOptionClick = (option: string) => {
    if (feedback !== null) return;
    setSelectedOption(option);
  };
  
  const handleCheck = () => {
    if (selectedOption === currentQuestion.correctAnswer) {
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
  };
  
  const handleNext = () => {
    if (feedback === "incorrect") {
      setFeedback(null);
      setSelectedOption(null);
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setFeedback(null);
      setSelectedOption(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      onComplete();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {config.title && (
        <h1 className="text-[24px] font-bold text-primary-dark mb-6 text-center">
          {config.title}
        </h1>
      )}
      <div className="w-full mb-8 flex justify-center">
        {config.audioUrl ? (
          <audio 
            ref={audioRef}
            src={config.audioUrl} 
            controls 
            className="w-full max-w-md rounded-full shadow-sm"
          />
        ) : (
          <div className="text-red-500 font-bold p-4 bg-red-50 rounded-lg border border-red-200">
            No audio URL provided for this activity.
          </div>
        )}
      </div>

      {config.transcript && (
        <div className="w-full mb-8">
          <button 
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-primary font-bold text-[14px] hover:underline mb-2 flex items-center gap-1"
          >
            {showTranscript ? "Hide Transcript" : "Show Transcript"}
          </button>
          {showTranscript && (
            <div className="bg-neutral-bg p-4 rounded-xl border border-primary-light text-text-primary text-[16px] leading-relaxed max-h-48 overflow-y-auto">
              {config.transcript}
            </div>
          )}
        </div>
      )}

      {hasQuestions ? (
        <div className="w-full bg-white border-2 border-primary-light rounded-2xl p-6 shadow-sm">
          <h2 className="text-[20px] font-bold text-primary-dark mb-6 text-center">
            {currentQuestion.question}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentQuestion.options.map((option, idx) => {
              if (!option) return null;
              
              let buttonStyle = "bg-white border-2 border-primary-light text-text-primary hover:border-primary hover:bg-primary-light/10";
              
              if (feedback !== null) {
                if (option === currentQuestion.correctAnswer) {
                  buttonStyle = "bg-success-light/20 border-success text-success-dark";
                } else if (option === selectedOption && feedback === "incorrect") {
                  buttonStyle = "bg-red-50 border-red-400 text-red-600";
                } else {
                  buttonStyle = "bg-white border-2 border-neutral-200 text-neutral-400 opacity-50";
                }
              } else if (option === selectedOption) {
                buttonStyle = "bg-primary-light/20 border-primary text-primary-dark";
              }
              
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  disabled={feedback !== null}
                  className={`p-4 rounded-xl font-medium text-[16px] transition-all text-left ${buttonStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          
          {feedback !== null && (
            <div className={`p-4 rounded-xl mb-6 font-bold text-center ${
              feedback === "correct" ? "bg-success-light/20 text-success-dark" : "bg-red-50 text-red-600"
            }`}>
              {feedback === "correct" ? "Correct!" : "Incorrect. Try again!"}
            </div>
          )}
          
          <div className="flex justify-end w-full">
            <Button
              onClick={feedback !== null ? handleNext : handleCheck}
              disabled={selectedOption === null}
              className={`font-bold px-8 text-[16px] ${
                feedback === "correct" ? "bg-success hover:bg-success-dark text-white" : ""
              }`}
            >
              {feedback !== null ? "Continue" : "Check"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-center mt-8">
          <Button onClick={onComplete} className="font-bold px-12 text-[18px]">
            Complete Activity
          </Button>
        </div>
      )}
    </div>
  );
}
