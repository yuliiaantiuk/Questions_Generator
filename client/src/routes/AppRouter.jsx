import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "../pages/UploadPage";
import SettingsPage from "../pages/SettingsPage";
import ProgressPage from "../pages/ProgressPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
