import nlp from "compromise";
import nlpSyllables from "compromise-syllables";
nlp.extend(nlpSyllables);

let doc = nlp('boyfriend');
console.log(doc.syllables());
