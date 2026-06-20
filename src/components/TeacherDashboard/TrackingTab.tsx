import React from "react";
import { Button } from "../Button";
import { TrackingTabAssignedCourses } from "./TrackingTabAssignedCourses";
import { TrackingTabHistory } from "./TrackingTabHistory";

export function TrackingTab({
  selectedTrackingStudent,
  setSelectedTrackingStudent,
  isAssigningFlow,
  setIsAssigningFlow,
  studentsList,
  studentStats,
  studentCursuses,
  setStudentCursuses,
  courseData,
  addToCursus,
  confirmRemoveId,
  setConfirmRemoveId,
  AVATARS
}: {
  selectedTrackingStudent: string | null;
  setSelectedTrackingStudent: (id: string | null) => void;
  isAssigningFlow: boolean;
  setIsAssigningFlow: (flow: boolean) => void;
  studentsList: any[];
  studentStats: any;
  studentCursuses: any;
  setStudentCursuses: React.Dispatch<React.SetStateAction<any>>;
  courseData: any[];
  addToCursus: (studentId: string, item: any) => void;
  confirmRemoveId: string | null;
  setConfirmRemoveId: (id: string | null) => void;
  AVATARS: { id: string; src: string; label: string }[];
}) {
  return (
    <div className="space-y-8">
      <h2 className="text-[20px] font-bold">
        Student Progress & History
      </h2>

      {selectedTrackingStudent ? (
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => {
                setSelectedTrackingStudent(null);
                setIsAssigningFlow(false);
              }}
              className="text-text-secondary hover:text-text-primary px-3 py-1 rounded bg-neutral-bg border border-primary-light font-medium text-[14px]"
            >
              ← Back
            </button>
            <h3 className="font-bold text-[20px] flex items-center gap-3">
              {studentsList.find((s) => s.id === selectedTrackingStudent)
                ?.avatarId && (
                <img
                  src={
                    AVATARS.find(
                      (a) =>
                        a.id ===
                        studentsList.find(
                          (s) => s.id === selectedTrackingStudent,
                        )?.avatarId,
                    )?.src
                  }
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-2 border-primary-light object-cover"
                />
              )}
              {studentsList.find((s) => s.id === selectedTrackingStudent)
                ?.name || "Student Details"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-neutral-bg p-4 rounded-[16px] border border-primary-light">
              <span className="text-text-secondary text-[14px] font-medium">
                Experience Points
              </span>
              <p className="text-[18px] font-bold mt-1 text-primary">
                💎{" "}
                {(studentStats[selectedTrackingStudent] || { xp: 0 }).xp}{" "}
                XP
              </p>
            </div>
            <div className="bg-neutral-bg p-4 rounded-[16px] border border-primary-light">
              <span className="text-text-secondary text-[14px] font-medium">
                Daily Streak
              </span>
              <p className="text-[18px] font-bold mt-1 text-reward-dark">
                🔥{" "}
                {
                  (studentStats[selectedTrackingStudent] || { streak: 1 })
                    .streak
                }{" "}
                Days
              </p>
            </div>
          </div>

          <div className="mb-6 border-t border-primary-light pt-6">
            <TrackingTabAssignedCourses
              selectedTrackingStudent={selectedTrackingStudent}
              isAssigningFlow={isAssigningFlow}
              setIsAssigningFlow={setIsAssigningFlow}
              studentCursuses={studentCursuses}
              setStudentCursuses={setStudentCursuses}
              courseData={courseData}
              addToCursus={addToCursus}
              confirmRemoveId={confirmRemoveId}
              setConfirmRemoveId={setConfirmRemoveId}
            />

            <h4 className="font-bold text-[18px] mb-4 text-primary-dark border-t border-primary-light pt-6">
              Learning History
            </h4>
            <TrackingTabHistory selectedTrackingStudent={selectedTrackingStudent} courseData={courseData} />
          </div>
        </div>
      ) : (
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">
            Student Progress Overview
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-primary-light">
                  <th className="pb-2 font-medium text-text-secondary">
                    Student
                  </th>
                  <th className="pb-2 font-medium text-text-secondary">
                    Completed Lessons
                  </th>
                  <th className="pb-2 font-medium text-text-secondary">
                    Total XP
                  </th>
                  <th className="pb-2 font-medium text-text-secondary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-light/50">
                {studentsList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-text-secondary italic"
                    >
                      No students found. Go to the "Students" tab to
                      create students.
                    </td>
                  </tr>
                ) : (
                  studentsList.map((student, idx) => {
                    const historyData = JSON.parse(
                      localStorage.getItem("lms_student_history") || "[]",
                    );
                    const studentHist = historyData.filter(
                      (h: any) =>
                        h.studentId === student.id &&
                        h.type === "lesson_finish",
                    );
                    return (
                      <tr key={student.id}>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            {student.avatarId && (
                              <img
                                src={
                                  AVATARS.find(
                                    (a) => a.id === student.avatarId,
                                  )?.src
                                }
                                alt="Avatar"
                                className="w-8 h-8 rounded-full border border-primary-light object-cover"
                              />
                            )}
                            <button
                              onClick={() =>
                                setSelectedTrackingStudent(student.id)
                              }
                              className="font-bold hover:text-primary hover:underline"
                            >
                              {student.name}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 font-medium">
                          {studentHist.length} Lessons Finished
                        </td>
                        <td className="py-3 font-medium text-primary-dark">
                          {(studentStats[student.id] || { xp: 0 }).xp} XP
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() =>
                              setSelectedTrackingStudent(student.id)
                            }
                            className="text-primary hover:underline font-bold text-xs"
                          >
                            View Details / History
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
