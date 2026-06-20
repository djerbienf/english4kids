import fs from 'fs';

let file = fs.readFileSync('src/spaces/TeacherDashboard.tsx', 'utf8');

const startStr = "  const [dictionaryWords, setDictionaryWords] = useState<DictionaryEntry[]>(() => {";
const endStr = "    localStorage.setItem(\"lms_dictionary_data\", JSON.stringify(newWords));\n  };";

const startIndex = file.indexOf(startStr);
const endIndex = file.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `  const { dictionaryWords, updateDictionary } = useDictionaryData();`;

  const newFile = file.slice(0, startIndex) + replacement + file.slice(endIndex + endStr.length);
  const finalFile = `import { useDictionaryData } from "../hooks/useDictionaryData";\n` + newFile;
  fs.writeFileSync('src/spaces/TeacherDashboard.tsx', finalFile);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find start or end.", startIndex, endIndex);
}
