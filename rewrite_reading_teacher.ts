import fs from 'fs';

const content = fs.readFileSync('src/spaces/TeacherDashboard.tsx', 'utf-8');

const startPattern = '{activity.type === "Reading" && (';
const endPattern = '                              </div>\n                            )}\n                            {activity.type !== "Watching" &&';

const startIdx = content.indexOf(startPattern);
if(startIdx === -1) { console.error("Start not found"); process.exit(1); }

const endIdx = content.indexOf(endPattern, startIdx);
if(endIdx === -1) { console.error("End not found"); process.exit(1); }

const replacement = `{activity.type === "Reading" && (
                              <div className="space-y-4">
                                <p className="text-sm font-medium text-text-secondary mb-4 italic">Note: Reading is composed of one or multiple slides. Each slide can have its own text, media and interactive options.</p>
                                {/* General Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 bg-white/50 p-4 border border-primary-light rounded-xl">
                                  <div>
                                    <label className="block text-[13px] font-bold text-primary-dark mb-1">
                                      Global Text Format
                                    </label>
                                    <select
                                      value={readingType}
                                      onChange={(e) => updateLessonField("readingType", e.target.value)}
                                      className="w-full bg-card-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                                    >
                                      <option value="text">Text (Article/Passage)</option>
                                      <option value="dialogue">Dialogue (Conversation)</option>
                                      <option value="story">Story (Narrative)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[13px] font-bold text-primary-dark mb-1">
                                      Reading Title (Optional)
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Ex: Le petit chaperon rouge"
                                      value={readingTitle}
                                      onChange={(e) => updateLessonField("readingTitle", e.target.value)}
                                      className="w-full bg-card-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                                    />
                                  </div>
                                </div>

                                {/* Slides Management */}
                                <div className="space-y-4">
                                  {(() => {
                                      const rawSlides = readingSlides.map((s: any) => typeof s === "string" ? { text: s } : s);
                                      return rawSlides.map((slide: any, slideIndex: number) => (
                                        <div key={slideIndex} className="bg-white border border-primary-light rounded-xl p-4 shadow-sm relative">
                                          <div className="flex justify-between items-center mb-4 border-b border-primary-light/50 pb-2">
                                            <span className="text-sm font-bold text-primary-dark">Slide {slideIndex + 1}</span>
                                            {rawSlides.length > 1 && (
                                              <button
                                                onClick={() => {
                                                  const newSlides = [...rawSlides];
                                                  newSlides.splice(slideIndex, 1);
                                                  updateLessonField("readingSlides", newSlides);
                                                }}
                                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                                              >
                                                Remove Slide
                                              </button>
                                            )}
                                          </div>

                                          <div className="space-y-4">
                                            {/* Text Content */}
                                            <div>
                                              <label className="block text-[13px] font-bold text-primary-dark mb-1">Text Content</label>
                                              <textarea
                                                placeholder="Enter slide content here..."
                                                value={slide.text || ""}
                                                onChange={(e) => {
                                                  const newSlides = [...rawSlides];
                                                  newSlides[slideIndex] = { ...newSlides[slideIndex], text: e.target.value };
                                                  updateLessonField("readingSlides", newSlides);
                                                }}
                                                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] min-h-[100px] focus:outline-none focus:border-primary"
                                              />
                                            </div>

                                            {/* Media */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                <label className="block text-[13px] font-bold text-primary-dark mb-1">Audio URL (Optional)</label>
                                                <input
                                                  type="text"
                                                  placeholder="https://...mp3"
                                                  value={slide.audioUrl || ""}
                                                  onChange={(e) => {
                                                    const newSlides = [...rawSlides];
                                                    newSlides[slideIndex] = { ...newSlides[slideIndex], audioUrl: e.target.value };
                                                    updateLessonField("readingSlides", newSlides);
                                                  }}
                                                  className="w-full bg-neutral-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-[13px] font-bold text-primary-dark mb-1">Image URL (Optional)</label>
                                                <input
                                                  type="text"
                                                  placeholder="https://...png"
                                                  value={slide.imageUrl || ""}
                                                  onChange={(e) => {
                                                    const newSlides = [...rawSlides];
                                                    newSlides[slideIndex] = { ...newSlides[slideIndex], imageUrl: e.target.value };
                                                    updateLessonField("readingSlides", newSlides);
                                                  }}
                                                  className="w-full bg-neutral-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                                                />
                                              </div>
                                            </div>

                                            {/* Interactive (Unscramble & Cloze) */}
                                            <div className="pt-2 border-t border-primary-light/50">
                                              <label className="block text-[13px] font-bold text-primary-dark mb-1">Drag & Drop Unscramble (Optional)</label>
                                              <input
                                                type="text"
                                                placeholder="Sentence to unscramble..."
                                                value={slide.unscrambleText || ""}
                                                onChange={(e) => {
                                                  const newSlides = [...rawSlides];
                                                  newSlides[slideIndex] = { ...newSlides[slideIndex], unscrambleText: e.target.value };
                                                  updateLessonField("readingSlides", newSlides);
                                                }}
                                                className="w-full bg-neutral-bg border border-primary-light rounded-xl p-3 text-[14px] focus:outline-none focus:border-primary"
                                              />
                                            </div>
                                            
                                            {/* Vocabulary */}
                                            <div className="pt-2 border-t border-primary-light/50">
                                              <div className="flex justify-between items-center mb-2">
                                                <label className="block text-[13px] font-bold text-primary-dark">Slide Vocabulary</label>
                                                <button
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    const newSlides = [...rawSlides];
                                                    const currentVocab = newSlides[slideIndex].vocabulary || [];
                                                    newSlides[slideIndex] = { ...newSlides[slideIndex], vocabulary: [...currentVocab, { word: "", translation: "", definition: "" }] };
                                                    updateLessonField("readingSlides", newSlides);
                                                  }}
                                                  className="text-xs text-primary font-bold hover:underline"
                                                >
                                                  + Add Word
                                                </button>
                                              </div>
                                              <div className="space-y-2">
                                                {(slide.vocabulary || []).map((vocab: any, vIdx: number) => (
                                                  <div key={vIdx} className="flex gap-2">
                                                    <input
                                                      type="text"
                                                      placeholder="Word"
                                                      value={vocab.word}
                                                      onChange={(e) => {
                                                        const newSlides = [...rawSlides];
                                                        newSlides[slideIndex].vocabulary[vIdx].word = e.target.value;
                                                        updateLessonField("readingSlides", newSlides);
                                                      }}
                                                      className="w-1/3 bg-neutral-bg border border-primary-light rounded p-2 text-xs"
                                                    />
                                                    <input
                                                      type="text"
                                                      placeholder="Translation"
                                                      value={vocab.translation}
                                                      onChange={(e) => {
                                                        const newSlides = [...rawSlides];
                                                        newSlides[slideIndex].vocabulary[vIdx].translation = e.target.value;
                                                        updateLessonField("readingSlides", newSlides);
                                                      }}
                                                      className="w-1/3 bg-neutral-bg border border-primary-light rounded p-2 text-xs"
                                                    />
                                                    <input
                                                      type="text"
                                                      placeholder="Definition"
                                                      value={vocab.definition || ""}
                                                      onChange={(e) => {
                                                        const newSlides = [...rawSlides];
                                                        newSlides[slideIndex].vocabulary[vIdx].definition = e.target.value;
                                                        updateLessonField("readingSlides", newSlides);
                                                      }}
                                                      className="w-1/3 bg-neutral-bg border border-primary-light rounded p-2 text-xs"
                                                    />
                                                    <button
                                                      onClick={() => {
                                                        const newSlides = [...rawSlides];
                                                        newSlides[slideIndex].vocabulary.splice(vIdx, 1);
                                                        updateLessonField("readingSlides", newSlides);
                                                      }}
                                                      className="text-red-500 hover:text-red-700 px-2"
                                                    >
                                                      ✕
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>

                                          </div>
                                        </div>
                                      ));
                                  })()}
                                  <button
                                    onClick={() => {
                                      const rawSlides = readingSlides.map((s: any) => typeof s === "string" ? { text: s } : s);
                                      updateLessonField("readingSlides", [...rawSlides, { text: "" }]);
                                    }}
                                    className="w-full border border-dashed border-primary-light hover:border-primary text-primary font-bold py-3 rounded-xl transition-colors"
                                  >
                                    + Add New Slide
                                  </button>
                                </div>

                              </div>
                            )}
                            {activity.type !== "Watching" &&`;

const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync('src/spaces/TeacherDashboard.tsx', newContent);
console.log("Success");
