// src/App.jsx
import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Results from "./pages/Results";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="results" element={<Results />} />
      </Route>
    </Routes>
  );
}

export default App;
