import React, { useState } from "react";
import { Lesson } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { Flashcard } from "../components/Flashcard";
import { Cloze } from "../components/Cloze";
import { Dictation } from "../components/Dictation";
import { Matching } from "../components/Matching";
import { ListeningActivity } from "../components/ListeningActivity";
import { ReadingActivity } from "../components/ReadingActivity";
import { ListenAndRepeatActivity } from "../components/ListenAndRepeatActivity";
import { VideoActivity } from "../components/VideoActivity";
import { MultipleChoiceActivity } from "../components/MultipleChoiceActivity";
import { WritingActivity } from "../components/WritingActivity";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/Button";

interface LessonRunnerProps {
  lesson: Lesson;
  onFinish: (xpEarned: number) => void;
  onBack: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Listening Comprehension": return "🎧";
    case "Reading Comprehension": return "📖";
    case "Speaking & Oral Interaction": return "🗣️";
    case "Writing & Written Production": return "✍️";
    case "Vocabulary & Semantics": return "📚";
    case "Grammar & Syntax": return "⚙️";
    case "Phonetics & Pronunciation": return "🗣️";
    case "Pragmatic & Cultural Competence": return "🌍";
    default: return "🎯";
  }
};

const getCefrBadgeStyle = (level: string) => {
  switch (level) {
    case "A1": return "bg-green-100 text-green-700 border-green-200";
    case "A2": return "bg-blue-100 text-blue-700 border-blue-200";
    case "B1": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "B2": return "bg-orange-100 text-orange-700 border-orange-200";
    case "C1/C2": return "bg-purple-100 text-purple-700 border-purple-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

function EmptyLessonView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#f5f5fb] flex flex-col items-center justify-center p-6 font-['Nunito']">
      <div className="w-full max-w-md bg-white border border-primary-light p-8 rounded-[24px] text-center shadow-sm">
        <div className="text-4xl mb-4">📭</div>
        <h2 className="text-xl font-bold text-primary-dark mb-2">No Activities Found</h2>
        <p className="text-text-secondary text-sm mb-6">This lesson does not contain any activities yet.</p>
        <Button onClick={onBack}>Return to Dashboard</Button>
      </div>
    </div>
  );
}

