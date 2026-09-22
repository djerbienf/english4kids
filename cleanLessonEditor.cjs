const fs = require('fs');

let fileContent = fs.readFileSync('src/components/TeacherDashboard/LessonEditor.tsx', 'utf8');

fileContent = fileContent.replace(/  \/\/ Default values for fields[\s\S]*?const readingUnscrambleText = activeLessonObj\?.readingUnscrambleText \?\? "";/m, '');

fs.writeFileSync('src/components/TeacherDashboard/LessonEditor.tsx', fileContent);
