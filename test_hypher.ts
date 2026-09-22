import Hypher from "hypher";
import english from "hyphenation.en-us";

const h = new Hypher(english);
console.log(h.hyphenate("boyfriend").join('·'));
