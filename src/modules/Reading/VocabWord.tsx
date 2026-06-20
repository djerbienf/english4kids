import React, { useState } from "react";
import { ReadingVocabulary } from "../../types";
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
