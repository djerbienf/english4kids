import { AppParameters } from "../types";

export const DEFAULT_APP_PARAMETERS: AppParameters = {
  // Flashcard defaults
  flashcardTolerance: "Normale",
  flashcardAttemptsMode: "infinite",
  flashcardMaxAttempts: 3,
  flashcardUseHints: true,

  // Video defaults
  videoPreventSkipping: false,
  videoShowSubtitles: true,
  videoShowTranscript: false,
  videoAllowSpeedControl: true,
  videoMaxReplays: "unlimited",

  // Reading defaults
  readingTapForTranslation: true,
  readingAutoPlayAudio: false,

  // Cloze defaults
  clozeTolerance: "Stricte",
  clozeShowChoices: true,

  // Dictation defaults
  dictationTolerance: "Stricte",
  dictationShowTranslation: true,
  
  // Timer defaults
  flashcardWriteTimerDuration: 12,
};

export const getAppParameters = (): AppParameters => {
  const stored = localStorage.getItem("lms_machine_parameters");
  if (!stored) return DEFAULT_APP_PARAMETERS;
  try {
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_APP_PARAMETERS, ...parsed };
  } catch (err) {
    return DEFAULT_APP_PARAMETERS;
  }
};

export const saveAppParameters = (params: AppParameters): void => {
  localStorage.setItem("lms_machine_parameters", JSON.stringify(params));
};
