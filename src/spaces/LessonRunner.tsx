import React, { useState } from 'react';
import { Lesson } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { Flashcard } from '../components/Flashcard';
import { Cloze } from '../components/Cloze';
import { VideoActivity } from '../components/VideoActivity';
import { ReadingActivity } from '../components/ReadingActivity';
import { Button } from '../components/Button';

interface LessonRunnerProps {
  lesson: Lesson;
  onFinish: (xpEarned: number) => void;
  onBack: () => void;
}

export function LessonRunner({ lesson, onFinish, onBack }: LessonRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const activities = lesson.activities;

  const handleNext = () => {
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowCelebration(true);
    }
  };

  if (showCelebration) {
    return (
      <div className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-success-light rounded-full flex items-center justify-center text-[40px] mb-6">
          🎉
        </div>
        <h1 className="text-[36px] font-bold text-primary-dark mb-4">Lesson complete!</h1>
        <div className="text-reward font-bold text-[20px] mb-8 px-6 py-2 bg-[#FFF4E0] rounded-full">
          +{lesson.xpReward} XP
        </div>
        <div className="flex gap-2 mb-12">
           {[...Array(7)].map((_, i) => (
             <div key={i} className={`w-3 h-3 rounded-full ${i < 3 ? 'bg-primary' : 'bg-primary-light'}`} />
           ))}
        </div>
        <Button onClick={() => onFinish(lesson.xpReward)}>Return to Dashboard →</Button>
      </div>
    );
  }

  const currentActivity = activities[currentIndex];
  const isVideoOrReading = currentActivity.type === 'video' || currentActivity.type === 'reading';
  const widthClass = isVideoOrReading ? "max-w-5xl" : "max-w-2xl";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className={`w-full max-w-5xl px-6 py-6 flex justify-between items-center transition-all duration-300`}>
        <button onClick={onBack} className="text-text-secondary hover:text-text-primary text-[15px] font-bold">← Back</button>
        <span className="font-bold text-[18px] text-text-primary tracking-tight">{lesson.title}</span>
        <span className="text-[15px] text-reward-dark font-bold flex items-center gap-1">
           🔥 2
        </span>
      </div>
      
      <div className={`w-full max-w-5xl px-6 transition-all duration-300`}>
        <ProgressBar current={currentIndex + 1} total={activities.length} />
      </div>

      <div className={`flex-1 w-full max-w-5xl flex flex-col relative mt-8 transition-all duration-300`}>
        {currentActivity.type === 'video' && (
          <VideoActivity key={currentActivity.id} config={currentActivity} onComplete={handleNext} />
        )}
        {currentActivity.type === 'flashcard' && (
          <Flashcard key={currentActivity.id} config={currentActivity} onComplete={handleNext} />
        )}
        {currentActivity.type === 'cloze' && (
          <Cloze key={currentActivity.id} config={currentActivity} onComplete={handleNext} />
        )}
        {currentActivity.type === 'reading' && (
          <ReadingActivity key={currentActivity.id} config={currentActivity} onComplete={handleNext} />
        )}
      </div>
    </div>
  );
}
