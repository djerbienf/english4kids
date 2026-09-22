export type ObjectiveArea = "Grammar" | "Vocabulary" | "Functional Language" | "Pronunciation";

// Backwards-compatible type alias for older categories if referenced
export type ObjectiveCategory = ObjectiveArea | string;

export interface PredefinedObjective {
  id: string;
  category: ObjectiveArea;
  subCategory: string;
  cognitiveAction: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | string;
  text: string;
}

export interface LessonObjective {
  id: string;
  category: string; // Major Dimension / Area
  subCategory?: string; // Specific Sub-category
  cognitiveAction?: string; // Cognitive Action
  level: string; // CEFR level
  text: string; // Competency text
  isCustom?: boolean;
}

export const TAXONOMY_AREAS: ObjectiveArea[] = [
  "Grammar",
  "Vocabulary",
  "Functional Language",
  "Pronunciation"
];

export const TAXONOMY_SUB_CATEGORIES: Record<ObjectiveArea, string[]> = {
  Grammar: [
    "Present Tenses",
    "Past Tenses",
    "Future Forms",
    "Modals",
    "Conditionals",
    "Prepositions",
    "Articles",
    "Passive Voice",
    "Relative Clauses",
    "Phrasal Verbs",
    "Adjectives & Adverbs",
    "Pronouns",
    "Noun Plurals & Gender",
    "Conjunctions & Connectors",
    "Question Formation",
    "Imperatives & Requests",
    "Subjunctive Mood",
    "Sentence Structure (Word Order)"
  ],
  Vocabulary: [
    "Daily Routine",
    "Travel & Transport",
    "Work & Business",
    "Food & Dining",
    "Health & Medicine",
    "Environment & Nature",
    "Technology & Media",
    "Emotions & Feelings",
    "Hobbies & Free Time",
    "Shopping & Money",
    "Family & Relationships",
    "Clothes & Fashion",
    "Weather & Seasons",
    "Education & School",
    "House & Home",
    "Town & Directions"
  ],
  "Functional Language": [
    "Asking for Directions",
    "Ordering Food",
    "Agreeing & Disagreeing",
    "Giving Advice",
    "Apologizing",
    "Negotiating",
    "Expressing Opinions",
    "Making Requests",
    "Greeting & Welcoming",
    "Inviting & Responding",
    "Describing Experiences",
    "Complaining & Resolving",
    "Clarifying & Repeating"
  ],
  Pronunciation: [
    "Individual Sounds (Phonemes)",
    "Word Stress",
    "Sentence Intonation",
    "Connected Speech (Liaisons/Elisions)",
    "Minimal Pairs",
    "Syllables & Rhythm"
  ]
};

export interface BloomLevel {
  level: string;
  description: string;
  example: string;
}

export const BLOOMS_TAXONOMY: BloomLevel[] = [
  {
    level: "Recognize / Identify",
    description: "The student can spot the correct word/form in multiple-choice or interactive context.",
    example: "Spotting the correct auxiliary verb in a multiple-choice question."
  },
  {
    level: "Understand / Translate",
    description: "The student can match words, comprehend definitions, or translate between languages.",
    example: "Matching English phrasal verbs with their corresponding Arabic translations."
  },
  {
    level: "Apply / Use in context",
    description: "The student can fill in blanks (Cloze) or use structures to build correct sentences.",
    example: "Filling in a blank (Cloze) with the correct conjugated conditional verb."
  },
  {
    level: "Analyze / Differentiate",
    description: "The student can choose between contrasting words/structures depending on semantic context.",
    example: "Choosing between 'make' vs 'do' or 'for' vs 'since' based on contextual cues."
  },
  {
    level: "Produce / Create",
    description: "The student can actively write or speak free-text sentences using target vocabulary or grammar.",
    example: "Writing a free-form email or paragraph applying phrasal verbs or modals."
  }
];

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export function buildObjectiveText(
  area: ObjectiveArea,
  subCategory: string,
  cognitiveAction: string,
  level: string
): string {
  const cleanAction = cognitiveAction.split(" (")[0];
  let explanation = "";

  switch (cleanAction) {
    case "Recognize / Identify":
      explanation = `spot, recognize, and identify the correct usage of ${subCategory} in receptive or multiple-choice formats.`;
      break;
    case "Understand / Translate":
      explanation = `comprehend the concept of ${subCategory}, match related terms, or translate accurately.`;
      break;
    case "Apply / Use in context":
      explanation = `correctly apply and use ${subCategory} structures in contextual tasks, such as gap-fill (Cloze) exercises.`;
      break;
    case "Analyze / Differentiate":
      explanation = `analyze, contrast, and differentiate between subtle nuances or contrasting options for ${subCategory}.`;
      break;
    case "Produce / Create":
      explanation = `actively produce and create free-form written sentences or spoken statements incorporating ${subCategory}.`;
      break;
    default:
      explanation = `demonstrate active competence in ${subCategory}.`;
  }

  return `${cleanAction} of ${subCategory} at ${level} level: The student can ${explanation}`;
}

