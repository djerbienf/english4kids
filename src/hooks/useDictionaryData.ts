import { useStore } from "../store/useStore";

export function useDictionaryData() {
  const dictionaryWords = useStore((state) => state.dictionaryWords);
  const updateDictionary = useStore((state) => state.updateDictionary);
  const setDictionaryWords = useStore((state) => state.setDictionaryWords);

  return { dictionaryWords, updateDictionary, setDictionaryWords };
}
