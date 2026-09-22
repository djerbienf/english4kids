const fs = require('fs');

let fileContent = fs.readFileSync('src/store/useStore.ts', 'utf8');

const regexMap = [
  {
    name: 'updateDictionary',
    regex: /const batches: Promise<void>\[\] = \[\];[\s\S]*?await Promise\.all\(batches\);/m,
    replacement: 'await syncCollectionToFirestore("dictionary_words", addedOrUpdated, removedIds);'
  },
  {
    name: 'setLessonsList',
    regex: /const batches: Promise<void>\[\] = \[\];[\s\S]*?await Promise\.all\(batches\);/m,
    replacement: 'await syncCollectionToFirestore("lessons", newData, removedIds);'
  },
  {
    name: 'setCourseData',
    regex: /const batches: Promise<void>\[\] = \[\];[\s\S]*?await Promise\.all\(batches\);/m,
    replacement: 'await syncCollectionToFirestore("courses", newData, removedIds, (unit, index) => ({ ...unit, order: index }));'
  },
  {
    name: 'setStudentsList',
    regex: /const batches: Promise<void>\[\] = \[\];[\s\S]*?await Promise\.all\(batches\);/m,
    replacement: 'await syncCollectionToFirestore("students", newData, removedIds);'
  }
];

let currentIndex = 0;
fileContent = fileContent.replace(/const batches: Promise<void>\[\] = \[\];[\s\S]*?await Promise\.all\(batches\);/mg, (match) => {
  if (currentIndex < regexMap.length) {
    const replacement = regexMap[currentIndex].replacement;
    currentIndex++;
    return replacement;
  }
  return match;
});

fs.writeFileSync('src/store/useStore.ts', fileContent);
