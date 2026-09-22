import { useState, useMemo, useEffect } from "react";
import { DictionaryEntry } from "../../types";

export function useDictionaryFilters(dictionaryWords: DictionaryEntry[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [assetFilter, setAssetFilter] = useState("All Assets");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [posFilter, setPosFilter] = useState("All Parts of Speech");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredWords = useMemo(() => {
    return dictionaryWords.filter((wordObj) => {
      const primarySense = wordObj.senses?.[0];

      // Search filter
      if (debouncedSearchQuery) {
        const q = debouncedSearchQuery.toLowerCase().trim();
        const wordEn = String(wordObj.lemma || wordObj.word || "").toLowerCase();
        const translation = String(
          primarySense?.translation_ar || wordObj.translation || ""
        ).toLowerCase();
        const forms = Array.isArray(wordObj.forms)
          ? wordObj.forms.map((f) => String(f).toLowerCase())
          : [];

        if (
          !wordEn.includes(q) &&
          !translation.includes(q) &&
          !forms.some((f) => f.includes(q))
        ) {
          return false;
        }
      }

      // Level filter
      if (levelFilter !== "All Levels") {
        const wordLevel = primarySense?.cefr_level;
        if (wordLevel !== levelFilter) return false;
      }

      // Asset filter
      if (assetFilter !== "All Assets") {
        const hasAudio = !!(
          primarySense?.assets?.audio?.us ||
          primarySense?.assets?.audio?.uk ||
          wordObj.pronunciation_us ||
          wordObj.pronunciation_uk
        );
        const hasImage = !!primarySense?.assets?.image;
        const hasTranslation = !!(
          primarySense?.translation_ar || wordObj.translation
        );
        const hasPos = !!(
          wordObj.part_of_speech || (primarySense as any)?.part_of_speech
        );
        const hasSynonyms =
          !!(
            (primarySense as any)?.synonyms &&
            (primarySense as any).synonyms.length > 0
          ) ||
          !!(
            primarySense?.relations?.synonyms &&
            primarySense.relations.synonyms.length > 0
          );
        const hasAntonyms =
          !!(
            (primarySense as any)?.antonyms &&
            (primarySense as any).antonyms.length > 0
          ) ||
          !!(
            primarySense?.relations?.antonyms &&
            primarySense.relations.antonyms.length > 0
          );

        if (assetFilter === "Has Image" && !hasImage) return false;
        if (assetFilter === "Has Audio" && !hasAudio) return false;
        if (assetFilter === "Has Both" && (!hasImage || !hasAudio))
          return false;
        if (assetFilter === "Has Synonyms" && !hasSynonyms) return false;
        if (assetFilter === "Has Antonyms" && !hasAntonyms) return false;
        if (assetFilter === "Missing Image" && hasImage) return false;
        if (assetFilter === "Missing Audio" && hasAudio) return false;
        if (assetFilter === "Missing Translation" && hasTranslation)
          return false;
        if (assetFilter === "Missing POS" && hasPos) return false;
      }

      // Category filter
      if (categoryFilter !== "All Categories") {
        if (primarySense?.category !== categoryFilter) return false;
      }

      // POS filter
      if (posFilter !== "All Parts of Speech") {
        const wordPos =
          wordObj.part_of_speech || (primarySense as any)?.part_of_speech;
        if (wordPos !== posFilter) return false;
      }

      return true;
    });
  }, [
    dictionaryWords,
    debouncedSearchQuery,
    levelFilter,
    assetFilter,
    categoryFilter,
    posFilter,
  ]);

  const categories = Array.from(
    new Set(dictionaryWords.map((w) => w.senses?.[0]?.category).filter(Boolean))
  ) as string[];

  const partsOfSpeech = Array.from(
    new Set(
      dictionaryWords
        .map(
          (w) => w.part_of_speech || (w.senses?.[0] as any)?.part_of_speech
        )
        .filter(Boolean)
    )
  ) as string[];

  return {
    searchQuery,
    setSearchQuery,
    levelFilter,
    setLevelFilter,
    assetFilter,
    setAssetFilter,
    categoryFilter,
    setCategoryFilter,
    posFilter,
    setPosFilter,
    filteredWords,
    categories,
    partsOfSpeech,
  };
}
