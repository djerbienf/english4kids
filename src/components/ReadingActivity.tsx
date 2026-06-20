import React, { useState } from "react";
import { ReadingConfig } from "../types";
import { Button } from "./Button";
import { Cloze } from "./Cloze";
import { motion, AnimatePresence } from "motion/react";
import { InteractiveText } from "../modules/Reading/InteractiveText";
import { UnscrambleStep } from "../modules/Reading/UnscrambleStep";

interface ReadingActivityProps {
  config: ReadingConfig;
  onComplete: () => void;
}

export function ReadingActivity({ config, onComplete }: ReadingActivityProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [interactionState, setInteractionState] = useState<"text" | "cloze" | "unscramble">("text");
  const [interactionSubIndex, setInteractionSubIndex] = useState(0);

  // Fetch global dictionary directly so it's always fresh
  const globalDictionary = React.useMemo(() => {
    try {
      const persisted = localStorage.getItem("lms_dictionary_data");
      if (persisted) return JSON.parse(persisted);
    } catch (e) {
      console.error(e);
    }
    return [];
  }, []);

  const titleText =
    config.readingType === "dialogue"
      ? "Dialogue Reading"
      : config.readingType === "story"
        ? "Story Time"
        : "Reading Practice";

  const slides =
    config.readingSlides && config.readingSlides.length > 0
      ? config.readingSlides
      : [{ text: "(Missing content)" }];

  const currentSlide = slides[currentSlideIndex];

  const clozes = React.useMemo(() => {
    let list = [];
    if (currentSlide?.clozes && currentSlide.clozes.length > 0) list = currentSlide.clozes;
    else if (currentSlide?.clozeCorrect) list = [{
      sentenceBefore: currentSlide.clozeSentenceBefore || "",
      sentenceAfter: currentSlide.clozeSentenceAfter || "",
      correct: currentSlide.clozeCorrect || "",
      distractors: Array.isArray(currentSlide.clozeDistractors) 
        ? currentSlide.clozeDistractors 
        : (typeof currentSlide.clozeDistractors === 'string' ? (currentSlide.clozeDistractors as string).split(',').map((s: string) => s.trim()).filter(Boolean) : [])
    }];
    return list.filter(c => c && c.correct && c.correct.trim() !== "");
  }, [currentSlide]);

  const unscrambles = React.useMemo(() => {
    let list = [];
    if (currentSlide?.unscrambleTexts && currentSlide.unscrambleTexts.length > 0) list = currentSlide.unscrambleTexts;
    else if (currentSlide?.unscrambleText) list = [currentSlide.unscrambleText];
    return list.filter(t => t && typeof t === 'string' && t.trim() !== "");
  }, [currentSlide]);

  // Combine slide vocabulary with global dictionary, preferring slide-specific definitions if duplicates exist
  const combinedVocabulary = React.useMemo(() => {
    const slideVocab = currentSlide?.vocabulary || [];
    const merged = [...slideVocab];
    const existingWords = new Set(slideVocab.map((v: any) => (v.lemma || v.word || "").toLowerCase()));
    
    globalDictionary.forEach((gv: any) => {
      const word = gv.lemma || gv.word;
      if (word && !existingWords.has(word.toLowerCase())) {
        merged.push({
           word: word,
           translation: gv.senses?.[0]?.translation_ar || gv.translation,
           definition: gv.senses?.[0]?.gloss || gv.definition,
           example: (gv.senses?.[0]?.examples && gv.senses?.[0]?.examples.length > 0) ? gv.senses?.[0]?.examples[0] : gv.example,
        });
      }
    });
    
    // Sort by length descending, so we match longer phrasal words first
    return merged.sort((a, b) => (b.word?.length || 0) - (a.word?.length || 0));
  }, [currentSlide, globalDictionary]);

  const handleNext = () => {
    if (interactionState === "text") {
      if (clozes.length > 0) {
        setInteractionState("cloze");
        setInteractionSubIndex(0);
      } else if (unscrambles.length > 0) {
        setInteractionState("unscramble");
        setInteractionSubIndex(0);
      } else {
        if (currentSlideIndex < slides.length - 1) {
          setCurrentSlideIndex((prev) => prev + 1);
          setInteractionState("text");
          setInteractionSubIndex(0);
        } else {
          onComplete();
        }
      }
    } else if (interactionState === "cloze") {
      if (interactionSubIndex < clozes.length - 1) {
        setInteractionSubIndex((prev) => prev + 1);
      } else if (unscrambles.length > 0) {
        setInteractionState("unscramble");
        setInteractionSubIndex(0);
      } else {
        if (currentSlideIndex < slides.length - 1) {
          setCurrentSlideIndex((prev) => prev + 1);
          setInteractionState("text");
          setInteractionSubIndex(0);
        } else {
          onComplete();
        }
      }
    } else if (interactionState === "unscramble") {
      if (interactionSubIndex < unscrambles.length - 1) {
        setInteractionSubIndex((prev) => prev + 1);
      } else {
        if (currentSlideIndex < slides.length - 1) {
          setCurrentSlideIndex((prev) => prev + 1);
          setInteractionState("text");
          setInteractionSubIndex(0);
        } else {
          onComplete();
        }
      }
    }
  };

  const handlePrev = () => {
    if (interactionState === "unscramble") {
      if (interactionSubIndex > 0) {
        setInteractionSubIndex((prev) => prev - 1);
      } else if (clozes.length > 0) {
        setInteractionState("cloze");
        setInteractionSubIndex(clozes.length - 1);
      } else {
        setInteractionState("text");
        setInteractionSubIndex(0);
      }
    } else if (interactionState === "cloze") {
      if (interactionSubIndex > 0) {
        setInteractionSubIndex((prev) => prev - 1);
      } else {
        setInteractionState("text");
        setInteractionSubIndex(0);
      }
    } else if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      // Simplify logic for going backwards: go to beginning of previous slide
      setInteractionState("text");
      setInteractionSubIndex(0);
    }
  };

  const handleInteractionComplete = () => {
    handleNext();
  };

  // Format the text for better reading experience
  const formatText = (text: string, type: string) => {
    if (!text) return null;
    if (type === "dialogue") {
      return text.split("\n").map((line, i) => {
        const match = line.match(/^([^:]+):(.*)$/);
        if (match) {
          return (
            <div
              key={i}
              className="mb-8 flex gap-6 items-start leading-relaxed"
            >
              <span className="font-bold text-primary-dark tracking-wider text-[22px] uppercase shrink-0 mt-1">
                {match[1]}:
              </span>
              <span className="text-[28px] text-text-primary leading-tight font-medium">
                <InteractiveText
                  text={match[2]}
                  vocabulary={combinedVocabulary}
                />
              </span>
            </div>
          );
        }
        return (
          <p
            key={i}
            className="mb-6 text-[26px] leading-relaxed text-text-primary"
          >
            <InteractiveText text={line} vocabulary={combinedVocabulary} />
          </p>
        );
      });
    }

    if (type === "story") {
      return text.split("\n").map((para, i) => {
        if (!para.trim()) return <br key={i} />;
        return (
          <p
            key={i}
            className="mb-8 text-[32px] leading-relaxed text-text-primary"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <InteractiveText text={para} vocabulary={combinedVocabulary} />
          </p>
        );
      });
    }

    return text.split("\n").map((para, i) => {
      if (!para.trim()) return <br key={i} />;
      return (
        <p
          key={i}
          className="mb-8 text-[30px] leading-relaxed text-text-primary font-medium"
        >
          <InteractiveText text={para} vocabulary={combinedVocabulary} />
        </p>
      );
    });
  };

  if (interactionState === "cloze" && clozes[interactionSubIndex]) {
    const currentCloze = clozes[interactionSubIndex];
    if (currentCloze.correct) {
      const clozeConfig = {
        id: "cloze_" + currentSlideIndex + "_" + interactionSubIndex,
        type: "cloze" as const,
        sentenceBeforeGap: currentCloze.sentenceBefore || "",
        correctAnswer: currentCloze.correct,
        sentenceAfterGap: currentCloze.sentenceAfter || "",
        distractors: Array.isArray(currentCloze.distractors) 
          ? currentCloze.distractors 
          : (typeof currentCloze.distractors === 'string' ? currentCloze.distractors.split(',').map((s: string) => s.trim()).filter(Boolean) : [])
      };
      return (
        <div className="flex flex-col h-full w-full bg-white relative flex-1">
          <div className="absolute top-4 left-4 pt-8 px-4 z-10 w-full pointer-events-auto">
            <Button
              variant="ghost"
              onClick={handlePrev}
              className="w-32 py-4 text-[18px]"
            >
              ← Back
            </Button>
          </div>
          <div className="pt-24 px-8 md:px-12 w-full max-w-4xl mx-auto text-sm text-text-secondary font-bold font-sans">Practice {interactionSubIndex + 1} / {clozes.length}</div>
          <Cloze key={`cloze-${currentSlideIndex}-${interactionSubIndex}`} config={clozeConfig} onComplete={handleInteractionComplete} />
        </div>
      );
    } else {
      // automatically skip empty configurations
      handleNext();
      return null;
    }
  }

  if (interactionState === "unscramble" && unscrambles[interactionSubIndex]) {
    return (
      <div className="flex flex-col h-full w-full bg-white relative flex-1">
        <div className="absolute top-4 left-4 pt-8 px-4 z-10 w-full pointer-events-auto">
          <Button
            variant="ghost"
            onClick={handlePrev}
            className="w-32 py-4 text-[18px]"
          >
            ← Back
          </Button>
        </div>
        <div className="pt-24 px-8 md:px-12 w-full max-w-4xl mx-auto text-sm text-text-secondary font-bold font-sans">Practice {interactionSubIndex + 1} / {unscrambles.length}</div>
        <UnscrambleStep key={`unscramble-${currentSlideIndex}-${interactionSubIndex}`} text={unscrambles[interactionSubIndex]} onComplete={handleInteractionComplete} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white relative flex-1">
      <div className="flex-1 flex flex-col items-center pt-8 pb-32 overflow-y-auto px-4 md:px-0 w-full">
        <div className="w-full max-w-4xl flex flex-col min-h-full justify-between items-center">
          {currentSlide?.imageUrl && (
            <div className="w-full max-w-2xl mx-auto mb-8">
              <img
                src={currentSlide.imageUrl}
                alt="Reading Cover"
                className="w-full h-auto object-cover rounded-[20px] shadow-sm"
              />
            </div>
          )}

          {(config.readingTitle || currentSlide?.audioUrl) && (
              <div className="text-center mb-8 w-full">
                {config.readingTitle && currentSlideIndex === 0 && (
                  <h1 className="text-[36px] font-bold text-primary-dark mb-6">
                    {config.readingTitle}
                  </h1>
                )}
                {currentSlide?.audioUrl && (
                  <audio
                    controls
                    src={currentSlide.audioUrl}
                    className="mx-auto mt-4 mb-8 outline-none"
                  >
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            )}

          <div className="text-center mb-16 w-full">
            <h2 className="text-[16px] font-bold text-text-secondary font-sans tracking-wide">
              {currentSlideIndex + 1} / {slides.length}
            </h2>
          </div>

          <div className="flex-1 mb-[120px] flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="w-full text-left relative z-0"
              >
                {formatText(currentSlide?.text || "", config.readingType)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pb-8 pt-16 pointer-events-none z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 md:px-0 pointer-events-auto">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentSlideIndex === 0 && interactionState === "text"}
            className="w-32 py-4 text-[18px]"
          >
            ← Back
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            className="w-56 py-4 text-[18px] font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-1 transition-all"
          >
            {clozes.length > 0 || unscrambles.length > 0
              ? "Practice →"
              : currentSlideIndex < slides.length - 1
                ? "Next →"
                : "Complete ✓"}
          </Button>
        </div>
      </div>
    </div>
  );
}
