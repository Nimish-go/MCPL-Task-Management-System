import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Dropdown,
  MenuButton,
  MenuItem,
  Typography,
  Menu,
  Divider,
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
} from "@mui/icons-material";
import TasksAssigned from "./TasksAssigned";
import ProjectHistory from "./ProjectHistory";
import axios from "axios";

const Navbar = () => {
  const location = useLocation();

  const navigate = useNavigate();

  const [spin, setSpin] = useState(false);
  const [taskAssignOpen, setTaskAssignOpen] = useState(false);
  const [projHistoryOpen, setProjHistoryOpen] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [workTypeData, setWorkTypeData] = useState([]);
  const [drawerType, setDrawerType] = useState("");

  const logout = () => {
    sessionStorage.clear();
    navigate("/");
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
    <div className="navbar-container bg-bg-navbar p-3 text-white">
      {location.pathname === "/" ? (
        <div className="navbar-container">
          <Typography level="h3" textAlign={"center"} color="#fff">
            Welcome to MCPL Task Management System
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
                    <MenuItem>
                      <WorkHistory /> Project History Report
                    </MenuItem>
                    <MenuItem>
                      <Task /> Tasks Performed
                    </MenuItem>
                  </Menu>
                </Dropdown>
              </li>
              {sessionStorage.getItem("role") === "SuperAdmin" ||
              sessionStorage.getItem("role") === "Admin" ? (
                <li className="hover:text-hover-navbar text-white mr-3">
                  <Link to="/admin_panel">
                    <AdminPanelSettings /> Admin Panel
                  </Link>
                </li>
              ) : (
                <></>
              )}
              <li>
                <Dropdown>
                  <MenuButton
                    variant="plain"
                    sx={{
                      all: "unset",
                      color: "#fff",
                      mr: "0.5rem",
                      p: 0,
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
                    onClick={() => {
                      setSpin(true);
                      setTimeout(() => setSpin(false), 8000);
                    }}
                  >
                    <Settings
                      className="settings-icon"
                      sx={{
                        "@keyframes spin": {
                          from: { transform: "rotate(0deg)" },
                          to: { transform: "rotate(180deg)" },
                        },
                        animation: spin ? "spin 0.8s ease-in-out" : "none",
                      }}
                    />
                    <ArrowDropDown />
                  </MenuButton>
                  <Menu>
                    <MenuItem>
                      <Person /> Profile Settings
                    </MenuItem>
                    <MenuItem>
                      <Key /> Password Settings
                    </MenuItem>
                    <Divider sx={{ my: 3 }} orientation="horizontal" />
                    <MenuItem
                      variant="soft"
                      color="danger"
                      onClick={() => logout()}
                    >
                      <Logout /> Logout
                    </MenuItem>
                  </Menu>
                </Dropdown>
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
    </div>
  );
};

export default Navbar;
