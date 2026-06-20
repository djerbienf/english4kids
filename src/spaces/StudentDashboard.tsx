import React from 'react';
import { Button } from '../components/Button';
import { StudentStats } from '../types';
import kidsLearningImg from '../assets/images/kids_learning_1781190788859.jpg';

interface StudentDashboardProps {
  studentName: string;
  stats: StudentStats;
  courseData: any[];
  studentHistory: any[];
  onStartLesson: (lessonObj: any) => void;
  onLogout: () => void;
}

export function StudentDashboard({ studentName, stats, courseData, studentHistory, onStartLesson, onLogout }: StudentDashboardProps) {
  // Filter out unpublished units and lessons
  const activeCourseData = courseData.map(unit => ({
    ...unit,
    lessons: unit.lessons.filter((l: any) => l.status === 'Published')
  })).filter(unit => unit.lessons.length > 0);

  return (
    <div className="min-h-screen bg-neutral-bg flex items-center justify-center p-8 md:p-16 text-text-primary">
      <div className="w-full max-w-7xl flex flex-col hover:shadow-none ease-in-out duration-300 md:flex-row items-center justify-between gap-12 md:gap-16">
        
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-10 z-10">
          <div className="flex items-center justify-between w-full border-b border-primary-light/50 pb-4">
            <div>
              <span className="text-text-secondary text-[14px] font-bold">WELCOME BACK</span>
              <h1 className="text-[36px] font-bold text-primary-dark leading-tight">
                Bonjour, {studentName}!
              </h1>
            </div>
            <button 
              onClick={onLogout} 
              className="text-text-secondary hover:text-red-500 font-semibold text-[14px] border border-primary-light p-2 bg-card-bg rounded-lg hover:shadow-smTransition px-4 transition-all duration-200"
            >
              Logout ↩
            </button>
          </div>

          <div className="flex gap-4 w-full">
            <div className="bg-card-bg p-4 rounded-[16px] border border-primary-light flex-1 text-center md:text-left">
              <span className="text-[12px] text-text-secondary font-medium">Streak Score</span>
              <p className="text-[22px] font-bold text-reward-dark flex items-center justify-center md:justify-start gap-1">
                🔥 {stats.streak} {stats.streak > 1 ? 'Days' : 'Day'}
              </p>
            </div>
            <div className="bg-card-bg p-4 rounded-[16px] border border-primary-light flex-1 text-center md:text-left">
              <span className="text-[12px] text-text-secondary font-medium">Total Rewards</span>
              <p className="text-[22px] font-bold text-primary flex items-center justify-center md:justify-start gap-1">
                💎 {stats.xp} XP
              </p>
            </div>
          </div>
          
          <div className="space-y-6 w-full mt-8">
            <h2 className="text-[20px] font-bold text-primary-dark">Your Course Map</h2>
            {activeCourseData.length === 0 ? (
              <div className="bg-white/60 p-6 rounded-[24px] border border-primary-light/50 space-y-2">
                <span className="px-3 py-1 bg-neutral-bg text-text-secondary rounded-full text-xs font-bold uppercase tracking-wider">
                  Status
                </span>
                <h2 className="text-[24px] font-bold text-text-primary leading-tight mt-2">
                  Waiting for New Lessons
                </h2>
                <p className="text-[15px] text-text-secondary">
                  Your teacher hasn't assigned any lessons to you yet!
                </p>
              </div>
            ) : (
              <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                {activeCourseData.map((unit: any, unitIndex: number) => {
                  const hasStartedUnit = studentHistory.some(h => h.unitId === unit.id);
                  return (
                    <div key={unit.id} className="bg-white/80 rounded-[20px] border border-primary-light p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <span className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Unit {unitIndex + 1}</span>
                          <h3 className="text-[18px] font-bold text-primary-dark">{unit.title}</h3>
                        </div>
                        {hasStartedUnit && <span className="bg-success-light/20 text-success text-[12px] px-2 py-1 rounded font-bold">In Progress</span>}
                      </div>
                      
                      <div className="space-y-3">
                        {unit.lessons.map((lesson: any, lessonIndex: number) => {
                          const isCompleted = studentHistory.some(h => h.lessonId === lesson.id && h.type === 'lesson_finish');
                          return (
                            <div 
                              key={lesson.id} 
                              onClick={() => onStartLesson({ ...lesson, _unitId: unit.id })}
                              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${isCompleted ? 'bg-success-light/10 border-success/30 hover:border-success/60' : 'bg-card-bg border-primary-light hover:border-primary-mid hover:shadow-sm'}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] ${isCompleted ? 'bg-success text-white' : 'bg-primary-light text-primary-dark'}`}>
                                  {isCompleted ? '✓' : lessonIndex + 1}
                                </div>
                                <span className={`font-semibold text-[15px] ${isCompleted ? 'text-text-secondary line-through opacity-70' : 'text-primary-dark'}`}>
                                  {lesson.title}
                                </span>
                              </div>
                              <Button variant="ghost" className={`px-4 py-1 text-[13px] ${isCompleted ? 'text-success hover:bg-success-light/30' : 'text-primary hover:bg-primary-light/30'}`}>
                                {isCompleted ? 'Review' : 'Start'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <img src={kidsLearningImg} alt="Kids learning together" className="w-full max-w-[650px] h-auto object-contain mix-blend-multiply scale-110 origin-right transition-all duration-300" />
        </div>

      </div>
    </div>
  );
}
