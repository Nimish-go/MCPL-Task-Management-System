import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Dropdown,
  MenuButton,
  MenuItem,
  Typography,
  Menu,
  Avatar,
  Box,
  ListItemButton,
  Divider,
} from "@mui/joy";
import {
  SpaceDashboard,
  AddTask,
  Assignment,
  History,
  Task,
  FileCopy,
  WorkHistory,
  AdminPanelSettings,
  ArrowBack,
  Groups,
  ExpandMore,
  ExpandLess,
  ChevronRight,
} from "@mui/icons-material";
import TasksAssigned from "./TasksAssigned";
import ProjectHistory from "./ProjectHistory";
import axios from "axios";
import SettingsModal from "./SettingsModal";

const SIDEBAR_COLLAPSED = 68;
const SIDEBAR_EXPANDED = 240;

const NavItem = ({ icon, label, to, active, expanded, onClick }) => (
  <Box
    component={to ? Link : "div"}
    to={to}
    onClick={onClick}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 2,
      py: 1.4,
      mx: 1,
      borderRadius: "10px",
      textDecoration: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
      backgroundColor: active ? "rgba(255,255,255,0.15)" : "transparent",
      borderLeft: active ? "3px solid #fff" : "3px solid transparent",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.12)",
      },
      overflow: "hidden",
      whiteSpace: "nowrap",
      minHeight: 44,
    }}
  >
    <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", color: active ? "#fff" : "rgba(255,255,255,0.75)" }}>
      {icon}
    </Box>
    <Typography
      sx={{
        color: active ? "#fff" : "rgba(255,255,255,0.75)",
        fontSize: "0.875rem",
        fontWeight: active ? 700 : 500,
        opacity: expanded ? 1 : 0,
        width: expanded ? "auto" : 0,
        transition: "opacity 0.2s ease, width 0.2s ease",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Typography>
  </Box>
);

const NavGroup = ({ icon, label, expanded, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Box
        onClick={() => expanded && setOpen((p) => !p)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          px: 2,
          py: 1.4,
          mx: 1,
          borderRadius: "10px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          borderLeft: "3px solid transparent",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
          overflow: "hidden",
          whiteSpace: "nowrap",
          minHeight: 44,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, overflow: "hidden" }}>
          <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", color: "rgba(255,255,255,0.75)" }}>
            {icon}
          </Box>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "0.875rem",
              fontWeight: 500,
              opacity: expanded ? 1 : 0,
              width: expanded ? "auto" : 0,
              transition: "opacity 0.2s ease, width 0.2s ease",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </Typography>
        </Box>
        {expanded && (
          <Box sx={{ color: "rgba(255,255,255,0.5)", flexShrink: 0, display: "flex" }}>
            {open ? <ExpandLess sx={{ fontSize: "1rem" }} /> : <ExpandMore sx={{ fontSize: "1rem" }} />}
          </Box>
        )}
      </Box>

      {/* Submenu */}
      <Box
        sx={{
          maxHeight: open && expanded ? "300px" : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <Box
          sx={{
            mx: 1,
            ml: 2,
            pl: 2,
            borderLeft: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

const SubNavItem = ({ icon, label, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 1.5,
      py: 1.1,
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
      my: 0.3,
    }}
  >
    <Box sx={{ color: "rgba(255,255,255,0.6)", display: "flex", flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.82rem", fontWeight: 500, whiteSpace: "nowrap" }}>
      {label}
    </Typography>
  </Box>
);

const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [taskAssignOpen, setTaskAssignOpen] = useState(false);
  const [projHistoryOpen, setProjHistoryOpen] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [workTypeData, setWorkTypeData] = useState([]);
  const [drawerType, setDrawerType] = useState("");
  const [settingsModal, setSettingsModal] = useState(false);

  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;
  const designation = sessionStorage.getItem("designation") || "";
  const role = sessionStorage.getItem("role") || "";
  const empName = sessionStorage.getItem("empName") || "";
  const isDirector = designation.toUpperCase().includes("DIRECTOR");
  const isAdmin = role === "SuperAdmin" || role === "Admin";

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    axios.get("/get_all_projects").then((res) => { if (res.status === 200) setProjectData(res.data); });
    axios.get("/get_work_type").then((res) => { if (res.status === 200) setWorkTypeData(res.data); }).catch(console.error);
    axios.get("/get_employee_names").then((res) => { if (res.status === 200) setEmployeeData(res.data); }).catch(console.error);
  }, []);

  // Don't show sidebar on login page
  if (location.pathname === "/") {
    return (
      <Box sx={{ textAlign: "center", p: 3, background: "linear-gradient(135deg, #0f1b35, #1565c0)" }}>
        <Typography level="h4" sx={{ color: "#fff", fontWeight: 700 }}>
          Welcome to MCPL Task Management System
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Sidebar */}
      <Box
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED,
          background: "linear-gradient(180deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
          transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1200,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: expanded ? "4px 0 24px rgba(0,0,0,0.25)" : "2px 0 8px rgba(0,0,0,0.15)",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            px: 2,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            minHeight: 68,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontWeight: 800,
              color: "#fff",
              fontSize: "1rem",
              letterSpacing: "-0.02em",
            }}
          >
            M
          </Box>
          <Box
            sx={{
              opacity: expanded ? 1 : 0,
              width: expanded ? "auto" : 0,
              transition: "opacity 0.2s ease",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.9rem", lineHeight: 1.2 }}>
              MCPL Task
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }}>
              Management System
            </Typography>
          </Box>
        </Box>

        {/* Admin Panel back button */}
        {location.pathname === "/admin_panel" && (
          <Box sx={{ px: 1, pt: 2 }}>
            <NavItem
              icon={<ArrowBack sx={{ fontSize: "1.1rem" }} />}
              label="Back to Dashboard"
              to="/dashboard"
              active={false}
              expanded={expanded}
            />
            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1 }} />
          </Box>
        )}

        {/* Nav Items */}
        <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", pt: 1.5, pb: 2,
          "&::-webkit-scrollbar": { width: 0 },
        }}>
          <NavItem
            icon={<SpaceDashboard sx={{ fontSize: "1.2rem" }} />}
            label="Dashboard"
            to="/dashboard"
            active={isActive("/dashboard")}
            expanded={expanded}
          />

          <NavGroup
            icon={<Assignment sx={{ fontSize: "1.2rem" }} />}
            label="Task Management"
            expanded={expanded}
          >
            <SubNavItem
              icon={<AddTask sx={{ fontSize: "1rem" }} />}
              label="Assign a Task"
              onClick={() => setTaskAssignOpen(true)}
            />
            <SubNavItem
              icon={<History sx={{ fontSize: "1rem" }} />}
              label="Project History"
              onClick={() => { setProjHistoryOpen(true); setDrawerType("history"); }}
            />
            <SubNavItem
              icon={<Task sx={{ fontSize: "1rem" }} />}
              label="Tasks Performed"
              onClick={() => { setProjHistoryOpen(true); setDrawerType("performed"); }}
            />
          </NavGroup>

          <NavGroup
            icon={<FileCopy sx={{ fontSize: "1.2rem" }} />}
            label="Reports Management"
            expanded={expanded}
          >
            <SubNavItem
              icon={<WorkHistory sx={{ fontSize: "1rem" }} />}
              label="Project History Report"
              onClick={() => navigate("/proj_hist_report")}
            />
            <SubNavItem
              icon={<Task sx={{ fontSize: "1rem" }} />}
              label="Tasks Performed Report"
              onClick={() => navigate("/tasks_perform_report")}
            />
          </NavGroup>

          {isAdmin && (
            <NavItem
              icon={<AdminPanelSettings sx={{ fontSize: "1.2rem" }} />}
              label="Admin Panel"
              to="/admin_panel"
              active={isActive("/admin_panel")}
              expanded={expanded}
            />
          )}

          {isDirector && (
            <NavItem
              icon={<Groups sx={{ fontSize: "1.2rem" }} />}
              label="Director Meetings"
              to="/director_meetings"
              active={isActive("/director_meetings")}
              expanded={expanded}
            />
          )}
        </Box>

        {/* Divider */}
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

        {/* User Profile */}
        <Box
          sx={{
            px: 1.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            overflow: "hidden",
            cursor: "pointer",
            borderRadius: "10px",
            mx: 1,
            mb: 1,
            transition: "background 0.2s ease",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
          }}
          onClick={() => setSettingsModal(true)}
        >
          <Avatar
            size="sm"
            sx={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.8rem",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            {getInitials(empName)}
          </Avatar>
          <Box
            sx={{
              opacity: expanded ? 1 : 0,
              width: expanded ? "auto" : 0,
              transition: "opacity 0.2s ease",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            <Typography sx={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>
              {empName}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>
              {designation}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Page offset so content doesn't go under sidebar */}
      <Box sx={{ ml: `${SIDEBAR_COLLAPSED}px`, transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)" }} />

      <TasksAssigned
        open={taskAssignOpen}
        onClose={() => setTaskAssignOpen(false)}
        projects={projectData}
        employees={employeeData}
        workTypes={workTypeData}
      />
      <ProjectHistory
        open={projHistoryOpen}
        onClose={() => setProjHistoryOpen(false)}
        type={drawerType}
        projects={projectData}
        employees={employeeData}
        workTypes={workTypeData}
      />
      <SettingsModal open={settingsModal} onClose={() => setSettingsModal(false)} />
    </>
  );
};

export default Navbar;