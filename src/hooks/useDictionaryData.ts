import { useState } from "react";
import { DictionaryEntry } from "../types";

export function useDictionaryData() {
  const [dictionaryWords, setDictionaryWords] = useState<DictionaryEntry[]>(() => {
    const persisted = localStorage.getItem("lms_dictionary_data");
    if (persisted) return JSON.parse(persisted);
    return [
      {
        id: "1",
        lemma: "Morning",
        senses: [{ sense_id: "1_1", gloss: "The first part of the day", translation_ar: "الصباح", examples: ['"Good morning, how are you?"'], cefr_level: "A1" }]
      },
      {
        id: "2",
        lemma: "Apple",
        senses: [{ sense_id: "2_1", gloss: "A round fruit", translation_ar: "تفاحة", examples: ['"I eat an apple every day."'], cefr_level: "A1" }]
      },
      {
        id: "3",
        lemma: "Family",
        senses: [{ sense_id: "3_1", gloss: "A group of parents and children", translation_ar: "عائلة", examples: ['"My family is big."'], cefr_level: "A1" }]
      },
      {
        id: "4",
        lemma: "Hello",
        senses: [{ sense_id: "4_1", gloss: "A greeting used to begin a conversation.", translation_ar: "مرحباً", examples: ['"Hello, nice to meet you."'], cefr_level: "A1" }]
      },
      {
        id: "5",
        lemma: "Water",
        senses: [{ sense_id: "5_1", gloss: "A clear liquid essential for life.", translation_ar: "ماء", examples: ['"Can I have a glass of water?"'], cefr_level: "A1" }]
      },
    ];
  });

  const updateDictionary = (newWords: typeof dictionaryWords) => {
    setDictionaryWords(newWords);
    localStorage.setItem("lms_dictionary_data", JSON.stringify(newWords));
  };

  return { dictionaryWords, updateDictionary, setDictionaryWords };
}
