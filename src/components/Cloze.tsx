import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ClozeConfig } from '../types';
import { Button } from './Button';

interface ClozeProps {
  config: ClozeConfig;
  onComplete: () => void;
}

export function Cloze({ config, onComplete }: ClozeProps) {
  const [typedWord, setTypedWord] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allChoices = [config.correctAnswer, ...config.distractors].sort();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [config]);

  const handleSubmit = () => {
    if (!typedWord.trim()) return;
    
    if (typedWord.toLowerCase().trim() === config.correctAnswer.toLowerCase().trim()) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full p-6 mt-8 w-full max-w-3xl mx-auto">
      <div className="mb-10">
        <h3 className="text-[22px] font-bold text-primary-dark">Fill in the blanks</h3>
      </div>

      <div className="flex flex-wrap gap-3 mb-10 w-full">
        {allChoices.map(word => (
          <div
            key={word}
            className="py-2 px-6 rounded-full text-[16px] font-semibold bg-neutral-bg text-text-secondary border border-neutral-light/50"
          >
            {word}
          </div>
        ))}
      </div>

      <div className="mb-12 w-full space-y-4">
        <p className="text-[20px] md:text-[24px] leading-[1.8] text-text-primary">
          <span>{config.sentenceBeforeGap}</span>
          <span className="mx-2 inline-flex items-center align-middle">
            <input
              ref={inputRef}
              type="text"
              value={typedWord}
              onChange={(e) => {
                setTypedWord(e.target.value);
                if (isCorrect === false) setIsCorrect(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={isCorrect === true}
              className={`min-w-[120px] max-w-[200px] font-bold px-2 py-0 pb-1 text-center focus:outline-none transition-all duration-300 bg-transparent border-0 border-b-2 rounded-none shadow-none leading-none
                ${isCorrect === true
                  ? 'text-success border-success'
                  : isCorrect === false
                  ? 'text-red-500 border-red-500 animate-shake'
                  : 'text-primary-dark border-primary-light focus:border-primary'}
              `}
              placeholder=""
            />
          </span>
          <span>{config.sentenceAfterGap}</span>
        </p>
        
        {isCorrect === false && (
          <p className="text-red-500 text-sm font-bold animate-pulse mt-4">Try again!</p>
        )}
      </div>

      <div className="flex flex-col items-center mt-6">
        {isCorrect !== true && (
          <Button
            onClick={handleSubmit}
            variant="primary"
            className="px-8 py-3 text-[16px] shadow-sm transform hover:-translate-y-0.5 transition-all w-48"
            disabled={!typedWord.trim()}
          >
            Check Answer
          </Button>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center min-h-[140px]">
        {isCorrect === true && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center flex flex-col items-center"
          >
            <div className="text-green-500 font-bold text-[20px] mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                ✓
              </div>
              Perfect!
            </div>
            <Button
              onClick={onComplete}
              variant="primary"
              className="px-10 py-3 text-[16px] shadow-md shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-1 transition-all"
            >
              Continue →
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
