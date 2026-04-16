import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import ProjectHistoryReport from "./pages/ProjectHistoryReport";
import DirectorMeetings from "./pages/DirectorMeetings";
import TasksPerformedReport from "./pages/TasksPerformedReport";
import { useState } from "react";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

function App() {
  const empName = sessionStorage.getItem("empName");

  const isLoggedIn = empName && empName !== "" && empName != undefined;

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin_panel" element={<AdminPanel />} />
          <Route path="/proj_hist_report" element={<ProjectHistoryReport />} />
          <Route
            path="/tasks_perform_report"
            element={<TasksPerformedReport />}
          />
          <Route path="/director_meetings" element={<DirectorMeetings />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
