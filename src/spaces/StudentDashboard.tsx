import React, { useState, useMemo } from 'react';
import { Button } from '../components/Button';
import { StudentStats, SRSDeckItem } from '../types';
import kidsLearningImg from '../assets/images/kids_learning_1781190788859.jpg';
import { 
  getSRSData, 
  getSRSStats, 
  calculateRetentionRate 
} from '../utils/srs';
import { 
  Search, 
  Brain, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Volume2
} from 'lucide-react';
import { playAudio } from '../utils/audio';

interface StudentDashboardProps {
  studentId: string;
  studentName: string;
  stats: StudentStats;
  courseData: any[];
  studentHistory: any[];
  dueCards: SRSDeckItem[];
  onStartLesson: (lessonObj: any) => void;
  onStartSRS: () => void;
  onLogout: () => void;
}

export function StudentDashboard({ 
  studentId, 
  studentName, 
  stats, 
  courseData, 
  studentHistory, 
  dueCards, 
  onStartLesson, 
  onStartSRS, 
  onLogout 
}: StudentDashboardProps) {
  const [deckVersion, setDeckVersion] = useState(0);

  // Card list search state
  const [searchQuery, setSearchQuery] = useState('');

  // Info accordion toggle
  const [showExplanation, setShowExplanation] = useState(true);

  // Use courseData directly since it is pre-filtered by StudentSpace
  const activeCourseData = useMemo(() => {
    return courseData;
  }, [courseData]);

  // Read the spaced repetition deck data dynamically based on studentId and deckVersion
  const srsData = useMemo(() => {
    return getSRSData(studentId);
  }, [studentId, deckVersion]);

  const cardsList = useMemo(() => {
    return Object.values(srsData.cards);
  }, [srsData]);

  const srsStats = useMemo(() => {
    return getSRSStats(studentId);
  }, [studentId, deckVersion]);

  const retentionRate = useMemo(() => {
    return calculateRetentionRate(studentId);
  }, [studentId, deckVersion]);

  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cardsList;
    const q = searchQuery.toLowerCase();
    return cardsList.filter(card => 
      card.word.toLowerCase().includes(q) || 
      card.translation_ar.toLowerCase().includes(q)
    );
  }, [cardsList, searchQuery]);

  return (
    <div className="min-h-screen bg-neutral-bg flex items-start justify-center p-4 md:p-8 text-text-primary">
      <div className="w-full max-w-7xl flex flex-col space-y-6">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-primary-light/50 pb-6">
          <div className="text-center md:text-left">
            <span className="text-text-secondary text-[14px] font-bold tracking-wider uppercase">STUDENT DASHBOARD</span>
            <h1 className="text-[32px] md:text-[36px] font-black text-primary-dark leading-tight mt-1">
              Hello, {studentName}!
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onLogout} 
              className="text-text-secondary hover:text-red-500 font-bold text-[14px] border border-primary-light p-2 bg-card-bg rounded-xl hover:shadow-sm transition-all duration-200 px-4 flex items-center gap-1.5"
            >
              Logout ↩
            </button>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card-bg p-4 rounded-[16px] border border-primary-light flex flex-col justify-between shadow-sm">
            <span className="text-[12px] text-text-secondary font-bold uppercase tracking-wider">Study Streak</span>
            <p className="text-[22px] font-black text-reward-dark flex items-center gap-1.5 mt-1">
              🔥 {stats.streak} {stats.streak > 1 ? 'Days' : 'Day'}
            </p>
          </div>
          <div className="bg-card-bg p-4 rounded-[16px] border border-primary-light flex flex-col justify-between shadow-sm">
            <span className="text-[12px] text-text-secondary font-bold uppercase tracking-wider">Total Rewards</span>
            <p className="text-[22px] font-black text-[#534AB7] flex items-center gap-1.5 mt-1">
              💎 {stats.xp} XP
            </p>
          </div>
          <div className="bg-card-bg p-4 rounded-[16px] border border-primary-light flex flex-col justify-between shadow-sm">
            <span className="text-[12px] text-text-secondary font-bold uppercase tracking-wider">Spaced Retention</span>
            <p className="text-[22px] font-black text-emerald-600 flex items-center gap-1.5 mt-1">
              📈 {retentionRate}%
            </p>
          </div>
          <div className="bg-[#E1F5EE] border border-[#5DCAA5]/40 p-4 rounded-[16px] flex flex-col justify-between shadow-sm">
            <span className="text-[12px] text-[#085041] font-bold uppercase tracking-wider">Ready Reviews</span>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[22px] font-black text-[#085041] flex items-center gap-1.5">
                🧠 {dueCards.length}
              </p>
              <Button 
                disabled={dueCards.length === 0} 
                onClick={onStartSRS} 
                className="text-xs py-1.5 px-3 bg-[#5DCAA5] hover:bg-[#48b08e] text-white border-none shadow-none font-extrabold"
              >
                Review
              </Button>
            </div>
          </div>
        </div>

        {/* Course & Lessons Map */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 md:gap-12 pt-4">
            
            <div className="w-full lg:w-3/5 space-y-6">
              <div className="flex items-center justify-between border-b border-primary-light/30 pb-2">
                <h2 className="text-[22px] font-black text-primary-dark">Your Learning Journey</h2>
                <span className="text-xs font-bold text-text-secondary bg-primary-light/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Current Syllabus
                </span>
              </div>

              {activeCourseData.length === 0 ? (
                <div className="bg-white p-8 rounded-[24px] border border-primary-light/50 space-y-3 text-center">
                  <span className="px-3 py-1 bg-neutral-bg text-text-secondary rounded-full text-xs font-bold uppercase tracking-wider">
                    Status
                  </span>
                  <h2 className="text-[22px] font-bold text-text-primary leading-tight mt-4">
                    Waiting for new lessons
                  </h2>
                  <p className="text-[15px] text-text-secondary max-w-md mx-auto">
                    Your teacher has not assigned any lessons to your course yet. As soon as a lesson is published, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {activeCourseData.map((unit: any, unitIndex: number) => {
                    const hasStartedUnit = studentHistory.some(h => h.unitId === unit.id);
                    return (
                      <div key={unit.id} className="bg-white rounded-[20px] border border-primary-light p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-bg">
                          <div>
                            <span className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest">Unit {unitIndex + 1}</span>
                            <h3 className="text-[18px] font-black text-primary-dark">{unit.title}</h3>
                          </div>
                          {hasStartedUnit && <span className="bg-emerald-50 text-emerald-600 text-[11px] px-2.5 py-1 rounded-full font-bold border border-emerald-100">In Progress</span>}
                        </div>
                        
                        <div className="space-y-2.5">
                          {unit.lessons.map((lesson: any, lessonIndex: number) => {
                            const isCompleted = studentHistory.some(h => h.lessonId === lesson.id && h.type === 'lesson_finish');
                            return (
                              <div 
                                key={lesson.id} 
                                onClick={() => onStartLesson({ ...lesson, _unitId: unit.id })}
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${isCompleted ? 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-200' : 'bg-card-bg border-primary-light hover:border-[#534AB7]/40 hover:shadow-sm'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-primary-light text-primary-dark'}`}>
                                    {isCompleted ? '✓' : lessonIndex + 1}
                                  </div>
                                  <span className={`font-semibold text-[15px] ${isCompleted ? 'text-emerald-700' : 'text-primary-dark'}`}>
                                    {lesson.title}
                                  </span>
                                </div>
                                <Button variant="ghost" className={`px-4 py-1.5 text-[13px] font-extrabold ${isCompleted ? 'text-emerald-600 hover:bg-emerald-50' : 'text-[#534AB7] hover:bg-primary-light/40'}`}>
                                  {isCompleted ? 'Replay' : 'Start'}
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
            
            {/* Right side graphic decoration */}
            <div className="w-full lg:w-2/5 flex flex-col items-center lg:items-end justify-center self-center">
              <img 
                src={kidsLearningImg} 
                alt="Kids learning together" 
                className="w-full max-w-[450px] h-auto object-contain mix-blend-multiply scale-105 transition-all duration-300" 
              />
            </div>

          </div>

      </div>
    </div>
  );
}
