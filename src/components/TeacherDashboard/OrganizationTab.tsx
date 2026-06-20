import React from "react";
import { Button } from "../Button";

export function OrganizationTab({
  courseData,
  setCourseData,
  editingUnitId,
  setEditingUnitId,
  handleUpdateUnitTitle,
  handleMoveUnitUp,
  handleMoveUnitDown,
  handleDeleteUnit,
  handleAddLesson,
  setEditingLesson,
  handleMoveLessonUp,
  handleMoveLessonDown,
  handleCreateUnit
}: {
  courseData: any[];
  setCourseData: (data: any[]) => void;
  editingUnitId: string | null;
  setEditingUnitId: (id: string | null) => void;
  handleUpdateUnitTitle: (id: string, title: string) => void;
  handleMoveUnitUp: (id: string) => void;
  handleMoveUnitDown: (id: string) => void;
  handleDeleteUnit: (id: string) => void;
  handleAddLesson: (unitId: string) => void;
  setEditingLesson: (val: any) => void;
  handleMoveLessonUp: (unitId: string, lessonIndex: number) => void;
  handleMoveLessonDown: (unitId: string, lessonIndex: number) => void;
  handleCreateUnit: () => void;
}) {
  return (
    <div className="max-w-7xl w-full mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-[20px] font-bold">Courses & Modules</h2>
        <Button onClick={handleCreateUnit}>+ Create Unit</Button>
      </div>

      {courseData.length === 0 && (
        <div className="text-text-secondary text-center p-8 bg-card-bg rounded-xl border border-primary-light">
          No course units created. Click "+ Create Unit" to get started.
        </div>
      )}

      {courseData.map((unit) => (
        <div
          key={unit.id}
          className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm"
        >
          <div className="flex justify-between items-start border-b border-primary-light pb-4 mb-4">
            {editingUnitId === unit.id ? (
              <div className="flex-1 mr-4">
                <input
                  type="text"
                  value={unit.title}
                  onChange={(e) =>
                    handleUpdateUnitTitle(unit.id, e.target.value)
                  }
                  className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[16px] font-bold text-primary-dark"
                  autoFocus
                  onBlur={() => setEditingUnitId(null)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setEditingUnitId(null)
                  }
                />
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-[16px] text-primary-dark">
                  {unit.title}
                </h3>
                <span className="text-text-secondary text-[14px]">
                  {unit.lessons.length} Lessons
                </span>
              </div>
            )}
            <div className="flex gap-2 items-center">
              {editingUnitId === unit.id ? (
                <Button
                  variant="ghost"
                  onClick={() => setEditingUnitId(null)}
                >
                  Done
                </Button>
              ) : (
                <>
                  <div className="flex gap-1 items-center mr-2 text-text-secondary opacity-60 hover:opacity-100 transition-opacity">
                    <button
                      disabled={courseData.indexOf(unit) === 0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMoveUnitUp(unit.id);
                      }}
                      className="p-1 hover:text-primary disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      disabled={
                        courseData.indexOf(unit) === courseData.length - 1
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMoveUnitDown(unit.id);
                      }}
                      className="p-1 hover:text-primary disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={(e: any) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingUnitId(unit.id);
                    }}
                  >
                    Edit Title
                  </Button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteUnit(unit.id);
                    }}
                    className="text-text-secondary hover:text-red-500 transition-colors p-2 text-lg"
                  >
                    🗑
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {unit.lessons.length === 0 && (
              <div className="text-text-secondary text-[14px] text-center p-4 bg-neutral-bg/50 rounded-xl border border-dashed border-primary-light">
                No lessons in this unit yet.
              </div>
            )}
            {unit.lessons.map((lesson: any, index: number) => (
              <div
                key={lesson.id}
                onClick={() =>
                  setEditingLesson({
                    unitId: unit.id,
                    lessonId: lesson.id,
                    unitTitle: unit.title,
                    lessonTitle: lesson.title,
                  })
                }
                className={`group flex justify-between items-center p-3 rounded-xl border relative cursor-pointer transition-colors ${lesson.status === "Published" ? "bg-primary-light/30 border-primary-light hover:border-primary" : "bg-neutral-bg border-primary-light opacity-80 hover:opacity-100 hover:border-primary-light"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-text-secondary font-bold text-[14px]">
                    #{index + 1}
                  </span>
                  <span
                    className={`font-medium text-[14px] ${lesson.status === "Published" ? "text-primary-dark font-bold" : ""}`}
                  >
                    {lesson.title}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${lesson.status === "Published" ? "bg-success-light text-success" : "text-text-secondary"}`}
                  >
                    {lesson.status}
                  </span>
                  <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <button
                      disabled={index === 0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMoveLessonUp(unit.id, index);
                      }}
                      className="p-1 text-text-secondary disabled:opacity-30 hover:text-primary transition-colors text-lg"
                      title="Move Lesson Up"
                    >
                      ↑
                    </button>
                    <button
                      disabled={index === unit.lessons.length - 1}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMoveLessonDown(unit.id, index);
                      }}
                      className="p-1 text-text-secondary disabled:opacity-30 hover:text-primary transition-colors text-lg"
                      title="Move Lesson Down"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCourseData(
                        courseData.map((u: any) =>
                          u.id === unit.id
                            ? {
                                ...u,
                                lessons: u.lessons.filter(
                                  (l: any) => l.id !== lesson.id,
                                ),
                              }
                            : u,
                        ),
                      );
                    }}
                    className="text-text-secondary hover:text-red-500 transition-all text-lg ml-2"
                    title="Delete Lesson"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button
              variant="ghost"
              onClick={() => handleAddLesson(unit.id)}
              className="border border-dashed border-primary-light w-full hover:border-primary hover:bg-primary-light/10 transition-colors text-text-secondary hover:text-primary"
            >
              + Add Lesson to Unit
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
