import React, { useState, useMemo } from "react";
import { DictionaryEntry } from "../../types";
import { ManageStudentDecks } from "./ManageStudentDecks";
import { BulkAssignSrs } from "./BulkAssignSrs";

interface SrsParametersTabProps {
  studentsList: { id: string; name: string; username: string }[];
  dictionaryWords: DictionaryEntry[];
}

export const SrsParametersTab = React.memo(function SrsParametersTab({ studentsList, dictionaryWords }: SrsParametersTabProps) {
  // Mode: "manage" (Manage Student Decks) or "assign" (Bulk Assign from Dictionary)
  const [subTab, setSubTab] = useState<"manage" | "assign">("manage");

  // Extract unique categories from the dictionary
  const categories = useMemo(() => {
    const cats = new Set<string>();
    dictionaryWords.forEach(w => {
      w.senses?.forEach(s => {
        if (s.category) {
          cats.add(s.category);
        }
      });
      if ((w as any).category) {
        cats.add((w as any).category);
      }
    });
    return Array.from(cats).sort();
  }, [dictionaryWords]);

  return (
    <div className="space-y-6">
      
      {/* Tab Header area */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-primary-light/50 pb-5">
        <div>
          <h2 className="text-[20px] font-black text-primary-dark flex items-center gap-2">
            🧠 Flashcards-SM2 Deck Parameters
          </h2>
          <p className="text-xs text-text-secondary">
            Manage student-specific Spaced Repetition (SM-2) flashcards, assign vocabulary, and check deck states.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="bg-neutral-bg border border-primary-light p-1 rounded-xl flex">
          <button
            onClick={() => setSubTab("manage")}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${subTab === "manage" ? "bg-[#534AB7] text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
          >
            👤 Individual Decks
          </button>
          <button
            onClick={() => setSubTab("assign")}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${subTab === "assign" ? "bg-[#534AB7] text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
          >
            ⚡ Bulk Assign from Dictionary
          </button>
        </div>
      </div>

      {studentsList.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-6 text-center">
          <p className="text-sm font-semibold text-amber-800">
            No student accounts available. Please create student accounts under "Student Accounts" tab first!
          </p>
        </div>
      ) : (
        <>
          {/* Sub Tab 1: Individual student deck manager */}
          {subTab === "manage" && (
            <ManageStudentDecks studentsList={studentsList} />
          )}

          {/* Sub Tab 2: Bulk Assign */}
          {subTab === "assign" && (
            <BulkAssignSrs 
              studentsList={studentsList} 
              dictionaryWords={dictionaryWords} 
              categories={categories} 
            />
          )}
        </>
      )}
    </div>
  );
});
