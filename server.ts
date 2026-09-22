import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper to cleanly distill target content for pedagogical test generation
function distillTargetContent(rawContent: string): string {
  if (!rawContent || typeof rawContent !== "string") return "General English Curriculum Content";
  try {
    const data = JSON.parse(rawContent);
    const vocabularyList: string[] = [];
    const stories: string[] = [];
    const objectives: string[] = [];
    const flashcards: string[] = [];

    function traverse(obj: any) {
      if (!obj || typeof obj !== "object") return;

      if (obj.title && typeof obj.title === "string" && !objectives.includes(obj.title)) {
        objectives.push(obj.title);
      }
      if (obj.description && typeof obj.description === "string") {
        objectives.push(obj.description);
      }

      // Reading texts & story slides
      if (obj.storyTitle || obj.storyText) {
        stories.push(`${obj.storyTitle || "Story"}: ${obj.storyText || ""}`);
      }
      if (Array.isArray(obj.readingSlides)) {
        obj.readingSlides.forEach((slide: any) => {
          if (slide.text) stories.push(slide.text);
        });
      }

      // Flashcards
      if (Array.isArray(obj.flashcardPairs)) {
        obj.flashcardPairs.forEach((pair: any) => {
          if (pair.left && pair.right) {
            flashcards.push(`${pair.left} ↔ ${pair.right}`);
          }
        });
      }

      // Dictionary words
      if (obj.lemma || obj.word) {
        const word = obj.lemma || obj.word;
        const pos = obj.part_of_speech ? `(${obj.part_of_speech})` : "";
        const gloss = obj.senses?.[0]?.gloss || obj.definition || "";
        const arabic = obj.senses?.[0]?.translation_ar || obj.translation || "";
        vocabularyList.push(`${word} ${pos}: ${arabic} ${gloss ? `— "${gloss}"` : ""}`);
      }

      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach(traverse);
        } else if (typeof obj[key] === "object") {
          traverse(obj[key]);
        }
      }
    }

    traverse(data);

    let summary = `TOPIC & LESSON: ${data.title || "Target Lesson"}\n`;
    if (objectives.length > 0) {
      summary += `LEARNING OBJECTIVES:\n${objectives.slice(0, 6).map(o => `- ${o}`).join("\n")}\n\n`;
    }
    if (vocabularyList.length > 0) {
      summary += `TARGET VOCABULARY:\n${vocabularyList.slice(0, 25).map(v => `- ${v}`).join("\n")}\n\n`;
    }
    if (flashcards.length > 0) {
      summary += `CORE FLASHCARD PAIRS:\n${flashcards.slice(0, 15).map(f => `- ${f}`).join("\n")}\n\n`;
    }
    if (stories.length > 0) {
      summary += `READING CONTEXT / PASSAGES:\n${stories.slice(0, 4).join("\n---\n")}\n\n`;
    }

    return summary.trim() || rawContent.slice(0, 2500);
  } catch {
    return rawContent.slice(0, 2500);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/generate-test", async (req, res) => {
    console.log("Received request to generate test", req.body);
    try {
      const {
        targetContent,
        questionCount,
        exerciseTypes,
        customPrompt,
        difficulty,
        theme,
        creativity,
        questionStyle,
        existingQuestions,
      } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }

      const exerciseTypesList = exerciseTypes && exerciseTypes.length > 0 
        ? exerciseTypes 
        : ["Multiple Choice", "Matching", "Cloze"];
      
      const distilledContext = distillTargetContent(targetContent);
      const count = Math.min(Math.max(parseInt(questionCount, 10) || 5, 1), 30);

      // Calibrated temperature to eliminate hallucinations and sloppy distractors
      let temperature = 0.45;
      if (creativity === "Low") temperature = 0.25;
      if (creativity === "High") temperature = 0.65;

      const systemInstruction = `You are a World-Class ESL Assessment Designer and Psychometrician specializing in English language testing for young learners (ages 10-14).
Your primary objective is to craft rigorous, pedagogically sound, fair, and engaging evaluation items grounded strictly in the provided curriculum content.

PEDAGOGICAL QUALITY STANDARDS:
1. DISTRACTOR (WRONG ANSWER) QUALITY:
   - For Multiple Choice: All 4 options MUST be of the identical grammatical category (e.g. all base verbs, all irregular past tense verbs, or all plural nouns).
   - Distractors MUST be plausible and based on common ESL learner errors (e.g., false cognates, morphological confusion, subtle semantic distinctions).
   - All options must be balanced in length and syntax so students cannot guess the answer by elimination.
   - There must be ONLY ONE unambiguously correct answer under standard English usage.

2. CLOZE (FILL-IN-THE-BLANK) QUALITY:
   - The sentence must provide rich contextual clues so the target blank makes logical and grammatical sense.
   - Distractors for cloze items must grammatically fit into the sentence slot so the item tests semantic comprehension or specific inflection agreement rather than surface-level syntax.

3. MATCHING QUALITY:
   - Pairs must be distinct, unambiguous, and test meaningful connections (e.g. Word ↔ Natural contextual definition/translation, Action ↔ Appropriate context, Problem ↔ Solution).

4. COGNITIVE LEVEL & SITUATIONAL RELEVANCE:
   - Do not ask dry, trivial questions (e.g. avoid "What is the translation of word X?").
   - Frame questions in authentic dialogues, mini-scenarios, and everyday communication appropriate for the specified theme and question style.

5. FEEDBACK & EXPLANATION:
   - Every question MUST include a concise 1-sentence pedagogical "explanation" explaining why the correct choice is right and clarifying any common misconception.

6. CEFR LEVEL CALIBRATION:
   - Easy (A1-A2): High-frequency words, simple sentence structures, direct context.
   - Medium (B1): Compound sentences, situational dialogues, phrasal expressions.
   - Hard (B2): Nuanced idioms, contextual inference, pragmatic appropriateness.`;

      const prompt = `
CURRICULUM CONTENT BRIEF:
${distilledContext}

TASK SPECIFICATIONS:
- Number of Questions to generate: EXACTLY ${count}
- Exercise Types to include: ${exerciseTypesList.join(", ")}
- Difficulty Level: ${difficulty || "Medium"}
- Theme / Setting: ${theme || "General"}
- Question Style: ${questionStyle || "Playful"}
${customPrompt ? `- Custom Teacher Directives: "${customPrompt}"` : ""}

${existingQuestions && Array.isArray(existingQuestions) && existingQuestions.length > 0 ? `
CRITICAL ANTI-DUPLICATION FILTER:
Do NOT repeat or closely mirror any of the following existing questions:
${existingQuestions.slice(0, 20).map((q: string) => `- ${q}`).join("\n")}
Ensure fresh angles, new vocabulary items, and diverse sentence structures.
` : ""}

OUTPUT FORMAT:
Return ONLY a valid JSON array of objects conforming to the schemas below (no markdown wrappers like \`\`\`json):

1. Multiple Choice:
{
  "type": "Multiple Choice",
  "title": "Clear concise title",
  "question": "Engaging situational question or dialogue...",
  "options": ["Plausible Option A", "Plausible Option B", "Plausible Option C", "Plausible Option D"],
  "correctAnswer": "Plausible Option A",
  "explanation": "Clear 1-sentence pedagogical explanation."
}

2. Matching:
{
  "type": "Matching",
  "title": "Matching Question Title",
  "pairs": [
    { "left": "Term 1", "right": "Definition or Translation 1" },
    { "left": "Term 2", "right": "Definition or Translation 2" },
    { "left": "Term 3", "right": "Definition or Translation 3" }
  ],
  "explanation": "Clear 1-sentence pedagogical explanation."
}

3. Cloze:
{
  "type": "Cloze",
  "title": "Fill in the Blank Title",
  "sentenceBeforeGap": "Sentence text before gap...",
  "correctAnswer": "targetWord",
  "sentenceAfterGap": "...sentence text after gap.",
  "distractors": ["Distractor1", "Distractor2", "Distractor3"],
  "explanation": "Clear 1-sentence pedagogical explanation."
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature,
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response from Gemini");
      }

      let parsedQuestions;
      try {
        parsedQuestions = JSON.parse(responseText);
      } catch {
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedQuestions = JSON.parse(cleanedText);
      }

      if (!Array.isArray(parsedQuestions)) {
        if (parsedQuestions && Array.isArray(parsedQuestions.questions)) {
          parsedQuestions = parsedQuestions.questions;
        } else if (parsedQuestions && Array.isArray(parsedQuestions.activities)) {
          parsedQuestions = parsedQuestions.activities;
        } else {
          parsedQuestions = [parsedQuestions];
        }
      }

      // Format them into ActivityConfig objects with explanation
      const activities = parsedQuestions.map((q: any, i: number) => {
        const id = `act_${Date.now()}_${i}`;
        const qType = String(q.type).toLowerCase();

        if (qType === "multiple choice") {
          const rawOptions = Array.isArray(q.options) ? q.options : [];
          const correct = q.correctAnswer || (rawOptions.length > 0 ? rawOptions[0] : "");
          // Ensure correct answer is always in the options array
          const finalOptions = rawOptions.includes(correct) 
            ? rawOptions 
            : [correct, ...rawOptions].slice(0, 4);

          return {
            id,
            type: "Multiple Choice",
            title: q.title || `Question ${i + 1}`,
            multipleChoiceQuestion: q.question || "",
            multipleChoiceOptions: finalOptions,
            multipleChoiceCorrectAnswer: correct,
            explanation: q.explanation || "Review the lesson context for this question.",
          };
        } else if (qType === "matching") {
          return {
            id,
            type: "Matching",
            title: q.title || `Matching ${i + 1}`,
            matchingPairs: Array.isArray(q.pairs) ? q.pairs : [],
            explanation: q.explanation || "Match elements based on the lesson definitions and context.",
          };
        } else if (qType === "cloze") {
          return {
            id,
            type: "Cloze",
            title: q.title || `Fill in the blank ${i + 1}`,
            clozeSentenceBefore: q.sentenceBeforeGap || "",
            clozeCorrect: q.correctAnswer || "",
            clozeSentenceAfter: q.sentenceAfterGap || "",
            clozeDistractors: Array.isArray(q.distractors) 
              ? q.distractors.join(", ") 
              : (q.distractors || ""),
            clozeShowChoices: true,
            explanation: q.explanation || `The word "${q.correctAnswer}" fits best in this context.`,
          };
        }
        return null;
      }).filter(Boolean);

      res.json({ activities });
    } catch (error: any) {
      console.error("Error generating test:", error);
      res.status(500).json({ error: error.message || "Failed to generate test" });
    }
  });

  // API route for automatic writing grading & correction
  app.post("/api/grade-writing", async (req, res) => {
    try {
      const {
        writingPrompt,
        writingInstructions,
        studentText,
        minWords,
        requiredKeywords,
        sampleAnswer,
        evaluationCriteria,
      } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }

      if (!studentText || typeof studentText !== "string") {
        return res.status(400).json({ error: "Student text is required" });
      }

      const prompt = `
You are an encouraging, expert ESL English teacher grading a student's writing submission.

TASK SPECIFICATIONS:
- Prompt / Question: "${writingPrompt || "Free Writing Task"}"
${writingInstructions ? `- Guidelines: "${writingInstructions}"` : ""}
${minWords ? `- Target minimum words: ${minWords}` : ""}
${requiredKeywords && requiredKeywords.length > 0 ? `- Required Vocabulary Keywords: ${JSON.stringify(requiredKeywords)}` : ""}
${sampleAnswer ? `- Model Reference Answer: "${sampleAnswer}"` : ""}
${evaluationCriteria && evaluationCriteria.length > 0 ? `- Rubric Criteria: ${JSON.stringify(evaluationCriteria)}` : ""}

STUDENT SUBMISSION:
"""
${studentText}
"""

Instructions for Evaluation:
1. Provide a numerical score from 0 to 100 based on grammar, accuracy, vocabulary usage, relevance to the prompt, and structure.
2. Provide a short, friendly encouraging overall summary (1-2 sentences).
3. Identify 2-3 key strengths in the student's writing.
4. Identify 1-3 specific areas for improvement.
5. Provide line-by-line grammar/spelling/style corrections if there are any errors. Each correction should have:
   - "original": the exact error phrase from student text
   - "corrected": the improved/correct phrase
   - "explanation": simple clear explanation in English
6. Evaluate each item in the Rubric Criteria (if provided) with "criterion", "met" (boolean), and "note".
7. Evaluate required keywords (if provided) with "keyword", "used" (boolean), and "feedback".
8. Provide a polished "improvedVersion" of the student's submission that fixes errors while preserving their original voice and ideas.

Return ONLY a raw JSON object with this exact structure:
{
  "score": 85,
  "summary": "...",
  "strengths": ["..."],
  "areasForImprovement": ["..."],
  "corrections": [
    {
      "original": "...",
      "corrected": "...",
      "explanation": "..."
    }
  ],
  "rubricEvaluations": [
    {
      "criterion": "...",
      "met": true,
      "note": "..."
    }
  ],
  "keywordFeedback": [
    {
      "keyword": "...",
      "used": true,
      "feedback": "..."
    }
  ],
  "improvedVersion": "..."
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response from Gemini");
      }

      let parsedResult;
      try {
        parsedResult = JSON.parse(responseText);
      } catch (e) {
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedResult = JSON.parse(cleanedText);
      }

      res.json(parsedResult);
    } catch (error: any) {
      console.error("Error grading writing:", error);
      res.status(500).json({ error: error.message || "Failed to grade writing" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
