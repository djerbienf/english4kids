import React from "react";

export function InteractionTab({
  slide,
  rawSlides,
  currentSafeSlideIndex,
  updateLessonField
}: {
  slide: any;
  rawSlides: any[];
  currentSafeSlideIndex: number;
  updateLessonField: (field: string, value: any) => void;
}) {
  const unscrambles = slide.unscrambleTexts || (slide.unscrambleText ? [slide.unscrambleText] : []);
  const clozesList = slide.clozes || (slide.clozeSentenceBefore || slide.clozeCorrect ? [{
    sentenceBefore: slide.clozeSentenceBefore || "",
    sentenceAfter: slide.clozeSentenceAfter || "",
    correct: slide.clozeCorrect || "",
    distractors: slide.clozeDistractors || []
  }] : []);

  return (
    <div className="space-y-6 h-full flex flex-col overflow-y-auto pr-2 pb-4">
      <div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <label className="block text-[13px] font-bold text-primary-dark mb-1">Drag & Drop Unscramble</label>
            <p className="text-xs text-text-secondary">Students must unscramble these sentences.</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              const newSlides = [...rawSlides];
              newSlides[currentSafeSlideIndex] = { 
                ...newSlides[currentSafeSlideIndex], 
                unscrambleTexts: [...unscrambles, ""]
              };
              updateLessonField("readingSlides", newSlides);
            }}
            className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary-dark transition-colors"
          >
            + Add Sentence
          </button>
        </div>
        <div className="space-y-3">
          {unscrambles.map((text: string, i: number) => (
            <div key={i} className="flex items-center gap-2 relative">
              <input
                type="text"
                placeholder="Ex: Le petit chaperon rouge marche dans la forêt."
                value={text}
                onChange={(e) => {
                  const newArr = [...unscrambles];
                  newArr[i] = e.target.value;
                  const newSlides = [...rawSlides];
                  newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], unscrambleTexts: newArr };
                  updateLessonField("readingSlides", newSlides);
                }}
                className="w-full bg-neutral-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => {
                  const newArr = [...unscrambles];
                  newArr.splice(i, 1);
                  const newSlides = [...rawSlides];
                  newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], unscrambleTexts: newArr };
                  updateLessonField("readingSlides", newSlides);
                }}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                title="Remove Unscramble"
              >
                ✕
              </button>
            </div>
          ))}
          {unscrambles.length === 0 && <p className="text-xs text-text-secondary italic">No unscramble sentences added.</p>}
        </div>
      </div>
      
      <div className="pt-4 border-t border-primary-light/50">
        <div className="flex justify-between items-center mb-3">
          <div>
            <label className="block text-[13px] font-bold text-primary-dark mb-1">Cloze Interactions</label>
            <p className="text-xs text-text-secondary">Ask students to guess a missing word.</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              const newSlides = [...rawSlides];
              newSlides[currentSafeSlideIndex] = { 
                ...newSlides[currentSafeSlideIndex], 
                clozes: [...clozesList, { sentenceBefore: "", sentenceAfter: "", correct: "", distractors: [] }]
              };
              updateLessonField("readingSlides", newSlides);
            }}
            className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary-dark transition-colors"
          >
            + Add Cloze
          </button>
        </div>
        <div className="space-y-4">
          {clozesList.map((cloze: any, i: number) => (
            <div key={i} className="bg-neutral-bg/50 p-4 rounded-xl border border-primary-light relative pt-8">
              <button
                onClick={() => {
                  const newArr = [...clozesList];
                  newArr.splice(i, 1);
                  const newSlides = [...rawSlides];
                  newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], clozes: newArr };
                  updateLessonField("readingSlides", newSlides);
                }}
                className="absolute top-2 right-2 text-red-500 bg-red-50 hover:bg-red-100 w-6 h-6 rounded-full flex items-center justify-center transition-colors text-xs"
                title="Remove Cloze"
              >
                ✕
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary mb-1">Sentence BEFORE</label>
                  <input
                    type="text"
                    placeholder="Ex: Have a great "
                    value={cloze.sentenceBefore || ""}
                    onChange={(e) => {
                      const newArr = [...clozesList];
                      newArr[i] = { ...newArr[i], sentenceBefore: e.target.value };
                      const newSlides = [...rawSlides];
                      newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], clozes: newArr };
                      updateLessonField("readingSlides", newSlides);
                    }}
                    className="w-full bg-white border border-primary-light rounded-xl p-2.5 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary mb-1">Correct Word</label>
                  <input
                    type="text"
                    placeholder="Ex: morning"
                    value={cloze.correct || ""}
                    onChange={(e) => {
                      const newArr = [...clozesList];
                      newArr[i] = { ...newArr[i], correct: e.target.value };
                      const newSlides = [...rawSlides];
                      newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], clozes: newArr };
                      updateLessonField("readingSlides", newSlides);
                    }}
                    className="w-full bg-white border border-primary-light rounded-xl p-2.5 text-[13px] font-bold text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary mb-1">Sentence AFTER</label>
                  <input
                    type="text"
                    placeholder="Ex: head start of the day!"
                    value={cloze.sentenceAfter || ""}
                    onChange={(e) => {
                      const newArr = [...clozesList];
                      newArr[i] = { ...newArr[i], sentenceAfter: e.target.value };
                      const newSlides = [...rawSlides];
                      newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], clozes: newArr };
                      updateLessonField("readingSlides", newSlides);
                    }}
                    className="w-full bg-white border border-primary-light rounded-xl p-2.5 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary mb-1">Distractors (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Ex: automobile, vegetable"
                    value={Array.isArray(cloze.distractors) ? cloze.distractors.join(", ") : cloze.distractors || ""}
                    onChange={(e) => {
                      const newArr = [...clozesList];
                      const str = e.target.value;
                      newArr[i] = { ...newArr[i], distractors: str };
                      const newSlides = [...rawSlides];
                      newSlides[currentSafeSlideIndex] = { ...newSlides[currentSafeSlideIndex], clozes: newArr };
                      updateLessonField("readingSlides", newSlides);
                    }}
                    className="w-full bg-white border border-primary-light rounded-xl p-2.5 text-[13px] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          ))}
          {clozesList.length === 0 && <p className="text-xs text-text-secondary italic">No cloze interactions added.</p>}
        </div>
      </div>
    </div>
  );
}
