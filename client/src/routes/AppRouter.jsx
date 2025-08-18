import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "../pages/UploadPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        {/* згодом додамо інші екрани */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
