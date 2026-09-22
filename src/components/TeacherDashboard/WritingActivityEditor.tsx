import React, { useState } from "react";
import { DictionaryEntry } from "../../types";
import { Plus, X, Sparkles, BookOpen, FileText, CheckSquare, Image as ImageIcon, Sliders, FolderOpen } from "lucide-react";
import { AssetPickerModal } from "./AssetPickerModal";

interface WritingActivityEditorProps {
  activity: any;
  updateActivityField: (activityId: number, field: string | Record<string, any>, value?: any) => void;
  dictionaryWords?: DictionaryEntry[];
}

export function WritingActivityEditor({
  activity,
  updateActivityField,
  dictionaryWords = [],
}: WritingActivityEditorProps) {
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newCriterion, setNewCriterion] = useState("");
  const [selectedDictWord, setSelectedDictWord] = useState("");

  const requiredKeywords: string[] = Array.isArray(activity.requiredKeywords)
    ? activity.requiredKeywords
    : typeof activity.requiredKeywords === "string"
    ? activity.requiredKeywords.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const evaluationCriteria: string[] = Array.isArray(activity.evaluationCriteria)
    ? activity.evaluationCriteria
    : [];

  const handleAddKeyword = (wordToAdd: string) => {
    const trimmed = wordToAdd.trim();
    if (!trimmed) return;
    if (!requiredKeywords.includes(trimmed)) {
      const updated = [...requiredKeywords, trimmed];
      updateActivityField(activity.id, "requiredKeywords", updated);
    }
    setNewKeyword("");
    setSelectedDictWord("");
  };

  const handleRemoveKeyword = (index: number) => {
    const updated = [...requiredKeywords];
    updated.splice(index, 1);
    updateActivityField(activity.id, "requiredKeywords", updated);
  };

  const handleAddCriterion = () => {
    const trimmed = newCriterion.trim();
    if (!trimmed) return;
    const updated = [...evaluationCriteria, trimmed];
    updateActivityField(activity.id, "evaluationCriteria", updated);
    setNewCriterion("");
  };

  const handleRemoveCriterion = (index: number) => {
    const updated = [...evaluationCriteria];
    updated.splice(index, 1);
    updateActivityField(activity.id, "evaluationCriteria", updated);
  };

  return (
    <div className="space-y-6 bg-white p-5 rounded-2xl border border-primary-light/60 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-primary-light/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
            <FileText size={18} />
          </div>
          <div>
            <h4 className="font-extrabold text-[15px] text-slate-800">Writing Activity Configuration</h4>
            <p className="text-[12px] text-slate-500">Configure writing prompts, word count targets, keywords, and rubrics</p>
          </div>
        </div>
      </div>

      {/* 1. Main Prompt & Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase text-slate-600 mb-1">
            Activity Title
          </label>
          <input
            type="text"
            value={activity.writingTitle || ""}
            onChange={(e) => updateActivityField(activity.id, "writingTitle", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary outline-none transition-all"
            placeholder="e.g. Opinion Essay on Technology"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-600 mb-1">
            Image Stimulus URL (Optional)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={activity.imageUrl || activity.writingImageUrl || ""}
                onChange={(e) => {
                  updateActivityField(activity.id, "imageUrl", e.target.value);
                  updateActivityField(activity.id, "writingImageUrl", e.target.value);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary outline-none transition-all"
                placeholder="https://images.unsplash.com/..."
              />
              <ImageIcon size={14} className="absolute left-3 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={() => setShowAssetPicker(true)}
              className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1 border border-slate-200"
              title="Select from Media Library"
            >
              <FolderOpen size={14} /> Media
            </button>
          </div>
        </div>
      </div>

      {/* Writing Prompt TextArea */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-600 mb-1">
          Writing Prompt / Topic Question <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={2}
          value={activity.writingPrompt || ""}
          onChange={(e) => updateActivityField(activity.id, "writingPrompt", e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:border-primary outline-none transition-all"
          placeholder="e.g. Describe your ideal vacation spot. Explain why you want to visit and what activities you would do there."
        />
      </div>

      {/* Additional Guidelines / Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase text-slate-600 mb-1">
            Detailed Guidelines / Context (Optional)
          </label>
          <textarea
            rows={3}
            value={activity.writingInstructions || ""}
            onChange={(e) => updateActivityField(activity.id, "writingInstructions", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:border-primary outline-none transition-all"
            placeholder="e.g. Write in complete sentences. Divide your text into at least two paragraphs."
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-600 mb-1">
            Sentence Starter / Opening Line (Optional)
          </label>
          <textarea
            rows={3}
            value={activity.writingStarterText || ""}
            onChange={(e) => updateActivityField(activity.id, "writingStarterText", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:border-primary outline-none transition-all"
            placeholder="e.g. In my opinion, my dream vacation spot is..."
          />
        </div>
      </div>

      {/* 2. Target Word Count */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-2">
          <Sliders size={15} className="text-primary" />
          <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700">Word Count Limits</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Minimum Word Count
            </label>
            <input
              type="number"
              min={0}
              value={activity.minWords ?? 25}
              onChange={(e) => updateActivityField(activity.id, "minWords", parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Maximum Word Count (0 = Unlimited)
            </label>
            <input
              type="number"
              min={0}
              value={activity.maxWords ?? 0}
              onChange={(e) => updateActivityField(activity.id, "maxWords", parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* 3. Target Keywords / Required Vocabulary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase text-slate-600">
            Target Keywords & Required Vocabulary
          </label>
          <span className="text-[11px] text-slate-400 font-medium">Students will be tracked on using these words</span>
        </div>

        {/* Existing Keywords list */}
        <div className="flex flex-wrap gap-2">
          {requiredKeywords.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No target keywords added yet.</span>
          ) : (
            requiredKeywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold"
              >
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(index)}
                  className="hover:text-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Inputs to add keywords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Custom word input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddKeyword(newKeyword);
                }
              }}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-primary outline-none"
              placeholder="Type keyword e.g. 'however'"
            />
            <button
              type="button"
              onClick={() => handleAddKeyword(newKeyword)}
              className="px-3 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-black transition-all flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {/* Quick select from Lesson Dictionary */}
          {dictionaryWords.length > 0 && (
            <div className="flex gap-2">
              <select
                value={selectedDictWord}
                onChange={(e) => setSelectedDictWord(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium text-slate-800 outline-none"
              >
                <option value="">+ Import from Dictionary...</option>
                {dictionaryWords.map((word) => (
                  <option key={word.id} value={word.lemma || word.word}>
                    {word.lemma || word.word} ({word.translation || word.senses?.[0]?.translation_ar || ""})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleAddKeyword(selectedDictWord)}
                disabled={!selectedDictWord}
                className="px-3 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark disabled:opacity-40 transition-all flex items-center gap-1"
              >
                <BookOpen size={14} /> Import
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Model / Sample Answer */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-600 mb-1">
          Model Answer / Reference Sample
        </label>
        <textarea
          rows={3}
          value={activity.sampleAnswer || ""}
          onChange={(e) => updateActivityField(activity.id, "sampleAnswer", e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:border-primary outline-none transition-all"
          placeholder="Provide a model answer that students can compare against after submission..."
        />
      </div>

      {/* 5. Evaluation Criteria / Rubric Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase text-slate-600 flex items-center gap-1.5">
            <CheckSquare size={14} className="text-green-600" /> Self-Checklist & Evaluation Rubric
          </label>
        </div>

        <div className="space-y-2">
          {evaluationCriteria.map((criterion, index) => (
            <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {index + 1}
                </span>
                {criterion}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveCriterion(index)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCriterion}
            onChange={(e) => setNewCriterion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCriterion();
              }
            }}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-primary outline-none"
            placeholder="e.g. 'Used correct punctuation' or 'Included at least two examples'"
          />
          <button
            type="button"
            onClick={handleAddCriterion}
            className="px-4 py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700 transition-all flex items-center gap-1"
          >
            <Plus size={14} /> Add Rubric Line
          </button>
        </div>
      </div>

      {/* 6. Settings / Options */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-primary cursor-pointer"
            checked={activity.allowAiFeedback !== false}
            onChange={(e) => updateActivityField(activity.id, "allowAiFeedback", e.target.checked)}
          />
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" /> Provide Instant AI Grammar & Style Feedback
          </span>
        </label>
      </div>

      <AssetPickerModal
        isOpen={showAssetPicker}
        onClose={() => setShowAssetPicker(false)}
        filterType="image"
        title="Select Stimulus Image"
        onSelect={(url) => {
          updateActivityField(activity.id, "imageUrl", url);
          updateActivityField(activity.id, "writingImageUrl", url);
        }}
      />
    </div>
  );
}
