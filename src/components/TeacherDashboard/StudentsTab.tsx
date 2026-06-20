import React from "react";
import { Button } from "../Button";

// Assuming AVATARS needs to be passed in or defined in a shared constants file
export function StudentsTab({
  showAddStudentForm,
  setShowAddStudentForm,
  newStudent,
  setNewStudent,
  handleAddStudent,
  studentsList,
  setStudentsList,
  AVATARS
}: {
  showAddStudentForm: boolean;
  setShowAddStudentForm: (show: boolean) => void;
  newStudent: any;
  setNewStudent: (student: any) => void;
  handleAddStudent: () => void;
  studentsList: any[];
  setStudentsList: (students: any[]) => void;
  AVATARS: { id: string; src: string; label: string }[];
}) {
  return (
    <div className="max-w-7xl w-full mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-[20px] font-bold">Students</h2>
        <Button onClick={() => setShowAddStudentForm(true)}>
          + Add Student
        </Button>
      </div>

      {showAddStudentForm && (
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Add New Student</h3>
          <div className="mb-6">
            <label className="block text-[14px] font-medium text-text-primary mb-2">
              Select Avatar
            </label>
            <div className="flex gap-4">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() =>
                    setNewStudent({ ...newStudent, avatarId: avatar.id })
                  }
                  className={`w-16 h-16 rounded-full overflow-hidden border-4 transition-all focus:outline-none ${newStudent.avatarId === avatar.id ? "border-primary ring-2 ring-primary ring-offset-2 scale-110" : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"}`}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.label}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-[14px] font-medium text-text-primary mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
                placeholder="Student Name"
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-text-primary mb-2">
                Username
              </label>
              <input
                type="text"
                value={newStudent.username}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    username: e.target.value,
                  })
                }
                placeholder="Username"
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-text-primary mb-2">
                Password
              </label>
              <input
                type="text"
                value={newStudent.password}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    password: e.target.value,
                  })
                }
                placeholder="Password"
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowAddStudentForm(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddStudent}>Save Student</Button>
          </div>
        </div>
      )}

      <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-primary-light">
                <th className="pb-2 font-medium text-text-secondary">
                  Student Name
                </th>
                <th className="pb-2 font-medium text-text-secondary">
                  Username
                </th>
                <th className="pb-2 font-medium text-text-secondary">
                  Password
                </th>
                <th className="pb-2 font-medium text-text-secondary">
                  Created At
                </th>
                <th className="pb-2 font-medium text-text-secondary w-24">
                  Actions
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
                    No students in your class. Click "+ Add Student" above
                    to enroll a first student.
                  </td>
                </tr>
              ) : (
                studentsList.map((student) => (
                  <tr key={student.id}>
                    <td className="py-4 font-bold text-primary-dark">
                      <div className="flex items-center gap-3">
                        {student.avatarId && (
                          <img
                            src={
                              AVATARS.find(
                                (a) => a.id === student.avatarId,
                              )?.src
                            }
                            alt="Avatar"
                            className="w-10 h-10 rounded-full border-2 border-primary-light object-cover"
                          />
                        )}
                        {student.name}
                      </div>
                    </td>
                    <td className="py-4">{student.username}</td>
                    <td className="py-4">{student.password}</td>
                    <td className="py-4 text-text-secondary">
                      {student.createdAt}
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => {
                          setStudentsList(
                            studentsList.filter(
                              (s) => s.id !== student.id,
                            ),
                          );
                        }}
                        className="text-text-secondary hover:text-red-500 transition-colors text-lg"
                        title="Remove Student"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
