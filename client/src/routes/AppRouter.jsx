import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "../pages/UploadPage";
import SettingsPage from "../pages/SettingsPage";
import ProgressPage from "../pages/ProgressPage";
import ResultPage from "../pages/ResultPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
