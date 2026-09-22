import React, { useState, useCallback, useMemo } from "react";
import { useDictionaryData } from "../hooks/useDictionaryData";
import { useStudentsData } from "../hooks/useStudentsData";
import { useCourseData } from "../hooks/useCourseData";
import { useStore } from "../store/useStore";
import { Button } from "../components/Button";
import avatar1 from "../assets/images/avatar_girl_purple_1781191819306.jpg";
import avatar2 from "../assets/images/avatar_boy_glasses_1781191832381.jpg";
import avatar3 from "../assets/images/avatar_girl_pigtails_1781191844201.jpg";
import avatar4 from "../assets/images/avatar_boy_curly_1781191857600.jpg";
import { DictionaryEntry } from "../types";
import { DictionaryTab } from "../components/TeacherDashboard/DictionaryTab";
import { StudentsTab } from "../components/TeacherDashboard/StudentsTab";
import { ParametersTab } from "../components/TeacherDashboard/ParametersTab";
import { TrackingTab } from "../components/TeacherDashboard/TrackingTab";
import { LessonEditor } from "../components/TeacherDashboard/LessonEditor";
import { OrganizationTab } from "../components/TeacherDashboard/OrganizationTab";
import { BuilderTab } from "../components/TeacherDashboard/BuilderTab";
import { AssignmentTab } from "../components/TeacherDashboard/AssignmentTab";
import { OverviewTab } from "../components/TeacherDashboard/OverviewTab";
import { AssetManagerTab } from "../components/TeacherDashboard/AssetManagerTab";
import { SelectFlashcardWordsModal } from "../components/TeacherDashboard/SelectFlashcardWordsModal";
import { SrsParametersTab } from "../components/TeacherDashboard/SrsParametersTab";
import { ObjectivesTab } from "../components/TeacherDashboard/ObjectivesTab";
import { TestBuilderTab } from "../components/TeacherDashboard/TestBuilderTab";
import { TestBankTab } from "../components/TeacherDashboard/TestBankTab";
import { SpiralTab } from "../components/TeacherDashboard/SpiralTab";

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
  | "overview"
  | "builder"
  | "organization"
  | "assignment"
  | "parameters"
  | "tracking"
  | "spiral"
  | "dictionary"
  | "srs-parameters"
  | "students"
  | "assets"
  | "objectives"
  | "tests"
  | "test-bank";

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editingLesson, setEditingLesson] = useState<{
    lessonId: string;
    lessonTitle: string;
  } | null>(null);


  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    username: "",
    password: "",
    avatarId: "avatar1",
  });
  const [selectedTrackingStudent, setSelectedTrackingStudent] = useState<
    string | null
  >(null);
  const [isAssigningFlow, setIsAssigningFlow] = useState(false);

  const {
    studentsList,
    setStudentsList,
    studentCursuses,
    setStudentCursuses,
    studentStats,
    setStudentStats,
    addToCursus,
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

  const resetAllData = useStore((state) => state.resetAllData);
  const handleResetAllData = () => {
    localStorage.removeItem("lms_current_student_id");
    resetAllData();
    setSelectedTrackingStudent(null);
    setEditingLesson(null);
  };

  const { dictionaryWords, updateDictionary } = useDictionaryData();

  const [showAddWordForm, setShowAddWordForm] = useState(false);
  const [editingWord, setEditingWord] = useState<DictionaryEntry | null>(null);
  const [
    editingFlashcardTargetActivityId,
    setEditingFlashcardTargetActivityId,
  ] = useState<number | null>(null);

  const {
    courseData,
    setCourseData,
    lessonsList,
    setLessonsList,
    updateStandaloneLessonField,
    updateLessonField,
    editingUnitId,
    setEditingUnitId,
    handleCreateUnit,
    handleAddStandaloneLesson,
    handleDeleteStandaloneLesson,
    handleLinkLessonToUnit,
    handleUnlinkLessonFromUnit,
    handleMoveLessonInUnit,
    handleMoveUnitUp,
    handleMoveUnitDown,
    handleDeleteUnit,
    handleUpdateUnitTitle,
  } = useCourseData(editingLesson);

  const activeLessonObj = useMemo(() => {
    return editingLesson ? lessonsList.find((l: any) => l.id === editingLesson.lessonId) : null;
  }, [editingLesson, lessonsList]);

  const handleUpdateLessonField = useCallback((field: string, value: any) => {
    if (editingLesson) {
      updateStandaloneLessonField(editingLesson.lessonId, field, value);
    }
  }, [editingLesson, updateStandaloneLessonField]);

  const handleSetIsReorderingActivities = useCallback((val: boolean) => {
    if (editingLesson) {
      updateStandaloneLessonField(editingLesson.lessonId, "_isReordering", val);
    }
  }, [editingLesson, updateStandaloneLessonField]);

  const handleMoveActivity = useCallback((index: number, direction: "up" | "down") => {
    if (!editingLesson) return;
    const currentLessons = useStore.getState().lessonsList;
    const lesson = currentLessons.find((l: any) => l.id === editingLesson.lessonId);
    if (!lesson) return;
    const newActivities = [...(lesson.activities || [])];
    if (direction === "up" && index > 0) {
      [newActivities[index - 1], newActivities[index]] = [newActivities[index], newActivities[index - 1]];
    } else if (direction === "down" && index < newActivities.length - 1) {
      [newActivities[index + 1], newActivities[index]] = [newActivities[index], newActivities[index + 1]];
    }
    updateStandaloneLessonField(editingLesson.lessonId, "activities", newActivities);
  }, [editingLesson, updateStandaloneLessonField]);

  const handleDuplicateActivity = useCallback((activity: any, index: number) => {
    if (!editingLesson) return;
    const currentLessons = useStore.getState().lessonsList;
    const lesson = currentLessons.find((l: any) => l.id === editingLesson.lessonId);
    if (!lesson) return;
    const newActivities = [...(lesson.activities || [])];
    const newActivity = JSON.parse(JSON.stringify(activity));
    newActivity.id = Date.now();
    newActivities.splice(index + 1, 0, newActivity);
    updateStandaloneLessonField(editingLesson.lessonId, "activities", newActivities);
  }, [editingLesson, updateStandaloneLessonField]);

  const handleDeleteActivity = useCallback((id: number) => {
    if (!editingLesson) return;
    const currentLessons = useStore.getState().lessonsList;
    const lesson = currentLessons.find((l: any) => l.id === editingLesson.lessonId);
    if (!lesson) return;
    const newActivities = (lesson.activities || []).filter((a: any) => a.id !== id);
    updateStandaloneLessonField(editingLesson.lessonId, "activities", newActivities);
  }, [editingLesson, updateStandaloneLessonField]);

  const handleAddActivity = useCallback((type: any) => {
    if (!editingLesson) return;
    const currentLessons = useStore.getState().lessonsList;
    const lesson = currentLessons.find((l: any) => l.id === editingLesson.lessonId);
    if (!lesson) return;
    let newAct: any = { id: Date.now(), type, title: `New ${type} Activity` };
    if (type === "Reading") {
      newAct.storyText = "Once upon a time...";
      newAct.readingQuestionType = "questions";
      newAct.readingQuestions = [{ question: "What happened?", options: ["A", "B", "C"], answer: "A" }];
    } else if (type === "Flashcards" || type === "Flashcards-sm2") {
      newAct.flashcardPairs = [{ left: "Hello", right: "Bonjour" }];
    } else if (type === "Matching") {
      newAct.matchingPairs = [{ left: "Cat", right: "Chat" }];
    } else if (type === "Multiple Choice") {
      newAct.multipleChoiceQuestion = "1+1?";
      newAct.multipleChoiceOptions = ["1", "2", "3"];
      newAct.multipleChoiceCorrectAnswer = "2";
    } else if (type === "Writing") {
      newAct.writingTitle = "Writing Task";
      newAct.writingPrompt = "Write a short paragraph describing your favorite daily routine or leisure activity.";
      newAct.writingInstructions = "Write in complete sentences and aim to use clear grammar.";
      newAct.writingStarterText = "In my free time, I usually...";
      newAct.minWords = 20;
      newAct.maxWords = 150;
      newAct.requiredKeywords = ["usually", "always"];
      newAct.sampleAnswer = "In my free time, I usually read books and spend time with my family. I always enjoy learning new things.";
      newAct.evaluationCriteria = ["Clear paragraph structure", "Used complete sentences", "Checked spelling and punctuation"];
      newAct.allowAiFeedback = true;
    }
    updateStandaloneLessonField(editingLesson.lessonId, "activities", [...(lesson.activities || []), newAct]);
  }, [editingLesson, updateStandaloneLessonField]);

  const handleGoToObjectives = useCallback(() => {
    setActiveTab("objectives");
  }, []);

  const handleGenerateActivitiesFromDictionary = useCallback((selectedWordIds: Set<string>) => {
    const currentWords = useStore.getState().dictionaryWords;
    const words = currentWords.filter(w => selectedWordIds.has(w.id));
    
    const newLessonId = `l${Date.now()}`;
    const newLesson = {
      id: newLessonId,
      title: `Vocabulary (${words.length} words)`,
      status: "Draft",
      activities: [
        {
          id: Date.now(),
          type: "Flashcards",
          title: "Learn New Words",
          flashcardWordIds: Array.from(selectedWordIds)
        },
        {
          id: Date.now() + 1,
          type: "Matching",
          title: "Matching Practice",
          matchingPairs: [],
          dictionaryWordIds: words.map(w => w.id)
        }
      ]
    };

    const currentLessons = useStore.getState().lessonsList;
    setLessonsList([...currentLessons, newLesson]);
    
    setActiveTab("builder");
    setEditingLesson({
      lessonId: newLessonId,
      lessonTitle: newLesson.title
    });
  }, [setLessonsList]);

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col p-8 text-text-primary">
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-[26px] font-bold text-primary-dark">
            Teacher Space
          </h1>
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Cloud Firestore Synchronized
          </span>
        </div>
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

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-[1400px] mx-auto h-[calc(100vh-150px)]">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-4 bg-card-bg p-4 rounded-2xl border border-primary-light h-fit overflow-y-auto">
          {/* Section: Overview */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center justify-between gap-3 ${activeTab === "overview" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span className="flex items-center gap-2.5">
                <span>📊</span> Overview
              </span>
            </button>
          </div>

          {/* Section: Curriculum */}
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary/70 px-3 mb-1.5">
              Curriculum Design
            </p>
            <button
              onClick={() => setActiveTab("builder")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center gap-2.5 ${activeTab === "builder" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span>🛠️</span> Course Builder
            </button>
            <button
              onClick={() => setActiveTab("tests")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center gap-2.5 ${activeTab === "tests" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span>📝</span> Test Builder
            </button>
            <button
              onClick={() => setActiveTab("organization")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center gap-2.5 ${activeTab === "organization" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span>📚</span> Course Organization
            </button>
            <button
              onClick={() => setActiveTab("objectives")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center gap-2.5 ${activeTab === "objectives" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span>🎯</span> Pedagogical Objectives
            </button>
          </div>

          {/* Section: Students */}
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary/70 px-3 mb-1.5">
              Student Management
            </p>
            <button
              onClick={() => setActiveTab("assignment")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center gap-2.5 ${activeTab === "assignment" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span>🤝</span> Assign Courses
            </button>
            <button
              onClick={() => setActiveTab("tracking")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center gap-2.5 ${activeTab === "tracking" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span>📈</span> Student Progress
            </button>
            <button
              onClick={() => setActiveTab("spiral")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center gap-2.5 ${activeTab === "spiral" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span>🌀</span> Spiral Pedagogy & AI
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center gap-2.5 ${activeTab === "students" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span>👥</span> Student Accounts
            </button>
          </div>

          {/* Section: Resources */}
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary/70 px-3 mb-1.5">
              Resources & Config
            </p>
            <button
              onClick={() => setActiveTab("test-bank")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center gap-2.5 ${activeTab === "test-bank" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span>🏦</span> Test Bank
            </button>
            <button
              onClick={() => setActiveTab("assets")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center gap-2.5 ${activeTab === "assets" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span>📁</span> Media Library
            </button>
            <button
              onClick={() => setActiveTab("dictionary")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center gap-2.5 ${activeTab === "dictionary" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span>📖</span> Dictionary
            </button>
            <button
              onClick={() => setActiveTab("srs-parameters")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center justify-between gap-3 ${activeTab === "srs-parameters" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span className="flex items-center gap-2.5">
                <span>🧠</span> Flashcards-SM2
              </span>
            </button>
            <button
              onClick={() => setActiveTab("parameters")}
              className={`w-full px-4 py-2.5 text-[14px] font-bold rounded-xl text-left transition-all duration-150 flex items-center justify-between gap-3 ${activeTab === "parameters" ? "bg-primary/10 text-primary-dark border-l-4 border-primary pl-3" : "text-text-secondary hover:bg-neutral-bg hover:text-text-primary"}`}
            >
              <span className="flex items-center gap-2.5">
                <span>⚙️</span> Modules & Settings
              </span>
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-primary-light p-6 overflow-x-hidden overflow-y-auto h-full relative">
          {activeTab === "overview" && (
            <OverviewTab
              courseData={courseData}
              lessonsList={lessonsList}
              dictionaryWords={dictionaryWords}
              onNavigate={(tab) => setActiveTab(tab as Tab)}
            />
          )}
          {(activeTab === "builder" || activeTab === "tests" || activeTab === "test-bank") && editingLesson && (
            <LessonEditor
              editingLesson={editingLesson}
              setEditingLesson={setEditingLesson}
              activeLessonObj={activeLessonObj}
              updateLessonField={handleUpdateLessonField}
              isReorderingActivities={activeLessonObj?._isReordering || false}
              setIsReorderingActivities={handleSetIsReorderingActivities}
              currentActivities={activeLessonObj?.activities || []}
              handleMoveActivity={handleMoveActivity}
              handleDuplicateActivity={handleDuplicateActivity}
              handleDeleteActivity={handleDeleteActivity}
              handleAddActivity={handleAddActivity}
              handleDeleteLesson={handleDeleteStandaloneLesson}
              setEditingFlashcardTargetActivityId={setEditingFlashcardTargetActivityId}
              dictionaryWords={dictionaryWords}
              updateDictionary={updateDictionary}
              onGoToObjectives={handleGoToObjectives}
            />
          )}
          {activeTab === "builder" && !editingLesson && (
            <BuilderTab
              lessonsList={lessonsList}
              handleAddStandaloneLesson={handleAddStandaloneLesson}
              handleDeleteStandaloneLesson={handleDeleteStandaloneLesson}
              setEditingLesson={setEditingLesson}
            />
          )}
          {activeTab === "organization" && (
            <OrganizationTab
              courseData={courseData}
              lessonsList={lessonsList}
              handleCreateUnit={handleCreateUnit}
              handleDeleteUnit={handleDeleteUnit}
              handleUpdateUnitTitle={handleUpdateUnitTitle}
              handleMoveUnitUp={handleMoveUnitUp}
              handleMoveUnitDown={handleMoveUnitDown}
              handleLinkLessonToUnit={handleLinkLessonToUnit}
              handleUnlinkLessonFromUnit={handleUnlinkLessonFromUnit}
              handleMoveLessonInUnit={handleMoveLessonInUnit}
            />
          )}
          {activeTab === "objectives" && (
            <ObjectivesTab
              lessonsList={lessonsList}
              updateStandaloneLessonField={updateStandaloneLessonField}
              setActiveTab={setActiveTab}
              setEditingLesson={setEditingLesson}
            />
          )}
          {activeTab === "assignment" && (
             <AssignmentTab
               studentsList={studentsList}
               courseData={courseData}
               lessonsList={lessonsList}
             />
          )}
          {activeTab === "parameters" && <ParametersTab />}

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

          {activeTab === "spiral" && <SpiralTab />}

          {activeTab === "tests" && !editingLesson && (
            <TestBuilderTab
              lessonsList={lessonsList}
              handleAddStandaloneLesson={handleAddStandaloneLesson}
              handleDeleteStandaloneLesson={handleDeleteStandaloneLesson}
              setEditingLesson={setEditingLesson}
            />
          )}

          {activeTab === "test-bank" && !editingLesson && (
            <TestBankTab
              lessonsList={lessonsList}
              courseData={courseData}
              handleDeleteStandaloneLesson={handleDeleteStandaloneLesson}
              setEditingLesson={setEditingLesson}
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
              onGenerateActivity={handleGenerateActivitiesFromDictionary}
            />
          )}

          {activeTab === "srs-parameters" && (
            <SrsParametersTab
              studentsList={studentsList}
              dictionaryWords={dictionaryWords}
            />
          )}

          {activeTab === "assets" && <AssetManagerTab />}

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
      </div>
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
