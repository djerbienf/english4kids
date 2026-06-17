import React from "react";
import * as t from "@babel/core"; // Just to show we don't need real React rendering
// Actually we can just run the logic

const vocabulary = [
  { word: "language", translation: "langue" },
  { word: "Morning", translation: "matin" }
];
const text = "Morning Learning a new language is an exciting journey.";

let parts = [text];

vocabulary.forEach((vocab, vIndex) => {
    if (!vocab.word) return;
    const escapeRegExp = (string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeWord = escapeRegExp(vocab.word);
    const wordRegex = new RegExp(
      `(^|[^a-zA-ZÀ-ÿ])(${safeWord})(?=[^a-zA-ZÀ-ÿ]|$)`,
      "gi",
    );

    const newParts = [];
    parts.forEach((part, pIndex) => {
      if (typeof part === "string") {
        const splitText = part.split(wordRegex);
        splitText.forEach((segment, sIndex) => {
          if (segment && segment.toLowerCase() === vocab.word.toLowerCase()) {
             newParts.push({ vocab: vocab.word, component: segment });
          } else if (segment) {
            newParts.push(segment);
          }
        });
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
});

console.log(JSON.stringify(parts, null, 2));
