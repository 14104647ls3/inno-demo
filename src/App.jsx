import { Routes, Route, Navigate } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import ViewPage from "./pages/ViewPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/upload" replace />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/view/:id" element={<ViewPage />} />
    </Routes>
  );
}

export default App;
