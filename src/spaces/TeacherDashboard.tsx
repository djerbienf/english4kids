import { useDictionaryData } from "../hooks/useDictionaryData";
import { useStudentsData } from "../hooks/useStudentsData";
import { useCourseData } from "../hooks/useCourseData";
import React, { useState } from "react";
import { Button } from "../components/Button";
import avatar1 from "../assets/images/avatar_girl_purple_1781191819306.jpg";
import avatar2 from "../assets/images/avatar_boy_glasses_1781191832381.jpg";
import avatar3 from "../assets/images/avatar_girl_pigtails_1781191844201.jpg";
import avatar4 from "../assets/images/avatar_boy_curly_1781191857600.jpg";
import { DictionaryEntry } from "../types";
import { AddWordModal } from "../components/TeacherDashboard/AddWordModal";
import { TextScanner } from "../components/TeacherDashboard/TextScanner";
import { DictionaryTab } from "../components/TeacherDashboard/DictionaryTab";
import { StudentsTab } from "../components/TeacherDashboard/StudentsTab";
import { ParametersTab } from "../components/TeacherDashboard/ParametersTab";
import { TrackingTab } from "../components/TeacherDashboard/TrackingTab";
import { LessonEditor } from "../components/TeacherDashboard/LessonEditor";
import { OrganizationTab } from "../components/TeacherDashboard/OrganizationTab";

const AVATARS = [
  { id: "avatar1", src: avatar1, label: "Girl with purple shirt" },
  { id: "avatar2", src: avatar2, label: "Boy with glasses" },
  { id: "avatar3", src: avatar3, label: "Girl with pigtails" },
  { id: "avatar4", src: avatar4, label: "Boy with green shirt" },
];

interface TeacherDashboardProps {
  onLogout: () => void;
}

type Tab =
  | "organization"
  | "parameters"
  | "tracking"
  | "dictionary"
  | "students";

import { ReadingActivityEditor } from "../components/TeacherDashboard/ReadingActivityEditor";

