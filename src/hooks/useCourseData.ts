import { useState, useEffect } from "react";

export function useCourseData(editingLesson: any) {
  const [courseData, setCourseData] = useState<
    {
      id: string;
      title: string;
      lessons: {
        id: string;
        title: string;
        status: string;
        videoUrl?: string;
        videoTitle?: string;
        videoDesc?: string;
        videoStart?: string;
        videoEnd?: string;
        flashcardWord?: string;
        flashcardTrans?: string;
        flashcardExample?: string;
        flashcardWordIds?: string[];
        clozeSentenceBefore?: string;
        clozeSentenceAfter?: string;
        clozeCorrect?: string;
        clozeDistractors?: string;
        readingType?: string;
        readingSlides?: string[];
        readingTitle?: string;
        readingAudioUrl?: string;
        readingImageUrl?: string;
        readingUnscrambleText?: string;
        readingVocabulary?: {
          word: string;
          translation: string;
          definition?: string;
        }[];
        activities?: any[];
      }[];
    }[]
  >(() => {
    const persisted = localStorage.getItem("lms_course_data");
    return persisted ? JSON.parse(persisted) : [];
  });

  const updateLessonField = (field: string, value: any) => {
    if (!editingLesson) return;
    setCourseData((prev) =>
      prev.map((unit) => {
        if (unit.id === editingLesson.unitId) {
          return {
            ...unit,
            lessons: unit.lessons.map((lesson) => {
              if (lesson.id === editingLesson.lessonId) {
                return {
                  ...lesson,
                  [field]: value,
                };
              }
              return lesson;
            }),
          };
        }
        return unit;
      })
    );
  };

  useEffect(() => {
    localStorage.setItem("lms_course_data", JSON.stringify(courseData));
  }, [courseData]);

  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  const handleCreateUnit = () => {
    const newUnit = {
      id: `u${Date.now()}`,
      title: `Unit ${courseData.length + 1}: New Unit`,
      lessons: [],
    };
    setCourseData([...courseData, newUnit]);
    setEditingUnitId(newUnit.id);
  };

  const handleAddLesson = (unitId: string) => {
    setCourseData((prev) =>
      prev.map((unit) => {
        if (unit.id === unitId) {
          return {
            ...unit,
            lessons: [
              ...unit.lessons,
              {
                id: `l${Date.now()}`,
                title: `New Lesson ${unit.lessons.length + 1}`,
                status: "Draft",
              },
            ],
          };
        }
        return unit;
      })
    );
  };

  const handleMoveLessonUp = (unitId: string, index: number) => {
    if (index === 0) return;
    setCourseData((prev) =>
      prev.map((unit) => {
        if (unit.id === unitId) {
          const newLessons = [...unit.lessons];
          [newLessons[index - 1], newLessons[index]] = [
            newLessons[index],
            newLessons[index - 1],
          ];
          return { ...unit, lessons: newLessons };
        }
        return unit;
      })
    );
  };

  const handleMoveLessonDown = (unitId: string, index: number) => {
    setCourseData((prev) =>
      prev.map((unit) => {
        if (unit.id === unitId) {
          if (index === unit.lessons.length - 1) return unit;
          const newLessons = [...unit.lessons];
          [newLessons[index + 1], newLessons[index]] = [
            newLessons[index],
            newLessons[index + 1],
          ];
          return { ...unit, lessons: newLessons };
        }
        return unit;
      })
    );
  };

  const handleMoveUnitUp = (unitId: string) => {
    const index = courseData.findIndex((u) => u.id === unitId);
    if (index > 0) {
      const newCourseData = [...courseData];
      [newCourseData[index - 1], newCourseData[index]] = [
        newCourseData[index],
        newCourseData[index - 1],
      ];
      setCourseData(newCourseData);
    }
  };

  const handleMoveUnitDown = (unitId: string) => {
    const index = courseData.findIndex((u) => u.id === unitId);
    if (index < courseData.length - 1) {
      const newCourseData = [...courseData];
      [newCourseData[index + 1], newCourseData[index]] = [
        newCourseData[index],
        newCourseData[index + 1],
      ];
      setCourseData(newCourseData);
    }
  };

  const handleDeleteUnit = (unitId: string) => {
    setCourseData((prev) => prev.filter((u) => u.id !== unitId));
  };

  const handleUpdateUnitTitle = (unitId: string, newTitle: string) => {
    setCourseData((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, title: newTitle } : u))
    );
  };

  return {
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
  };
}
