import { useState, useEffect } from "react";

export function useStudentsData() {
  const [studentsList, setStudentsList] = useState<
    {
      id: string;
      name: string;
      username: string;
      password: string;
      createdAt: string;
      avatarId: string;
    }[]
  >(() => {
    const persisted = localStorage.getItem("lms_students");
    return persisted ? JSON.parse(persisted) : [];
  });
  
  const [studentCursuses, setStudentCursuses] = useState<{
    [studentId: string]: {
      id: string;
      type: "unit" | "lesson";
      title: string;
      status: string;
      unitId?: string;
      lessonId?: string;
    }[];
  }>(() => {
    const persisted = localStorage.getItem("lms_student_cursuses");
    return persisted ? JSON.parse(persisted) : {};
  });

  const [studentStats, setStudentStats] = useState<{
    [id: string]: {
      xp: number;
      streak: number;
      dailyGoalProgress: number;
      dailyGoalTotal: number;
    };
  }>(() => {
    const persisted = localStorage.getItem("lms_student_stats");
    return persisted ? JSON.parse(persisted) : {};
  });

  useEffect(() => {
    localStorage.setItem("lms_students", JSON.stringify(studentsList));
  }, [studentsList]);

  useEffect(() => {
    localStorage.setItem(
      "lms_student_cursuses",
      JSON.stringify(studentCursuses),
    );
  }, [studentCursuses]);

  useEffect(() => {
    localStorage.setItem("lms_student_stats", JSON.stringify(studentStats));
  }, [studentStats]);

  const addToCursus = (
    studentId: string,
    item: {
      type: "unit" | "lesson";
      title: string;
      lessonId?: string;
      unitId?: string;
    },
  ) => {
    setStudentCursuses((prev) => {
      const current = prev[studentId] || [];
      return {
        ...prev,
        [studentId]: [
          ...current,
          {
            id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: item.type,
            title: item.title,
            status: "pending",
            lessonId: item.lessonId,
            unitId: item.unitId,
          },
        ],
      };
    });
  };

  return {
    studentsList,
    setStudentsList,
    studentCursuses,
    setStudentCursuses,
    studentStats,
    setStudentStats,
    addToCursus
  };
}
