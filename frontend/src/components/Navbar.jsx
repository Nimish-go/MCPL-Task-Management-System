import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  Sheet,
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
  CalendarToday,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import TasksAssigned from "./TasksAssigned";
import ProjectHistory from "./ProjectHistory";
import axios from "axios";
import SettingsModal from "./SettingsModal";
import { useTheme, useMediaQuery } from "@mui/material";

const SIDEBAR_COLLAPSED = 68;
const SIDEBAR_EXPANDED = 240;

// ─── Shared Nav Primitives ────────────────────────────────────────────────────

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
      "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
      overflow: "hidden",
      whiteSpace: "nowrap",
      minHeight: 44,
    }}
  >
    <Box
      sx={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        color: active ? "#fff" : "rgba(255,255,255,0.75)",
      }}
    >
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

      <Box
        sx={{
          maxHeight: open && expanded ? "300px" : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <Box sx={{ mx: 1, ml: 2, pl: 2, borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
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
    <Box sx={{ color: "rgba(255,255,255,0.6)", display: "flex", flexShrink: 0 }}>{icon}</Box>
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

// Gradient background shared between sidebar + mobile drawer
const sidebarBg = "linear-gradient(180deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)";

// ─── Sidebar Content (shared between desktop sidebar & mobile drawer) ──────────

const SidebarContent = ({
  expanded,
  location,
  isAdmin,
  isDirector,
  empName,
  designation,
  onTaskAssign,
  onProjHistory,
  onTasksPerformed,
  onProjHistReport,
  onTasksPerformReport,
  onSettings,
  onClose, // mobile only
}) => {
  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
          justifyContent: expanded ? "flex-start" : "center",
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

        {/* Close button for mobile drawer */}
        {onClose && (
          <IconButton
            onClick={onClose}
            size="sm"
            sx={{ ml: "auto", color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}
          >
            <CloseIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>
        )}
      </Box>

      {/* Back button */}
      {location.pathname !== "/dashboard" && (
        <Box sx={{ px: 1, pt: 2 }}>
          <NavItem
            icon={<ArrowBack sx={{ fontSize: "1.1rem" }} />}
            label="Back to Dashboard"
            to="/dashboard"
            active={false}
            expanded={expanded}
            onClick={onClose}
          />
          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1 }} />
        </Box>
      )}

      {/* Nav items */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", pt: 1.5, pb: 2, "&::-webkit-scrollbar": { width: 0 } }}>
        <NavItem
          icon={<SpaceDashboard sx={{ fontSize: "1.2rem" }} />}
          label="Dashboard"
          to="/dashboard"
          active={isActive("/dashboard")}
          expanded={expanded}
          onClick={onClose}
        />

        <NavGroup icon={<Assignment sx={{ fontSize: "1.2rem" }} />} label="Task Management" expanded={expanded}>
          <SubNavItem icon={<AddTask sx={{ fontSize: "1rem" }} />} label="Assign a Task" onClick={() => { onTaskAssign(); onClose?.(); }} />
          <SubNavItem icon={<History sx={{ fontSize: "1rem" }} />} label="Project History" onClick={() => { onProjHistory(); onClose?.(); }} />
          <SubNavItem icon={<Task sx={{ fontSize: "1rem" }} />} label="Tasks Performed" onClick={() => { onTasksPerformed(); onClose?.(); }} />
        </NavGroup>

        <NavGroup icon={<FileCopy sx={{ fontSize: "1.2rem" }} />} label="Reports Management" expanded={expanded}>
          <SubNavItem icon={<WorkHistory sx={{ fontSize: "1rem" }} />} label="Project History Report" onClick={() => { onProjHistReport(); onClose?.(); }} />
          <SubNavItem icon={<Task sx={{ fontSize: "1rem" }} />} label="Tasks Performed Report" onClick={() => { onTasksPerformReport(); onClose?.(); }} />
        </NavGroup>

        {isAdmin && (
          <NavItem
            icon={<AdminPanelSettings sx={{ fontSize: "1.2rem" }} />}
            label="Admin Panel"
            to="/admin_panel"
            active={isActive("/admin_panel")}
            expanded={expanded}
            onClick={onClose}
          />
        )}

        {isDirector && (
          <NavItem
            icon={<Groups sx={{ fontSize: "1.2rem" }} />}
            label="Director Meetings"
            to="/director_meetings"
            active={isActive("/director_meetings")}
            expanded={expanded}
            onClick={onClose}
          />
        )}

        <NavItem
          icon={<CalendarToday sx={{ fontSize: "1.2rem" }} />}
          label="Leave Management"
          to="/leave_management"
          active={isActive("/leave_management")}
          expanded={expanded}
          onClick={onClose}
        />
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* User profile */}
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
          // Pushes the profile above the iPad home indicator / bottom chrome
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
          transition: "background 0.2s ease",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
        }}
        onClick={onSettings}
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
          <Typography sx={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>{empName}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>{designation}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Bottom Nav for Mobile ────────────────────────────────────────────────────

const BottomNavItem = ({ icon, label, active, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 0.4,
      py: 1,
      cursor: "pointer",
      color: active ? "#fff" : "rgba(255,255,255,0.55)",
      transition: "color 0.2s",
      position: "relative",
      "&::after": active
        ? {
            content: '""',
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 32,
            height: 3,
            borderRadius: "0 0 4px 4px",
            background: "#fff",
          }
        : {},
    }}
  >
    <Box sx={{ fontSize: "1.3rem", display: "flex" }}>{icon}</Box>
    <Typography sx={{ fontSize: "0.62rem", fontWeight: active ? 700 : 500, color: "inherit" }}>
      {label}
    </Typography>
  </Box>
);

// ─── Main Navbar Component ────────────────────────────────────────────────────

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Responsive breakpoints via MUI
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");

  const [expanded, setExpanded] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [taskAssignOpen, setTaskAssignOpen] = useState(false);
  const [projHistoryOpen, setProjHistoryOpen] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [workTypeData, setWorkTypeData] = useState([]);
  const [drawerType, setDrawerType] = useState("");
  const [settingsModal, setSettingsModal] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const root = document.documentElement;
    theme === "dark" ? root.classList.add("dark") : root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

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

  if (location.pathname === "/") {
    return (
      <Box sx={{ textAlign: "center", p: 3, background: sidebarBg }}>
        <Typography level="h4" sx={{ color: "#fff", fontWeight: 700 }}>
          Welcome to MCPL Task Management System
        </Typography>
      </Box>
    );
  }

  // Shared action handlers
  const handleTaskAssign = () => setTaskAssignOpen(true);
  const handleProjHistory = () => { setProjHistoryOpen(true); setDrawerType("history"); };
  const handleTasksPerformed = () => { setProjHistoryOpen(true); setDrawerType("performed"); };
  const handleProjHistReport = () => navigate("/proj_hist_report");
  const handleTasksPerformReport = () => navigate("/tasks_perform_report");
  const handleSettings = () => setSettingsModal(true);

  const sharedContentProps = {
    location,
    isAdmin,
    isDirector,
    empName,
    designation,
    onTaskAssign: handleTaskAssign,
    onProjHistory: handleProjHistory,
    onTasksPerformed: handleTasksPerformed,
    onProjHistReport: handleProjHistReport,
    onTasksPerformReport: handleTasksPerformReport,
    onSettings: handleSettings,
  };

  return (
    <>
      {/* ── DESKTOP / TABLET: Fixed sidebar ─────────────────────────────── */}
      {!isMobile && (
        <Box
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            // 100dvh accounts for mobile/tablet browser chrome (address bar, bottom bar).
            // Falls back to -webkit-fill-available for older iOS Safari, then 100vh.
            height: "100vh",
            "@supports (height: 100dvh)": { height: "100dvh" },
            width: expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED,
            background: sidebarBg,
            transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 1200,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: expanded ? "4px 0 24px rgba(0,0,0,0.25)" : "2px 0 8px rgba(0,0,0,0.15)",
            // Ensure the profile section at the bottom is never hidden behind iPad chrome
            pb: "env(safe-area-inset-bottom)",
          }}
        >
          <SidebarContent expanded={expanded} {...sharedContentProps} />
        </Box>
      )}

      {/* ── MOBILE: Top app bar + slide-in drawer ───────────────────────── */}
      {isMobile && (
        <>
          {/* Top bar */}
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: 56,
              background: sidebarBg,
              zIndex: 1200,
              display: "flex",
              alignItems: "center",
              px: 2,
              gap: 1.5,
              boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
            }}
          >
            <IconButton
              size="sm"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ color: "#fff" }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#fff",
                fontSize: "0.85rem",
              }}
            >
              M
            </Box>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.88rem" }}>
              MCPL Task
            </Typography>

            {/* Avatar shortcut */}
            <Box sx={{ ml: "auto" }}>
              <Avatar
                size="sm"
                onClick={handleSettings}
                sx={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  border: "2px solid rgba(255,255,255,0.3)",
                  cursor: "pointer",
                }}
              >
                {getInitials(empName)}
              </Avatar>
            </Box>
          </Box>

          {/* Full-screen slide-in drawer */}
          <Drawer
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            anchor="left"
            size="sm"
            slotProps={{
              content: {
                sx: {
                  background: sidebarBg,
                  width: "80vw",
                  maxWidth: 280,
                  p: 0,
                },
              },
            }}
          >
            <SidebarContent
              expanded={true}
              onClose={() => setMobileDrawerOpen(false)}
              {...sharedContentProps}
            />
          </Drawer>

          {/* Offset for top bar */}
          <Box sx={{ height: 56 }} />
        </>
      )}

      {/* Content offset for desktop/tablet sidebar */}
      {!isMobile && (
        <Box
          sx={{
            ml: `${SIDEBAR_COLLAPSED}px`,
            transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      )}

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