import { SelectFlashcardWordsModal } from "../components/TeacherDashboard/SelectFlashcardWordsModal";

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("organization");
  const [editingLesson, setEditingLesson] = useState<{
    unitId: string;
    lessonId: string;
    unitTitle: string;
    lessonTitle: string;
  } | null>(null);

  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    username: "",
    password: "",
    avatarId: "avatar1",
  });
  const [selectedTrackingStudent, setSelectedTrackingStudent] = useState<string | null>(null);
  const [isAssigningFlow, setIsAssigningFlow] = useState(false);

  const {
    studentsList,
    setStudentsList,
    studentCursuses,
    setStudentCursuses,
    studentStats,
    setStudentStats,
    addToCursus
  } = useStudentsData();

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.username && newStudent.password) {
      const addedId = Date.now().toString();
      setStudentsList([
        ...studentsList,
        {
          id: addedId,
          name: newStudent.name,
          username: newStudent.username,
          password: newStudent.password,
          createdAt: new Date().toLocaleDateString(),
          avatarId: newStudent.avatarId,
        },
      ]);
      // Also register initial stats for new student
      setStudentStats((prev) => ({
        ...prev,
        [addedId]: {
          xp: 0,
          streak: 1,
          dailyGoalProgress: 0,
          dailyGoalTotal: 3,
        },
      }));
      setNewStudent({
        name: "",
        username: "",
        password: "",
        avatarId: "avatar1",
      });
      setShowAddStudentForm(false);
    }
  };

  const handleResetAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL students, courses, paths, and scores? This action cannot be undone.",
      )
    ) {
      localStorage.removeItem("lms_students");
      localStorage.removeItem("lms_student_cursuses");
      localStorage.removeItem("lms_student_stats");
      localStorage.removeItem("lms_course_data");
      localStorage.removeItem("lms_current_student_id");

      setStudentsList([]);
      setStudentCursuses({});
      setStudentStats({});
      setCourseData([]);
      setSelectedTrackingStudent(null);
      setEditingLesson(null);

      alert(
        "All data has been successfully reset! You can now create new students and courses.",
      );
    }
  };

  const { dictionaryWords, updateDictionary } = useDictionaryData();

  const [showAddWordForm, setShowAddWordForm] = useState(false);
  const [editingWord, setEditingWord] = useState<DictionaryEntry | null>(null);
  const [editingFlashcardTargetActivityId, setEditingFlashcardTargetActivityId] = useState<number | null>(null);

  const {
    courseData,
    setCourseData,
    updateLessonField,
    editingUnitId,
    setEditingUnitId,
    handleCreateUnit,
    handleAddLesson,
    handleMoveLessonUp,
    handleMoveLessonDown,
    handleMoveUnitUp,
    handleMoveUnitDown,
    handleDeleteUnit,
    handleUpdateUnitTitle,
  } = useCourseData(editingLesson);

  const activeUnit = editingLesson
    ? courseData.find((u) => u.id === editingLesson.unitId)
    : undefined;
  const activeLessonObj = editingLesson
    ? activeUnit?.lessons.find((l) => l.id === editingLesson.lessonId)
    : undefined;

  const renderOrganizationTab = () => {
    if (editingLesson) {
      const currentActivities = activeLessonObj?.activities ?? [];

      const isReorderingActivities = (activeLessonObj as any)?._isReordering || false;
      const setIsReorderingActivities = (val: boolean) => updateLessonField("_isReordering", val);
      
      const handleMoveActivity = (index: number, direction: 'up' | 'down') => {
        if (!currentActivities) return;
        const newActivities = [...currentActivities];
        if (direction === 'up' && index > 0) {
          [newActivities[index - 1], newActivities[index]] = [newActivities[index], newActivities[index - 1]];
          updateLessonField("activities", newActivities);
        } else if (direction === 'down' && index < newActivities.length - 1) {
          [newActivities[index + 1], newActivities[index]] = [newActivities[index], newActivities[index + 1]];
          updateLessonField("activities", newActivities);
        }
      };

      const handleDuplicateActivity = (activity: any, index: number) => {
        if (!currentActivities) return;
        const newActivities = [...currentActivities];
        const newActivity = JSON.parse(JSON.stringify(activity));
        newActivity.id = Date.now();
        newActivities.splice(index + 1, 0, newActivity);
        updateLessonField("activities", newActivities);
      };

      const handleDeleteActivity = (id: number) => {
        if (!currentActivities) return;
        updateLessonField("activities", currentActivities.filter((a: any) => a.id !== id));
      };

      const handleAddActivity = (type: any) => {
        if (!currentActivities) return;
        let newAct: any = { id: Date.now(), type, title: `New ${type} Activity` };
        if (type === "Reading") {
          newAct.readingType = "text";
          newAct.readingTitle = "New Story";
          newAct.readingSlides = [{text: "Some text..."}];
        }
        updateLessonField("activities", [...currentActivities, newAct]);
      };

      return (
        <LessonEditor
          editingLesson={editingLesson}
          setEditingLesson={setEditingLesson}
          activeLessonObj={activeLessonObj}
          updateLessonField={updateLessonField}
          isReorderingActivities={isReorderingActivities}
          setIsReorderingActivities={setIsReorderingActivities}
          currentActivities={currentActivities || []}
          handleMoveActivity={handleMoveActivity}
          handleDuplicateActivity={handleDuplicateActivity}
          handleDeleteActivity={handleDeleteActivity}
          handleAddActivity={handleAddActivity}
          setEditingFlashcardTargetActivityId={setEditingFlashcardTargetActivityId}
          dictionaryWords={dictionaryWords}
          updateDictionary={updateDictionary}
        />
      );
    }

    return (
      <OrganizationTab
        courseData={courseData}
        setCourseData={setCourseData}
        editingUnitId={editingUnitId}
        setEditingUnitId={setEditingUnitId}
        handleUpdateUnitTitle={handleUpdateUnitTitle}
        handleMoveUnitUp={handleMoveUnitUp}
        handleMoveUnitDown={handleMoveUnitDown}
        handleDeleteUnit={handleDeleteUnit}
        handleAddLesson={handleAddLesson}
        setEditingLesson={setEditingLesson}
        handleMoveLessonUp={handleMoveLessonUp}
        handleMoveLessonDown={handleMoveLessonDown}
        handleCreateUnit={handleCreateUnit}
      />
    );
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col p-8 text-text-primary">
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <h1 className="text-[26px] font-bold text-primary-dark">
          Teacher Space
        </h1>
        <div className="flex items-center gap-3">
          <button
            id="teacher-reset-data-btn"
            onClick={handleResetAllData}
            className="px-4 py-2 text-[13px] font-bold text-red-500 hover:text-white border border-red-200 hover:bg-red-500 rounded-xl transition-all duration-200"
          >
            🗑 Delete all data
          </button>
          <Button variant="ghost" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-primary-light pb-2">
        <button
          onClick={() => setActiveTab("organization")}
          className={`px-4 py-2 text-[16px] font-bold transition-colors ${activeTab === "organization" ? "text-primary border-b-2 border-primary -mb-[10px]" : "text-text-secondary hover:text-text-primary"}`}
        >
          Course Organization
        </button>
        <button
          onClick={() => setActiveTab("parameters")}
          className={`px-4 py-2 text-[16px] font-bold transition-colors ${activeTab === "parameters" ? "text-primary border-b-2 border-primary -mb-[10px]" : "text-text-secondary hover:text-text-primary"}`}
        >
          Modules
        </button>
        <button
          onClick={() => setActiveTab("tracking")}
          className={`px-4 py-2 text-[16px] font-bold transition-colors ${activeTab === "tracking" ? "text-primary border-b-2 border-primary -mb-[10px]" : "text-text-secondary hover:text-text-primary"}`}
        >
          Student Cursus
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 text-[16px] font-bold transition-colors ${activeTab === "students" ? "text-primary border-b-2 border-primary -mb-[10px]" : "text-text-secondary hover:text-text-primary"}`}
        >
          Students
        </button>
        <button
          onClick={() => setActiveTab("dictionary")}
          className={`px-4 py-2 text-[16px] font-bold transition-colors ${activeTab === "dictionary" ? "text-primary border-b-2 border-primary -mb-[10px]" : "text-text-secondary hover:text-text-primary"}`}
        >
          Dictionary Management
        </button>
      </div>

      <div className="flex-1">
        {activeTab === "organization" && renderOrganizationTab()}

        {activeTab === "parameters" && (
          <ParametersTab />
        )}

        {activeTab === "tracking" && (
          <TrackingTab
            selectedTrackingStudent={selectedTrackingStudent}
            setSelectedTrackingStudent={setSelectedTrackingStudent}
            isAssigningFlow={isAssigningFlow}
            setIsAssigningFlow={setIsAssigningFlow}
            studentsList={studentsList}
            studentStats={studentStats}
            studentCursuses={studentCursuses}
            setStudentCursuses={setStudentCursuses}
            courseData={courseData}
            addToCursus={addToCursus}
            confirmRemoveId={confirmRemoveId}
            setConfirmRemoveId={setConfirmRemoveId}
            AVATARS={AVATARS}
          />
        )}

        {activeTab === "dictionary" && (
          <DictionaryTab
            dictionaryWords={dictionaryWords}
            updateDictionary={updateDictionary}
            showAddWordForm={showAddWordForm}
            setShowAddWordForm={setShowAddWordForm}
            editingWord={editingWord}
            setEditingWord={setEditingWord}
          />
        )}

        {activeTab === "students" && (
          <StudentsTab
            showAddStudentForm={showAddStudentForm}
            setShowAddStudentForm={setShowAddStudentForm}
            newStudent={newStudent}
            setNewStudent={setNewStudent}
            handleAddStudent={handleAddStudent}
            studentsList={studentsList}
            setStudentsList={setStudentsList}
            AVATARS={AVATARS}
          />
        )}
      </div>

      {editingFlashcardTargetActivityId !== null && editingLesson !== null && (
        <SelectFlashcardWordsModal
          dictionaryWords={dictionaryWords}
          selectedWordIds={
            activeLessonObj?.activities.find(
              (a) => a.id === editingFlashcardTargetActivityId
            )?.flashcardWordIds || []
          }
          alreadyUsedWordIds={(() => {
            const used = new Set<string>();
            courseData.forEach((course) => {
              course.lessons.forEach((lesson) => {
                lesson.activities.forEach((a) => {
                  if (a.type === "Flashcards" && a.id !== editingFlashcardTargetActivityId) {
                    (a.flashcardWordIds || []).forEach((id) => used.add(id));
                  }
                });
              });
            });
            return used;
          })()}
          onClose={() => setEditingFlashcardTargetActivityId(null)}
          onSave={(wordIds) => {
            if (activeLessonObj) {
              const newActivities = activeLessonObj.activities.map((a) =>
                a.id === editingFlashcardTargetActivityId
                  ? { ...a, flashcardWordIds: wordIds }
                  : a
              );
              
              const updatedCourses = courseData.map((course) => {
                if (course.id === editingLesson.unitId) {
                  return {
                    ...course,
                    lessons: course.lessons.map((lesson) => {
                      if (lesson.id === editingLesson.lessonId) {
                        return { ...lesson, activities: newActivities };
                      }
                      return lesson;
                    }),
                  };
                }
                return course;
              });

              setCourseData(updatedCourses);
              localStorage.setItem("lms_course_data", JSON.stringify(updatedCourses));
            }
            setEditingFlashcardTargetActivityId(null);
          }}
        />
      )}

    </div>
  );
}
