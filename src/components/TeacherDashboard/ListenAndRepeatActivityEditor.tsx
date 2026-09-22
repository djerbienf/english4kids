import React, { useState } from "react";
import { DictionaryEntry } from "../../types";
import { getSyllables } from "../../utils/syllables";

interface ListenAndRepeatActivityEditorProps {
  activity: any;
  updateActivityField: (activityId: number, field: string | Record<string, any>, value?: any) => void;
  dictionaryWords: DictionaryEntry[];
}

export function ListenAndRepeatActivityEditor({ activity, updateActivityField, dictionaryWords }: ListenAndRepeatActivityEditorProps) {
  const [focusedListenRepeatItem, setFocusedListenRepeatItem] = useState<{ activityId: number; itemId: string } | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[14px] font-bold text-text-secondary mb-1">
          Title
        </label>
        <input
          type="text"
          value={activity.title || ""}
          onChange={(e) =>
            updateActivityField(
              activity.id,
              "title",
              e.target.value,
            )
          }
          placeholder="E.g. Listen and repeat these words"
          className="w-full border-2 border-primary-light/50 rounded-lg p-2 focus:border-primary outline-none text-[14px]"
        />
      </div>

      <div className="pt-4 border-t border-primary-light/30">
        <h4 className="font-bold text-primary-dark mb-4 text-[16px]">
          Items
        </h4>
        <div className="space-y-4">
          {(!activity.listenAndRepeatItems || activity.listenAndRepeatItems.length === 0) && (
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-dashed border-primary/30 text-text-secondary text-sm">
              No items added yet. Click below to add one.
            </div>
          )}
          {(activity.listenAndRepeatItems || []).map(
            (item: any, itemIndex: number) => (
              <div key={itemIndex} className="p-4 border border-primary-light rounded-lg bg-neutral-bg space-y-4 relative group">
                <button
                  onClick={() => {
                    const newItems = [...(activity.listenAndRepeatItems || [])];
                    newItems.splice(itemIndex, 1);
                    updateActivityField(activity.id, "listenAndRepeatItems", newItems);
                  }}
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-[12px] font-bold text-text-secondary mb-1">Word</label>
                    <input
                      type="text"
                      value={item.word || ""}
                      onFocus={() => setFocusedListenRepeatItem({ activityId: activity.id, itemId: item.id })}
                      onBlur={() => setTimeout(() => setFocusedListenRepeatItem(null), 200)}
                      onChange={(e) => {
                        const newItems = [...(activity.listenAndRepeatItems || [])];
                        const newWord = e.target.value;
                        newItems[itemIndex] = { 
                          ...newItems[itemIndex], 
                          word: newWord,
                          syllables: getSyllables(newWord, newItems[itemIndex].pronunciation)
                        };
                        updateActivityField(activity.id, "listenAndRepeatItems", newItems);
                      }}
                      className="w-full border-2 border-primary-light/50 rounded-lg p-2 focus:border-primary outline-none text-[14px]"
                    />
                    {focusedListenRepeatItem?.activityId === activity.id && focusedListenRepeatItem?.itemId === item.id && (item.word || "").length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-primary-light rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {dictionaryWords
                          .filter(w => (w.lemma || w.word || "").toLowerCase().includes((item.word || "").toLowerCase()))
                          .slice(0, 5)
                          .map((dw) => {
                            const text = dw.lemma || dw.word || "";
                            const audioUrl = dw.senses?.find(s => s.assets?.audio?.us || s.assets?.audio?.uk)?.assets?.audio?.us || dw.senses?.find(s => s.assets?.audio?.us || s.assets?.audio?.uk)?.assets?.audio?.uk || "";
                            const pronunciation = dw.pronunciation_us || dw.pronunciation_uk || "";
                            return (
                              <div
                                key={dw.id}
                                className="px-4 py-2 hover:bg-primary-light/10 cursor-pointer text-[14px] flex justify-between items-center"
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Prevent blur
                                  const newItems = [...(activity.listenAndRepeatItems || [])];
                                  newItems[itemIndex] = { 
                                    ...newItems[itemIndex], 
                                    word: text,
                                    syllables: getSyllables(text, pronunciation || newItems[itemIndex].pronunciation),
                                    pronunciation: pronunciation || newItems[itemIndex].pronunciation,
                                    audioUrl: audioUrl || newItems[itemIndex].audioUrl,
                                  };
                                  updateActivityField(activity.id, "listenAndRepeatItems", newItems);
                                  setFocusedListenRepeatItem(null);
                                }}
                              >
                                <span className="font-bold">{text}</span>
                                {(pronunciation || audioUrl) && (
                                  <span className="text-[12px] text-primary-dark opacity-70">
                                    {pronunciation ? `[${pronunciation}] ` : ''}{audioUrl ? '🎵' : ''}
                                  </span>
                                )}
                              </div>
                            );
                          })
                        }
                        {dictionaryWords.filter(w => (w.lemma || w.word || "").toLowerCase().includes((item.word || "").toLowerCase())).length === 0 && (
                          <div className="px-4 py-2 text-[12px] text-text-secondary italic">No dictionary matches</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-text-secondary mb-1">Syllables (Optional)</label>
                    <input
                      type="text"
                      value={item.syllables || ""}
                      onChange={(e) => {
                        const newItems = [...(activity.listenAndRepeatItems || [])];
                        newItems[itemIndex] = { ...newItems[itemIndex], syllables: e.target.value };
                        updateActivityField(activity.id, "listenAndRepeatItems", newItems);
                      }}
                      placeholder="E.g. wa·ter"
                      className="w-full border-2 border-primary-light/50 rounded-lg p-2 focus:border-primary outline-none text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-text-secondary mb-1">Pronunciation / IPA (Optional)</label>
                    <input
                      type="text"
                      value={item.pronunciation || ""}
                      onChange={(e) => {
                        const newItems = [...(activity.listenAndRepeatItems || [])];
                        const newPronunciation = e.target.value;
                        newItems[itemIndex] = { 
                          ...newItems[itemIndex], 
                          pronunciation: newPronunciation,
                          syllables: getSyllables(newItems[itemIndex].word || "", newPronunciation)
                        };
                        updateActivityField(activity.id, "listenAndRepeatItems", newItems);
                      }}
                      placeholder="E.g. /ˈwɔːtər/"
                      className="w-full border-2 border-primary-light/50 rounded-lg p-2 focus:border-primary outline-none text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-text-secondary mb-1">Audio URL (Optional)</label>
                    <input
                      type="text"
                      value={item.audioUrl || ""}
                      onChange={(e) => {
                        const newItems = [...(activity.listenAndRepeatItems || [])];
                        newItems[itemIndex] = { ...newItems[itemIndex], audioUrl: e.target.value };
                        updateActivityField(activity.id, "listenAndRepeatItems", newItems);
                      }}
                      className="w-full border-2 border-primary-light/50 rounded-lg p-2 focus:border-primary outline-none text-[14px]"
                    />
                  </div>
                </div>
              </div>
            )
          )}
          <button
            onClick={() => {
              const newItems = [...(activity.listenAndRepeatItems || []), { id: Date.now().toString(), word: "" }];
              updateActivityField(activity.id, "listenAndRepeatItems", newItems);
            }}
            className="flex items-center gap-2 text-primary hover:text-primary-dark font-bold text-[14px] bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors border border-primary/20 w-full justify-center"
          >
            + Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
