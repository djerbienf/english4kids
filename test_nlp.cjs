const nlp = require('nlp_compromise');
const syllables = require('nlp-syllables');
nlp.plugin(syllables);

const term = nlp.term('boyfriend');
console.log(term.syllables());
