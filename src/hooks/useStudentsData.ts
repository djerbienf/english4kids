import { useStore } from "../store/useStore";

export function useStudentsData() {
  const studentsList = useStore((state) => state.studentsList);
  const setStudentsList = useStore((state) => state.setStudentsList);
  const studentCursuses = useStore((state) => state.studentCursuses);
  const setStudentCursuses = useStore((state) => state.setStudentCursuses);
  const studentStats = useStore((state) => state.studentStats);
  const setStudentStats = useStore((state) => state.setStudentStats);
  const addToCursus = useStore((state) => state.addToCursus);

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
