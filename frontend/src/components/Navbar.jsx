import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Dropdown,
  MenuButton,
  MenuItem,
  Typography,
  Menu,
  Divider,
  Avatar,
  Box,
  Button,
  Link as JoyLink,
  ListItemButton,
} from "@mui/joy";
import {
  ArrowDropDown,
  SpaceDashboard,
  AddTask,
  Assignment,
  History,
  Task,
  FileCopy,
  WorkHistory,
  AdminPanelSettings,
  Settings,
  Person,
  Key,
  Logout,
  MeetingRoom,
  Groups,
  ArrowBack,
  KeyboardArrowLeft,
} from "@mui/icons-material";
import TasksAssigned from "./TasksAssigned";
import ProjectHistory from "./ProjectHistory";
import axios from "axios";
import SettingsModal from "./SettingsModal";

const Navbar = () => {
  const location = useLocation();

  const navigate = useNavigate();
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

  const getInitials = (name) => {
    if (!name) return "";

    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    axios.get("/get_all_projects").then((res) => {
      if (res.status === 200) {
        const data = res.data;
        setProjectData(data);
      }
    });
    axios
      .get("/get_work_type")
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setWorkTypeData(data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
    axios
      .get("/get_employee_names")
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setEmployeeData(data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="navbar-container bg-bg-navbar p-3 text-white font-primary">
      {location.pathname === "/" ? (
        <div className="navbar-container">
          <Typography level="h3" textAlign={"center"} color="#fff">
            Welcome to MCPL Task Management System
          </Typography>
        </div>
      ) : location.pathname === "/admin_panel" ? (
        <div className="navbar-container flex text-center justify-center items-center">
          <JoyLink
            color="primary"
            variant="soft"
            underline="none"
            href="/dashboard"
            mx={3}
          >
            <ArrowBack /> Go Back
          </JoyLink>
          <Typography
            level="h3"
            textAlign={"center"}
            color="#f5f5f5"
            fontFamily={"Open Sans, sans-serif"}
          >
            MCPL Task Management System Admin Mode On
          </Typography>
        </div>
      ) : (
        <div className="navbar-container flex justify-between bg-bg-navbar">
          <div className="logo">
            <Typography level="h3" textColor={"#fff"}>
              MCPL Task Management System
            </Typography>
          </div>
          <div className="list">
            <ul className="flex text-white">
              <li className="hover:text-hover-navbar text-white">
                <Link to="/dashboard">
                  <SpaceDashboard /> Dashboard
                </Link>
              </li>
              <li>
                <Dropdown>
                  <MenuButton
                    variant="plain"
                    sx={{
                      all: "unset",
                      color: "#fff",
                      mx: "1rem",
                      p: 0,
                      minHeight: "auto",
                      background: "transparent",
                      fontWeight: "normal",
                      fontSize: "inherit",
                      cursor: "pointer",
                      textAlign: "center",
                      "&:hover": {
                        background: "transparent !important",
                        color: "#f4d35e",
                      },
                    }}
                  >
                    <Assignment /> Tasks Management
                    <ArrowDropDown />
                  </MenuButton>
                  <Menu>
                    <MenuItem onClick={() => setTaskAssignOpen(true)}>
                      <AddTask />
                      Assign a Task
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setProjHistoryOpen(true);
                        setDrawerType("history");
                      }}
                    >
                      <History /> Project History
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setProjHistoryOpen(true);
                        setDrawerType("performed");
                      }}
                    >
                      <Task /> Tasks Performed
                    </MenuItem>
                  </Menu>
                </Dropdown>
              </li>
              <li>
                <Dropdown>
                  <MenuButton
                    variant="plain"
                    sx={{
                      all: "unset",
                      color: "#fff",
                      mr: "1rem",
                      p: 0,
                      minHeight: "auto",
                      background: "transparent",
                      fontWeight: "normal",
                      fontSize: "inherit",
                      cursor: "pointer",
                      textAlign: "center",
                      "&:hover": {
                        background: "transparent !important",
                        color: "#f4d35e",
                      },
                    }}
                  >
                    <FileCopy /> Reports Management
                    <ArrowDropDown />
                  </MenuButton>
                  <Menu>
                    <MenuItem onClick={() => navigate("/proj_hist_report")}>
                      <WorkHistory /> Project History Report
                    </MenuItem>
                    <MenuItem onClick={() => navigate("/tasks_perform_report")}>
                      <Task /> Tasks Performed Report
                    </MenuItem>
                  </Menu>
                </Dropdown>
              </li>
              {sessionStorage.getItem("role") === "SuperAdmin" ||
              sessionStorage.getItem("role") === "Admin" ? (
                <li className="hover:text-hover-navbar text-white">
                  <Link to="/admin_panel">
                    <AdminPanelSettings /> Admin Panel
                  </Link>
                </li>
              ) : (
                <></>
              )}
              {sessionStorage
                .getItem("designation")
                .toUpperCase()
                .includes("DIRECTOR") && (
                <li className="hover:text-hover-navbar text-white ml-4">
                  <Link to="/director_meetings">
                    <Groups /> Director Meetings
                  </Link>
                </li>
              )}
              <li>
                <ListItemButton
                  sx={{
                    color: "#fff",
                    mx: "1rem",
                    px: 0,
                    minHeight: "auto",
                    background: "transparent",
                    fontWeight: "normal",
                    fontSize: "inherit",
                    cursor: "pointer",
                    "&:hover": {
                      background: "transparent !important",
                      color: "#f4d35e",
                    },
                    textAlign: "center",
                    margin: "0, auto",
                  }}
                  onClick={() => setSettingsModal(true)}
                >
                  <Avatar size="sm" sx={{ cursor: "pointer" }}>
                    {getInitials(sessionStorage.getItem("empName"))}
                  </Avatar>
                </ListItemButton>
                {/* <Dropdown>
                  <MenuButton
                    variant="plain"
                    sx={{
                      all: "unset",
                      color: "#fff",
                      mr: "0.5rem",
                      px: 0,
                      minHeight: "auto",
                      background: "transparent",
                      fontWeight: "normal",
                      fontSize: "inherit",
                      cursor: "pointer",
                      "&:hover": {
                        background: "transparent !important",
                        color: "#f4d35e",
                      },
                      textAlign: "center",
                      margin: "0, auto",
                    }}
                  >
                    
                  </MenuButton>
                  <Menu sx={{ p: 1 }}>
                    <MenuItem>
                      <Settings /> Settings
                    </MenuItem>
                    <Divider sx={{ my: 2 }} orientation="horizontal" />
                    <MenuItem
                      variant="soft"
                      color="danger"
                      onClick={() => logout()}
                    >
                      <Logout /> Logout
                    </MenuItem>
                  </Menu>
                </Dropdown> */}
              </li>
            </ul>
          </div>
        </div>
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
      <SettingsModal
        open={settingsModal}
        onClose={() => setSettingsModal(false)}
      />
    </div>
  );
};

export default Navbar;
