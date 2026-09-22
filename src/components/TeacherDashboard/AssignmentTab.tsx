import React, { useState, memo } from "react";
import { Button } from "../Button";
import { useStore } from "../../store/useStore";
import { Trash2 } from "lucide-react";

export const AssignmentTab = memo(function AssignmentTab({
  studentsList,
  courseData,
  lessonsList
}: any) {
  const studentCursuses = useStore((state) => state.studentCursuses);
  const addToCursus = useStore((state) => state.addToCursus);
  const removeFromCursus = useStore((state) => state.removeFromCursus);
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [itemType, setItemType] = useState<"unit" | "lesson" | "test">("unit");

  const handleAssign = () => {
    if (!selectedStudentId || !selectedItemId) return;
    addToCursus(selectedStudentId, {
      type: itemType,
      [itemType === "unit" ? "unitId" : "lessonId"]: selectedItemId,
      assignedAt: new Date().toISOString()
    });
    setSelectedItemId("");
  };

  const currentStudentCursus = studentCursuses[selectedStudentId] || [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-primary-dark">Assign Courses to Students</h2>
      
      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-primary-light">
        <select 
          className="px-3 py-2 border border-primary-light rounded-lg flex-1 font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
        >
          <option value="" disabled>Select Student...</option>
          {studentsList.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name}{s.email ? ` (${s.email})` : ""}
            </option>
          ))}
        </select>
      </div>

      {selectedStudentId && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-primary-light flex flex-col gap-4 animate-fade-in">
          <h3 className="font-bold text-lg">Assign New Material</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <select
              className="px-3 py-2 border border-primary-light rounded-lg font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={itemType}
              onChange={(e) => {
                setItemType(e.target.value as "unit" | "lesson" | "test");
                setSelectedItemId("");
              }}
            >
              <option value="unit">Unit</option>
              <option value="lesson">Independent Lesson</option>
              <option value="test">Evaluation / Test</option>
            </select>

            <select
              className="px-3 py-2 border border-primary-light rounded-lg flex-1 font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
            >
              <option value="" disabled>Select {itemType}...</option>
              {itemType === "unit" && courseData.map((u: any) => (
                <option key={u.id} value={u.id}>{u.title}</option>
              ))}
              {itemType === "lesson" && lessonsList.filter((l:any) => !l.isTest).map((l: any) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
              {itemType === "test" && lessonsList.filter((l:any) => l.isTest).map((l: any) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>

            <Button variant="primary" onClick={handleAssign} disabled={!selectedItemId}>
              Assign
            </Button>
          </div>

          <div className="mt-8 border-t border-primary-light/40 pt-6">
            <h3 className="font-bold text-lg mb-4">Currently Assigned to this Student</h3>
            {currentStudentCursus.length === 0 ? (
              <p className="text-text-secondary font-semibold text-sm">No items assigned yet.</p>
            ) : (
              <div className="space-y-2.5">
                {currentStudentCursus.map((c: any, index: number) => {
                   let name = "Unknown";
                   if (c.type === "unit") {
                     name = courseData.find((u: any) => u.id === c.unitId)?.title || "Unknown Unit";
                   } else if (c.type === "lesson" || c.type === "test") {
                     name = lessonsList.find((l: any) => l.id === c.lessonId)?.title || `Unknown ${c.type}`;
                   }
                   return (
                     <div key={c.id || index} className="flex justify-between items-center p-3.5 bg-neutral-bg/60 rounded-xl border border-primary-light/45 hover:border-primary-light transition-colors">
                       <div className="flex items-center gap-2 min-w-0">
                         <span className="bg-primary-light/20 text-primary-dark text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0">
                           {c.type}
                         </span>
                         <span className="font-bold text-[13.5px] text-text-primary truncate">{name}</span>
                       </div>
                       <Button
                         variant="secondary"
                         size="xs"
                         onClick={() => {
                           removeFromCursus(selectedStudentId, c.id);
                         }}
                         className="p-2 bg-white text-slate-400 border border-primary-light/60 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors shrink-0"
                         title="Remove assignment"
                       >
                         <Trash2 size={14} />
                       </Button>
                     </div>
                   );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
