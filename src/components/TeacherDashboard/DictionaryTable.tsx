import React from "react";
import { DictionaryEntry } from "../../types";

interface DictionaryTableProps {
  filteredWords: DictionaryEntry[];
  selectedWordIds: Set<string>;
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleToggleSelect: (id: string) => void;
  setEditingWord: (word: DictionaryEntry) => void;
  currentPage: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
}

export function DictionaryTable({
  filteredWords,
  selectedWordIds,
  handleSelectAll,
  handleToggleSelect,
  setEditingWord,
  currentPage,
  itemsPerPage,
  setCurrentPage
}: DictionaryTableProps) {
  const getCefrColor = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'A1': return 'bg-green-100 text-green-700 border-green-200';
      case 'A2': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'B1': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'B2': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'C1': return 'bg-red-100 text-red-700 border-red-200';
      case 'C2': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="border-b border-primary-light">
              <th className="pb-2 w-10">
                <input 
                  type="checkbox" 
                  checked={filteredWords.length > 0 && selectedWordIds.size === filteredWords.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-primary-light text-primary focus:ring-primary"
                />
              </th>
              <th className="pb-2 font-medium text-text-secondary pr-4">Word & Assets</th>
              <th className="pb-2 font-medium text-text-secondary w-16 pr-4">CEFR</th>
              <th className="pb-2 font-medium text-text-secondary w-24 pr-4">Category</th>
              <th className="pb-2 font-medium text-text-secondary pr-4">Translation</th>
              <th className="pb-2 font-medium text-text-secondary pr-4 min-w-[100px]">Synonyms</th>
              <th className="pb-2 font-medium text-text-secondary pr-4 min-w-[100px]">Antonyms</th>
              <th className="pb-2 font-medium text-text-secondary pr-4">Context (Definition & Example)</th>
              <th className="pb-2 font-medium text-text-secondary w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-light/50">
            {filteredWords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-text-secondary">
                  No words found matching your filters.
                </td>
              </tr>
            ) : filteredWords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((wordObj) => {
              const primarySense = wordObj.senses?.[0];
              const translation = primarySense?.translation_ar || wordObj.translation || "";
              const definition = primarySense?.gloss || wordObj.definition || "";
              const example = (primarySense?.examples && primarySense.examples.length > 0) ? primarySense.examples[0] : wordObj.example || "";
              const isSelected = selectedWordIds.has(wordObj.id);
              
              const hasAudio = primarySense?.assets?.audio?.us || primarySense?.assets?.audio?.uk;
              const hasImage = primarySense?.assets?.image;
              const cefrLevel = primarySense?.cefr_level;
              const category = primarySense?.category;

              return (
              <tr key={wordObj.id} className={isSelected ? "bg-primary-light/10" : ""}>
                <td className="py-4 pr-4">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => handleToggleSelect(wordObj.id)}
                    className="w-4 h-4 rounded border-primary-light text-primary focus:ring-primary"
                  />
                </td>
                <td className="py-4 pr-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-primary-dark">{wordObj.lemma || wordObj.word}</span>
                    <div className="flex gap-1.5 items-center flex-wrap">
                      {hasImage && <span title="Has Image" className="text-[12px] opacity-80 cursor-help">🖼️</span>}
                      {hasAudio && <span title="Has Audio" className="text-[12px] opacity-80 cursor-help">🔊</span>}
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-4">
                  {cefrLevel ? (
                    <span className={`text-[10px] border px-1.5 py-0.5 rounded font-bold uppercase ${getCefrColor(cefrLevel)}`} title="CEFR Level">
                      {cefrLevel}
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-secondary opacity-50">-</span>
                  )}
                </td>
                <td className="py-4 pr-4">
                  {category ? (
                     <span className="text-[10px] bg-gray-100 text-gray-700 border border-gray-200 px-1.5 py-0.5 rounded truncate max-w-[100px] inline-block" title={category}>{category}</span>
                  ) : (
                     <span className="text-[10px] text-text-secondary opacity-50">-</span>
                  )}
                </td>
                <td className="py-4 pr-4 font-arabic text-lg" dir="rtl">{translation}</td>
                <td className="py-4 pr-4">
                  {((primarySense as any)?.synonyms && (primarySense as any).synonyms.length > 0) || (primarySense?.relations?.synonyms && primarySense.relations.synonyms.length > 0) ? (
                    <span className="text-sm text-text-secondary">{((primarySense as any)?.synonyms || primarySense?.relations?.synonyms || []).join(", ")}</span>
                  ) : (
                    <span className="text-[12px] text-text-secondary opacity-40">-</span>
                  )}
                </td>
                <td className="py-4 pr-4">
                  {((primarySense as any)?.antonyms && (primarySense as any).antonyms.length > 0) || (primarySense?.relations?.antonyms && primarySense.relations.antonyms.length > 0) ? (
                    <span className="text-sm text-text-secondary">{((primarySense as any)?.antonyms || primarySense?.relations?.antonyms || []).join(", ")}</span>
                  ) : (
                    <span className="text-[12px] text-text-secondary opacity-40">-</span>
                  )}
                </td>
                <td className="py-4 pr-4">
                  <div className="flex flex-col gap-1">
                    {definition && <span className="text-text-secondary text-[13px] font-medium">{definition}</span>}
                    {example ? (
                      <span className="text-text-secondary text-[13px] italic opacity-80">{example.replace(/["“”]/g, '')}</span>
                    ) : (
                      <span className="text-text-secondary text-[12px] opacity-40 italic">No example</span>
                    )}
                  </div>
                </td>
                <td className="py-4">
                  <button
                    className="text-primary hover:underline text-xs"
                    onClick={() => setEditingWord(wordObj)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {filteredWords.length > 0 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-primary-light">
          <div className="text-[12px] text-text-secondary">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredWords.length)} of {filteredWords.length} words
          </div>
          <div className="flex gap-1 items-center">
            <button 
              className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
              ←
            </button>
            {getPageNumbers().map((p, i) => (
              <button
                key={i}
                disabled={p === '...'}
                className={`px-3 py-1 rounded border ${p === currentPage ? 'bg-primary text-white border-primary' : p === '...' ? 'border-transparent' : 'hover:bg-gray-50'}`}
                onClick={() => typeof p === 'number' && setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button 
              className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
