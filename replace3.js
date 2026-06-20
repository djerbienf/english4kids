import fs from 'fs';

let file = fs.readFileSync('src/spaces/TeacherDashboard.tsx', 'utf8');

const startStr = "  const [courseData, setCourseData] = useState<\n    {";

const endStr = "  const handleUpdateUnitTitle = (unitId: string, newTitle: string) => {\n    setCourseData(\n      courseData.map((u) => (u.id === unitId ? { ...u, title: newTitle } : u)),\n    );\n  };";

const startIndex = file.indexOf(startStr);
const endIndex = file.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `  const {
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
  } = useCourseData(editingLesson);`;

  const newFile = file.slice(0, startIndex) + replacement + file.slice(endIndex + endStr.length);
  
  // also add import at top
  const finalFile = `import { useCourseData } from "../hooks/useCourseData";\n` + newFile;
  fs.writeFileSync('src/spaces/TeacherDashboard.tsx', finalFile);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find start or end.", startIndex, endIndex);
}