// Curated high-quality predefined objectives mapped to our new taxonomy
export const PREDEFINED_OBJECTIVES: PredefinedObjective[] = [
  // Grammar Predefined
  {
    id: "g1",
    category: "Grammar",
    subCategory: "Present Tenses",
    cognitiveAction: "Apply / Use in context",
    level: "A1",
    text: "Apply / Use in context of Present Tenses at A1 level: The student can correctly use the simple present tense to describe routine activities in gap-fill tasks."
  },
  {
    id: "g2",
    category: "Grammar",
    subCategory: "Past Tenses",
    cognitiveAction: "Apply / Use in context",
    level: "A2",
    text: "Apply / Use in context of Past Tenses at A2 level: The student can correctly apply and use simple past tense endings to recount completed weekend activities."
  },
  {
    id: "g3",
    category: "Grammar",
    subCategory: "Conditionals",
    cognitiveAction: "Apply / Use in context",
    level: "B1",
    text: "Apply / Use in context of Conditionals at B1 level: The student can fill in a blank (Cloze) with the correct first conditional structure."
  },
  {
    id: "g4",
    category: "Grammar",
    subCategory: "Conditionals",
    cognitiveAction: "Analyze / Differentiate",
    level: "B2",
    text: "Analyze / Differentiate of Conditionals at B2 level: The student can choose between second and third conditionals depending on hypothetical contexts."
  },
  {
    id: "g5",
    category: "Grammar",
    subCategory: "Passive Voice",
    cognitiveAction: "Produce / Create",
    level: "B2",
    text: "Produce / Create of Passive Voice at B2 level: The student can type a free-text sentence rewriting active sentences into the passive voice."
  },
  {
    id: "g6",
    category: "Grammar",
    subCategory: "Phrasal Verbs",
    cognitiveAction: "Understand / Translate",
    level: "B1",
    text: "Understand / Translate of Phrasal Verbs at B1 level: The student can understand and match common phrasal verbs (e.g., 'give up', 'look forward to') to their definitions."
  },

  // Vocabulary Predefined
  {
    id: "v1",
    category: "Vocabulary",
    subCategory: "Daily Routine",
    cognitiveAction: "Recognize / Identify",
    level: "A1",
    text: "Recognize / Identify of Daily Routine at A1 level: The student can spot routine action words (e.g., 'wake up', 'have breakfast') in a basic multiple choice quiz."
  },
  {
    id: "v2",
    category: "Vocabulary",
    subCategory: "Food & Dining",
    cognitiveAction: "Understand / Translate",
    level: "A2",
    text: "Understand / Translate of Food & Dining at A2 level: The student can match vocabulary related to restaurant menus and food preparation to their native meaning."
  },
  {
    id: "v3",
    category: "Vocabulary",
    subCategory: "Work & Business",
    cognitiveAction: "Apply / Use in context",
    level: "B2",
    text: "Apply / Use in context of Work & Business at B2 level: The student can correctly fill in business vocabulary (e.g., 'revenue', 'negotiate') in context-rich emails."
  },

  // Functional Predefined
  {
    id: "f1",
    category: "Functional Language",
    subCategory: "Ordering Food",
    cognitiveAction: "Produce / Create",
    level: "A2",
    text: "Produce / Create of Ordering Food at A2 level: The student can produce polite sentences to order a meal and ask for the bill at a restaurant."
  },
  {
    id: "f2",
    category: "Functional Language",
    subCategory: "Agreeing & Disagreeing",
    cognitiveAction: "Analyze / Differentiate",
    level: "B1",
    text: "Analyze / Differentiate of Agreeing & Disagreeing at B1 level: The student can choose between polite and impolite expressions depending on formal vs. informal situations."
  },

  // Pronunciation Predefined
  {
    id: "p1",
    category: "Pronunciation",
    subCategory: "Word Stress",
    cognitiveAction: "Recognize / Identify",
    level: "A2",
    text: "Recognize / Identify of Word Stress at A2 level: The student can identify the stressed syllable in common two-syllable nouns and verbs."
  },
  {
    id: "p2",
    category: "Pronunciation",
    subCategory: "Sentence Intonation",
    cognitiveAction: "Apply / Use in context",
    level: "B1",
    text: "Apply / Use in context of Sentence Intonation at B1 level: The student can audibly recognize and apply rising/falling intonation for statements vs. questions."
  }
];
