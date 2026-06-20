import React, { useState } from "react";
import { TeacherDashboard } from "./TeacherDashboard";
import { Button } from "../components/Button";

export function TeacherSpace() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="bg-card-bg rounded-[24px] p-10 shadow-sm border border-primary-light max-w-sm w-full text-center"
        >
          <h1 className="text-[26px] font-bold text-primary-dark mb-2">
            Teacher Space
          </h1>
          <p className="text-text-secondary text-[14px] mb-8">
            Sign in to manage your classes
          </p>
          <div className="space-y-4 mb-6 text-left">
            <div>
              <label className="block text-[14px] font-medium text-text-primary mb-1">
                Username / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-text-primary mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-bg border border-primary-light rounded-lg p-3 text-[14px] focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
          <div className="mt-6">
            <a href="/" className="text-primary hover:underline text-[14px]">
              Student Portal
            </a>
          </div>
        </form>
      </div>
    );
  }

  return <TeacherDashboard onLogout={() => setIsLoggedIn(false)} />;
}
