import { useState, useCallback } from "react";
import { useStore } from "../store/useStore";

export function useCourseData(editingLesson: any) {
  const courseData = useStore((state) => state.courseData);
  const setCourseData = useStore((state) => state.setCourseData);
  const lessonsList = useStore((state) => state.lessonsList);
  const setLessonsList = useStore((state) => state.setLessonsList);
  const updateStandaloneLessonField = useStore((state) => state.updateStandaloneLessonField);
  const updateLessonField = useStore((state) => state.updateLessonField);

  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  const handleCreateUnit = useCallback(() => {
    const newUnit = {
      id: `u${Date.now()}`,
      title: "New Unit",
      description: "",
      lessonIds: [],
    };
    const currentCourseData = useStore.getState().courseData;
    setCourseData([...currentCourseData, newUnit]);
    setEditingUnitId(newUnit.id);
  }, [setCourseData]);

  const handleAddStandaloneLesson = useCallback((templateData?: any) => {
    const currentLessons = useStore.getState().lessonsList;
    const newLessonId = `l${Date.now()}`;
    const newLesson = {
      id: newLessonId,
      title: templateData?.title || `New Lesson ${currentLessons.length + 1}`,
      status: "Draft",
      ...templateData
    };
    setLessonsList([...currentLessons, newLesson]);
    return newLessonId;
  }, [setLessonsList]);

  const handleDeleteStandaloneLesson = useCallback((lessonId: string) => {
    setLessonsList((prevLessons: any[]) => prevLessons.filter((l) => l.id !== lessonId));
    // Also remove from any unit
    const currentCourseData = useStore.getState().courseData;
    setCourseData(
      currentCourseData.map((unit) => ({
        ...unit,
        lessonIds: (unit.lessonIds || []).filter((id: string) => id !== lessonId),
      }))
    );
    // Also clean up any assigned student pathways
    const currentCursuses = useStore.getState().studentCursuses;
    if (currentCursuses && Object.keys(currentCursuses).length > 0) {
      const updatedCursuses: Record<string, any[]> = {};
      let changed = false;
      for (const [studentId, cursusList] of Object.entries(currentCursuses)) {
        const filtered = (cursusList || []).filter((item: any) => item.lessonId !== lessonId);
        if (filtered.length !== (cursusList || []).length) changed = true;
        updatedCursuses[studentId] = filtered;
      }
      if (changed) {
        useStore.getState().setStudentCursuses(updatedCursuses);
      }
    }
  }, [setLessonsList, setCourseData]);

  const handleLinkLessonToUnit = useCallback((unitId: string, lessonId: string) => {
    const currentCourseData = useStore.getState().courseData;
    setCourseData(
      currentCourseData.map((unit) => {
        if (unit.id === unitId) {
          const currentIds = unit.lessonIds || [];
          if (!currentIds.includes(lessonId)) {
            return {
              ...unit,
              lessonIds: [...currentIds, lessonId],
            };
          }
        }
        return unit;
      })
    );
  }, [setCourseData]);

  const handleUnlinkLessonFromUnit = useCallback((unitId: string, lessonId: string) => {
    const currentCourseData = useStore.getState().courseData;
    setCourseData(
      currentCourseData.map((unit) => {
        if (unit.id === unitId) {
          return {
            ...unit,
            lessonIds: (unit.lessonIds || []).filter((id: string) => id !== lessonId),
          };
        }
        return unit;
      })
    );
  }, [setCourseData]);

  const handleMoveLessonInUnit = useCallback((unitId: string, oldIndex: number, newIndex: number) => {
    const currentCourseData = useStore.getState().courseData;
    setCourseData(
      currentCourseData.map((unit) => {
        if (unit.id === unitId) {
          const newIds = [...(unit.lessonIds || [])];
          const [moved] = newIds.splice(oldIndex, 1);
          newIds.splice(newIndex, 0, moved);
          return { ...unit, lessonIds: newIds };
        }
        return unit;
      })
    );
  }, [setCourseData]);

  const handleMoveUnitUp = useCallback((id: string) => {
    const currentCourseData = useStore.getState().courseData;
    const index = currentCourseData.findIndex((u) => u.id === id);
    if (index > 0) {
      const newData = [...currentCourseData];
      const temp = newData[index - 1];
      newData[index - 1] = newData[index];
      newData[index] = temp;
      setCourseData(newData);
    }
  }, [setCourseData]);

  const handleMoveUnitDown = useCallback((id: string) => {
    const currentCourseData = useStore.getState().courseData;
    const index = currentCourseData.findIndex((u) => u.id === id);
    if (index < currentCourseData.length - 1) {
      const newData = [...currentCourseData];
      const temp = newData[index + 1];
      newData[index + 1] = newData[index];
      newData[index] = temp;
      setCourseData(newData);
    }
  }, [setCourseData]);

  const handleDeleteUnit = useCallback((id: string) => {
    const currentCourseData = useStore.getState().courseData;
    setCourseData(currentCourseData.filter((u) => u.id !== id));

    // Also clean up any assigned student pathways for this unit
    const currentCursuses = useStore.getState().studentCursuses;
    if (currentCursuses && Object.keys(currentCursuses).length > 0) {
      const updatedCursuses: Record<string, any[]> = {};
      let changed = false;
      for (const [studentId, cursusList] of Object.entries(currentCursuses)) {
        const filtered = (cursusList || []).filter((item: any) => item.unitId !== id);
        if (filtered.length !== (cursusList || []).length) changed = true;
        updatedCursuses[studentId] = filtered;
      }
      if (changed) {
        useStore.getState().setStudentCursuses(updatedCursuses);
      }
    }
  }, [setCourseData]);

  const handleUpdateUnitTitle = useCallback((id: string, title: string) => {
    const currentCourseData = useStore.getState().courseData;
    setCourseData(
      currentCourseData.map((u) => (u.id === id ? { ...u, title } : u))
    );
  }, [setCourseData]);

  const handleUpdateLessonFieldWrapper = useCallback((field: string, value: any) => {
    if (editingLesson) updateStandaloneLessonField(editingLesson.lessonId, field, value);
  }, [editingLesson, updateStandaloneLessonField]);

  return {
    courseData,
    setCourseData,
    lessonsList,
    setLessonsList,
    updateStandaloneLessonField,
    updateLessonField: handleUpdateLessonFieldWrapper,
    editingUnitId,
    setEditingUnitId,
    handleCreateUnit,
    handleAddStandaloneLesson,
    handleDeleteStandaloneLesson,
    handleLinkLessonToUnit,
    handleUnlinkLessonFromUnit,
    handleMoveLessonInUnit,
    handleMoveUnitUp,
    handleMoveUnitDown,
    handleDeleteUnit,
    handleUpdateUnitTitle,
  };
}

