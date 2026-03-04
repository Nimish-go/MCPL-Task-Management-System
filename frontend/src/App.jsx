import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import ProjectHistoryReport from "./pages/ProjectHistoryReport";
import DirectorMeetings from "./pages/DirectorMeetings";
import TasksPerformedReport from "./pages/TasksPerformedReport";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin_panel" element={<AdminPanel />} />
          <Route path="/proj_hist_report" element={<ProjectHistoryReport />} />
          <Route
            path="/tasks_perform_report"
            element={<TasksPerformedReport />}
          />
          <Route path="/directorMeetings" element={<DirectorMeetings />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
