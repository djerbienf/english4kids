import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StudentSpace } from "./spaces/StudentSpace";
import { TeacherSpace } from "./spaces/TeacherSpace";
import { TestPreviewPage } from "./components/TestPreviewPage";
import { useStore } from './store/useStore';
import { ensureInitialized } from "./utils/initData";

export default function App() {
  const initFirebaseSync = useStore(state => state.initFirebaseSync);

  useEffect(() => {
    ensureInitialized();
    initFirebaseSync();
  }, [initFirebaseSync]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentSpace />} />
        <Route path="/teacher" element={<TeacherSpace />} />
        <Route path="/test-preview/:testId" element={<TestPreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
