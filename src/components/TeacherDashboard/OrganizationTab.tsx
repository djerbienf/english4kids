import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../Button";
import { useStore } from "../../store/useStore";
import {
  GripVertical,
  Trash2,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Layers,
  Edit2,
  Check,
  AlertTriangle,
  Link,
  Unlink,
  Plus,
  HelpCircle
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableLessonItem({ lesson, unitId, handleUnlinkLessonFromUnit }: any) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isConfirming) {
      const timer = setTimeout(() => setIsConfirming(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirming]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const activitiesCount = lesson.activities?.length || 0;
  const objectivesCount = lesson.objectives?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex justify-between items-center p-3.5 rounded-xl border transition-all duration-200 ${
        isDragging
          ? "bg-primary/10 border-primary shadow-xl ring-2 ring-primary/20 scale-[1.01]"
          : "bg-white border-primary-light/50 hover:border-primary/40 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="text-text-secondary hover:text-text-primary cursor-grab active:cursor-grabbing p-1.5 hover:bg-neutral-bg rounded-lg transition-colors shrink-0"
          title="Drag to reorder lesson inside unit"
        >
          <GripVertical size={16} className="text-text-secondary/80" />
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-2 bg-primary-light/10 rounded-lg text-primary-dark shrink-0">
            <BookOpen size={15} />
          </span>
          <div className="min-w-0">
            <span className="font-extrabold text-[13px] text-text-primary block truncate">
              {lesson.title}
            </span>
            <div className="flex gap-2 items-center text-[11px] text-text-secondary font-semibold mt-0.5">
              <span>{activitiesCount} {activitiesCount === 1 ? "activity" : "activities"}</span>
              <span className="text-text-secondary/40">•</span>
              <span className={`px-1.5 py-0.2 rounded-full font-bold ${objectivesCount > 0 ? "bg-cyan-50 text-cyan-700 border border-cyan-100" : "bg-neutral-bg text-text-secondary"}`}>
                {objectivesCount} {objectivesCount === 1 ? "objective" : "objectives"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="xs"
        className={`shrink-0 rounded-xl transition-all duration-200 p-2 ${
          isConfirming
            ? "text-red-600 bg-red-50 hover:bg-red-100 font-extrabold border border-red-200"
            : "text-slate-400 hover:text-cyan-700 hover:bg-cyan-50"
        }`}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (isConfirming) {
            handleUnlinkLessonFromUnit(unitId, lesson.id);
            setIsConfirming(false);
          } else {
            setIsConfirming(true);
          }
        }}
        title={isConfirming ? "Confirm Unlink" : "Unlink Lesson"}
      >
        {isConfirming ? (
          <span className="text-[11px] px-1.5 flex items-center gap-1">
            <Check size={14} /> Unlink?
          </span>
        ) : (
          <Unlink size={15} />
        )}
      </Button>
    </div>
  );
}

