import React, { useState, useMemo } from "react";
import { DictionaryEntry } from "../../types";
import { addWordsToSRS } from "../../utils/srs";
import { Button } from "../Button";
import { Search, Filter, BookOpen, Users, Check, Sparkles, Grid } from "lucide-react";

interface BulkAssignSrsProps {
  studentsList: { id: string; name: string; username: string }[];
  dictionaryWords: DictionaryEntry[];
  categories: string[];
}

export function BulkAssignSrs({ studentsList, dictionaryWords, categories }: BulkAssignSrsProps) {
  // States for Bulk Assign
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkSearchMode, setBulkSearchMode] = useState<"word" | "category">("word");
  const [bulkCategoryFilter, setBulkCategoryFilter] = useState("All");
  const [bulkLevelFilter, setBulkLevelFilter] = useState("All");
  const [selectedDictWordIds, setSelectedDictWordIds] = useState<Set<string>>(new Set());
  const [targetStudentIds, setTargetStudentIds] = useState<Set<string>>(new Set());
  const [bulkSuccess, setBulkSuccess] = useState("");
  const [bulkError, setBulkError] = useState("");

  // Filtered dictionary words for Bulk Assign
  const filteredDictWords = useMemo(() => {
    return dictionaryWords.filter(w => {
      // CEFR Level match
      const firstSenseLevel = w.senses?.[0]?.cefr_level || "A1";
      const matchesLevel = bulkLevelFilter === "All" || firstSenseLevel === bulkLevelFilter;
      if (!matchesLevel) return false;

      // Word / Category filtering based on mode
      if (bulkSearchMode === "word") {
        const wordText = w.lemma || w.word || "";
        const matchesSearch = !bulkSearch.trim() || wordText.toLowerCase().includes(bulkSearch.toLowerCase());
        return matchesSearch;
      } else {
        // Category mode
        const wordCategory = w.senses?.[0]?.category || (w as any).category || "";
        // Category Dropdown Match
        const matchesCategoryDropdown = bulkCategoryFilter === "All" || wordCategory === bulkCategoryFilter;
        if (!matchesCategoryDropdown) return false;

        // Optional search input match on category text
        const matchesCategorySearch = !bulkSearch.trim() || wordCategory.toLowerCase().includes(bulkSearch.toLowerCase());
        return matchesCategorySearch;
      }
    });
  }, [dictionaryWords, bulkSearch, bulkLevelFilter, bulkSearchMode, bulkCategoryFilter]);

  // Toggle single dictionary word selection
  const toggleDictWordSelection = (id: string) => {
    const next = new Set(selectedDictWordIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedDictWordIds(next);
  };

  // Select all filtered dictionary words
  const selectAllFilteredWords = () => {
    const next = new Set(selectedDictWordIds);
    filteredDictWords.forEach(w => next.add(w.id));
    setSelectedDictWordIds(next);
  };

  // Deselect all filtered dictionary words
  const deselectAllFilteredWords = () => {
    const next = new Set(selectedDictWordIds);
    filteredDictWords.forEach(w => next.delete(w.id));
    setSelectedDictWordIds(next);
  };

  // Toggle student targeting
  const toggleTargetStudent = (id: string) => {
    const next = new Set(targetStudentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setTargetStudentIds(next);
  };

  // Select all students
  const selectAllStudents = () => {
    setTargetStudentIds(new Set(studentsList.map(s => s.id)));
  };

  // Deselect all students
  const deselectAllStudents = () => {
    setTargetStudentIds(new Set());
  };

  // Handle Bulk Assign execution
  const handleBulkAssign = () => {
    setBulkError("");
    setBulkSuccess("");

    if (selectedDictWordIds.size === 0) {
      setBulkError("Please select at least one word from the dictionary list.");
      return;
    }
    if (targetStudentIds.size === 0) {
      setBulkError("Please select at least one student to assign the cards to.");
      return;
    }

    // Prepare list of word items to assign
    const wordsToAssign: { word: string; translation_ar: string; example: string }[] = [];
    dictionaryWords.forEach(dw => {
      if (selectedDictWordIds.has(dw.id)) {
        const wordText = dw.lemma || dw.word || "";
        const sense = dw.senses?.[0];
        const translation = sense?.translation_ar || dw.translation || "";
        const example = sense?.examples?.[0] || dw.example || "";

        wordsToAssign.push({
          word: wordText,
          translation_ar: translation,
          example: example
        });
      }
    });

    // Assign to each target student
    targetStudentIds.forEach(studentId => {
      addWordsToSRS(studentId, wordsToAssign);
    });

    setBulkSuccess(`Successfully assigned \${wordsToAssign.length} flashcard(s) to \${targetStudentIds.size} student(s)!`);
    setSelectedDictWordIds(new Set());
    setTargetStudentIds(new Set());

    setTimeout(() => setBulkSuccess(""), 4000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
      
      {/* LEFT PANEL: Dictionary Selection */}
      <div className="lg:col-span-7 bg-white rounded-[16px] border border-primary-light p-4 flex flex-col">
        <div className="mb-4">
          <h3 className="text-[16px] font-black text-primary-dark flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-[#534AB7]" /> Select Words to Assign
          </h3>
          <p className="text-[12px] text-text-secondary">
            Filter and select words from the master dictionary to assign as new flashcards.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-neutral-bg rounded-xl border border-primary-light/50 p-3 mb-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center bg-white border border-primary-light rounded-lg overflow-hidden shrink-0">
              <button 
                onClick={() => setBulkSearchMode("word")}
                className={`px-3 py-1.5 text-xs font-bold \${bulkSearchMode === "word" ? "bg-[#534AB7] text-white" : "text-text-secondary hover:bg-neutral-bg"}`}
              >
                By Word
              </button>
              <button 
                onClick={() => setBulkSearchMode("category")}
                className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1 \${bulkSearchMode === "category" ? "bg-[#534AB7] text-white" : "text-text-secondary hover:bg-neutral-bg"}`}
              >
                <Grid className="w-3 h-3" /> By Category
              </button>
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder={bulkSearchMode === "word" ? "Search words..." : "Search in categories..."}
                value={bulkSearch}
                onChange={(e) => setBulkSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-primary-light rounded-lg text-sm focus:outline-none focus:border-[#534AB7]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[150px]">
              <Filter className="w-4 h-4 text-text-secondary shrink-0" />
              <select
                value={bulkLevelFilter}
                onChange={(e) => setBulkLevelFilter(e.target.value)}
                className="w-full bg-white border border-primary-light rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#534AB7]"
              >
                <option value="All">All CEFR Levels</option>
                <option value="A1">A1 Beginner</option>
                <option value="A2">A2 Elementary</option>
                <option value="B1">B1 Intermediate</option>
                <option value="B2">B2 Upper Intermediate</option>
                <option value="C1">C1 Advanced</option>
                <option value="C2">C2 Mastery</option>
              </select>
            </div>

            {bulkSearchMode === "category" && (
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <Grid className="w-4 h-4 text-text-secondary shrink-0" />
                <select
                  value={bulkCategoryFilter}
                  onChange={(e) => setBulkCategoryFilter(e.target.value)}
                  className="w-full bg-white border border-primary-light rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#534AB7]"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Words List Header */}
        <div className="flex justify-between items-center bg-primary-light/10 border border-primary-light rounded-t-xl px-3 py-2 shrink-0">
          <span className="text-[12px] font-bold text-primary-dark">
            Showing {filteredDictWords.length} words
          </span>
          <div className="flex gap-2">
            <button 
              onClick={selectAllFilteredWords}
              className="text-[11px] font-bold text-[#534AB7] hover:underline"
            >
              Select All
            </button>
            <span className="text-primary-light">|</span>
            <button 
              onClick={deselectAllFilteredWords}
              className="text-[11px] font-bold text-text-secondary hover:text-text-primary hover:underline"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Words List */}
        <div className="flex-1 overflow-y-auto border-x border-b border-primary-light rounded-b-xl p-2 bg-neutral-bg relative">
          {filteredDictWords.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-70">
              <Search className="w-8 h-8 mb-2" />
              <p className="text-sm">No dictionary words found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredDictWords.map((w) => {
                const isSelected = selectedDictWordIds.has(w.id);
                const wordText = w.lemma || w.word || "";
                const translation = w.senses?.[0]?.translation_ar || w.translation || "";
                const category = w.senses?.[0]?.category || (w as any).category || "";
                
                return (
                  <div 
                    key={w.id} 
                    onClick={() => toggleDictWordSelection(w.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all \${
                      isSelected 
                        ? "bg-[#534AB7]/5 border-[#534AB7] shadow-[0_0_0_1px_rgba(83,74,183,0.3)]" 
                        : "bg-white border-primary-light hover:border-[#534AB7]/50 hover:bg-neutral-bg"
                    }`}
                  >
                    <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors \${
                      isSelected ? "bg-[#534AB7] border-[#534AB7]" : "bg-white border-primary-light/80"
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[14px] font-bold text-text-primary truncate" title={wordText}>{wordText}</span>
                        {category && (
                          <span className="text-[9px] font-bold bg-neutral-bg px-1.5 py-0.5 rounded text-text-secondary truncate shrink-0 max-w-[80px]">
                            {category}
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-text-secondary font-arabic truncate mt-0.5" dir="rtl" title={translation}>
                        {translation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Target Students & Execute */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-white rounded-[16px] border border-primary-light p-4 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-[16px] font-black text-primary-dark flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-[#534AB7]" /> Target Students
            </h3>
            <p className="text-[12px] text-text-secondary">
              Select who will receive the {selectedDictWordIds.size} selected words as new flashcards.
            </p>
          </div>

          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[12px] font-bold text-primary-dark">
              {targetStudentIds.size} selected
            </span>
            <div className="flex gap-2">
              <button 
                onClick={selectAllStudents}
                className="text-[11px] font-bold text-[#534AB7] hover:underline"
              >
                Select All
              </button>
              <span className="text-primary-light">|</span>
              <button 
                onClick={deselectAllStudents}
                className="text-[11px] font-bold text-text-secondary hover:text-text-primary hover:underline"
              >
                None
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border border-primary-light rounded-xl p-2 bg-neutral-bg mb-4">
            <div className="space-y-1.5">
              {studentsList.map(st => {
                const isSelected = targetStudentIds.has(st.id);
                return (
                  <label 
                    key={st.id} 
                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors \${
                      isSelected 
                        ? "bg-white border-[#534AB7]/50 shadow-sm" 
                        : "bg-white/50 border-transparent hover:bg-white hover:border-primary-light"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors \${
                      isSelected ? "bg-[#534AB7] border-[#534AB7]" : "bg-white border-primary-light/80"
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-text-primary truncate">{st.name}</div>
                      <div className="text-[11px] text-text-secondary truncate">@{st.username}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Area */}
          <div className="bg-neutral-bg border border-primary-light rounded-xl p-4 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[13px] font-bold text-text-secondary">Words: <span className={selectedDictWordIds.size > 0 ? "text-[#534AB7]" : ""}>{selectedDictWordIds.size}</span></div>
              <div className="text-[13px] font-bold text-text-secondary">Students: <span className={targetStudentIds.size > 0 ? "text-[#534AB7]" : ""}>{targetStudentIds.size}</span></div>
            </div>

            {bulkError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-lg text-center">
                {bulkError}
              </div>
            )}
            
            {bulkSuccess && (
              <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-lg text-center flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4" /> {bulkSuccess}
              </div>
            )}

            <Button 
              onClick={handleBulkAssign}
              disabled={selectedDictWordIds.size === 0 || targetStudentIds.size === 0}
              className="w-full py-3 bg-[#534AB7] hover:bg-[#433B93] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Assign {selectedDictWordIds.size} Cards to {targetStudentIds.size} Students
            </Button>
            <p className="text-center text-[10px] text-text-secondary mt-2">
              Cards will be added directly to their SM-2 learning queue.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
