const fs = require('fs');
const content = fs.readFileSync('src/spaces/TeacherDashboard.tsx', 'utf8');

const correctEnd = `
      {editingFlashcardTargetActivityId !== null && editingLesson !== null && (
        <SelectFlashcardWordsModal
          dictionaryWords={dictionaryWords}
          selectedWordIds={(() => {
            const act = activeLessonObj?.activities.find((a: any) => a.id === editingFlashcardTargetActivityId);
            if (!act) return [];
            return act.flashcardWordIds || act.dictionaryWordIds || [];
          })()}
          alreadyUsedWordIds={(() => {
            const used = new Set<string>();
            lessonsList.forEach((lesson: any) => {
              (lesson.activities || []).forEach((a: any) => {
                if (a.id !== editingFlashcardTargetActivityId) {
                  (a.flashcardWordIds || []).forEach((id: string) => used.add(id));
                  (a.dictionaryWordIds || []).forEach((id: string) => used.add(id));
                }
              });
            });
            return used;
          })()}
          onClose={() => setEditingFlashcardTargetActivityId(null)}
          onSave={(wordIds) => {
            if (activeLessonObj) {
              const newActivities = (activeLessonObj.activities || []).map((a: any) => {
                if (a.id === editingFlashcardTargetActivityId) {
                  if (a.type === "Flashcards" || a.type === "Flashcards-sm2" || a.type === "Grammar Flashcards") {
                    return { ...a, flashcardWordIds: wordIds };
                  }
                  return { ...a, dictionaryWordIds: wordIds, matchingPairs: a.matchingPairs || [] };
                }
                return a;
              });
              updateStandaloneLessonField(editingLesson.lessonId, "activities", newActivities);
            }
            setEditingFlashcardTargetActivityId(null);
          }}
        />
      )}
    </div>
  );
}
`;

const lines = content.split('\n');
const studentsTabIdx = lines.findIndex(l => l.includes('<StudentsTab'));
const closeDivIdx = lines.findIndex((l, idx) => idx > studentsTabIdx && l.includes('</div>'));
const nextCloseDivIdx = lines.findIndex((l, idx) => idx > closeDivIdx && l.includes('</div>'));

const goodContent = lines.slice(0, nextCloseDivIdx + 1).join('\n') + correctEnd;
fs.writeFileSync('src/spaces/TeacherDashboard.tsx', goodContent);

