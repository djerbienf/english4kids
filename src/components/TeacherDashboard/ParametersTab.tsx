import React from "react";

export function ParametersTab() {
  return (
    <div className="max-w-7xl w-full mx-auto space-y-8">
      <h2 className="text-[20px] font-bold">Modules Configuration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Watching */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Watching (Video)</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Prevent Skipping Ahead</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Show English Subtitles</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Show Transcript</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Allow Playback Speed Control</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
            </label>
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Max Replays Allowed</span>
              <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                <option>1 replay</option>
                <option>3 replays</option>
                <option>Unlimited</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listening */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Listening</h3>
          <div className="space-y-4">
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Max Replays Allowed</span>
              <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                <option>3 replays</option>
                <option>5 replays</option>
                <option>Unlimited</option>
              </select>
            </div>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Show Transcript After</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
            </label>
          </div>
        </div>

        {/* Reading */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Reading</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Tap for Translation</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Auto-play Audio</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" />
            </label>
          </div>
        </div>

        {/* Flashcards */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Flashcards</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Enable Audio</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Show Phonetics</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
            </label>
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Display Order</span>
              <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                <option>Sequential</option>
                <option>Random Shuffle</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grammar Flashcards */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Grammar Flashcards</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Show Rule Before</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">AI Explanation</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
            </label>
          </div>
        </div>

        {/* Matching */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Matching</h3>
          <div className="space-y-4">
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Display Mode</span>
              <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                <option>Text / Text</option>
                <option>Text / Image</option>
              </select>
            </div>
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Time Limit</span>
              <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                <option>None (Learn Mode)</option>
                <option>30 seconds</option>
                <option>60 seconds</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dictation */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Dictation</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">Strict Spelling Check</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" />
            </label>
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Max Replays Allowed</span>
              <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                <option>3 replays</option>
                <option>5 replays</option>
                <option>Unlimited</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cloze */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Cloze</h3>
          <div className="space-y-4">
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Number of Distractors</span>
              <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                <option>3 distractors</option>
                <option>4 distractors</option>
                <option>5 distractors</option>
              </select>
            </div>
            <label className="flex items-center justify-between pt-2">
              <span className="text-[14px] text-text-primary">Case Sensitive</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" />
            </label>
          </div>
        </div>

        {/* Speaking */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Speaking</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[14px] text-text-primary">AI Pronunciation Scoring</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
            </label>
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Recording Limit</span>
              <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                <option>10 seconds</option>
                <option>30 seconds</option>
                <option>None</option>
              </select>
            </div>
          </div>
        </div>

        {/* Writing */}
        <div className="bg-card-bg border border-primary-light rounded-[20px] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] mb-4">Writing</h3>
          <div className="space-y-4">
            <div className="pt-2">
              <span className="text-[14px] text-text-secondary block mb-2">Minimum Words</span>
              <select className="w-full bg-neutral-bg border border-primary-light rounded-lg p-2 text-[14px]">
                <option>None</option>
                <option>20 words</option>
                <option>50 words</option>
              </select>
            </div>
            <label className="flex items-center justify-between pt-2">
              <span className="text-[14px] text-text-primary">Show Model Answer After</span>
              <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
