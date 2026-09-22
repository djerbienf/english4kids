import { Lesson, AppParameters } from "../types";
import { getAppParameters } from "./parameters";

export function buildConfiguredLesson(
  resolvedLesson: any,
  dictionaryWords: any[],
  appParams: AppParameters,
): Lesson {
  const title = resolvedLesson.title;
  const isFamily =
    title.toLowerCase().includes("family") ||
    title.toLowerCase().includes("people");
  

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
        ? resolvedLesson.clozeDistractors
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
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
        return [
          {
            id: act.id || "v_step_" + resolvedLesson.id + "_" + idx,
            type: "video",
            title: act.videoTitle || act.title || videoTitle,
            description: act.videoDesc || act.description || videoDesc,
            videoUrl: act.videoUrl || videoUrl,
            videoStart: act.videoStart || resolvedLesson?.videoStart,
            videoEnd: act.videoEnd || resolvedLesson?.videoEnd,
            videoPreventSkipping:
              act.videoPreventSkipping ?? appParams.videoPreventSkipping,
            videoShowSubtitles:
              act.videoShowSubtitles ?? appParams.videoShowSubtitles,
            videoShowTranscript:
              act.videoShowTranscript ?? appParams.videoShowTranscript,
            videoAllowSpeedControl:
              act.videoAllowSpeedControl ?? appParams.videoAllowSpeedControl,
            videoMaxReplays: act.videoMaxReplays ?? appParams.videoMaxReplays,
          },
        ];
      }
      if (act.type === "Flashcards" || act.type === "Flashcards-sm2" || act.type === "Grammar Flashcards") {
        const isSm2 = act.type === "Flashcards-sm2";
        const commonFlashcardConfig = {
          flashcardTolerance:
            act.flashcardTolerance ?? appParams.flashcardTolerance,
          flashcardUseHints:
            act.flashcardUseHints ?? appParams.flashcardUseHints,
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
          flashcardAttemptsMode:
            act.flashcardAttemptsMode ?? appParams.flashcardAttemptsMode,
          flashcardMaxAttempts:
            act.flashcardMaxAttempts ?? appParams.flashcardMaxAttempts,
        };

        if (act.flashcardWordIds && act.flashcardWordIds.length > 0) {
          return act.flashcardWordIds
            .map((id: string, wordIdx: number) => {
              const dictEntry = dictionaryWords.find((w: any) => w.id === id);
              if (!dictEntry) return null;

              return {
                id:
                  (act.id || "f_step_" + resolvedLesson.id + "_" + idx) +
                  "_word_" +
                  wordIdx,
                type: isSm2 ? "flashcard-sm2" : "flashcard",
                word: dictEntry.lemma || dictEntry.word,
                translation_ar:
                  dictEntry.senses?.[0]?.translation_ar ||
                  dictEntry.translation ||
                  "",
                example:
                  dictEntry.senses?.[0]?.examples?.[0] ||
                  dictEntry.senses?.[0]?.example ||
                  dictEntry.example ||
                  "",
                audioUrl: dictEntry.senses?.[0]?.assets?.audio?.us || dictEntry.senses?.[0]?.assets?.audio?.uk || dictEntry.audioUrl || "",
                imageUrl: dictEntry.senses?.[0]?.assets?.image || dictEntry.imageUrl || "",
                ...commonFlashcardConfig,
              };
            })
            .filter(Boolean);
        }

        return [
          {
            id: act.id || "f_step_" + resolvedLesson.id + "_" + idx,
            type: isSm2 ? "flashcard-sm2" : "flashcard",
            word: act.flashcardWord || flashcardWord,
            translation_ar: act.flashcardTrans || flashcardTrans,
            example: act.flashcardExample || flashcardExample,
            ...commonFlashcardConfig,
          },
        ];
      }
      if (act.type === "Cloze") {
        let actDistractors = act.clozeDistractors || clozeDistributors;
        if (typeof actDistractors === "string") {
          actDistractors = actDistractors
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
        return [
          {
            id: act.id || "c_step_" + resolvedLesson.id + "_" + idx,
            type: "cloze",
            sentenceBeforeGap: act.clozeSentenceBefore || clozeSentenceBefore,
            sentenceAfterGap: act.clozeSentenceAfter || clozeSentenceAfter,
            correctAnswer: act.clozeCorrect || clozeCorrect,
            distractors: actDistractors,
            clozeTolerance: act.clozeTolerance ?? appParams.clozeTolerance,
            clozeShowChoices:
              act.clozeShowChoices ?? appParams.clozeShowChoices,
            clozeFullText: act.clozeFullText,
            clozeGapIndices: act.clozeGapIndices,
          },
        ];
      }
      if (act.type === "Reading") {
        let actSlides = act.readingSlides || normalizedReadingSlides;
        if (
          Array.isArray(act.readingSlides) &&
          typeof act.readingSlides[0] === "string"
        ) {
          actSlides = act.readingSlides.map((slide: string) => ({
            text: slide,
            imageUrl: act.readingImageUrl || resolvedLesson.readingImageUrl,
            audioUrl: act.readingAudioUrl || resolvedLesson.readingAudioUrl,
            unscrambleText:
              act.readingUnscrambleText || resolvedLesson.readingUnscrambleText,
            vocabulary:
              act.readingVocabulary || resolvedLesson.readingVocabulary || [],
          }));
        }
        return [
          {
            id: act.id || "r_step_" + resolvedLesson.id + "_" + idx,
            type: "reading",
            readingType: act.readingType || readingType,
            readingTitle: act.readingTitle || resolvedLesson.readingTitle,
            readingSlides: actSlides,
            readingTapForTranslation:
              act.readingTapForTranslation ??
              appParams.readingTapForTranslation,
            readingAutoPlayAudio:
              act.readingAutoPlayAudio ?? appParams.readingAutoPlayAudio,
          },
        ];
      }
      if (act.type === "Dictation") {
        // Fallback for single legacy dictation
        const legacySlide =
          act.dictationAudioUrl || act.dictationCorrectText
            ? [
                {
                  audioUrl: act.dictationAudioUrl || "",
                  correctText: act.dictationCorrectText || "",
                  translation: act.dictationTranslation || "",
                },
              ]
            : [];

        return [
          {
            id: act.id || "d_step_" + resolvedLesson.id + "_" + idx,
            type: "dictation",
            dictationSlides:
              Array.isArray(act.dictationSlides) &&
              act.dictationSlides.length > 0
                ? act.dictationSlides
                : legacySlide,
            dictationTolerance:
              act.dictationTolerance ?? appParams.dictationTolerance,
            dictationShowTranslation:
              act.dictationShowTranslation ??
              appParams.dictationShowTranslation,
          },
        ];
      }
      if (act.type === "Matching") {
        let pairs = (act.matchingPairs || []).map((p: any, pIdx: number) => ({
          id: p.id || `m_pair_${idx}_${pIdx}`,
          left: p.left || "",
          right: p.right || "",
          imageUrl: p.imageUrl || "",
          audioUrl: p.audioUrl || "",
        })).filter((p: any) => p.left && p.right);

        if (act.dictionaryWordIds && act.dictionaryWordIds.length > 0) {
           const dictPairs = act.dictionaryWordIds.map((id: string, index: number) => {
             const dictEntry = dictionaryWords.find((w: any) => w.id === id);
             if (!dictEntry) return null;
             return {
               id: `m_dyn_${idx}_${index}`,
               left: dictEntry.lemma || dictEntry.word,
               right: dictEntry.senses?.[0]?.translation_ar || dictEntry.translation || "No translation",
               imageUrl: dictEntry.senses?.[0]?.assets?.image || dictEntry.imageUrl || "",
               audioUrl: dictEntry.senses?.[0]?.assets?.audio?.us || dictEntry.senses?.[0]?.assets?.audio?.uk || dictEntry.audioUrl || ""
             };
           }).filter(Boolean);
           pairs = [...pairs, ...dictPairs];
        }
        return [
          {
            id: act.id || "m_step_" + resolvedLesson.id + "_" + idx,
            type: "matching",
            pairs: pairs,
          },
        ];
      }
      if (act.type === "Listening") {
        return [
          {
            id: act.id || "l_step_" + resolvedLesson.id + "_" + idx,
            type: "listening",
            title: act.title || act.listeningTitle || "",
            audioUrl: act.listeningAudioUrl || "",
            transcript: act.listeningTranscript || "",
            questions: act.listeningQuestions || [],
          },
        ];
      }
      if (act.type === "Listen and Repeat") {
        return [
          {
            id: act.id || "lr_step_" + resolvedLesson.id + "_" + idx,
            type: "listen_and_repeat",
            title: act.title || "",
            items: act.listenAndRepeatItems || [],
          },
        ];
      }
      if (act.type === "Multiple Choice") {
        return [
          {
            id: act.id || "mc_step_" + resolvedLesson.id + "_" + idx,
            type: "multiple_choice",
            question: act.multipleChoiceQuestion || "",
            options: act.multipleChoiceOptions || [],
            correctAnswer: act.multipleChoiceCorrectAnswer || "",
          },
        ];
      }
      if (act.type === "Writing" || act.type === "writing") {
        return [
          {
            id: act.id || "w_step_" + resolvedLesson.id + "_" + idx,
            type: "writing",
            writingTitle: act.writingTitle || act.title || "Writing Activity",
            writingPrompt: act.writingPrompt || "Write a paragraph responding to the prompt.",
            writingInstructions: act.writingInstructions || "",
            writingStarterText: act.writingStarterText || "",
            minWords: act.minWords ?? 20,
            maxWords: act.maxWords ?? 0,
            requiredKeywords: Array.isArray(act.requiredKeywords)
              ? act.requiredKeywords
              : typeof act.requiredKeywords === "string"
              ? act.requiredKeywords.split(",").map((s: string) => s.trim()).filter(Boolean)
              : [],
            sampleAnswer: act.sampleAnswer || "",
            evaluationCriteria: Array.isArray(act.evaluationCriteria) ? act.evaluationCriteria : [],
            allowAiFeedback: act.allowAiFeedback !== false,
            imageUrl: act.imageUrl || act.writingImageUrl || "",
          },
        ];
      }
      if (act.type === "Speaking") {
        const targetWord = act.speakingTargetText || act.speakingPrompt || "Hello";
        return [
          {
            id: act.id || "spk_step_" + resolvedLesson.id + "_" + idx,
            type: "listen_and_repeat",
            title: act.title || act.speakingPrompt || "Speaking Practice",
            items: [
              {
                id: `spk_item_${idx}`,
                word: targetWord,
                syllables: act.speakingSyllables || targetWord,
                audioUrl: act.speakingAudioUrl || "",
                pronunciation: act.speakingSyllables || "",
              },
            ],
          },
        ];
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
