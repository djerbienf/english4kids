import React, { memo, useMemo, useState } from "react";
import { Button } from "../Button";
import { Trash2, Plus } from "lucide-react";

export const BuilderTab = memo(function BuilderTab({
  lessonsList,
  handleAddStandaloneLesson,
  handleDeleteStandaloneLesson,
  setEditingLesson
}: any) {
  const [lessonToDelete, setLessonToDelete] = useState<any>(null);

  const normalLessons = useMemo(() => {
    return lessonsList.filter((l: any) => !l.isTest);
  }, [lessonsList]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary-dark">Course Builder</h2>
        <Button onClick={() => {
          const newId = handleAddStandaloneLesson({});
          setEditingLesson({ lessonId: newId, lessonTitle: `New Lesson ${normalLessons.length + 1}` });
        }} variant="primary" className="flex items-center gap-1.5 font-extrabold text-xs">
          <Plus size={15} /> Create Lesson
        </Button>
      </div>
      <div className="space-y-4">
        {normalLessons.length === 0 ? (
          <div className="text-center py-12 bg-white border border-primary-light/50 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-text-secondary font-semibold">No lessons created yet.</p>
          </div>
        ) : (
          normalLessons.map((lesson: any) => (
            <div key={lesson.id} className="border border-primary-light rounded-xl p-4 bg-white shadow-sm flex justify-between items-center cursor-pointer hover:border-primary transition-all duration-200"
                 onClick={() => setEditingLesson({ lessonId: lesson.id, lessonTitle: lesson.title })}>
              <div>
                <h3 className="text-base font-extrabold text-primary-dark">{lesson.title}</h3>
                <p className="text-xs text-text-secondary font-semibold mt-0.5">Status: <span className="text-primary-dark font-extrabold">{lesson.status || "Draft"}</span></p>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="secondary"
                  size="xs"
                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors bg-white border border-primary-light/60"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLessonToDelete(lesson);
                  }}
                  title="Delete Lesson"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Modal Confirmation */}
      {lessonToDelete && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-primary-light/30 font-['Nunito']">
            <h3 className="text-lg font-bold text-primary-dark mb-2">Delete Lesson</h3>
            <p className="text-text-secondary text-sm mb-6">
              Are you sure you want to delete <span className="font-extrabold text-primary-dark">"{lessonToDelete.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setLessonToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-500 hover:bg-red-600 text-white font-bold"
                onClick={() => {
                  handleDeleteStandaloneLesson(lessonToDelete.id);
                  setLessonToDelete(null);
                }}
              >
                Delete Lesson
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
