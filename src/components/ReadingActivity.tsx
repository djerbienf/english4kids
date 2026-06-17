import React, { useState } from "react";
import { ReadingConfig, ReadingVocabulary, ReadingSlideConfig } from "../types";
import { Button } from "./Button";
import { Cloze } from "./Cloze";
import { motion, AnimatePresence } from "motion/react";

export const VocabWord = ({
  vocab,
  text,
}: {
  vocab: ReadingVocabulary;
  text: string;
}) => {
  const [open, setOpen] = useState(false);
  const [showArabic, setShowArabic] = useState(false);

  return (
    <span className="relative inline-block mx-1">
      <span
        onClick={() => {
          setOpen(!open);
          setShowArabic(false);
        }}
        className="text-primary font-bold cursor-pointer hover:bg-primary-light/10 rounded px-1 border-b-2 border-primary border-dashed transition-colors"
      >
        {text}
      </span>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-white text-text-primary rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] p-4 border border-primary-light"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-neutral-bg text-text-secondary hover:text-text-primary text-sm font-bold transition-colors"
            >
              ×
            </button>
            {vocab.definition ? (
              <p className="text-[14px] font-medium mb-3 pr-4 leading-snug">
                {vocab.definition}
              </p>
            ) : (
              <p className="text-[14px] font-medium mb-3 pr-4 opacity-50 italic">
                No definition
              </p>
            )}
            {showArabic ? (
              <p
                className="text-[20px] font-arabic text-primary-dark font-bold text-center border-t border-primary-light/50 pt-3 mt-1"
                dir="rtl"
              >
                {vocab.translation}
              </p>
            ) : (
              <button
                onClick={() => setShowArabic(true)}
                className="w-full text-[13px] font-bold text-primary bg-primary-light/20 hover:bg-primary-light/40 py-2 rounded-lg transition-colors mt-1"
              >
                Show Translation
              </button>
            )}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-white"></div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[9px] border-transparent border-t-primary-light -z-10 -ml-[1px]"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

export function InteractiveText({
  text,
  vocabulary,
}: {
  text: string;
  vocabulary?: ReadingVocabulary[];
}) {
  if (!vocabulary || vocabulary.length === 0) return <span>{text}</span>;

  let parts: React.ReactNode[] = [text];

  vocabulary.forEach((vocab, vIndex) => {
    if (!vocab.word) return;
    const trimWord = vocab.word.trim();
    if (!trimWord) return;
    
    // Word boundary that supports French accented characters
    const escapeRegExp = (string: string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeWord = escapeRegExp(trimWord);
    const wordRegex = new RegExp(
      `(^|[^a-zA-ZÀ-ÿ])(${safeWord})(?=[^a-zA-ZÀ-ÿ]|$)`,
      "gi",
    );

    const newParts: React.ReactNode[] = [];
    parts.forEach((part, pIndex) => {
      if (typeof part === "string") {
        const splitText = part.split(wordRegex);
        splitText.forEach((segment, sIndex) => {
          if (segment && segment.toLowerCase() === trimWord.toLowerCase()) {
            newParts.push(
              <VocabWord
                key={`${vIndex}-${pIndex}-${sIndex}`}
                vocab={vocab}
                text={segment}
              />,
            );
          } else if (segment) {
            newParts.push(segment);
          }
        });
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
  });

  return (
    <span>
      {parts.map((p, i) => (
        <React.Fragment key={i}>{p}</React.Fragment>
      ))}
    </span>
  );
}

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

function UnscrambleStep({
  text,
  onComplete,
}: {
  text: string;
  onComplete: () => void;
}) {
  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const [bankWords, setBankWords] = useState<{ id: string; word: string }[]>(
    [],
  );
  const [sentenceWords, setSentenceWords] = useState<
    { id: string; word: string }[]
  >([]);
  const [draggedItem, setDraggedItem] = useState<{
    source: "bank" | "sentence";
    index: number;
  } | null>(null);

  const [hasChecked, setHasChecked] = useState(false);

  // Allow native HTML5 DND over empty areas
  const [isOverSentence, setIsOverSentence] = useState(false);

  React.useEffect(() => {
    setBankWords(
      [...words]
        .sort(() => Math.random() - 0.5)
        .map((w, i) => ({ id: `${i}-${w}`, word: w })),
    );
    setSentenceWords([]);
    setHasChecked(false);
  }, [words]);

  const handleDragStart = (
    e: React.DragEvent,
    source: "bank" | "sentence",
    index: number,
  ) => {
    setDraggedItem({ source, index });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${source}-${index}`);
  };

  const handleDragOverBank = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropBank = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;
    setHasChecked(false);

    if (draggedItem.source === "sentence") {
      const item = sentenceWords[draggedItem.index];
      const newSentence = [...sentenceWords];
      newSentence.splice(draggedItem.index, 1);

      setSentenceWords(newSentence);
      setBankWords([...bankWords, item]);
    }
    setDraggedItem(null);
  };

  const handleDragOverSentence = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOverSentence(true);
  };

  const handleDragLeaveSentence = () => {
    setIsOverSentence(false);
  };

  const handleDropSentence = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    setIsOverSentence(false);
    if (!draggedItem) return;
    setHasChecked(false);

    let item: { id: string; word: string };
    const newBank = [...bankWords];
    const newSentence = [...sentenceWords];

    if (draggedItem.source === "bank") {
      item = newBank.splice(draggedItem.index, 1)[0];
      setBankWords(newBank);
    } else {
      item = newSentence.splice(draggedItem.index, 1)[0];
    }

    if (targetIndex !== undefined) {
      newSentence.splice(targetIndex, 0, item);
    } else {
      newSentence.push(item);
    }

    setSentenceWords(newSentence);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setIsOverSentence(false);
  };

  const moveWordClick = (source: "bank" | "sentence", index: number) => {
    setHasChecked(false);
    if (source === "bank") {
      const item = bankWords[index];
      const newBank = [...bankWords];
      newBank.splice(index, 1);
      setBankWords(newBank);
      setSentenceWords([...sentenceWords, item]);
    } else {
      const item = sentenceWords[index];
      const newSentence = [...sentenceWords];
      newSentence.splice(index, 1);
      setSentenceWords(newSentence);
      setBankWords([...bankWords, item]);
    }
  };

  const isCorrect =
    hasChecked &&
    bankWords.length === 0 &&
    sentenceWords.every((s, i) => s.word === words[i]);

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto min-h-full">
      <div className="text-center mb-8">
        <h3 className="text-[28px] font-bold text-primary-dark mb-4">
          Sentence Unscramble
        </h3>
        <p className="text-[18px] text-text-secondary">
          Reorder the words to form the correct sentence.
        </p>
      </div>

      <div className="flex flex-col w-full gap-8 mt-4">
        {/* Sentence Drop Zone */}
        <div
          onDragOver={handleDragOverSentence}
          onDragLeave={handleDragLeaveSentence}
          onDrop={(e) => handleDropSentence(e)}
          className={`flex flex-wrap gap-4 min-h-[120px] p-6 rounded-2xl border-2 transition-colors duration-300 w-full shadow-inner ${isOverSentence ? "bg-primary-light/20 border-primary" : "bg-neutral-bg border-primary-light/50"}`}
        >
          {sentenceWords.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-text-secondary font-medium opacity-50 pointer-events-none">
              Drag words here
            </div>
          )}
          {sentenceWords.map((item, index) => {
            let styleClass = "bg-white border-primary-light text-primary-dark";
            if (hasChecked) {
              if (item.word === words[index]) {
                styleClass = "border-green-500 bg-green-50 text-green-700";
              } else {
                styleClass = "border-red-500 bg-red-50 text-red-700";
              }
            }

            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, "sentence", index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDropSentence(e, index);
                }}
                onClick={() => moveWordClick("sentence", index)}
                className={`cursor-grab active:cursor-grabbing px-6 py-3 border-2 rounded-xl shadow-sm text-[22px] font-bold transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md ${styleClass} ${draggedItem?.source === "sentence" && draggedItem?.index === index ? "opacity-30 scale-95" : ""}`}
              >
                {item.word}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {(sentenceWords.length > 0 || hasChecked) && (
          <div className="flex justify-center -mt-2 mb-2">
            <Button
              onClick={() => setHasChecked(true)}
              variant="ghost"
              className="px-8 py-3 text-[16px] font-bold border-2 border-primary-light hover:border-primary bg-white hover:bg-neutral-bg transition-colors"
            >
              Verify Answer
            </Button>
          </div>
        )}

        {/* Word Bank */}
        <div
          onDragOver={handleDragOverBank}
          onDrop={handleDropBank}
          className="flex flex-wrap gap-4 justify-center min-h-[140px] p-8 w-full"
        >
          {bankWords.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, "bank", index)}
              onDragEnd={handleDragEnd}
              onClick={() => moveWordClick("bank", index)}
              className={`cursor-grab active:cursor-grabbing px-6 py-4 bg-white border-2 border-primary-light rounded-xl shadow-sm font-bold text-[22px] text-primary-dark select-none transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md ${draggedItem?.source === "bank" && draggedItem?.index === index ? "opacity-30 scale-95" : ""}`}
            >
              {item.word}
            </div>
          ))}
        </div>
      </div>

      {isCorrect ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="text-center flex flex-col items-center mt-8"
        >
          <div className="text-green-500 font-bold text-[24px] mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              ✓
            </div>
            Perfect!
          </div>
          <Button
            onClick={onComplete}
            variant="primary"
            className="px-12 py-4 text-[18px] shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-1 transition-all"
          >
            Continue →
          </Button>
        </motion.div>
      ) : (
        <div className="h-[120px]" />
      )}
    </div>
  );
}
