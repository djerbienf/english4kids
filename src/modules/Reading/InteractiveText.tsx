import React from "react";
import { ReadingVocabulary } from "../../types";
import { VocabWord } from "./VocabWord";

export function InteractiveText({
  text,
  vocabulary,
}: {
  text: string;
  vocabulary?: ReadingVocabulary[];
}) {
  if (!vocabulary || vocabulary.length === 0) return <span>{text}</span>;

  let parts: React.ReactNode[] = [text];

  vocabulary.forEach((vocab, vIndex) => {
    if (!vocab.word) return;
    const trimWord = vocab.word.trim();
    if (!trimWord) return;
    
    // Word boundary that supports French accented characters
    const escapeRegExp = (string: string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeWord = escapeRegExp(trimWord);
    const wordRegex = new RegExp(
      `(^|[^a-zA-ZÀ-ÿ])(${safeWord})(?=[^a-zA-ZÀ-ÿ]|$)`,
      "gi",
    );

    const newParts: React.ReactNode[] = [];
    parts.forEach((part, pIndex) => {
      if (typeof part === "string") {
        const splitText = part.split(wordRegex);
        splitText.forEach((segment, sIndex) => {
          if (segment && segment.toLowerCase() === trimWord.toLowerCase()) {
            newParts.push(
              <VocabWord
                key={`${vIndex}-${pIndex}-${sIndex}`}
                vocab={vocab}
                text={segment}
              />,
            );
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

  return (
    <span>
      {parts.map((p, i) => (
        <React.Fragment key={i}>{p}</React.Fragment>
      ))}
    </span>
  );
}
