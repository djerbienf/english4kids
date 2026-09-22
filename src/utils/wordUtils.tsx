import React from "react";

export const syllableColors = [
  "text-blue-700",
  "text-green-700",
  "text-purple-700",
  "text-orange-700",
  "text-teal-700",
  "text-pink-700",
];

export const renderColoredWord = (word: string, syllables?: string) => {
  if (!syllables) return word;
  // Split by common syllable separators
  const parts = syllables.split(/[\·\-\.]/).filter(Boolean);
  if (parts.length <= 1) return word;

  const joinedSyllables = parts.join("").toLowerCase();
  const wordAlpha = word.toLowerCase();

  if (joinedSyllables === wordAlpha) {
    let currentIndex = 0;
    return (
      <span className="flex justify-center gap-[1px]">
        {parts.map((part, index) => {
          const originalPart = word.substring(currentIndex, currentIndex + part.length);
          currentIndex += part.length;
          return (
            <span key={index} className={syllableColors[index % syllableColors.length]}>
              {originalPart}
            </span>
          );
        })}
      </span>
    );
  }
  return word;
};

export const renderColoredSyllables = (syllables: string) => {
  if (!syllables) return null;
  const parts = syllables.split(/([\·\-\.])/).filter(Boolean);
  
  let syllableIndex = 0;
  return (
    <span className="flex justify-center">
      {parts.map((part, index) => {
        const isSeparator = /[\·\-\.]/.test(part);
        if (isSeparator) {
          return <span key={index} className="text-[#8888aa] px-[1px]">{part}</span>;
        }
        const colorClass = syllableColors[syllableIndex % syllableColors.length];
        syllableIndex++;
        return (
          <span key={index} className={`${colorClass} font-bold`}>
            {part}
          </span>
        );
      })}
    </span>
  );
};
