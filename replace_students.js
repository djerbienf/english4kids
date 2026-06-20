import fs from 'fs';

let file = fs.readFileSync('src/spaces/TeacherDashboard.tsx', 'utf8');

const startStr = "  const [studentsList, setStudentsList] = useState<";
const endStr = `          },
        ],
      };
    });
  };`;

const startIndex = file.indexOf(startStr);
const endIndex = file.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `  const {
    studentsList,
    setStudentsList,
    studentCursuses,
    setStudentCursuses,
    studentStats,
    setStudentStats,
    addToCursus
  } = useStudentsData();`;

  const newFile = file.slice(0, startIndex) + replacement + file.slice(endIndex + endStr.length);
  const finalFile = `import { useStudentsData } from "../hooks/useStudentsData";\n` + newFile;
  fs.writeFileSync('src/spaces/TeacherDashboard.tsx', finalFile);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find start or end.", startIndex, endIndex);
}
