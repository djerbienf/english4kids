import { DictionaryEntry } from "../types";

export const parseDictionaryJson = (
  json: any[],
  currentDictionary: DictionaryEntry[]
): { updatedDictionary: DictionaryEntry[]; addedCount: number; updatedCount: number } => {
  const updatedDictionary = [...currentDictionary];
  let addedCount = 0;
  let updatedCount = 0;

  json.forEach((item: any) => {
    const wordText = item.word || item.lemma;
    if (!wordText) return;

    const forms: string[] = [];
    if (Array.isArray(item.verbs)) {
      item.verbs.forEach((v: any) => {
        if (v.text && !forms.includes(v.text.toLowerCase())) {
          forms.push(v.text.toLowerCase());
        }
      });
    }
    if (Array.isArray(item.forms)) {
      item.forms.forEach((v: any) => {
        const text = typeof v === "string" ? v : v.text;
        if (text && !forms.includes(text.toLowerCase())) {
          forms.push(text.toLowerCase());
        }
      });
    }

    if (!forms.includes(wordText.toLowerCase())) {
      forms.push(wordText.toLowerCase());
    }

    let defData = item.definition || item.definitions || item.senses || [];
    if (typeof defData === "string") defData = [{ text: defData }];
    if (!Array.isArray(defData)) defData = [defData];
    if (defData.length === 0) defData = [{ text: "" }];

    const senses = defData.map((def: any, index: number) => ({
      sense_id: `${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
      cefr_level: def.cefr || item.cefr || "A1",
      gloss: def.text || def.gloss || "",
      translation_ar: def.translation?.trim() || def.translation_ar?.trim() || "",
      part_of_speech:
        def.pos ||
        def.part_of_speech ||
        (Array.isArray(item.pos) ? item.pos[0] : item.pos) ||
        "",
      category: def.category || item.category || "",
      examples: Array.isArray(def.example)
        ? def.example.map((ex: any) => (typeof ex === "string" ? ex : ex.text))
        : Array.isArray(def.examples)
        ? def.examples
        : [],
      assets: {
        image: item.image || def.image || undefined,
        audio: {
          uk: item.audio_uk || def.audio_uk || undefined,
        },
      },
    }));

    // Check for duplicates in existing dictionary by lemma
    const existingWordIndex = updatedDictionary.findIndex(
      (w) => w.lemma.toLowerCase() === wordText.toLowerCase()
    );

    if (existingWordIndex !== -1) {
      // Merge data into existing word
      const existingWord = updatedDictionary[existingWordIndex];

      // Merge forms
      const mergedForms = Array.from(
        new Set([...(existingWord.forms || []), ...forms])
      );

      updatedDictionary[existingWordIndex] = {
        ...existingWord,
        forms: mergedForms,
        pronunciation_uk:
          existingWord.pronunciation_uk || item.pronunciation_uk,
        senses: [
          ...existingWord.senses,
          ...senses.filter(
            (s) => !existingWord.senses.some((es) => es.gloss === s.gloss)
          ),
        ],
      };
      updatedCount++;
    } else {
      // Add new word
      updatedDictionary.push({
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        lemma: wordText,
        part_of_speech: Array.isArray(item.pos) ? item.pos[0] : item.pos || "",
        forms: forms,
        pronunciation_uk: item.pronunciation_uk || "",
        senses: senses,
      });
      addedCount++;
    }
  });

  return { updatedDictionary, addedCount, updatedCount };
};
