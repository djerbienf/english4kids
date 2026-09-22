import { StudentCompetency, StudentRemediation, LessonObjective, ActivityConfig } from "../types";

// Default parameters for the spiral pedagogy engine
export const SPIRAL_CONFIG = {
  seuil_acquisition: 0.85, // Score >= 0.85 means Mastered / Acclimated
  seuil_faible: 0.50,       // Score < 0.50 means Fragile
  recall_ratio: 0.35,      // 30-40% recall items in tests
  new_ratio: 0.65,         // 60-70% new items in tests
};

/**
 * LocalStorage wrapper for Student Competency Tracking
 */
export function getStudentCompetencies(studentId: string): StudentCompetency[] {
  try {
    const raw = localStorage.getItem(`lms_spiral_competencies_${studentId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading spiral competencies from storage", e);
  }
  return [];
}

export function saveStudentCompetencies(studentId: string, comps: StudentCompetency[]): void {
  try {
    localStorage.setItem(`lms_spiral_competencies_${studentId}`, JSON.stringify(comps));
  } catch (e) {
    console.error("Error saving spiral competencies to storage", e);
  }
}

/**
 * LocalStorage wrapper for Student Remediations
 */
export function getStudentRemediations(studentId: string): StudentRemediation[] {
  try {
    const raw = localStorage.getItem(`lms_spiral_remediations_${studentId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading spiral remediations from storage", e);
  }
  return [];
}

export function saveStudentRemediations(studentId: string, rems: StudentRemediation[]): void {
  try {
    localStorage.setItem(`lms_spiral_remediations_${studentId}`, JSON.stringify(rems));
  } catch (e) {
    console.error("Error saving spiral remediations to storage", e);
  }
}

/**
 * Select recall competencies based on the 3 priorities in the spec:
 * 1. Near-critical mastery score (between 0.5 and 0.85).
 * 2. Longest elapsed time since last tested (older lastTestedStep).
 * 3. Categorical cross-reinforcement with the new objectives (matching category).
 */
export function selectRecallCompetencies(
  studentId: string,
  newObjectives: LessonObjective[],
  currentLessonId: string,
  limit: number = 3
): StudentCompetency[] {
  const comps = getStudentCompetencies(studentId);
  if (comps.length === 0) return [];

  // Exclude competencies that are already part of the new objectives
  const newTextSet = new Set(newObjectives.map(o => o.text.toLowerCase()));
  const candidates = comps.filter(c => !newTextSet.has(c.competency.toLowerCase()));

  if (candidates.length === 0) return [];

  // Map of category matching
  const newCategories = new Set(newObjectives.map(o => o.category));

  // Score each candidate according to specification priorities
  const scoredCandidates = candidates.map(c => {
    let score = 0;

    // 1. Mastery close to critical threshold (0.5 to 0.85) gets highest priority
    if (c.masteryScore >= 0.50 && c.masteryScore < 0.85) {
      score += 100; // Large boost
      // Closer to the center of the threshold (0.68) gets slightly higher weight
      const distanceToCenter = Math.abs(c.masteryScore - 0.68);
      score += (1 - distanceToCenter) * 10;
    } else if (c.masteryScore < 0.50) {
      score += 50; // Fragile competencies also need testing
    } else {
      score += 10; // Already mastered ones get low recall score
    }

    // 2. Longest elapsed time since last tested (approximate based on steps)
    // If it was tested long ago, increase weight
    const stepsAgo = c.history.length;
    score += Math.min(stepsAgo * 15, 60);

    // 3. Categorical connection with new objectives (Cross-reinforcement)
    if (newCategories.has(c.category)) {
      score += 30; // Category match bonus
    }

    return { competency: c, score };
  });

  // Sort by score descending and return top matches
  scoredCandidates.sort((a, b) => b.score - a.score);
  return scoredCandidates.slice(0, limit).map(x => x.competency);
}

/**
 * Update mastery scores & detect regressions, returning the updated state and proposed remediations
 */
export function processSpiralTestResults(
  studentId: string,
  currentLessonId: string,
  testScores: Record<string, number>, // Map of competencyId (objective text) to score (0 to 1)
  lessonObjectives: LessonObjective[]
): {
  updatedCompetencies: StudentCompetency[];
  newRemediations: StudentRemediation[];
} {
  const existingComps = getStudentCompetencies(studentId);
  const existingRems = getStudentRemediations(studentId);
  
  const updatedCompetencies = [...existingComps];
  const newRemediationsList: StudentRemediation[] = [];

  const timestamp = new Date().toISOString();
  const newObjectiveTexts = new Set(lessonObjectives.map(o => o.text.toLowerCase()));

  for (const [competencyText, testScore] of Object.entries(testScores)) {
    // Try to find existing competency state
    let compIdx = updatedCompetencies.findIndex(
      c => c.competency.toLowerCase() === competencyText.toLowerCase()
    );

    let comp: StudentCompetency;
    let oldScore: number | null = null;

    if (compIdx >= 0) {
      comp = updatedCompetencies[compIdx];
      oldScore = comp.masteryScore;

      // Update masteryScore using exponentially weighted moving average (60% weight to new test)
      const updatedScore = Number((comp.masteryScore * 0.4 + testScore * 0.6).toFixed(2));
      
      comp.history.push({
        step: currentLessonId,
        score: testScore,
        timestamp,
      });

      comp.lastTestedStep = currentLessonId;
      comp.masteryScore = updatedScore;
    } else {
      // First time seeing this competency! Find the objective to populate category/level
      const matchedObj = lessonObjectives.find(
        o => o.text.toLowerCase() === competencyText.toLowerCase()
      );
      
      comp = {
        id: Math.random().toString(36).substr(2, 9),
        competency: competencyText,
        category: matchedObj?.category || "General",
        level: matchedObj?.level || "A1",
        firstSeenStep: currentLessonId,
        lastTestedStep: currentLessonId,
        masteryScore: testScore,
        status: "nouvelle",
        history: [{
          step: currentLessonId,
          score: testScore,
          timestamp,
        }]
      };
      
      updatedCompetencies.push(comp);
    }

    // Determine Status based on current algorithm:
    // SI masteryScore >= seuil_acquisition -> "acquise"
    // SINON SI masteryScore en baisse par rapport au précédent (régression) -> "fragile" & REMÉDIER
    // SINON SI masteryScore entre seuil_faible et seuil_acquisition -> "en_consolidation" & RÉVISER
    // SINON -> "fragile" & REMÉDIER
    let isRegression = false;
    if (oldScore !== null && comp.masteryScore < oldScore - 0.05) {
      isRegression = true;
    }

    if (comp.masteryScore >= SPIRAL_CONFIG.seuil_acquisition) {
      comp.status = "acquise";
    } else if (isRegression) {
      comp.status = "fragile";
      
      // Propose a remediation for regression (AI proposal)
      const remId = `rem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newRemediation: StudentRemediation = {
        id: remId,
        studentId,
        competencyId: comp.id,
        competencyText: comp.competency,
        category: comp.category,
        status: "pending", // Pending teacher approval
        proposedAt: timestamp,
        activities: generateRemediationActivities(comp),
      };
      newRemediationsList.push(newRemediation);
    } else if (comp.masteryScore >= SPIRAL_CONFIG.seuil_faible) {
      comp.status = "en_consolidation";
    } else {
      comp.status = "fragile";
      
      // Also propose a remediation for very low score (< 0.5)
      const remId = `rem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newRemediation: StudentRemediation = {
        id: remId,
        studentId,
        competencyId: comp.id,
        competencyText: comp.competency,
        category: comp.category,
        status: "pending",
        proposedAt: timestamp,
        activities: generateRemediationActivities(comp),
      };
      newRemediationsList.push(newRemediation);
    }
  }

  // Save changes
  saveStudentCompetencies(studentId, updatedCompetencies);
  
  if (newRemediationsList.length > 0) {
    const combinedRems = [...existingRems, ...newRemediationsList];
    saveStudentRemediations(studentId, combinedRems);
  }

  return {
    updatedCompetencies,
    newRemediations: newRemediationsList,
  };
}

/**
 * Generate targeted remediation exercises/mini-activities for a fragile competency
 */
export function generateRemediationActivities(comp: StudentCompetency): any[] {
  const category = comp.category;
  const subCategory = comp.competency.split(" of ")[1]?.split(" at ")[0] || "Concept";
  const level = comp.level;

  return [
    {
      id: `act_rem_explain_${Date.now()}`,
      type: "reading",
      readingTitle: `💡 Mini-Remediation: Understanding ${subCategory}`,
      readingSlides: [
        {
          text: `Let's review the main rules for ${subCategory}. This is a critical concept at ${level} level. \n\nTake your time to read the explanation and memorize the examples!`,
        },
        {
          text: `Key Grammar Tip:\n- Focus on word order and auxiliary usage.\n- Pay close attention to exceptions and singular/plural forms.`,
        }
      ]
    },
    {
      id: `act_rem_quiz_${Date.now()}`,
      type: "multiple_choice",
      question: `Let's apply: Select the correct and natural form of ${subCategory}:`,
      options: [
        "The standard correct form based on rules.",
        "An incorrect form with common mistakes.",
        "A distractor that uses the wrong tense."
      ],
      correctAnswer: "The standard correct form based on rules."
    }
  ];
}

/**
 * Pre-authored educational questions bank mapped to English Categories & Levels
 * to guarantee high-fidelity interactive spiral tests
 */
export const SPIRAL_TEST_BANK: Record<string, Array<{
  question: string;
  options: string[];
  correctAnswer: string;
  translationAr: string;
  explanation: string;
}>> = {
  "grammar_a1": [
    {
      question: "Which sentence is negative and uses the Present Simple correctly?",
      options: [
        "She does not likes apples.",
        "She do not like apples.",
        "She does not like apples.",
        "She not likes apples."
      ],
      correctAnswer: "She does not like apples.",
      translationAr: "أي جملة منفية وتستخدم المضارع البسيط بشكل صحيح؟",
      explanation: "For 'she/he/it' in Present Simple negative, we use 'does not' + verb base (without -s)."
    },
    {
      question: "Choose the correct question form:",
      options: [
        "Where do you live?",
        "Where you live?",
        "Where does you live?",
        "Where do you lives?"
      ],
      correctAnswer: "Where do you live?",
      translationAr: "اختر صيغة السؤال الصحيحة:",
      explanation: "Question structure in Present Simple: Question Word + do/does + subject + verb base."
    }
  ],
  "grammar_a2": [
    {
      question: "Choose the correct past simple form: 'Yesterday, we ______ to the museum.'",
      options: [
        "go",
        "went",
        "gone",
        "was go"
      ],
      correctAnswer: "went",
      translationAr: "اختر صيغة الماضي البسيط الصحيحة: 'أمس، ذهبنا إلى المتحف.'",
      explanation: "'Went' is the irregular past tense of the verb 'go'."
    },
    {
      question: "Complete: 'I am ______ English now because I want to travel.'",
      options: [
        "study",
        "studying",
        "studies",
        "studied"
      ],
      correctAnswer: "studying",
      translationAr: "أكمل: 'أنا أدرس الإنجليزية الآن لأنني أريد السفر.'",
      explanation: "Present Continuous uses 'am/is/are' + verb-ing to show actions happening right now."
    }
  ],
  "vocabulary_a1": [
    {
      question: "What is the English word for 'الصباح'?",
      options: [
        "Evening",
        "Morning",
        "Afternoon",
        "Night"
      ],
      correctAnswer: "Morning",
      translationAr: "ما هي الكلمة الإنجليزية لـ 'الصباح'؟",
      explanation: "Morning refers to the first part of the day."
    },
    {
      question: "Which of these is a fruit?",
      options: [
        "Carrot",
        "Apple",
        "Potato",
        "Onion"
      ],
      correctAnswer: "Apple",
      translationAr: "أي من هذه فاكهة؟",
      explanation: "Apple is a sweet, round fruit, while others are vegetables."
    }
  ],
  "vocabulary_a2": [
    {
      question: "Choose the word that means 'وسيلة نقل عامة على قضبان الحديد':",
      options: [
        "Car",
        "Train",
        "Bicycle",
        "Airplane"
      ],
      correctAnswer: "Train",
      translationAr: "اختر الكلمة التي تعني وسيلة نقل عامة على قضبان حديدية:",
      explanation: "Trains run on railway tracks to transport passengers."
    }
  ],
  "functional language_a1": [
    {
      question: "How do you politely greet someone in the morning?",
      options: [
        "Good evening",
        "Good morning",
        "Good night",
        "Goodbye"
      ],
      correctAnswer: "Good morning",
      translationAr: "كيف تحيي شخصًا بأدب في الصباح؟",
      explanation: "We say 'Good morning' from sunrise until noon."
    }
  ],
  "pronunciation_a1": [
    {
      question: "Which syllable has the main stress in 'MORNING'?",
      options: [
        "The first syllable (MOR-)",
        "The second syllable (-ning)",
        "Both syllables equally",
        "No stress at all"
      ],
      correctAnswer: "The first syllable (MOR-)",
      translationAr: "أي مقطع لفظي يحتوي على النبرة الرئيسية في كلمة 'MORNING'؟",
      explanation: "In the word 'morning', the stress is on the first syllable: /'mɔ:.nɪŋ/."
    }
  ]
};

/**
 * Build dynamic questions tailored to specified objectives
 */
export function generateSpiralTestQuestions(
  newObjectives: LessonObjective[],
  recallObjectives: LessonObjective[]
): Array<{
  id: string;
  competencyText: string;
  category: string;
  level: string;
  question: string;
  options: string[];
  correctAnswer: string;
  translationAr?: string;
  explanation?: string;
}> {
  const list: any[] = [];

  // Generate for new objectives (60-70%)
  newObjectives.forEach((obj, idx) => {
    const key = `${obj.category.toLowerCase()}_${obj.level.toLowerCase()}`;
    const bankItems = SPIRAL_TEST_BANK[key] || SPIRAL_TEST_BANK["grammar_a1"];
    // Pick one question from bank
    const bankItem = bankItems[idx % bankItems.length];
    
    list.push({
      id: `new_${obj.id}_${idx}_${Date.now()}`,
      competencyText: obj.text,
      category: obj.category,
      level: obj.level,
      question: bankItem ? bankItem.question : `Choose the correct application of ${obj.subCategory || obj.category}:`,
      options: bankItem ? bankItem.options : ["Correct Option", "Incorrect Distractor A", "Incorrect Distractor B"],
      correctAnswer: bankItem ? bankItem.correctAnswer : "Correct Option",
      translationAr: bankItem?.translationAr || "",
      explanation: bankItem?.explanation || `This question tests: ${obj.text}`
    });
  });

  // Generate for recall objectives (30-40%)
  recallObjectives.forEach((obj, idx) => {
    const key = `${obj.category.toLowerCase()}_${obj.level.toLowerCase()}`;
    const bankItems = SPIRAL_TEST_BANK[key] || SPIRAL_TEST_BANK["grammar_a1"];
    const bankItem = bankItems[(idx + 1) % bankItems.length];

    list.push({
      id: `recall_${obj.id}_${idx}_${Date.now()}`,
      competencyText: obj.text,
      category: obj.category,
      level: obj.level,
      question: bankItem ? bankItem.question : `Review: Pick the correct use of ${obj.subCategory || obj.category}:`,
      options: bankItem ? bankItem.options : ["Correct Option", "Incorrect Distractor A", "Incorrect Distractor B"],
      correctAnswer: bankItem ? bankItem.correctAnswer : "Correct Option",
      translationAr: bankItem?.translationAr || "",
      explanation: bankItem?.explanation || `This recall question tests past competency: ${obj.text}`
    });
  });

  return list;
}
