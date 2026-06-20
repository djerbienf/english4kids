import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StudentSpace } from "./spaces/StudentSpace";
import { TeacherSpace } from "./spaces/TeacherSpace";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentSpace />} />
        <Route path="/teacher" element={<TeacherSpace />} />
      </Routes>
    </BrowserRouter>
  );
}
