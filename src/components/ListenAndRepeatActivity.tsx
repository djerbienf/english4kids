import React, { useState, useEffect, useRef } from "react";
import { ListenAndRepeatConfig } from "../types";
import { Button } from "./Button";
import { Play, Mic, MicOff, RotateCcw, CheckCircle2, AlertCircle, Sparkles, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { renderColoredWord, renderColoredSyllables } from "../utils/wordUtils";
import { getSyllables } from "../utils/syllables";
import { levenshtein } from "../utils/levenshtein";

interface ListenAndRepeatActivityProps {
  config: ListenAndRepeatConfig;
  onComplete: () => void;
}

export function ListenAndRepeatActivity({
  config,
  onComplete,
}: ListenAndRepeatActivityProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const items = config.items || [];
  const currentItem = items[currentIndex];
  const computedSyllables = currentItem?.syllables || (currentItem ? getSyllables(currentItem.word, currentItem.pronunciation) : "");

  // Speech Recognition States
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    status: "excellent" | "good" | "retry" | null;
  }>({ score: 0, feedback: "", status: null });

  const recognitionRef = useRef<any>(null);

  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card-bg rounded-3xl border-2 border-primary-light text-center max-w-lg mx-auto font-['Nunito']">
        <p className="text-text-secondary font-bold mb-4">No pronunciation items available.</p>
        <Button onClick={onComplete}>Continue →</Button>
      </div>
    );
  }

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
        setTranscript("");
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript || "";
        setTranscript(resultText);
        evaluatePronunciation(resultText);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setRecognitionError("Microphone permission denied. Please enable it in your browser.");
        } else if (event.error === "no-speech") {
          setRecognitionError("No speech detected. Try speaking louder!");
        } else {
          setRecognitionError(`Recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    // When the item changes, we could auto-play audio if desired, but user interaction is usually better.
    if (audioRef.current && currentItem?.audioUrl) {
      audioRef.current.load(); // Ensure the new audio is loaded
    }
    // Reset recognition feedback
    setTranscript("");
    setEvaluation({ score: 0, feedback: "", status: null });
    setRecognitionError(null);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [currentIndex, currentItem]);

  // Clean strings helper
  const cleanWord = (w: string) => {
    return w
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const evaluatePronunciation = (userSpeech: string) => {
    if (!currentItem) return;
    const target = cleanWord(currentItem.word);
    const spoken = cleanWord(userSpeech);

    if (!spoken) {
      setEvaluation({
        score: 0,
        feedback: "Try speaking a bit louder and clearly!",
        status: "retry"
      });
      return;
    }

    const dist = levenshtein(spoken, target);
    const maxLen = Math.max(spoken.length, target.length);
    const score = maxLen === 0 ? 100 : Math.round((1 - dist / maxLen) * 100);

    let feedback = "";
    let status: "excellent" | "good" | "retry" = "retry";

    if (score >= 85) {
      feedback = "Excellent! Perfect pronunciation! 🎉";
      status = "excellent";
    } else if (score >= 60) {
      feedback = "Very good! That's very close, keep going! 👍";
      status = "good";
    } else {
      feedback = "Not quite. Try one more time! 💪";
      status = "retry";
    }

    setEvaluation({ score, feedback, status });
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Error starting speech recognition:", e);
      // If already started, stop it first
      recognitionRef.current.stop();
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  };

  const handleNext = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePlayAudio = () => {
    if (audioRef.current && currentItem?.audioUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing audio", e));
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-border">
        <h2 className="text-xl font-bold text-text-primary mb-2">Listen and Repeat</h2>
        <p className="text-text-secondary">No items available for this activity.</p>
        <Button onClick={onComplete} className="mt-4 bg-primary text-white hover:bg-primary-dark">
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center px-4">
      {config.title && (
        <h1 className="text-[24px] font-bold text-primary-dark mb-4 text-center">
          {config.title}
        </h1>
      )}

      <div className="text-text-secondary font-bold text-sm bg-neutral-bg/60 px-4 py-1.5 rounded-full border border-primary-light/40 mb-4 shadow-sm">
        {currentIndex + 1} / {items.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-white rounded-[32px] shadow-sm border-2 border-primary-light/70 p-8 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden"
        >
          {currentItem.audioUrl && (
            <audio ref={audioRef} src={currentItem.audioUrl} preload="auto" />
          )}

          {/* Decorative background circle */}
          <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-purple-50/40 pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-40 h-40 rounded-full bg-blue-50/40 pointer-events-none" />

          <div className="flex flex-col items-center gap-5 mb-6 text-center z-10 w-full">
            {currentItem.word && (
              <h2 className="text-[44px] md:text-[52px] font-extrabold text-text-primary leading-tight tracking-tight">
                {currentItem.word}
              </h2>
            )}
            
            {(computedSyllables || currentItem.pronunciation) && (
              <div className="flex flex-col gap-1.5">
                {computedSyllables && (
                  <div className="text-[22px] md:text-[26px]">
                    {renderColoredSyllables(computedSyllables)}
                  </div>
                )}
                {currentItem.pronunciation && (
                  <div className="text-[18px] md:text-[20px] font-mono text-primary-dark/80 bg-primary-light/10 px-3 py-0.5 rounded-lg border border-primary-light/20 self-center">
                    {currentItem.pronunciation}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 mb-6 z-10">
            {/* Audio Play Button */}
            {currentItem.audioUrl ? (
              <Button
                onClick={handlePlayAudio}
                title="Écouter le mot"
                className="w-14 h-14 rounded-full bg-primary text-white hover:bg-primary-dark shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              >
                <Volume2 className="w-6 h-6" />
              </Button>
            ) : (
              <div className="text-text-secondary text-sm italic">
                Aucun audio disponible
              </div>
            )}

            {/* Native Speech Recognition Button */}
            {isSupported ? (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all relative ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse scale-110"
                    : "bg-purple-100 hover:bg-purple-200 text-purple-700"
                } cursor-pointer hover:scale-105 active:scale-95`}
                title={isListening ? "Stop recording" : "Speak to evaluate your pronunciation"}
              >
                {isListening ? (
                  <>
                    <Mic className="w-6 h-6 z-10" />
                    <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping" />
                  </>
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-neutral-bg px-3 py-2 rounded-xl border border-primary-light/40">
                <MicOff className="w-4 h-4 text-red-400" />
                <span>Microphone not supported</span>
              </div>
            )}
          </div>

          {/* Feedback & Result Overlay */}
          <div className="w-full z-10 min-h-[100px] flex flex-col items-center justify-center">
            {isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-purple-700 font-bold text-sm bg-purple-50 px-5 py-2.5 rounded-2xl border border-purple-200 shadow-sm flex items-center gap-2"
              >
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
                <span>Your turn to speak! Say: "{currentItem.word}"</span>
              </motion.div>
            )}

            {recognitionError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-red-700 font-semibold text-xs bg-red-50 px-4 py-2 rounded-xl border border-red-200 shadow-sm flex items-center gap-1.5 max-w-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{recognitionError}</span>
              </motion.div>
            )}

            {!isListening && !recognitionError && transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md flex flex-col items-center bg-neutral-bg/60 border border-primary-light/40 rounded-2xl p-4 shadow-sm"
              >
                <p className="text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-1">You said:</p>
                <p className="text-[18px] font-bold text-purple-700 mb-3 italic">"{transcript}"</p>

                {evaluation.status && (
                  <div className={`w-full flex flex-col items-center p-3 rounded-xl border ${
                    evaluation.status === "excellent"
                      ? "bg-green-50/80 border-green-200 text-green-800"
                      : evaluation.status === "good"
                      ? "bg-blue-50/80 border-blue-200 text-blue-800"
                      : "bg-orange-50/80 border-orange-200 text-orange-800"
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold text-[14px] md:text-[15px] mb-1">
                      {evaluation.status === "excellent" && <Sparkles className="w-4 h-4 text-green-600 animate-spin-slow" />}
                      {evaluation.status === "good" && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      {evaluation.status === "retry" && <RotateCcw className="w-4 h-4 text-orange-500" />}
                      <span>{evaluation.feedback}</span>
                    </div>
                    <div className="text-xs font-bold opacity-80">
                      Pronunciation score: {evaluation.score}%
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {!isListening && !recognitionError && !transcript && isSupported && (
              <p className="text-xs text-text-secondary italic text-center max-w-xs">
                Click the purple microphone and repeat the word after listening!
              </p>
            )}

            {!isListening && !recognitionError && !transcript && !isSupported && (
              <p className="text-xs text-text-secondary italic text-center max-w-xs">
                Listen carefully to the word and practice out loud!
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex gap-4 w-full justify-center">
        {transcript && (
          <button
            onClick={startListening}
            disabled={isListening}
            className="px-5 py-3 rounded-xl border-2 border-purple-200 text-purple-700 hover:bg-purple-50 font-bold transition-all text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try again</span>
          </button>
        )}
        <Button
          onClick={handleNext}
          className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm text-sm"
        >
          {currentIndex < items.length - 1 ? "Next word" : "Finish"}
        </Button>
      </div>
    </div>
  );
}

