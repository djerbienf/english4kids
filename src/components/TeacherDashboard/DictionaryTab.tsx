import React, { useState, useRef, memo } from "react";
import { Button } from "../Button";
import { AddWordModal } from "./AddWordModal";
import { BulkEditModal } from "./BulkEditModal";
import { DictionaryEntry } from "../../types";
import { parseDictionaryJson } from "../../utils/dictionaryImport";
import { DictionaryTable } from "./DictionaryTable";
import { useDictionaryFilters } from "./useDictionaryFilters";
import { DictionaryFilterBar } from "./DictionaryFilterBar";

export const DictionaryTab = memo(function DictionaryTab({
  dictionaryWords,
  updateDictionary,
  showAddWordForm,
  setShowAddWordForm,
  editingWord,
  setEditingWord,
  onGenerateActivity
}: {
  dictionaryWords: DictionaryEntry[];
  updateDictionary: (words: DictionaryEntry[] | DictionaryEntry) => Promise<void> | void;
  showAddWordForm: boolean;
  setShowAddWordForm: (show: boolean) => void;
  editingWord: DictionaryEntry | null;
  setEditingWord: (word: DictionaryEntry | null) => void;
  onGenerateActivity?: (selectedWordIds: Set<string>) => void;
}) {
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    searchQuery,
    setSearchQuery,
    levelFilter,
    setLevelFilter,
    assetFilter,
    setAssetFilter,
    categoryFilter,
    setCategoryFilter,
    posFilter,
    setPosFilter,
    filteredWords,
    categories,
    partsOfSpeech,
  } = useDictionaryFilters(dictionaryWords);

  React.useEffect(() => {
    setCurrentPage(1); // Reset page on search or filter change
  }, [searchQuery, levelFilter, assetFilter, categoryFilter, posFilter, itemsPerPage]);

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const { updatedDictionary, addedCount, updatedCount } = parseDictionaryJson(json, dictionaryWords);

          if (addedCount > 0 || updatedCount > 0) {
              await updateDictionary(updatedDictionary);
              alert(`Successfully imported! Added: ${addedCount}, Updated: ${updatedCount} words.`);
          } else {
              alert("No new words or updates found in the file.");
          }
        }
      } catch (err) {
          console.error(err);
          alert("Failed to parse JSON file.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const [showConfirmDeduplicate, setShowConfirmDeduplicate] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const duplicateCount = React.useMemo(() => {
    const seen = new Set<string>();
    let dupes = 0;
    dictionaryWords.forEach((word) => {
      const lower = (word.lemma || word.word || "").toLowerCase();
      if (seen.has(lower)) {
        dupes++;
      } else {
        seen.add(lower);
      }
    });
    return dupes;
  }, [dictionaryWords]);

  const handleRemoveDuplicates = async () => {
    const seen = new Set<string>();
    const uniqueWords = dictionaryWords.filter(word => {
      const lowerLemma = (word.lemma || word.word || "").toLowerCase();
      if (seen.has(lowerLemma)) {
        return false;
      }
      seen.add(lowerLemma);
      return true;
    });

    if (uniqueWords.length < dictionaryWords.length) {
      const removedCount = dictionaryWords.length - uniqueWords.length;
      await updateDictionary(uniqueWords);
      setNotification(`Cleaned ${removedCount} duplicate words from dictionary.`);
    } else {
      setNotification("No duplicate words found in dictionary.");
    }
    setShowConfirmDeduplicate(false);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedWordIds(new Set(filteredWords.map(w => w.id)));
    } else {
      setSelectedWordIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedWordIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedWordIds(newSelected);
  };

  const handleDeleteSelected = () => {
    updateDictionary(dictionaryWords.filter(w => !selectedWordIds.has(w.id)));
    setSelectedWordIds(new Set());
  };

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[20px] font-bold">Vocabulary Dictionary</h2>
          <p className="text-sm text-gray-500">{dictionaryWords.length} total words | {filteredWords.length} displayed</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImportJson} 
            className="hidden" 
          />
          <Button
            variant="outline"
            className="border-primary-light text-primary bg-white hover:bg-primary-light/10"
            onClick={() => fileInputRef.current?.click()}
          >
            📥 Import JSON
          </Button>
          <Button
            variant="outline"
            className="border-red-200 text-red-600 bg-white hover:bg-red-50"
            onClick={() => setShowConfirmDeduplicate(true)}
          >
            🧹 Deduplicate
          </Button>
          <Button
            variant="outline"
            className="border-primary-light text-primary bg-white hover:bg-primary-light/10"
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8,Word,Translation,CEFR\n" 
                + dictionaryWords.map(w => `${w.lemma},${w.senses?.[0]?.translation_ar || ''},${w.senses?.[0]?.cefr_level || ''}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "dictionary_export.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            📤 Export CSV
          </Button>
          <Button
            onClick={() => setShowAddWordForm(!showAddWordForm)}
          >
            {showAddWordForm ? "Cancel" : "+ Add Word"}
          </Button>
        </div>
      </div>

      {(showAddWordForm || editingWord) && (
        <AddWordModal 
          initialData={editingWord || undefined}
          dictionaryWords={dictionaryWords}
          onClose={() => {
            setShowAddWordForm(false);
            setEditingWord(null);
          }} 
          onSave={(word) => {
            if (editingWord) {
              updateDictionary(dictionaryWords.map(w => w.id === word.id ? word : w));
            } else {
              updateDictionary([...dictionaryWords, word]);
            }
            setShowAddWordForm(false);
            setEditingWord(null);
          }}
          onDelete={editingWord ? () => {
            updateDictionary(dictionaryWords.filter(w => w.id !== editingWord.id));
            setEditingWord(null);
          } : undefined}
        />
      )}

      {selectedWordIds.size > 0 && (
        <div className="bg-primary-light/10 border border-primary-light p-4 rounded-xl flex items-center justify-between">
          <span className="text-primary-dark font-medium">
            {selectedWordIds.size} word{selectedWordIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <Button
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={() => {
                if (onGenerateActivity) {
                  onGenerateActivity(selectedWordIds);
                  setSelectedWordIds(new Set());
                }
              }}
            >
              ✨ Generate Activity
            </Button>
            <Button
              variant="outline"
              className="border-primary-light text-primary bg-white hover:bg-primary-light/10"
              onClick={() => setShowBulkEdit(true)}
            >
              ✏️ Batch Edit
            </Button>
            <Button 
              variant="outline" 
              className="border-red-200 text-red-600 bg-white hover:bg-red-50"
              onClick={handleDeleteSelected}
            >
              🗑 Delete
            </Button>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Confirmation Modal for Deduplication */}
      {showConfirmDeduplicate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-primary-light shadow-2xl space-y-4 font-['Nunito']">
            <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2">
              🧹 Clean Duplicate Words
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {duplicateCount > 0 ? (
                <>Found <strong className="text-red-600">{duplicateCount} duplicate words</strong> in the dictionary based on identical lemma keywords. Do you want to remove them and keep only one entry per term?</>
              ) : (
                <>No duplicate words detected in the dictionary. Everything is already unique.</>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-primary-light">
              <Button variant="ghost" onClick={() => setShowConfirmDeduplicate(false)} className="text-xs">
                Cancel
              </Button>
              {duplicateCount > 0 && (
                <Button onClick={handleRemoveDuplicates} className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white">
                  Remove {duplicateCount} Duplicates
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {showBulkEdit && (
        <BulkEditModal
          selectedWordIds={selectedWordIds}
          dictionaryWords={dictionaryWords}
          onSave={(updatedWords) => {
            updateDictionary(updatedWords);
            setShowBulkEdit(false);
            setSelectedWordIds(new Set());
          }}
          onClose={() => setShowBulkEdit(false)}
        />
      )}

      <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
        <DictionaryFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          posFilter={posFilter}
          setPosFilter={setPosFilter}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          assetFilter={assetFilter}
          setAssetFilter={setAssetFilter}
          categories={categories}
          partsOfSpeech={partsOfSpeech}
        />

        <DictionaryTable 
          filteredWords={filteredWords}
          selectedWordIds={selectedWordIds}
          handleSelectAll={handleSelectAll}
          handleToggleSelect={handleToggleSelect}
          setEditingWord={setEditingWord}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
        />

      </div>
    </div>
  );
});
