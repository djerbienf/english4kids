import { getSyllables } from "./src/utils/syllables.ts";

console.log(getSyllables("boyfriend", "/ˈbɔɪ·frend/"));
console.log(getSyllables("morning", "/mɔːr·nɪŋ/"));
console.log(getSyllables("beautiful", "/ˈbjuː.tɪ.fəl/"));
console.log(getSyllables("boyfriend")); // fallback