export function LessonRunner({ lesson, onFinish, onBack }: LessonRunnerProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const activities = lesson.activities || [];

  if (!activities || activities.length === 0) {
    return <EmptyLessonView onBack={onBack} />;
  }

  const handleNext = () => {
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowCelebration(true);
    }
  };

  const objectives = lesson.objectives || [];

  if (showCelebration) {
    return (
      <div className="min-h-screen bg-[#f5f5fb] flex flex-col items-center justify-center p-6 font-['Nunito']">
        <div className="w-full max-w-2xl bg-white border border-primary-light p-8 rounded-[24px] shadow-sm text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-[40px] mb-6">
            🎉
          </div>
          <h1 className="text-[32px] font-black text-primary-dark mb-2">
            Lesson complete!
          </h1>
          <p className="text-text-secondary text-sm mb-6 max-w-md font-medium leading-relaxed">
            Fantastic work! You have completed all activities and mastered this lesson.
          </p>

          <div className="text-reward font-bold text-[20px] mb-8 px-6 py-2 bg-[#FFF4E0] rounded-full">
            +{lesson.xpReward} XP
          </div>

          {objectives.length > 0 && (
            <div className="w-full text-left bg-green-50/50 border border-green-100 p-5 rounded-2xl mb-8 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-green-800 flex items-center gap-1.5 mb-2">
                <span>✅</span> Learning Objectives Completed:
              </h3>
              <div className="space-y-3">
                {objectives.map((obj) => (
                  <div key={obj.id} className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5">{getCategoryIcon(obj.category)}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold border px-1 rounded uppercase ${getCefrBadgeStyle(obj.level)}`}>
                          {obj.level}
                        </span>
                        <span className="text-[10px] font-bold text-green-700 uppercase">
                          {obj.category}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-text-primary mt-0.5">
                        {obj.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={() => onFinish(lesson.xpReward)}>
            Return to Dashboard →
          </Button>
        </div>
      </div>
    );
  }

  if (!hasStarted && objectives.length > 0) {
    return (
      <div className="min-h-screen bg-[#f5f5fb] flex flex-col items-center justify-center p-6 font-['Nunito']">
        <div className="w-full max-w-2xl bg-white border border-primary-light p-8 rounded-[24px] shadow-sm">
          <button
            onClick={onBack}
            className="text-[#44445e] hover:bg-[#EEEEF8] px-3 py-1.5 rounded-lg font-bold text-[14px] flex items-center gap-1.5 transition-colors mb-6"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back
          </button>

          <div className="text-center mb-6">
            <span className="text-[40px] block mb-2">🎯</span>
            <h1 className="text-[28px] font-black text-primary-dark mb-2">
              {lesson.title}
            </h1>
            {lesson.desc && (
              <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed font-medium">
                {lesson.desc}
              </p>
            )}
          </div>

          <div className="text-left bg-[#f8f8fc] border border-primary-light p-5 rounded-2xl mb-8 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-primary-dark/80">
              Learning Objectives of this Lesson:
            </h3>
            <div className="space-y-3.5">
              {objectives.map((obj) => (
                <div key={obj.id} className="flex items-start gap-2.5">
                  <span className="text-base mt-0.5">{getCategoryIcon(obj.category)}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold border px-1 rounded uppercase ${getCefrBadgeStyle(obj.level)}`}>
                        {obj.level}
                      </span>
                      <span className="text-[10px] font-bold text-text-secondary uppercase">
                        {obj.category}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-text-primary mt-0.5 leading-normal">
                      {obj.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="w-full py-3.5 bg-primary text-white text-[16px] font-black rounded-xl shadow-md hover:bg-primary-dark transition-all"
              onClick={() => setHasStarted(true)}
            >
              Start Lesson!
            </Button>
            <span className="text-[11px] text-text-secondary/80 font-semibold text-center">
              Earn <strong className="text-reward">+{lesson.xpReward} XP</strong> upon completion.
            </span>
          </div>
        </div>
      </div>
    );
  }

  const currentActivity = activities[currentIndex];
  if (!currentActivity) {
    return (
      <div className="min-h-screen bg-[#f5f5fb] flex flex-col items-center justify-center p-6 font-['Nunito']">
        <div className="w-full max-w-md bg-white border border-primary-light p-8 rounded-[24px] text-center shadow-sm">
          <h2 className="text-xl font-bold text-primary-dark mb-2">Activity Error</h2>
          <p className="text-text-secondary text-sm mb-6">Unable to load the requested activity.</p>
          <Button onClick={onBack}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isVideoOrReading =
    currentActivity.type === "video" || currentActivity.type === "reading";
  const widthClass = isVideoOrReading ? "max-w-5xl" : "max-w-2xl";

  return (
    <div className="min-h-screen bg-[#f5f5fb] flex flex-col items-center font-['Nunito']">
      <div
        className={`w-full max-w-5xl px-6 py-4 flex justify-between items-center transition-all duration-300`}
      >
        <button
          onClick={onBack}
          className="text-[#44445e] hover:bg-[#EEEEF8] px-2 py-1.5 rounded-lg font-bold text-[14px] flex items-center gap-1.5 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          Back
        </button>
        <div className="flex items-center gap-1.5 bg-[#FFF3E0] rounded-full px-3 py-1 text-[14px] font-extrabold text-[#E65100]">
          <span>🔥</span> 3
        </div>
      </div>

      <div className={`w-full max-w-5xl px-6 transition-all duration-300`}>
        <ProgressBar current={currentIndex + 1} total={activities.length} />
      </div>

      <div
        className={`flex-1 w-full max-w-5xl flex flex-col relative mt-8 transition-all duration-300`}
      >
        {currentActivity.type === "video" && (
          <VideoActivity
            key={currentActivity.id}
            config={currentActivity}
            onComplete={handleNext}
          />
        )}
        {(currentActivity.type === "flashcard" || currentActivity.type === "flashcard-sm2") && (
          <Flashcard
            key={currentActivity.id}
            config={currentActivity}
            onComplete={handleNext}
          />
        )}
        {currentActivity.type === "cloze" && (
          <Cloze
            key={currentActivity.id}
            config={currentActivity}
            onComplete={handleNext}
          />
        )}
        {currentActivity.type === "reading" && (
          <ReadingActivity
            key={currentActivity.id}
            config={currentActivity}
            onComplete={handleNext}
          />
        )}
        {currentActivity.type === "dictation" && (
          <Dictation
            key={currentActivity.id}
            config={currentActivity}
            onComplete={handleNext}
          />
        )}
        {currentActivity.type === "matching" && (
          <Matching
            key={currentActivity.id}
            config={currentActivity}
            onComplete={handleNext}
          />
        )}
        {currentActivity.type === "listening" && (
          <ListeningActivity
            key={currentActivity.id}
            config={currentActivity as any}
            onComplete={handleNext}
          />
        )}
        {currentActivity.type === "listen_and_repeat" && (
          <ListenAndRepeatActivity
            key={currentActivity.id}
            config={currentActivity as any}
            onComplete={handleNext}
          />
        )}
        {currentActivity.type === "multiple_choice" && (
          <MultipleChoiceActivity
            key={currentActivity.id}
            activity={currentActivity}
            onComplete={handleNext}
          />
        )}
        {currentActivity.type === "writing" && (
          <WritingActivity
            key={currentActivity.id}
            config={currentActivity as any}
            onComplete={handleNext}
          />
        )}
      </div>
    </div>
  );
}
