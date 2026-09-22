import React, { useState, useMemo } from "react";
import { DictionaryEntry } from "../../types";
import { getSRSData, addWordsToSRS, deleteSRSItem } from "../../utils/srs";
import { Button } from "../Button";
import { Plus, Trash2, Search, Settings } from "lucide-react";

interface ManageStudentDecksProps {
  studentsList: { id: string; name: string; username: string }[];
}

export function ManageStudentDecks({ studentsList }: ManageStudentDecksProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(studentsList[0]?.id || "");
  const [deckVersion, setDeckVersion] = useState(0);

  // Manual word adding state (teacher adding directly to a student's deck)
  const [manualWord, setManualWord] = useState("");
  const [manualTranslation, setManualTranslation] = useState("");
  const [manualExample, setManualExample] = useState("");
  const [manualError, setManualError] = useState("");
  const [manualSuccess, setManualSuccess] = useState("");

  // Search filter for deck management
  const [deckSearch, setDeckSearch] = useState("");

  // Read current student's deck
  const currentStudentDeck = useMemo(() => {
    if (!selectedStudentId) return [];
    const data = getSRSData(selectedStudentId);
    return Object.values(data.cards);
  }, [selectedStudentId, deckVersion]);

  // Filtered student deck
  const filteredStudentDeck = useMemo(() => {
    if (!deckSearch.trim()) return currentStudentDeck;
    const q = deckSearch.toLowerCase();
    return currentStudentDeck.filter(
      item =>
        item.word.toLowerCase().includes(q) ||
        item.translation_ar.toLowerCase().includes(q)
    );
  }, [currentStudentDeck, deckSearch]);

  const selectedStudentName = useMemo(() => {
    return studentsList.find(s => s.id === selectedStudentId)?.name || "Unknown";
  }, [studentsList, selectedStudentId]);

  // Handle Manual word creation
  const handleAddManualWord = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError("");
    setManualSuccess("");

    if (!selectedStudentId) {
      setManualError("Please select a student first.");
      return;
    }
    if (!manualWord.trim()) {
      setManualError("Please enter a word.");
      return;
    }
    if (!manualTranslation.trim()) {
      setManualError("Please enter the translation.");
      return;
    }

    const key = manualWord.trim().toLowerCase();
    const data = getSRSData(selectedStudentId);
    if (data.cards[key]) {
      setManualError("This word already exists in this student's deck.");
      return;
    }

    addWordsToSRS(selectedStudentId, [
      {
        word: manualWord.trim(),
        translation_ar: manualTranslation.trim(),
        example: manualExample.trim()
      }
    ]);

    setManualWord("");
    setManualTranslation("");
    setManualExample("");
    setManualSuccess("Word added to student's deck!");
    setDeckVersion(v => v + 1);

    setTimeout(() => setManualSuccess(""), 3000);
  };

  // Handle word deletion
  const handleDeleteWord = (wordId: string) => {
    if (!selectedStudentId) return;
    deleteSRSItem(selectedStudentId, wordId);
    setDeckVersion(v => v + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Student Selector */}
        <div className="bg-white rounded-[16px] border border-primary-light p-4">
          <label className="block text-[12px] font-bold text-text-secondary mb-2 uppercase tracking-wide">
            Select Student
          </label>
          <div className="space-y-1">
            {studentsList.map(st => (
              <button
                key={st.id}
                onClick={() => setSelectedStudentId(st.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all \${
                  selectedStudentId === st.id 
                    ? "bg-[#534AB7] text-white font-bold shadow-md shadow-[#534AB7]/30" 
                    : "hover:bg-primary-light/10 text-text-secondary hover:text-primary-dark"
                }`}
              >
                {st.name} <span className="opacity-70 text-xs">({st.username})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Add Flashcard Form */}
        <div className="bg-white rounded-[16px] border border-primary-light p-4">
          <h3 className="text-[14px] font-black text-primary-dark mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#534AB7]" /> Add Card Manually
          </h3>
          <form onSubmit={handleAddManualWord} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary mb-1">Target Word / Phrase <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={manualWord}
                onChange={(e) => setManualWord(e.target.value)}
                placeholder="e.g. bonjour"
                className="w-full bg-neutral-bg border border-primary-light/50 rounded-lg p-2 text-[13px] focus:outline-none focus:border-[#534AB7]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary mb-1">Translation <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={manualTranslation}
                onChange={(e) => setManualTranslation(e.target.value)}
                placeholder="e.g. hello"
                className="w-full bg-neutral-bg border border-primary-light/50 rounded-lg p-2 text-[13px] focus:outline-none focus:border-[#534AB7]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary mb-1">Example (Optional)</label>
              <input
                type="text"
                value={manualExample}
                onChange={(e) => setManualExample(e.target.value)}
                placeholder="e.g. Bonjour tout le monde."
                className="w-full bg-neutral-bg border border-primary-light/50 rounded-lg p-2 text-[13px] focus:outline-none focus:border-[#534AB7]"
              />
            </div>
            
            {manualError && (
              <div className="p-2 bg-red-50 text-red-600 text-[12px] font-medium rounded-lg border border-red-200">
                {manualError}
              </div>
            )}
            {manualSuccess && (
              <div className="p-2 bg-green-50 text-green-700 text-[12px] font-medium rounded-lg border border-green-200">
                {manualSuccess}
              </div>
            )}

            <Button type="submit" className="w-full text-xs py-2 bg-[#534AB7] hover:bg-[#433B93]">
              Add to {selectedStudentName}'s Deck
            </Button>
          </form>
        </div>
      </div>

      {/* Deck Viewer */}
      <div className="lg:col-span-8 bg-white rounded-[16px] border border-primary-light p-4 md:p-6 min-h-[500px] flex flex-col">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-primary-light/50 pb-4 mb-4">
          <div>
            <h3 className="text-[16px] font-black text-primary-dark">
              {selectedStudentName}'s Flashcards
            </h3>
            <p className="text-[12px] text-text-secondary mt-1">
              {currentStudentDeck.length} cards in SRS rotation
            </p>
          </div>
          
          {/* Deck Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search in deck..."
              value={deckSearch}
              onChange={(e) => setDeckSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-bg border border-primary-light rounded-xl text-sm focus:outline-none focus:border-[#534AB7]"
            />
          </div>
        </div>

        {filteredStudentDeck.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-neutral-bg rounded-xl border border-dashed border-primary-light">
            <Settings className="w-8 h-8 text-text-secondary opacity-50 mb-3" />
            <p className="text-[14px] font-bold text-text-primary mb-1">
              {deckSearch ? "No cards match your search" : "This deck is empty"}
            </p>
            <p className="text-[12px] text-text-secondary max-w-[250px]">
              {deckSearch 
                ? "Try adjusting your search terms." 
                : "Add words manually using the form on the left, or use the Bulk Assign tab to assign words from the dictionary."}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto bg-neutral-bg border border-primary-light rounded-xl p-2 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStudentDeck.map((card) => {
                let stageColor = "bg-primary-light/20 text-primary-dark";
                let stageLabel = "New";
                
                if (card.repetition > 0 && card.repetition < 3) {
                  stageColor = "bg-blue-100 text-blue-700";
                  stageLabel = "Learning";
                } else if (card.repetition >= 3) {
                  stageColor = "bg-green-100 text-green-700";
                  stageLabel = "Reviewing";
                }

                const currentSession = getSRSData(selectedStudentId).currentSession;
                const isDue = (card.nextReviewSession ?? currentSession) <= currentSession;

                return (
                  <div key={card.word} className="bg-white p-3 rounded-lg border border-primary-light shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${stageColor}`}>
                        {stageLabel}
                      </span>
                      <button 
                        onClick={() => handleDeleteWord(card.word)}
                        className="text-red-400 hover:text-red-600 p-1 bg-red-50 hover:bg-red-100 rounded transition-colors"
                        title="Delete from deck"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <h4 className="text-[15px] font-black text-text-primary truncate" title={card.word}>
                      {card.word}
                    </h4>
                    <p className="text-[12px] text-text-secondary font-arabic truncate mt-0.5" dir="rtl" title={card.translation_ar}>
                      {card.translation_ar}
                    </p>
                    
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <div className="text-[10px] text-text-secondary font-medium">
                        Level: {card.repetition}
                      </div>
                      <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDue ? "bg-amber-100 text-amber-800" : "bg-neutral-bg text-text-secondary"}`}>
                        {isDue ? "Due Now" : "Not Due"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
