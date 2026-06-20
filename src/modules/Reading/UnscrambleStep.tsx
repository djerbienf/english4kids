import React, { useState } from "react";
import { Button } from "../../components/Button";
import { motion } from "motion/react";

export function UnscrambleStep({
  text,
  onComplete,
}: {
  text: string;
  onComplete: () => void;
}) {
  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const [bankWords, setBankWords] = useState<{ id: string; word: string }[]>([]);
  const [sentenceWords, setSentenceWords] = useState<{ id: string; word: string }[]>([]);
  const [draggedItem, setDraggedItem] = useState<{ source: "bank" | "sentence"; index: number; } | null>(null);

  const [hasChecked, setHasChecked] = useState(false);
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
