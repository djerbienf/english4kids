import { DictionaryEntry } from "../types";

export function generateActivityFromText(
  type: "flashcard" | "matching" | "cloze",
  text: string,
  dictionaryWords: DictionaryEntry[]
) {
  // 1. Extract words from text that are in dictionaryWords
  // Simple basic tokenization, case-insensitive
  const textWords = (text.toLowerCase().match(/[\p{L}\p{M}]+/gu) || []) as string[];
  const matchedDictWords = dictionaryWords.filter(w => 
    (w.lemma && textWords.includes(w.lemma.toLowerCase())) || 
    (w.word && textWords.includes(w.word.toLowerCase()))
  );

  if (matchedDictWords.length === 0) {
    return { error: "No known vocabulary words found in this text. Please add some words to the dictionary first by clicking on them." };
  }

  const newActivityId = Date.now();
  let newActivity: any = null;
  let message = "";

  if (type === "matching") {
    newActivity = {
      id: newActivityId,
      type: "Matching",
      title: "Generated Matching Activity",
      matchingPairs: [],
      dictionaryWordIds: matchedDictWords.slice(0, 8).map(w => w.id),
    };
    message = `Generated matching pairs for ${Math.min(matchedDictWords.length, 8)} words.`;
  } else if (type === "cloze") {
    const targetWord = matchedDictWords[0];
    const lemma = targetWord.lemma || targetWord.word || "";
    const regex = new RegExp(`(^|\\s)(${lemma})(\\s|\\.|,|$)`, "i");
    const match = text.match(regex);
    
    let sentenceBefore = "This is the generated sentence before ";
    let correct = lemma;
    let sentenceAfter = " and this is after.";
    
    if (match && match.index !== undefined) {
       // rudimentary sentence extraction
       const startIndex = Math.max(0, text.lastIndexOf(".", match.index) + 1);
       const endIndex = text.indexOf(".", match.index + match[0].length);
       const endObjIndex = endIndex === -1 ? text.length : endIndex + 1;
       
       const sentence = text.substring(startIndex, endObjIndex).trim();
       const wordInSentenceMatch = sentence.match(new RegExp(lemma, "i"));
       if (wordInSentenceMatch && wordInSentenceMatch.index !== undefined) {
         sentenceBefore = sentence.substring(0, wordInSentenceMatch.index);
         correct = wordInSentenceMatch[0];
         sentenceAfter = sentence.substring(wordInSentenceMatch.index + correct.length);
       }
    }

    // Generate distractors intelligently from the dictionary
    const otherWords = dictionaryWords.filter(w => w.id !== targetWord.id);
    const targetPos = targetWord.part_of_speech;
    const targetCategory = targetWord.senses?.[0]?.category;

    const distractorsList = otherWords.map(w => {
      let score = Math.random(); // Baseline random for variety
      const pos = w.part_of_speech;
      const cat = w.senses?.[0]?.category;
      
      if (targetPos && pos === targetPos) score += 10; // High priority for same POS (e.g. noun vs noun)
      if (targetCategory && cat === targetCategory) score += 5; // Medium priority for same category
      
      return { text: w.lemma || w.word || "", score };
    })
    .filter(d => d.text)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(d => d.text);

    newActivity = {
      id: newActivityId,
      type: "Cloze",
      title: "Generated Cloze Activity",
      clozeSentenceBefore: sentenceBefore,
      clozeCorrect: correct,
      clozeSentenceAfter: sentenceAfter,
      clozeDistractors: distractorsList.length > 0 ? distractorsList.join(", ") : "distractor1, distractor2",
      clozeTolerance: "Normale",
      clozeShowChoices: true,
    };
    message = `Generated cloze activity targeting the word "${correct}".`;
  } else if (type === "flashcard") {
    newActivity = {
      id: newActivityId,
      type: "Flashcards",
      title: "Generated Flashcards",
      flashcardWordIds: matchedDictWords.map(w => w.id),
    };
    message = `Generated flashcards for ${matchedDictWords.length} words.`;
  }

  return { activity: newActivity, message };
}
