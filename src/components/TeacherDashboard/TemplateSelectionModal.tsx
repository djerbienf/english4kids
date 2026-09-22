import React, { useState } from "react";
import { Button } from "../Button";

const TEMPLATES = [
  {
    id: "blank",
    icon: "📄",
    title: "Blank Lesson",
    description: "Start from scratch with an empty lesson.",
    activities: [],
  },
  {
    id: "vocabulary",
    icon: "🔤",
    title: "Vocabulary Builder",
    description: "A standard layout for learning new words with Flashcards and Matching.",
    activities: [
      { id: "flashcards", type: "flashcard", data: { text: "Vocabulary Introduction" } },
      { id: "matching", type: "matching", data: {} }
    ]
  },
  {
    id: "reading",
    icon: "📖",
    title: "Reading Comprehension",
    description: "Start with a reading text, followed by some questions.",
    activities: [
      { id: "reading", type: "reading", data: { title: "Reading Text", content: "" } },
      { id: "quiz", type: "quiz", data: {} }
    ]
  },
  {
    id: "listening",
    icon: "🎧",
    title: "Listening Practice",
    description: "Audio-focused lesson with Dictation.",
    activities: [
      { id: "dictation", type: "dictation", data: {} }
    ]
  },
  {
    id: "ai",
    icon: "✨",
    title: "AI Generated Lesson",
    description: "Generate a complete lesson structure from a topic.",
    isAi: true
  }
];

export function TemplateSelectionModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateData: any) => void;
}) {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topicError, setTopicError] = useState("");

  if (!isOpen) return null;

  const handleSelect = (template: typeof TEMPLATES[0]) => {
    setTopicError("");
    if (template.id === "blank") {
      onSelectTemplate({});
    } else if (template.id === "ai") {
      if (!selectedTopic.trim()) {
        setTopicError("Please enter a topic or subject for the AI lesson generator.");
        return;
      }
      // Generate AI-themed structure
      onSelectTemplate({
        title: `Unit: ${selectedTopic}`,
        description: `This lesson about ${selectedTopic} was organized by AI.`,
        activities: [
          { id: Date.now(), type: "Reading", storyTitle: `Introduction to ${selectedTopic}`, storyText: `Welcome to our unit about ${selectedTopic}. Read the passage attentively to discover key concepts.` },
          { id: Date.now() + 1, type: "Flashcards", title: `Core Vocabulary: ${selectedTopic}`, flashcardPairs: [{ left: "Concept 1", right: "Definition 1" }] },
          { id: Date.now() + 2, type: "Speaking", title: `Pronounce: ${selectedTopic}`, targetSpeech: selectedTopic, targetAudioUrl: "" }
        ]
      });
    } else {
      onSelectTemplate({
        title: template.title,
        activities: template.activities
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-neutral-light flex justify-between items-center bg-neutral-bg/50">
          <div>
            <h2 className="text-2xl font-bold text-primary-dark">Create New Lesson</h2>
            <p className="text-text-secondary mt-1">Choose a template or generate with AI</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES.map((template) => (
            <div 
              key={template.id}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3
                ${template.isAi ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:border-indigo-400 hover:shadow-md" : "bg-white border-neutral-light hover:border-primary hover:shadow-sm"}
              `}
              onClick={() => {
                if (!template.isAi) {
                  handleSelect(template);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{template.icon}</span>
                <h3 className={`font-bold text-lg ${template.isAi ? "text-indigo-900" : "text-primary-dark"}`}>
                  {template.title}
                </h3>
              </div>
              <p className={`text-sm ${template.isAi ? "text-indigo-700/80" : "text-text-secondary"}`}>
                {template.description}
              </p>
              
              {template.isAi && (
                <div className="mt-3 relative" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Travel Vocabulary, Advanced Grammar..." 
                      className="flex-1 w-full px-4 py-2 rounded-xl border border-indigo-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                      value={selectedTopic}
                      onChange={(e) => {
                        setSelectedTopic(e.target.value);
                        if (topicError) setTopicError("");
                      }}
                    />
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(template);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                    >
                      Generate ✨
                    </Button>
                  </div>
                  {topicError && (
                    <p className="text-xs font-semibold text-rose-600 mt-1.5 animate-fade-in">
                      {topicError}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
