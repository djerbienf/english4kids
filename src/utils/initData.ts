import {
  DEFAULT_STUDENTS,
  DEFAULT_CURSUSES,
  DEFAULT_STATS,
  DEFAULT_COURSE_DATA,
  DEFAULT_LESSONS_LIST,
} from "../data/mockData";

export function ensureInitialized() {
  // One-time auto-wipe of old mock data so the user gets a fully clean start with custom courses
  if (!localStorage.getItem("lms_full_reset_v7")) {
    localStorage.removeItem("lms_students");
    localStorage.removeItem("lms_student_cursuses");
    localStorage.removeItem("lms_student_stats");
    localStorage.removeItem("lms_course_data");
    localStorage.removeItem("lms_lessons_list");
    localStorage.removeItem("lms_student_history");
    localStorage.removeItem("lms_current_student_id");
    localStorage.setItem("lms_full_reset_v7", "yes");
  }

  if (!localStorage.getItem("lms_students")) {
    localStorage.setItem("lms_students", JSON.stringify(DEFAULT_STUDENTS));
  }
  if (!localStorage.getItem("lms_student_cursuses")) {
    localStorage.setItem(
      "lms_student_cursuses",
      JSON.stringify(DEFAULT_CURSUSES),
    );
  }
  if (!localStorage.getItem("lms_student_stats")) {
    localStorage.setItem("lms_student_stats", JSON.stringify(DEFAULT_STATS));
  }
  if (!localStorage.getItem("lms_course_data")) {
    localStorage.setItem(
      "lms_course_data",
      JSON.stringify(DEFAULT_COURSE_DATA),
    );
  }
  if (!localStorage.getItem("lms_lessons_list")) {
    localStorage.setItem(
      "lms_lessons_list",
      JSON.stringify(DEFAULT_LESSONS_LIST),
    );
  }
  if (!localStorage.getItem("lms_student_history")) {
    const defaultHistory = [
      {
        id: "h1",
        studentId: "s_leo",
        lessonId: "u1_l1",
        unitId: "u1",
        type: "lesson_finish",
        timestamp: "2026-07-11T10:00:00.000Z"
      },
      {
        id: "h2",
        studentId: "s_leo",
        lessonId: "u1_l2",
        unitId: "u1",
        type: "lesson_finish",
        timestamp: "2026-07-12T09:00:00.000Z"
      },
      {
        id: "h3",
        studentId: "s_sarah",
        lessonId: "u1_l1",
        unitId: "u1",
        type: "lesson_finish",
        timestamp: "2026-07-12T08:30:00.000Z"
      }
    ];
    localStorage.setItem("lms_student_history", JSON.stringify(defaultHistory));
  }
}
