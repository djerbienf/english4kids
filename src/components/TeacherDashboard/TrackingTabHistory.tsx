import React from "react";
import { formatRelativeTime } from "../../utils/dateUtils";

export function TrackingTabHistory({
  selectedTrackingStudent,
  courseData,
}: {
  selectedTrackingStudent: string;
  courseData: any[];
}) {
  const historyData = JSON.parse(
    localStorage.getItem("lms_student_history") || "[]",
  );
  const studentHistory = historyData
    .filter((h: any) => h.studentId === selectedTrackingStudent)
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (studentHistory.length === 0) {
    return (
      <div className="bg-white/60 p-6 rounded-[16px] border border-primary-light border-dashed text-center">
        <p className="text-text-secondary">
          No learning history recorded yet. Assign a course and wait for the student to start!
        </p>
      </div>
    );
  }

  // Group history items
  const grouped = studentHistory.reduce((acc: any[], item: any) => {
    let entityName = "Unknown Element";
    for (const unit of courseData) {
      if (item.type === "unit_start" && item.unitId === unit.id) {
        entityName = unit.title;
        break;
      }
      const foundLesson = unit.lessons?.find((l: any) => l.id === item.lessonId);
      if (item.type === "lesson_finish" && foundLesson) {
        entityName = foundLesson.title;
        break;
      }
    }
    
    const key = `${item.type}-${item.unitId || ''}-${item.lessonId || ''}`;
    const existingGroup = acc.find((g: any) => g.key === key);
    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      acc.push({
        key,
        type: item.type,
        entityName,
        items: [item]
      });
    }
    return acc;
  }, []);

  return (
    <div className="relative pl-4 mt-2">
      {/* Timeline vertical line */}
      <div className="absolute left-[3px] top-4 bottom-4 w-[2px] bg-primary-light/50"></div>
      
      <div className="space-y-6">
        {grouped.map((group) => {
          const latestItem = group.items[0];
          const count = group.items.length;
          const isStart = group.type === "unit_start";
          
          return (
            <div key={group.key} className="relative pl-6">
              {/* Timeline dot */}
              <div className={`absolute -left-[5px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${isStart ? 'bg-blue-400' : 'bg-green-400'}`}></div>
              
              <div className="bg-white p-4 rounded-[12px] border border-primary-light/50 shadow-sm relative group">
                <div className="flex flex-col">
                  <div className="flex items-start justify-between">
                    <span className="text-[14px] font-bold text-primary-dark">
                      {isStart ? "🚀 Started Unit: " : "✅ Finished Lesson: "}
                      {group.entityName}
                      {count > 1 && (
                        <span className="ml-2 font-normal text-xs px-2 py-0.5 bg-neutral-bg text-text-secondary rounded-full">
                          {count} times
                        </span>
                      )}
                    </span>
                    <span className="text-[12px] text-text-secondary mt-1 whitespace-nowrap ml-4">
                      {formatRelativeTime(latestItem.timestamp)}
                    </span>
                  </div>
                  
                  {/* Show details on hover for multiple items */}
                  {count > 1 && (
                    <div className="mt-3 pt-3 border-t border-primary-light/30 hidden group-hover:block">
                      <p className="text-xs text-text-secondary mb-2 font-bold uppercase tracking-wider">All occurrences</p>
                      <div className="space-y-1">
                        {group.items.map((i: any, idx: number) => (
                          <div key={idx} className="text-xs text-text-secondary">
                            {new Date(i.timestamp).toLocaleString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
