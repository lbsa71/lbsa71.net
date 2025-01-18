import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./app/Layout";
import Editor from "../../src/pages/edit/[user_id]/[[document_id]]";
import { Page } from "../../src/app/pages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Page />} />
          <Route path="editor" element={<Editor />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