export const OrganizationTab = React.memo(function OrganizationTab({
  courseData = [],
  lessonsList = [],
  handleCreateUnit,
  handleDeleteUnit,
  handleUpdateUnitTitle,
  handleMoveUnitUp,
  handleMoveUnitDown,
  handleLinkLessonToUnit,
  handleUnlinkLessonFromUnit,
  handleMoveLessonInUnit
}: any) {
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editingTitleVal, setEditingTitleVal] = useState<string>("");
  const [selectedLessonForUnit, setSelectedLessonForUnit] = useState<Record<string, string>>({});
  const [unitToDelete, setUnitToDelete] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, unitId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const unit = courseData.find((u: any) => u.id === unitId);
      if (unit) {
        const oldIndex = (unit.lessonIds || []).indexOf(active.id as string);
        const newIndex = (unit.lessonIds || []).indexOf(over.id as string);
        handleMoveLessonInUnit(unitId, oldIndex, newIndex);
      }
    }
  };

  // Find all lessons that are not currently linked to any Unit
  const unassignedLessons = useMemo(() => {
    const linkedIds = new Set<string>();
    courseData.forEach((unit: any) => {
      (unit.lessonIds || []).forEach((id: string) => linkedIds.add(id));
    });
    return lessonsList.filter((l) => !linkedIds.has(l.id));
  }, [courseData, lessonsList]);

  // Statistics for top bar
  const totalMappedLessons = useMemo(() => {
    let sum = 0;
    courseData.forEach((u: any) => {
      sum += (u.lessonIds || []).length;
    });
    return sum;
  }, [courseData]);

  const handleStartEditingTitle = (unit: any) => {
    setEditingUnitId(unit.id);
    setEditingTitleVal(unit.title);
  };

  const handleSaveTitle = (unitId: string) => {
    if (editingTitleVal.trim()) {
      handleUpdateUnitTitle(unitId, editingTitleVal.trim());
    }
    setEditingUnitId(null);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header with general instructions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary-light pb-4">
        <div>
          <h2 className="text-[22px] font-bold text-primary-dark flex items-center gap-2">
            <span>📚</span> Course & Unit Organization
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Group curriculum lessons into sequential chapters or learning units. Drag & drop to sort.
          </p>
        </div>
        <Button
          onClick={handleCreateUnit}
          variant="primary"
          className="font-extrabold flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-sm text-sm"
        >
          <Plus size={16} /> Add New Unit
        </Button>
      </div>

      {/* Ergonomic Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-primary-light/50 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary-dark">
            <Layers size={22} />
          </div>
          <div>
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-text-secondary">
              Total Units
            </span>
            <span className="text-xl font-extrabold text-primary-dark">
              {courseData.length} Chapters
            </span>
          </div>
        </div>

        <div className="bg-white border border-primary-light/50 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <BookOpen size={22} />
          </div>
          <div>
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-text-secondary">
              Lessons Sequenced
            </span>
            <span className="text-xl font-extrabold text-emerald-700">
              {totalMappedLessons} of {lessonsList.length}
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-4 shadow-sm transition-all ${
          unassignedLessons.length > 0
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : "bg-white border-primary-light/50 text-text-primary"
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            unassignedLessons.length > 0 ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-neutral-bg text-text-secondary"
          }`}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-text-secondary">
              Unassigned Lessons
            </span>
            <span className={`text-xl font-extrabold ${unassignedLessons.length > 0 ? "text-amber-700" : "text-text-secondary"}`}>
              {unassignedLessons.length} {unassignedLessons.length === 1 ? "lesson" : "lessons"}
            </span>
          </div>
        </div>
      </div>

      {/* Unassigned Lessons Helper Box (Interactive Work Ergonomics) */}
      {unassignedLessons.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50/50 to-amber-100/30 border border-amber-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-700 shrink-0" />
            <h4 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">
              Ready for organization
            </h4>
          </div>
          <p className="text-xs text-amber-900/80 leading-relaxed font-semibold">
            These active lessons exist in the Course Builder but are not yet grouped into any Unit. Add them below to make them visible to students.
          </p>
          <div className="flex gap-2 flex-wrap max-h-[120px] overflow-y-auto pr-1">
            {unassignedLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white border border-amber-200/60 shadow-sm rounded-xl px-3 py-1.5 text-xs font-bold text-text-primary flex items-center gap-2 hover:border-amber-400/80 transition-colors"
              >
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                <span>{lesson.title}</span>
                <select
                  onChange={(e) => {
                    const unitId = e.target.value;
                    if (unitId) {
                      handleLinkLessonToUnit(unitId, lesson.id);
                    }
                  }}
                  className="bg-neutral-bg hover:bg-neutral-bg/80 text-[10px] font-bold py-1 px-1.5 rounded-lg border border-amber-100 text-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  defaultValue=""
                >
                  <option value="" disabled>+ Map to Unit</option>
                  {courseData.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.title}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Units List */}
      <div className="space-y-6">
        {courseData.length === 0 ? (
          <div className="text-center py-16 bg-white border border-primary-light rounded-3xl p-8 shadow-sm">
            <div className="w-16 h-16 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers size={28} className="text-primary-dark" />
            </div>
            <h3 className="font-extrabold text-lg text-text-primary">Create Your First Unit</h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1 mb-6">
              Create curriculum chapters or units to sequence, organize, and bundle learning resources.
            </p>
            <Button onClick={handleCreateUnit} variant="primary">
              + Create Unit Folder
            </Button>
          </div>
        ) : (
          courseData.map((unit: any, uIndex: number) => {
            const hasLessons = (unit.lessonIds || []).length > 0;
            const linkableLessons = lessonsList.filter(
              (l: any) => !(unit.lessonIds || []).includes(l.id)
            );

            return (
              <div
                key={unit.id}
                className="border border-primary-light rounded-2xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Unit Header Panel */}
                <div className="bg-neutral-bg/40 border-b border-primary-light/50 px-5 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="bg-primary/10 border border-primary/20 text-primary-dark font-extrabold text-[11px] px-3 py-1 rounded-full shrink-0">
                      Unit {uIndex + 1}
                    </span>
                    
                    {editingUnitId === unit.id ? (
                      <div className="flex items-center gap-2 max-w-md w-full">
                        <input
                          type="text"
                          value={editingTitleVal}
                          onChange={(e) => setEditingTitleVal(e.target.value)}
                          className="px-3 py-1 bg-white border border-primary rounded-xl font-bold text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTitle(unit.id);
                            if (e.key === "Escape") setEditingUnitId(null);
                          }}
                        />
                        <Button
                          onClick={() => handleSaveTitle(unit.id)}
                          variant="primary"
                          size="xs"
                          className="p-1.5 shrink-0"
                          title="Save title"
                        >
                          <Check size={14} />
                        </Button>
                      </div>
                    ) : (
                      <h3
                        className="text-[15px] font-extrabold text-text-primary flex items-center gap-2 cursor-pointer hover:text-primary min-w-0 group"
                        onClick={() => handleStartEditingTitle(unit)}
                        title="Click to edit Unit title"
                      >
                        <span className="truncate">{unit.title}</span>
                        <Edit2 size={13} className="text-text-secondary/50 group-hover:text-primary transition-colors shrink-0" />
                      </h3>
                    )}
                  </div>

                  {/* Unit Action Buttons (Move, Delete) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => handleMoveUnitUp(unit.id)}
                      disabled={uIndex === 0}
                      className="p-2 bg-white text-text-primary hover:text-primary-dark"
                      title="Move Unit Up"
                    >
                      <ArrowUp size={14} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => handleMoveUnitDown(unit.id)}
                      disabled={uIndex === courseData.length - 1}
                      className="p-2 bg-white text-text-primary hover:text-primary-dark"
                      title="Move Unit Down"
                    >
                      <ArrowDown size={14} />
                    </Button>
                    <div className="w-px h-5 bg-primary-light/80 mx-1.5"></div>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => setUnitToDelete(unit)}
                      className="p-2 bg-white text-slate-400 border border-primary-light/60 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                      title="Delete Unit"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* Unit Content Area */}
                <div className="p-5 space-y-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleDragEnd(e, unit.id)}
                  >
                    <SortableContext
                      items={unit.lessonIds || []}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2.5">
                        {!hasLessons ? (
                          <div className="text-center py-8 bg-neutral-bg/30 border border-dashed border-primary-light/60 rounded-2xl px-4">
                            <span className="text-xl">📭</span>
                            <p className="text-xs text-text-secondary font-medium mt-1">
                              This Unit folder is currently empty.
                            </p>
                            <p className="text-[10px] text-text-secondary/80 mt-0.5">
                              Link lessons below to build your curriculum sequence.
                            </p>
                          </div>
                        ) : (
                          (unit.lessonIds || []).map((lId: string) => {
                            const lesson = lessonsList.find((l: any) => l.id === lId);
                            if (!lesson) return null;
                            return (
                              <SortableLessonItem
                                key={lId}
                                lesson={lesson}
                                unitId={unit.id}
                                handleUnlinkLessonFromUnit={handleUnlinkLessonFromUnit}
                              />
                            );
                          })
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Add Lesson to Unit Control Bar */}
                  <div className="pt-4 border-t border-primary-light/40 flex flex-col sm:flex-row gap-2.5 items-center bg-neutral-bg/10 -mx-5 -mb-5 p-5 mt-4">
                    <span className="text-[11px] font-extrabold text-text-secondary uppercase tracking-wider self-start sm:self-center shrink-0">
                      Add lesson to sequence:
                    </span>
                    <div className="flex gap-2.5 w-full">
                      <select
                        className="px-3 py-2 bg-white border border-primary-light/80 hover:border-primary/60 rounded-xl text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary flex-1 min-w-0"
                        value={selectedLessonForUnit[unit.id] || ""}
                        onChange={(e) => setSelectedLessonForUnit({ ...selectedLessonForUnit, [unit.id]: e.target.value })}
                      >
                        <option value="" disabled>Select a lesson to map...</option>
                        {linkableLessons.map((l: any) => (
                          <option key={l.id} value={l.id}>
                            {l.title} ({l.activities?.length || 0} act.)
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        className="font-extrabold text-xs py-2 px-4 border-primary-light/80 hover:bg-primary-light/20 text-primary-dark shadow-sm bg-white shrink-0 rounded-xl"
                        onClick={() => {
                          const sel = selectedLessonForUnit[unit.id];
                          if (sel) {
                            handleLinkLessonToUnit(unit.id, sel);
                            setSelectedLessonForUnit({ ...selectedLessonForUnit, [unit.id]: "" });
                          }
                        }}
                        disabled={!selectedLessonForUnit[unit.id]}
                      >
                        Link Lesson
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Unit Confirmation Modal */}
      {unitToDelete && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-['Nunito']">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-primary-light/30">
            <h3 className="text-lg font-bold text-primary-dark mb-2">Delete Unit</h3>
            <p className="text-text-secondary text-sm mb-6">
              Are you sure you want to delete <span className="font-extrabold text-primary-dark">"{unitToDelete.title}"</span>? Unlinked lessons will remain available in the Course Builder.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setUnitToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-500 hover:bg-red-600 text-white font-bold"
                onClick={() => {
                  handleDeleteUnit(unitToDelete.id);
                  setUnitToDelete(null);
                }}
              >
                Delete Unit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
