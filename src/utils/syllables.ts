export function getSyllables(word: string, pronunciation?: string): string {
  if (!word) return "";

  // If pronunciation has syllable markers (· or .), try to align them
  if (pronunciation && (pronunciation.includes('·') || pronunciation.includes('.'))) {
    const parts = pronunciation.split(/[·\.]/);
    if (parts.length > 1) {
      // Find the first letter of each pronunciation syllable (ignoring non-alphabetic chars)
      // and try to map it to the word.
      let syllables = [];
      let currentWordIndex = 0;
      
      const w = word.toLowerCase();
      
      for (let i = 0; i < parts.length - 1; i++) {
        // The start of the next syllable in pronunciation
        const nextPart = parts[i + 1].replace(/[^a-z]/gi, '');
        if (nextPart.length > 0) {
          const firstChar = nextPart[0].toLowerCase();
          // Find this char in the word, starting from currentWordIndex + 1
          // We want it to be after some vowels of the current syllable
          let foundIdx = -1;
          for (let j = currentWordIndex + 1; j < w.length; j++) {
            if (w[j] === firstChar) {
              foundIdx = j;
              break;
            }
          }
          if (foundIdx !== -1) {
            syllables.push(word.substring(currentWordIndex, foundIdx));
            currentWordIndex = foundIdx;
          }
        }
      }
      syllables.push(word.substring(currentWordIndex));
      
      // If we managed to split it into the same number of syllables as the pronunciation
      if (syllables.length === parts.length) {
        return syllables.join("·");
      }
    }
  }

  // Fallback heuristic
  const w = word.toLowerCase();
  
  // Hardcoded fixes for common words or patterns
  if (w === "boyfriend") return "boy·friend";
  if (w === "girlfriend") return "girl·friend";
  if (w === "morning") return "mor·ning";
  if (w === "beautiful") return "beau·ti·ful";
  
  // Identify vowels
  const isVowel = (c: string) => /[aeiouyàáâäæãåāèéêëēėęîïíīįìôöòóœøōõûüùúū]/i.test(c);
  
  let result = "";
  let currentSyllable = "";
  
  const onsets = ["bl","br","ch","cl","cr","dr","fl","fr","gl","gr","pl","pr","sc","sh","sk","sl","sm","sn","sp","st","sw","th","tr","tw","wh","wr","sch","scr","shr","sph","spl","spr","squ","str","thr"];
  
  const chunks = [];
  let i = 0;
  while (i < word.length) {
    let chunk = word[i];
    let isV = isVowel(word[i]);
    i++;
    while (i < word.length && isVowel(word[i]) === isV) {
      chunk += word[i];
      i++;
    }
    chunks.push({ text: chunk, isVowel: isV });
  }
  
  let syllables = [];
  let temp = "";
  
  for (let j = 0; j < chunks.length; j++) {
    const chunk = chunks[j];
    if (chunk.isVowel) {
      temp += chunk.text;
      if (j + 1 < chunks.length) {
        const nextConsonants = chunks[j + 1].text;
        if (j + 2 < chunks.length) {
          if (nextConsonants.length === 1) {
            syllables.push(temp);
            temp = "";
          } else {
            let splitIdx = 1;
            // if the suffix of consonants is a valid onset, split there
            for (let k = 0; k < nextConsonants.length; k++) {
              const suffix = nextConsonants.substring(k).toLowerCase();
              if (onsets.includes(suffix) || nextConsonants.length - k === 1) {
                splitIdx = k;
                break;
              }
            }
            if (splitIdx === 0 && temp.length > 0) {
               // keep temp as is
            } else {
               temp += nextConsonants.substring(0, splitIdx);
            }
            syllables.push(temp);
            temp = nextConsonants.substring(splitIdx);
            j++;
          }
        } else {
          temp += nextConsonants;
          syllables.push(temp);
          temp = "";
          j++;
        }
      } else {
        syllables.push(temp);
        temp = "";
      }
    } else {
      temp += chunk.text;
    }
  }
  
  if (temp) {
    if (syllables.length > 0) {
      syllables[syllables.length - 1] += temp;
    } else {
      syllables.push(temp);
    }
  }
  
  if (syllables.length <= 1) return word;
  
  return syllables.join("·");
}
