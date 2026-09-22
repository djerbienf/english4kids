import React, { useState, useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { FlashcardConfig, FlashcardSm2Config } from '../types';
import { FlashcardDiscovery } from '../modules/Flashcard/FlashcardDiscovery';
import { FlashcardRecognize } from '../modules/Flashcard/FlashcardRecognize';
import { FlashcardListen } from '../modules/Flashcard/FlashcardListen';
import { FlashcardCopy } from "../modules/Flashcard/FlashcardCopy";
import { FlashcardWrite } from '../modules/Flashcard/FlashcardWrite';
import { levenshtein } from '../utils/levenshtein';
import { playAudio } from '../utils/audio';
import { useStore } from '../store/useStore';
import { renderColoredWord, renderColoredSyllables } from '../utils/wordUtils';
import { getSyllables } from '../utils/syllables';

interface FlashcardProps {
  config: FlashcardConfig | FlashcardSm2Config;
  onComplete: (grade?: number) => void;
}

const COMMON_DISTRACTORS = ["orange", "banana", "grape", "car", "house", "tree", "book", "water", "friend", "cat", "dog", "sun", "moon", "star", "bird"];

export function Flashcard({ config, onComplete }: FlashcardProps) {
  const dictionaryWords = useStore((state) => state.dictionaryWords);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(config.type === "flashcard-sm2" ? 4 : 0);
  
  const [mcqOptions, setMcqOptions] = useState<string[]>([]);
  const [mcqWrongOptions, setMcqWrongOptions] = useState<string[]>([]);
  const [mcqStatus, setMcqStatus] = useState<null | 'correct' | 'wrong'>(null);
  const [mcqAttempts, setMcqAttempts] = useState(0);

  const [typedValue, setTypedValue] = useState("");
  const [hint1Used, setHint1Used] = useState(false);
  const [hint2Used, setHint2Used] = useState(false);
  const [writeFeedback, setWriteFeedback] = useState<null | 'correct' | 'almost' | 'wrong'>(null);
  const [writeAttempts, setWriteAttempts] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const [timeRemaining, setTimeRemaining] = useState<number | null>(() => {
    if (config.type === "flashcard-sm2") return null;
    if (config.flashcardUseTimer && config.flashcardTimerSeconds) return config.flashcardTimerSeconds;
    return null;
  });

  useEffect(() => {
    if (config.type === "flashcard-sm2") return;
    if (config.flashcardUseTimer && config.flashcardTimerSeconds) {
      setTimeRemaining(config.flashcardTimerSeconds);
    }
  }, [phase, config.flashcardUseTimer, config.flashcardTimerSeconds, config.type]);

  useEffect(() => {

    if (timeRemaining === null || timeRemaining <= 0 || writeFeedback === 'correct' || mcqStatus === 'correct' || phase === 0) return;
    
    const intervalId = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          if (phase === 1 && mcqStatus === null) {
            setMcqStatus('wrong');
            setMistakes(m => m + 1);
          }
          else if ((phase === 3 || phase === 4) && writeFeedback === null) {
            setWriteFeedback('wrong');
            setMistakes(m => m + 1);
          }
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
    
    if (dictionaryWords && dictionaryWords.length > 0) {
      const otherWords = dictionaryWords
        .map(w => (w.lemma || '').toLowerCase())
        .filter(w => w && w !== config.word.toLowerCase());
      
      otherWords.sort(() => Math.random() - 0.5);
      
      for (const w of otherWords) {
        if (options.size >= 4) break;
        options.add(w);
      }
    }
    
    while (options.size < 4) {
      options.add(COMMON_DISTRACTORS[Math.floor(Math.random() * COMMON_DISTRACTORS.length)]);
    }
    
    setMcqOptions(Array.from(options).sort(() => Math.random() - 0.5));
  }, [config.word, dictionaryWords]);

  const dictionaryWord = React.useMemo(() => {
    return dictionaryWords?.find(w => 
      w.lemma?.toLowerCase() === config.word.toLowerCase() || 
      w.word?.toLowerCase() === config.word.toLowerCase()
    );
  }, [config.word, dictionaryWords]);

  const pronunciation = dictionaryWord?.pronunciation_uk || dictionaryWord?.pronunciation_us || "";
  
  // Try to find audioUrl in dictionary senses
  let dictAudioUrl = undefined;
  if (dictionaryWord?.senses && dictionaryWord.senses.length > 0) {
    dictAudioUrl = dictionaryWord.senses[0].assets?.audio?.uk || dictionaryWord.senses[0].assets?.audio?.us;
  }
  
  const extendedConfig = {
    ...config,
    type: "flashcard" as const,
    pronunciation: pronunciation,
    // Try to find syllables in the dictionary word if it was added, or default to config.syllables
    syllables: (dictionaryWord as any)?.syllables || (config as any).syllables || getSyllables(config.word, pronunciation),
    // Prefer dictionary audioUrl if available
    audioUrl: dictAudioUrl || config.audioUrl,
    part_of_speech: dictionaryWord?.part_of_speech || (dictionaryWord as any)?.pos || (dictionaryWord?.senses?.[0] as any)?.part_of_speech || (dictionaryWord?.senses?.[0] as any)?.pos || config.part_of_speech || "",
    dictionaryExamples: (() => {
      if (!dictionaryWord?.senses) return [];
      const allExamples: string[] = [];
      dictionaryWord.senses.forEach(sense => {
        if (sense.examples && Array.isArray(sense.examples)) {
          sense.examples.forEach(ex => {
            if (ex && ex.trim()) {
              allExamples.push(ex.trim());
            }
          });
        }
      });
      return Array.from(new Set(allExamples)).slice(0, 2);
    })()
  };

  useEffect(() => {

    if (phase === 4) {
      setTypedValue("");
      setWriteFeedback(null);
      setWriteAttempts(0);
      setHint1Used(false);
      setHint2Used(false);
    }
    if ((phase === 3 || phase === 4) && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  }, [phase]);

  const highlightExample = () => {
    if (!config.example) return null;
    const cleanExample = config.example.replace(/["“”]/g, '');
    const regex = new RegExp(`(${config.word})`, 'gi');
    const parts = cleanExample.split(regex);
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === config.word.toLowerCase() ? <strong key={i} className="text-[#534AB7] font-black">{part}</strong> : part
        )}
      </>
    );
  };

  const maxAttempts = config.type === "flashcard-sm2" ? Infinity : 3;
  const noMoreWriteAttempts = writeAttempts >= maxAttempts && writeFeedback !== "correct";
  const noMoreMcqAttempts = mcqAttempts >= maxAttempts && mcqStatus !== "correct";

  const handleMcqClick = (option: string) => {
    if (mcqStatus === 'correct' || noMoreMcqAttempts) return;
    
    const isCorrect = option.toLowerCase() === config.word.toLowerCase();
    
    if (isCorrect) {
      setMcqStatus('correct');
      extendedConfig.audioUrl ? playAudio(extendedConfig.audioUrl, true) : playAudio(config.word);
    } else {
      setMcqWrongOptions(prev => [...prev, option]);
      setMistakes(m => m + 1);
      setMcqAttempts(a => {
        const nextAttempts = a + 1;
        if (nextAttempts >= maxAttempts) {
          setMcqStatus('wrong');
        }
        return nextAttempts;
      });
    }
  };

  const handleCheckWord = React.useCallback(() => {
    const val = typedValue.trim().toLowerCase();
    const target = config.word.toLowerCase();
    if (!val) return;

    const lev = levenshtein(val, target);
    let maxTolerance = target.length <= 4 ? 1 : 2;
    if (config.flashcardTolerance?.includes("Normale")) maxTolerance = 1;
    if (config.flashcardTolerance?.includes("Stricte")) maxTolerance = 0;
    
    setWriteAttempts(a => a + 1);

    if (val === target) {
      setWriteFeedback('correct');
      extendedConfig.audioUrl ? playAudio(extendedConfig.audioUrl, true) : playAudio(config.word);
    } else if (lev <= maxTolerance) {
      setWriteFeedback('almost');
      setMistakes(m => m + 0.5);
      setTypedValue('');
    } else {
      setWriteFeedback('wrong');
      setMistakes(m => m + 1);
      setTypedValue('');
    }
  }, [typedValue, config.word, extendedConfig.audioUrl, config.flashcardTolerance]);

  const handleComplete = () => {
    let penalty = mistakes;
    if (hint1Used) penalty += 0.5;
    if (hint2Used) penalty += 1;
    const grade = Math.max(0, 5 - Math.floor(penalty));
    onComplete(grade);
  };

  return (
    <div className="flex flex-col items-center justify-start flex-1 w-full max-w-4xl mx-auto text-text-primary px-4 pb-8 relative mt-8">
      
      {/* Time Remaining */}
      {timeRemaining !== null && phase !== 4 && (
        <div className={`absolute -top-12 left-4 px-3 py-1 rounded-full text-[13px] font-mono font-bold flex items-center gap-1.5 transition-colors ${timeRemaining <= 5 ? 'bg-red-100 text-red-600' : 'bg-neutral-bg text-text-secondary border border-primary-light'}`}>
          ⏱ {timeRemaining}s
        </div>
      )}

      {/* Top Right Speaker */}
      {(phase === 0 || phase === 1 || phase === 3 || phase === 4) && config.flashcardShowAudio !== false && !((phase === 1 && noMoreMcqAttempts) || ((phase === 3 || phase === 4) && noMoreWriteAttempts)) && (
        <button 
          onClick={() => extendedConfig.audioUrl ? playAudio(extendedConfig.audioUrl, true) : playAudio(config.word)}
          className="absolute -top-4 right-4 text-[#8a9db4] hover:text-[#413ea0] transition-colors"
          aria-label="Play audio"
        >
          <Volume2 size={40} />
        </button>
      )}

      {/* Interactive Phase Components */}
      <div className={`w-full ${phase > 0 ? "mt-4" : ""} max-w-2xl`}>
        {phase === 0 && <FlashcardDiscovery config={extendedConfig} setPhase={setPhase as any} highlightExample={highlightExample} />}
        {phase === 1 && <FlashcardRecognize config={extendedConfig} mcqOptions={mcqOptions} mcqWrongOptions={mcqWrongOptions} mcqStatus={mcqStatus} handleMcqClick={handleMcqClick} setPhase={setPhase as any} highlightExample={highlightExample} noMoreAttempts={noMoreMcqAttempts} />}
        {phase === 2 && <FlashcardListen config={extendedConfig} setPhase={setPhase as any} />}
        {phase === 3 && <FlashcardCopy config={extendedConfig} hint1Used={hint1Used} setHint1Used={setHint1Used} hint2Used={hint2Used} setHint2Used={setHint2Used} typedValue={typedValue} setTypedValue={setTypedValue} writeFeedback={writeFeedback} setWriteFeedback={setWriteFeedback} noMoreAttempts={noMoreWriteAttempts} handleCheckWord={handleCheckWord} setPhase={setPhase as any} inputRef={inputRef} highlightExample={highlightExample} />}
        {phase === 4 && <FlashcardWrite config={extendedConfig} hint1Used={hint1Used} setHint1Used={setHint1Used} hint2Used={hint2Used} setHint2Used={setHint2Used} typedValue={typedValue} setTypedValue={setTypedValue} writeFeedback={writeFeedback} setWriteFeedback={setWriteFeedback} noMoreAttempts={noMoreWriteAttempts} handleCheckWord={handleCheckWord} onComplete={handleComplete} inputRef={inputRef} highlightExample={highlightExample} />}
      </div>
    </div>
  );
}

