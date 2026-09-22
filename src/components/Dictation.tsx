import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { DictationConfig } from '../types';
import { Button } from './Button';
import { levenshtein } from '../utils/levenshtein';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface DictationProps {
  config: DictationConfig;
  onComplete: () => void;
}

export function Dictation({ config, onComplete }: DictationProps) {
  const slides = config.dictationSlides || [];
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [typedText, setTypedText] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [attemptsCount, setAttemptsCount] = useState(0);
  
  // Audio state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSlide = slides[currentSlideIndex];

  useEffect(() => {
    // Reset over whole config change
    setCurrentSlideIndex(0);
    setTypedText("");
    setIsCorrect(null);
    setShowFeedback(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAttemptsCount(0);
  }, [config]);

  useEffect(() => {
    // Reset state when slide changes
    setTypedText("");
    setIsCorrect(null);
    setShowFeedback(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAttemptsCount(0);
    
    if (!currentSlide) return;
    
    let audio: HTMLAudioElement;
    if (audioRef.current) {
      audio = audioRef.current;
      audio.pause();
      audio.src = currentSlide.audioUrl;
      audio.load();
    } else if (currentSlide.audioUrl) {
      audio = new Audio(currentSlide.audioUrl);
      audioRef.current = audio;
    } else {
      return;
    }
    
    audio.playbackRate = playbackRate;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    
    if (audio.duration) {
      setDuration(audio.duration);
    }
    
    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
    };
  }, [currentSlideIndex, currentSlide]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const toggleAudio = () => {
    if (!audioRef.current || !currentSlide?.audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error("Audio playback failed:", err));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const rewind = () => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - 3);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const fastForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(duration, audioRef.current.currentTime + 3);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const replay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play().catch(err => console.error("Audio playback failed:", err));
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = () => {
    if (!currentSlide) return;
    const val = typedText.toLowerCase().trim();
    const target = currentSlide.correctText.toLowerCase().trim();
    if (!val) return;
    
    let maxTolerance = target.length <= 15 ? 1 : 3;
    if (config.dictationTolerance === "Normale") maxTolerance = 2;
    if (config.dictationTolerance === "Stricte") maxTolerance = 0;
    if (config.dictationTolerance === "Souple") maxTolerance = 5;
    
    const lev = levenshtein(val, target);
    
    if (val === target || lev <= maxTolerance) {
      if (lev > 0) setTypedText(currentSlide.correctText); // Visual autocorrect
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
      setAttemptsCount(prev => prev + 1);
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  if (!currentSlide) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card-bg rounded-3xl border-2 border-primary-light text-center max-w-lg mx-auto">
        <p className="text-text-secondary font-bold mb-4">No dictation content available.</p>
        <Button onClick={onComplete}>Continue →</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-2xl w-full mx-auto px-4 py-8">
      <div className="w-full flex justify-between items-center mb-8">
        <h3 className="text-[22px] font-bold text-primary-dark">Dictation</h3>
        {slides.length > 1 && (
          <div className="text-[14px] font-bold text-primary-dark bg-primary-light/20 px-3 py-1 rounded-full">
            {currentSlideIndex + 1} / {slides.length}
          </div>
        )}
      </div>

      <div className="w-full flex flex-col items-center bg-card-bg rounded-3xl p-10 border-2 border-primary-light shadow-sm mb-8 space-y-6">
        {/* Audio Controller Panel */}
        {currentSlide.audioUrl ? (
          <div className="w-full flex flex-col items-center space-y-4 pt-2">
            
            {/* Main Buttons Row */}
            <div className="flex items-center justify-center gap-5 sm:gap-6">
              {/* Reset / Replay Button - subtle */}
              <button
                onClick={replay}
                className="p-1.5 rounded-full text-text-secondary/40 hover:text-primary transition-all cursor-pointer"
                title="Restart from beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Rewind -3s - subtle */}
              <button
                onClick={rewind}
                className="p-1.5 rounded-full text-text-secondary/40 hover:text-primary transition-all cursor-pointer flex items-center justify-center gap-0.5"
                title="Rewind 3s"
              >
                <SkipBack className="w-4 h-4" />
                <span className="text-[9px] font-bold">-3s</span>
              </button>

              {/* Play / Pause Toggle - LARGE & PROMINENT */}
              <button
                onClick={toggleAudio}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isPlaying 
                    ? 'bg-primary text-white hover:bg-primary/95 scale-105 shadow-primary/20' 
                    : 'bg-primary/10 text-primary hover:bg-primary/25 hover:scale-105'
                }`}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              {/* Forward +3s - subtle */}
              <button
                onClick={fastForward}
                className="p-1.5 rounded-full text-text-secondary/40 hover:text-primary transition-all cursor-pointer flex items-center justify-center gap-0.5"
                title="Forward 3s"
              >
                <span className="text-[9px] font-bold">+3s</span>
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Progress Bar / Seeker - very slim and discrete */}
            <div className="w-full max-w-md flex items-center gap-3 text-[11px] font-mono text-text-secondary/60">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.05}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-neutral-light rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none transition-all"
                style={{
                  background: `linear-gradient(to right, var(--color-primary, #6366f1) 0%, var(--color-primary, #6366f1) ${duration ? (currentTime / duration) * 100 : 0}%, #e5e7eb ${duration ? (currentTime / duration) * 100 : 0}%, #e5e7eb 100%)`
                }}
              />
              <span>{formatTime(duration)}</span>
            </div>

            {/* Playback Speed Controller Row - small and discrete */}
            <div className="flex items-center gap-2.5 text-[11px] text-text-secondary/60 pt-1">
              <span className="font-semibold tracking-wide uppercase text-[9px]">Speed:</span>
              <div className="flex items-center gap-1">
                {[0.7, 0.85, 1.0, 1.2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => changeSpeed(speed)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                      playbackRate === speed
                        ? 'bg-primary/10 text-primary font-extrabold'
                        : 'text-text-secondary/60 hover:text-text-primary'
                    }`}
                  >
                    {speed === 1.0 ? "Normal" : `${speed}x`}
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="text-text-secondary text-sm italic">No audio provided segment...</div>
        )}

        {config.dictationShowTranslation && currentSlide.translation && (
          <p className="text-text-secondary text-[16px] italic text-center">
            "{currentSlide.translation}"
          </p>
        )}

        {/* Input Controls Header */}
        <div className="w-full flex justify-between items-center px-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Your answer:</label>
        </div>
        <div className="w-full relative animate-fadeIn">
          {showFeedback ? (
            <div
              className={`w-full p-6 bg-neutral-bg rounded-2xl border-2 overflow-y-auto h-44 flex flex-col justify-between ${
                isCorrect 
                  ? 'border-green-400 bg-green-50/50' 
                  : 'border-red-400 bg-red-50/50'
              }`}
            >
              {isCorrect ? (
                <div className="flex flex-col items-center justify-center h-full text-green-800 py-2">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-green-600 mb-1">Excellent!</span>
                  <p className="text-[20px] font-bold italic">"{currentSlide.correctText}"</p>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between gap-1.5 text-sm py-1">
                  <div>
                    <span className="text-[10px] uppercase font-black text-red-500 tracking-wider block">Your Answer</span>
                    <p className="text-[17px] font-medium text-red-950 mt-0.5">
                      {alignStrings(typedText, currentSlide.correctText).typedAligned.map((item, idx) => (
                        <span 
                          key={idx} 
                          className={item.isMatch ? "text-text-primary" : "text-red-600 bg-red-100/80 px-1 rounded line-through font-bold mx-px"}
                        >
                          {item.char}
                        </span>
                      ))}
                    </p>
                  </div>
                  
                  <div className="border-t border-dashed border-red-200 my-1"></div>
                  
                  <div>
                    <span className="text-[10px] uppercase font-black text-green-600 tracking-wider block">Correct Answer</span>
                    <p className="text-[17px] font-semibold text-green-950 mt-0.5">
                      {alignStrings(typedText, currentSlide.correctText).targetAligned.map((item, idx) => (
                        <span 
                          key={idx} 
                          className={item.isMatch ? "text-text-primary" : "text-green-700 bg-green-100/80 px-1 rounded font-extrabold underline decoration-green-500 decoration-2 mx-px"}
                        >
                          {item.char}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder="Type what you hear..."
              className="w-full p-6 text-[18px] bg-neutral-bg rounded-2xl border-2 focus:outline-none transition-all resize-none h-40 border-neutral-light focus:border-primary text-text-primary"
            />
          )}
        </div>
        
        {showFeedback && !isCorrect && (
          <div className="w-full flex flex-col gap-3">
            {/* Visual Legend */}
            <div className="flex flex-wrap gap-4 text-[11px] font-bold px-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-green-100 border border-green-300 rounded inline-block" />
                <span className="text-green-700">Missing/Corrected letter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-red-100 border border-red-300 line-through rounded inline-block" />
                <span className="text-red-700">Incorrect extra letter</span>
              </div>
            </div>

            <div className="w-full p-4 bg-orange-50/50 border border-orange-200/80 rounded-2xl">
               <p className="text-orange-800 text-[13px] font-bold mb-1">Correct Answer:</p>
               <p className="text-orange-950 text-[16px] font-semibold">{currentSlide.correctText}</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full">
        {showFeedback ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
          >
            {isCorrect || attemptsCount >= 2 ? (
              <Button onClick={handleNext} className="w-full">
                {currentSlideIndex < slides.length - 1 ? "Next Segment" : "Continue"}
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  setShowFeedback(false);
                  setIsCorrect(null);
                }} 
                className="w-full"
              >
                Try Again
              </Button>
            )}
          </motion.div>
        ) : (
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={!typedText.trim()}
          >
            Check Answer
          </Button>
        )}
      </div>
    </div>
  );
}

function alignStrings(typed: string, target: string) {
  const m = typed.length;
  const n = target.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (typed[i - 1].toLowerCase() === target[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const typedAligned: { char: string; isMatch: boolean }[] = [];
  const targetAligned: { char: string; isMatch: boolean }[] = [];
  
  let i = m;
  let j = n;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && typed[i - 1].toLowerCase() === target[j - 1].toLowerCase()) {
      typedAligned.unshift({ char: typed[i - 1], isMatch: true });
      targetAligned.unshift({ char: target[j - 1], isMatch: true });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Missing in typed (present in target)
      targetAligned.unshift({ char: target[j - 1], isMatch: false });
      j--;
    } else {
      // Extra in typed (not present in target)
      typedAligned.unshift({ char: typed[i - 1], isMatch: false });
      i--;
    }
  }
  
  return { typedAligned, targetAligned };
}


