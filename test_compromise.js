import nlp from "compromise";
import nlpSyllables from "compromise-syllables";
nlp.plugin(nlpSyllables);

let doc = nlp('boyfriend');
console.log(doc.terms().syllables());
