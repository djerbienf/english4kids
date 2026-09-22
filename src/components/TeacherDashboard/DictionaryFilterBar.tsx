import React from "react";

interface DictionaryFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  posFilter: string;
  setPosFilter: (val: string) => void;
  levelFilter: string;
  setLevelFilter: (val: string) => void;
  assetFilter: string;
  setAssetFilter: (val: string) => void;
  categories: string[];
  partsOfSpeech: string[];
}

export function DictionaryFilterBar({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  posFilter,
  setPosFilter,
  levelFilter,
  setLevelFilter,
  assetFilter,
  setAssetFilter,
  categories,
  partsOfSpeech
}: DictionaryFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Search dictionary (word, translation, definition)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] pr-10"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      <select 
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] min-w-[150px]"
      >
        <option>All Categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <select 
        value={posFilter}
        onChange={(e) => setPosFilter(e.target.value)}
        className="bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] min-w-[150px]"
      >
        <option>All Parts of Speech</option>
        {partsOfSpeech.map(pos => (
          <option key={pos} value={pos}>{pos}</option>
        ))}
      </select>
      <select 
        value={levelFilter}
        onChange={(e) => setLevelFilter(e.target.value)}
        className="bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] min-w-[150px]"
      >
        <option>All Levels</option>
        <option>A1</option>
        <option>A2</option>
        <option>B1</option>
        <option>B2</option>
        <option>C1</option>
        <option>C2</option>
      </select>
      <select 
        value={assetFilter}
        onChange={(e) => setAssetFilter(e.target.value)}
        className="bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] min-w-[150px]"
      >
        <option>All Assets</option>
        <option>Has Audio</option>
        <option>Has Image</option>
        <option>Has Both</option>
        <option>Has Synonyms</option>
        <option>Has Antonyms</option>
        <option>Missing Audio</option>
        <option>Missing Image</option>
        <option>Missing Translation</option>
        <option>Missing POS</option>
      </select>
    </div>
  );
}
