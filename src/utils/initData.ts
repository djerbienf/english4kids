import {
  DEFAULT_STUDENTS,
  DEFAULT_CURSUSES,
  DEFAULT_STATS,
  DEFAULT_COURSE_DATA,
} from "../data/mockData";

export function ensureInitialized() {
  // One-time auto-wipe of old mock data so the user gets a fully clean start with custom courses
  if (!localStorage.getItem("lms_full_reset_v5")) {
    localStorage.removeItem("lms_students");
    localStorage.removeItem("lms_student_cursuses");
    localStorage.removeItem("lms_student_stats");
    localStorage.removeItem("lms_course_data");
    localStorage.removeItem("lms_current_student_id");
    localStorage.setItem("lms_full_reset_v5", "yes");
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
}
