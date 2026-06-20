import React from "react";
import { Button } from "../../components/Button";

interface Props {
  selectedTrackingStudent: string;
  isAssigningFlow: boolean;
  setIsAssigningFlow: (flow: boolean) => void;
  studentCursuses: any;
  setStudentCursuses: React.Dispatch<React.SetStateAction<any>>;
  courseData: any[];
  addToCursus: (studentId: string, item: any) => void;
  confirmRemoveId: string | null;
  setConfirmRemoveId: (id: string | null) => void;
}

export function TrackingTabAssignedCourses({
  selectedTrackingStudent,
  isAssigningFlow,
  setIsAssigningFlow,
  studentCursuses,
  setStudentCursuses,
  courseData,
  addToCursus,
  confirmRemoveId,
  setConfirmRemoveId,
}: Props) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-[18px] text-primary-dark">
          Assigned Courses
        </h4>
        <Button onClick={() => {
          if (document.startViewTransition) {
            document.startViewTransition(() => setIsAssigningFlow(!isAssigningFlow));
          } else {
            setIsAssigningFlow(!isAssigningFlow);
          }
        }}>
          {isAssigningFlow ? "Cancel" : "+ Assign Course"}
        </Button>
      </div>
      
      {isAssigningFlow && (
        <div className="bg-neutral-bg p-4 rounded-[12px] border border-primary-light mb-4">
          <h5 className="font-bold text-[14px] mb-2">Select a unit to assign:</h5>
          <div className="flex gap-4">
            <select 
              id="assign-select"
              className="flex-1 bg-white border border-primary-light rounded-lg p-2 text-[14px]"
            >
              {courseData.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.title}</option>
              ))}
            </select>
            <Button 
              onClick={() => {
                const selectEl = document.getElementById("assign-select") as HTMLSelectElement;
                const unitId = selectEl?.value;
                const unit = courseData.find(u => u.id === unitId);
                
                const updateState = () => {
                  if (unit) {
                    addToCursus(selectedTrackingStudent, {
                      type: "unit",
                      title: unit.title,
                      unitId: unit.id,
                    });
                  }
                  setIsAssigningFlow(false);
                };

                if (document.startViewTransition) {
                  document.startViewTransition(updateState);
                } else {
                  updateState();
                }
              }}
            >
              Assign
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-8">
        {(studentCursuses[selectedTrackingStudent] || []).length === 0 ? (
          <div className="bg-white/60 p-6 rounded-[16px] border border-primary-light border-dashed text-center">
            <p className="text-text-secondary">
              No courses assigned yet. Click on "+ Assign Course" to start!
            </p>
          </div>
        ) : (
          (studentCursuses[selectedTrackingStudent] || []).map((cursus: any, index: number) => {
            const historyData = JSON.parse(localStorage.getItem("lms_student_history") || "[]");
            const studentHistory = historyData.filter((h: any) => h.studentId === selectedTrackingStudent);
            
            let progress = 0;
            if (cursus.type === "unit") {
              const unit = courseData.find((u: any) => u.id === cursus.unitId);
              if (unit && unit.lessons.length > 0) {
                const finishedLessons = unit.lessons.filter((l: any) => 
                  studentHistory.some((h: any) => h.type === 'lesson_finish' && h.lessonId === l.id)
                ).length;
                progress = Math.round((finishedLessons / unit.lessons.length) * 100);
              }
            } else if (cursus.type === "lesson") {
              const isFinished = studentHistory.some((h: any) => h.type === 'lesson_finish' && h.lessonId === cursus.lessonId);
              if (isFinished) progress = 100;
            }

            return (
              <div
                key={cursus.id || index}
                className={`flex items-center justify-between p-4 rounded-[12px] border pb-4 ${cursus.type === "unit" ? "bg-white border-primary-light" : "bg-neutral-bg border-primary-light/50"}`}
              >
                <div className="flex flex-col flex-1">
                  <span className="text-[15px] font-bold text-primary-dark">
                    {cursus.type === "unit" ? "📚 Unit: " : "📄 Lesson: "}
                    {cursus.title}
                  </span>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="h-1.5 flex-1 bg-neutral-bg rounded-full overflow-hidden">
                      <div className="h-full bg-primary-dark rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-text-secondary w-10 text-right">{progress}%</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-6">
                  <div className="flex flex-col gap-1 mr-2">
                    <button
                      className="text-text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={index === 0}
                      onClick={() => {
                        setStudentCursuses((prev: any) => {
                          const arr = [...(prev[selectedTrackingStudent] || [])];
                          [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
                          return { ...prev, [selectedTrackingStudent]: arr };
                        });
                      }}
                      title="Move Up priority"
                    >
                      <span className="text-sm">▲</span>
                    </button>
                    <button
                      className="text-text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={index === (studentCursuses[selectedTrackingStudent] || []).length - 1}
                      onClick={() => {
                        setStudentCursuses((prev: any) => {
                          const arr = [...(prev[selectedTrackingStudent] || [])];
                          [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
                          return { ...prev, [selectedTrackingStudent]: arr };
                        });
                      }}
                      title="Move Down priority"
                    >
                      <span className="text-sm">▼</span>
                    </button>
                  </div>
                  <button
                    className={`text-sm font-bold px-3 py-1.5 rounded transition-all ${
                      confirmRemoveId === cursus.id 
                      ? "bg-red-50 text-red-600 border border-red-200" 
                      : "text-text-secondary hover:text-red-600 hover:bg-red-50 border border-transparent"
                    }`}
                    onClick={() => {
                      if (confirmRemoveId === cursus.id) {
                        setStudentCursuses((prev: any) => ({
                          ...prev,
                          [selectedTrackingStudent]: prev[selectedTrackingStudent].filter((c: any) => c.id !== cursus.id)
                        }));
                        setConfirmRemoveId(null);
                      } else {
                        setConfirmRemoveId(cursus.id);
                        setTimeout(() => setConfirmRemoveId(null), 3500);
                      }
                    }}
                  >
                    {confirmRemoveId === cursus.id ? "Confirmer ?" : "Remove"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
