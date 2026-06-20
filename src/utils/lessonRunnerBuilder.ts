import { Lesson } from "../types";

export function buildConfiguredLesson(resolvedLesson: any, dictionaryWords: any[]): Lesson {
  const title = resolvedLesson.title;
  const isFamily = title.toLowerCase().includes("family") || title.toLowerCase().includes("people");

  // Extract dynamic fields (with fallback if the teacher didn't edit them)
  const videoUrl =
    resolvedLesson?.videoUrl ||
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  const videoTitle = resolvedLesson?.videoTitle || `Video: ${title}`;
  const videoDesc =
    resolvedLesson?.videoDesc ||
    "Watch this video carefully to understand the lesson and do the exercises.";

  const flashcardWord =
    resolvedLesson?.flashcardWord ||
    (isFamily ? "Family Members" : "Greetings vocab");
  const flashcardTrans =
    resolvedLesson?.flashcardTrans ||
    (isFamily ? "أفراد العائلة" : "مفردات التحيات");
  const flashcardExample =
    resolvedLesson?.flashcardExample ||
    (isFamily
      ? "My family provides continuous support."
      : "Always start with a pleasant greeting.");

  const clozeSentenceBefore =
    resolvedLesson?.clozeSentenceBefore ||
    (isFamily ? "We are a close knit " : "Have a great ");
  const clozeSentenceAfter =
    resolvedLesson?.clozeSentenceAfter ||
    (isFamily ? " that shares everything." : " head start of the day!");
  const clozeCorrect =
    resolvedLesson?.clozeCorrect || (isFamily ? "family" : "morning");

  let clozeDistributors = ["automobile", "vegetable", "water"];
  if (resolvedLesson?.clozeDistractors) {
    clozeDistributors = Array.isArray(resolvedLesson.clozeDistractors)
      ? resolvedLesson.clozeDistractors
      : typeof resolvedLesson.clozeDistractors === "string"
        ? resolvedLesson.clozeDistractors.split(",").map((s: string) => s.trim()).filter(Boolean)
        : ["automobile", "vegetable", "water"];
  }

  const readingType = resolvedLesson?.readingType || "text";
  let readingSlides = resolvedLesson?.readingSlides || ["Once upon a time..."];

  const normalizedReadingSlides = readingSlides.map((slide: any) => {
    if (typeof slide === "string") {
      return {
        text: slide,
        imageUrl: resolvedLesson.readingImageUrl,
        audioUrl: resolvedLesson.readingAudioUrl,
        unscrambleText: resolvedLesson.readingUnscrambleText,
        vocabulary: resolvedLesson.readingVocabulary || [],
      };
    }
    return slide;
  });

  const teacherActivities = resolvedLesson?.activities || [
    { id: 1, type: "Watching" },
    { id: 2, type: "Flashcards" },
    { id: 3, type: "Cloze" },
    { id: 4, type: "Reading" },
  ];

  const mappedActivities = teacherActivities
    .flatMap((act: any, idx: number) => {
      if (act.type === "Watching") {
        return [{
          id: act.id || "v_step_" + resolvedLesson.id + "_" + idx,
          type: "video",
          title: act.videoTitle || act.title || videoTitle,
          description: act.videoDesc || act.description || videoDesc,
          videoUrl: act.videoUrl || videoUrl,
          videoStart: act.videoStart || resolvedLesson?.videoStart,
          videoEnd: act.videoEnd || resolvedLesson?.videoEnd,
        }];
      }
      if (act.type === "Flashcards") {
        const commonFlashcardConfig = {
          flashcardLearnMode: act.flashcardLearnMode,
          flashcardTolerance: act.flashcardTolerance,
          flashcardUseHints: act.flashcardUseHints,
          flashcardHintLength: act.flashcardHintLength,
          flashcardHintFirstLetter: act.flashcardHintFirstLetter,
          flashcardHintWholeWord: act.flashcardHintWholeWord,
          flashcardHintPenalty: act.flashcardHintPenalty,
          flashcardShowImage: act.flashcardShowImage,
          flashcardShowWord: act.flashcardShowWord,
          flashcardShowPhonetics: act.flashcardShowPhonetics,
          flashcardShowAudio: act.flashcardShowAudio,
          flashcardFeedback: act.flashcardFeedback,
          flashcardUseTimer: act.flashcardUseTimer,
          flashcardTimerSeconds: act.flashcardTimerSeconds,
          flashcardReward: act.flashcardReward,
          flashcardPassingScore: act.flashcardPassingScore,
          flashcardAttemptsMode: act.flashcardAttemptsMode,
          flashcardMaxAttempts: act.flashcardMaxAttempts,
        };

        if (act.flashcardWordIds && act.flashcardWordIds.length > 0) {
          return act.flashcardWordIds.map((id: string, wordIdx: number) => {
            const dictEntry = dictionaryWords.find((w: any) => w.id === id);
            if (!dictEntry) return null;

            return {
              id: (act.id || "f_step_" + resolvedLesson.id + "_" + idx) + "_word_" + wordIdx,
              type: "flashcard",
              word: dictEntry.lemma || dictEntry.word,
              translation_ar: dictEntry.senses?.[0]?.translation_ar || dictEntry.translation || "",
              example: dictEntry.senses?.[0]?.examples?.[0] || dictEntry.senses?.[0]?.example || dictEntry.example || "Learn this word thoroughly.",
              ...commonFlashcardConfig
            };
          }).filter(Boolean);
        }

        return [{
          id: act.id || "f_step_" + resolvedLesson.id + "_" + idx,
          type: "flashcard",
          word: act.flashcardWord || flashcardWord,
          translation_ar: act.flashcardTrans || flashcardTrans,
          example: act.flashcardExample || flashcardExample,
          ...commonFlashcardConfig
        }];
      }
      if (act.type === "Cloze") {
        let actDistractors = (act.clozeDistractors || clozeDistributors);
        if (typeof actDistractors === "string") {
          actDistractors = actDistractors.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
        return [{
          id: act.id || "c_step_" + resolvedLesson.id + "_" + idx,
          type: "cloze",
          sentenceBeforeGap: act.clozeSentenceBefore || clozeSentenceBefore,
          sentenceAfterGap: act.clozeSentenceAfter || clozeSentenceAfter,
          correctAnswer: act.clozeCorrect || clozeCorrect,
          distractors: actDistractors,
        }];
      }
      if (act.type === "Reading") {
        let actSlides = act.readingSlides || normalizedReadingSlides;
        if (Array.isArray(act.readingSlides) && typeof act.readingSlides[0] === "string") {
          actSlides = act.readingSlides.map((slide: string) => ({
            text: slide,
            imageUrl: act.readingImageUrl || resolvedLesson.readingImageUrl,
            audioUrl: act.readingAudioUrl || resolvedLesson.readingAudioUrl,
            unscrambleText: act.readingUnscrambleText || resolvedLesson.readingUnscrambleText,
            vocabulary: act.readingVocabulary || resolvedLesson.readingVocabulary || [],
          }));
        }
        return [{
          id: act.id || "r_step_" + resolvedLesson.id + "_" + idx,
          type: "reading",
          readingType: act.readingType || readingType,
          readingTitle: act.readingTitle || resolvedLesson.readingTitle,
          readingSlides: actSlides,
        }];
      }
      return [];
    })
    .filter(Boolean);

  const configuredLesson: Lesson = {
    id: resolvedLesson.id,
    title: title,
    xpReward: 20,
    activities: mappedActivities,
  };
  (configuredLesson as any)._unitId = resolvedLesson._unitId;
  return configuredLesson;
}
