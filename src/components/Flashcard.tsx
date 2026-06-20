import React, { useState, useEffect, useRef } from 'react';
import { FlashcardConfig } from '../types';
import { FlashcardDiscovery } from '../modules/Flashcard/FlashcardDiscovery';
import { FlashcardRecognize } from '../modules/Flashcard/FlashcardRecognize';
import { FlashcardWrite } from '../modules/Flashcard/FlashcardWrite';
import { FlashcardPhaseIndicators } from '../modules/Flashcard/FlashcardPhaseIndicators';
import { levenshtein } from '../utils/levenshtein';
import { getEmojiForWord } from '../utils/emoji';
import { playAudio } from '../utils/audio';

interface FlashcardProps {
  config: FlashcardConfig;
  onComplete: () => void;
}

const COMMON_DISTRACTORS = ["orange", "banana", "grape", "car", "house", "tree", "book", "water", "friend", "cat", "dog", "sun", "moon", "star", "bird"];

export function Flashcard({ config, onComplete }: FlashcardProps) {
  const [phase, setPhase] = useState<0 | 1 | 2>(
    config.flashcardLearnMode === "direct" ? 2 : config.flashcardLearnMode === "semi" ? 1 : 0
  );
  
  const [mcqOptions, setMcqOptions] = useState<string[]>([]);
  const [mcqSelected, setMcqSelected] = useState<string | null>(null);
  const [mcqStatus, setMcqStatus] = useState<null | 'correct' | 'wrong'>(null);

  const [typedValue, setTypedValue] = useState("");
  const [hint1Used, setHint1Used] = useState(false);
  const [hint2Used, setHint2Used] = useState(false);
  const [writeFeedback, setWriteFeedback] = useState<null | 'correct' | 'almost' | 'wrong'>(null);
  const [attempts, setAttempts] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const currentEmoji = getEmojiForWord(config.word);

  const [timeRemaining, setTimeRemaining] = useState<number | null>(() => {
    if (config.flashcardUseTimer && config.flashcardTimerSeconds) return config.flashcardTimerSeconds;
    return null;
  });

  useEffect(() => {
    if (config.flashcardUseTimer && config.flashcardTimerSeconds) {
      setTimeRemaining(config.flashcardTimerSeconds);
    }
  }, [phase, config.flashcardUseTimer, config.flashcardTimerSeconds]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || writeFeedback === 'correct' || mcqStatus === 'correct' || phase === 0) return;
    
    const intervalId = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          if (phase === 1 && mcqStatus === null) setMcqStatus('wrong');
          else if (phase === 2 && writeFeedback === null) setWriteFeedback('wrong');
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeRemaining, writeFeedback, mcqStatus, phase]);

  useEffect(() => {
    const options = new Set<string>();
    options.add(config.word.toLowerCase());
    while (options.size < 4) {
      options.add(COMMON_DISTRACTORS[Math.floor(Math.random() * COMMON_DISTRACTORS.length)]);
    }
    setMcqOptions(Array.from(options).sort(() => Math.random() - 0.5));
  }, [config.word]);

  useEffect(() => {
    if (phase === 2 && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  }, [phase]);

  useEffect(() => {
    if (phase === 0) playAudio(config.word);
  }, [phase, config.word]);

  const highlightExample = () => {
    const regex = new RegExp(`(${config.word})`, 'gi');
    const parts = config.example.split(regex);
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === config.word.toLowerCase() ? <strong key={i} className="text-primary-dark">{part}</strong> : part
        )}
      </>
    );
  };

  const handleMcqClick = (option: string) => {
    if (mcqStatus === 'correct') return;
    setMcqSelected(option);
    if (option.toLowerCase() === config.word.toLowerCase()) {
      setMcqStatus('correct');
      playAudio(config.word);
    } else {
      setMcqStatus('wrong');
    }
  };

  const handleCheckWord = () => {
    const val = typedValue.trim().toLowerCase();
    const target = config.word.toLowerCase();
    if (!val) return;

    const lev = levenshtein(val, target);
    let maxTolerance = target.length <= 4 ? 1 : 2;
    if (config.flashcardTolerance?.includes("Normale")) maxTolerance = 1;
    if (config.flashcardTolerance?.includes("Stricte")) maxTolerance = 0;
    
    setAttempts(a => a + 1);

    if (val === target) {
      setWriteFeedback('correct');
      playAudio(config.word);
    } else if (lev <= maxTolerance) setWriteFeedback('almost');
    else {
      setWriteFeedback('wrong');
      setTimeout(() => setTypedValue(''), 800);
    }
  };

  const isLimited = config.flashcardAttemptsMode === "limited";
  const maxAttempts = config.flashcardMaxAttempts ?? 3;
  const noMoreAttempts = isLimited && attempts >= maxAttempts && writeFeedback !== "correct";

  return (
    <div className="flex flex-col items-center justify-start flex-1 w-full max-w-2xl mx-auto text-text-primary px-4 pb-8">
      <FlashcardPhaseIndicators phase={phase} />

      <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm flex flex-col gap-6 w-full border border-primary-light/30 relative">
        {timeRemaining !== null && (
          <div className={`absolute top-4 right-4 max-w-[fit-content] px-3 py-1 rounded-full text-[13px] font-mono font-bold flex items-center gap-1.5 transition-colors ${timeRemaining <= 5 ? 'bg-red-100 text-red-600' : 'bg-neutral-bg text-text-secondary border border-primary-light'}`}>
            ⏱ {timeRemaining}s
          </div>
        )}

        {config.flashcardShowImage !== false && (
          <div className="bg-gradient-to-br from-primary-light/20 to-blue-50 rounded-[18px] h-40 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="text-[72px] transform transition-transform hover:scale-110">{currentEmoji}</div>
            {config.flashcardShowAudio !== false && (
              <button 
                onClick={() => playAudio(config.word)}
                className="absolute bottom-3 right-3 bg-white w-10 h-10 rounded-full flex items-center justify-center text-primary shadow-sm hover:scale-95 transition-transform" 
                aria-label="Play audio"
              >
                <span className="text-[18px]">🔊</span>
              </button>
            )}
          </div>
        )}

        {config.flashcardShowImage === false && config.flashcardShowAudio !== false && (
           <div className="flex justify-center mt-2">
             <button 
               onClick={() => playAudio(config.word)}
               className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center text-primary shadow-sm hover:scale-95 transition-transform" 
             >
               <span className="text-[28px]">🔊</span>
             </button>
           </div>
        )}

        <div className="text-center mt-2">
          {config.flashcardShowWord !== false && (
            <>
              <div className="text-[26px] text-primary-dark font-bold" dir="rtl">{config.translation_ar}</div>
              {config.flashcardShowPhonetics && (
                 <div className="text-[14px] text-text-secondary font-mono mt-1 opacity-70">phonetics: {config.word}</div>
              )}
            </>
          )}
          {phase === 0 && <div className="text-[14px] text-text-secondary mt-1">Look at this word in English ⬇️</div>}
          {phase === 1 && <div className="text-[14px] text-text-secondary mt-1">What is the English word? ⬇️</div>}
        </div>

        {phase === 0 && <FlashcardDiscovery config={config} setPhase={setPhase as any} highlightExample={highlightExample} />}
        {phase === 1 && <FlashcardRecognize config={config} mcqOptions={mcqOptions} mcqSelected={mcqSelected} mcqStatus={mcqStatus} handleMcqClick={handleMcqClick} setPhase={setPhase as any} highlightExample={highlightExample} />}
        {phase === 2 && <FlashcardWrite config={config} hint1Used={hint1Used} setHint1Used={setHint1Used} hint2Used={hint2Used} setHint2Used={setHint2Used} typedValue={typedValue} setTypedValue={setTypedValue} writeFeedback={writeFeedback} setWriteFeedback={setWriteFeedback} noMoreAttempts={noMoreAttempts} handleCheckWord={handleCheckWord} onComplete={onComplete} inputRef={inputRef} highlightExample={highlightExample} />}
      </div>
    </div>
  );
}

