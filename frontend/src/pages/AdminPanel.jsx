import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  ListItemDecorator,
  Skeleton,
  Switch,
  Tab,
  Table,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import {
  AddCircle,
  CreateNewFolder,
  Engineering,
  FolderCopy,
  Groups3,
  PersonAdd,
  Warning,
} from "@mui/icons-material";
import axios from "axios";
import AdminPanelAdd from "../components/AdminPanelAdd";
import MarkInactive from "../components/MarkInactive";
import Navbar from "../components/Navbar";
import AccessDenied from "../components/AccessDenied";

const SIDEBAR_W = 68; // collapsed sidebar width

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  color: "rgba(255,255,255,0.85)",
  fontWeight: 700,
  fontSize: "0.72rem",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  borderRight: "1px solid rgba(255,255,255,0.1)",
};

const tdStyle = {
  padding: "11px 16px",
  fontSize: "0.82rem",
  color: "#1e293b",
  verticalAlign: "middle",
  borderBottom: "1px solid #f0f2f8",
};

const AdminPanel = () => {
  const [employees, setEmployees] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [inactiveSwitch, setInactiveSwitch] = useState(null);
  const [type, setType] = useState("");
  const [open, setOpen] = useState(false);
  const [inactiveModal, setInactiveModal] = useState(false);
  const [inactiveEmployee, setInactiveEmployee] = useState("");
  const [designation, setDesignation] = useState([]);
  const [branch, setBranch] = useState([]);
  const [loading, setLoading] = useState(false);
  const [organisations, setOrganisations] = useState([]);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("role").toUpperCase().includes("ADMIN")) {
      setAccessDenied(true);
    }
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    setLoading(true);
    axios
      .get("/getAdminPanelLists")
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setEmployees(data.employees);
          setProjects(data.projects);
          setWorkTypes(data.workTypes);
          setOrganisations(data.organisations);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    axios
      .get("/getDesignationAndBranch")
      .then((res) => {
        if (res.status === 200) {
          setDesignation(res.data.designations);
          setBranch(res.data.branches);
        }
      })
      .catch(console.error);
  }, []);

  const handleMarkInactive = (name) => {
    setInactiveEmployee(name);
    setInactiveModal(true);
  };

  const SectionHeader = ({ title, buttonLabel, buttonIcon, onAdd }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 3,
        pb: 2,
        borderBottom: "2px solid #f0f2f8",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 4,
            height: 28,
            borderRadius: "4px",
            background: "linear-gradient(180deg, #1976d2, #42a5f5)",
          }}
        />
        <Typography level="title-lg" sx={{ fontWeight: 700, color: "#0f1b35" }}>
          {title}
        </Typography>
        <Chip size="sm" variant="soft" color="primary" sx={{ fontWeight: 600 }}>
          {title === "Active Employees"
            ? employees.length
            : title === "All Projects"
              ? projects.length
              : workTypes.length}{" "}
          records
        </Chip>
      </Box>
      <Button
        variant="solid"
        color="primary"
        startDecorator={buttonIcon}
        onClick={onAdd}
        sx={{
          borderRadius: "10px",
          fontWeight: 600,
          fontSize: "0.85rem",
          background: "linear-gradient(135deg, #1565c0, #1976d2)",
          boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #0d47a1, #1565c0)",
            boxShadow: "0 6px 16px rgba(25,118,210,0.4)",
          },
        }}
      >
        {buttonLabel}
      </Button>
    </Box>
  );

  const skeletonRows = (cols) =>
    Array.from({ length: 8 }).map((_, i) => (
      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} style={tdStyle}>
            <Skeleton variant="text" animation="wave" height={20} />
          </td>
        ))}
      </tr>
    ));

  const TableWrapper = ({ children }) => (
    <Box
      sx={{
        borderRadius: "14px",
        border: "1px solid #e8ecf4",
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
      }}
    >
      <Box sx={{ overflowX: "auto", maxHeight: 480, overflowY: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          {children}
        </table>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        ml: `${SIDEBAR_W}px`, // offset for collapsed sidebar
        minHeight: "100vh",
        backgroundColor: "#f4f6fb",
      }}
    >
      <Navbar />
      {/* Page Header */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
          px: { xs: 3, md: 5 },
          py: 3,
          mb: 0,
        }}
      >
        <Typography
          level="h4"
          sx={{ color: "#fff", fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          Admin Panel
        </Typography>
        <Typography
          level="body-sm"
          sx={{ color: "rgba(255,255,255,0.65)", mt: 0.5 }}
        >
          Manage employees, projects and work types
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: "20px",
            boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
            border: "1px solid #e8ecf4",
            overflow: "hidden",
          }}
        >
          <Tabs defaultValue={0}>
            <TabList
              sx={{
                px: 3,
                pt: 2,
                gap: 1,
                backgroundColor: "transparent",
                borderBottom: "2px solid #f0f2f8",
                "& .MuiTab-root": {
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  borderRadius: "10px 10px 0 0",
                  color: "#64748b",
                  border: "none",
                  py: 1.2,
                  px: 2.5,
                  transition: "all 0.2s ease",
                  "&:hover": { backgroundColor: "#f0f4ff", color: "#1976d2" },
                  "&.Mui-selected": {
                    color: "#1976d2",
                    backgroundColor: "#e8f0fe",
                    fontWeight: 700,
                  },
                },
              }}
            >
              <Tab value={0} disableIndicator>
                <ListItemDecorator sx={{ mr: 0.5 }}>
                  <Groups3 sx={{ fontSize: "1rem" }} />
                </ListItemDecorator>
                Employees
              </Tab>
              <Tab value={1} disableIndicator>
                <ListItemDecorator sx={{ mr: 0.5 }}>
                  <FolderCopy sx={{ fontSize: "1rem" }} />
                </ListItemDecorator>
                Projects
              </Tab>
              <Tab value={2} disableIndicator>
                <ListItemDecorator sx={{ mr: 0.5 }}>
                  <Engineering sx={{ fontSize: "1rem" }} />
                </ListItemDecorator>
                Work Types
              </Tab>
            </TabList>

            {/* ── Employees Tab ───────────────────────────────── */}
            <TabPanel value={0} sx={{ p: 3 }}>
              <SectionHeader
                title="Active Employees"
                buttonLabel="Add An Employee"
                buttonIcon={<PersonAdd sx={{ fontSize: "1rem" }} />}
                onAdd={() => {
                  setType("employee");
                  setOpen(true);
                }}
              />
              <TableWrapper>
                <thead>
                  <tr
                    style={{
                      background: "linear-gradient(135deg, #0f1b35, #1565c0)",
                    }}
                  >
                    {[
                      "#",
                      "Employee ID",
                      "Employee Name",
                      "Designation",
                      "Branch",
                      "Mark Inactive",
                    ].map((h, i, arr) => (
                      <th
                        key={h}
                        style={{
                          ...thStyle,
                          borderRight:
                            i < arr.length - 1 ? thStyle.borderRight : "none",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    skeletonRows(6)
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={tdStyle}>
                        <Box sx={{ textAlign: "center", py: 6 }}>
                          <Typography
                            level="title-sm"
                            sx={{ color: "#90a4ae" }}
                          >
                            No employees found
                          </Typography>
                        </Box>
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee, index) => (
                      <tr
                        key={employee.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#fff" : "#fafbff",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f0f4ff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            index % 2 === 0 ? "#fff" : "#fafbff")
                        }
                      >
                        <td style={tdStyle}>
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              backgroundColor: "#e8f0fe",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: "#1976d2",
                              }}
                            >
                              {index + 1}
                            </Typography>
                          </Box>
                        </td>
                        <td style={tdStyle}>
                          <Typography
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              color: "#1976d2",
                            }}
                          >
                            #{employee.id}
                          </Typography>
                        </td>
                        <td style={tdStyle}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #1565c0, #42a5f5)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                boxShadow: "0 2px 6px rgba(25,118,210,0.25)",
                              }}
                            >
                              <Typography
                                sx={{
                                  color: "#fff",
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                }}
                              >
                                {employee.name?.charAt(0).toUpperCase()}
                              </Typography>
                            </Box>
                            <Typography
                              sx={{ fontSize: "0.82rem", fontWeight: 500 }}
                            >
                              {employee.name}
                            </Typography>
                          </Box>
                        </td>
                        <td style={tdStyle}>
                          <Chip
                            size="sm"
                            sx={{
                              backgroundColor: "#f0f4ff",
                              color: "#1565c0",
                              fontWeight: 600,
                              fontSize: "0.72rem",
                              border: "1px solid #c5cae9",
                              borderRadius: "6px",
                            }}
                          >
                            {employee.designation}
                          </Chip>
                        </td>
                        <td style={tdStyle}>
                          <Typography
                            sx={{ fontSize: "0.82rem", color: "#475569" }}
                          >
                            {employee.branch}
                          </Typography>
                        </td>
                        <td style={tdStyle}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Switch
                              variant="plain"
                              color="danger"
                              size="sm"
                              checked={inactiveSwitch === employee.name}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setInactiveSwitch(employee.name);
                                  handleMarkInactive(employee.name);
                                } else {
                                  setInactiveSwitch(null);
                                }
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color:
                                  inactiveSwitch === employee.name
                                    ? "#c62828"
                                    : "#94a3b8",
                                transition: "color 0.2s ease",
                              }}
                            >
                              {inactiveSwitch === employee.name
                                ? "Marking..."
                                : "Mark Inactive"}
                            </Typography>
                          </Box>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </TableWrapper>
            </TabPanel>

            {/* ── Projects Tab ────────────────────────────────── */}
            <TabPanel value={1} sx={{ p: 3 }}>
              <SectionHeader
                title="All Projects"
                buttonLabel="Add Project"
                buttonIcon={<CreateNewFolder sx={{ fontSize: "1rem" }} />}
                onAdd={() => {
                  setType("project");
                  setOpen(true);
                }}
              />
              <TableWrapper>
                <thead>
                  <tr
                    style={{
                      background: "linear-gradient(135deg, #0f1b35, #1565c0)",
                    }}
                  >
                    {["#", "Project ID", "Project Code", "Project Name"].map(
                      (h, i, arr) => (
                        <th
                          key={h}
                          style={{
                            ...thStyle,
                            borderRight:
                              i < arr.length - 1 ? thStyle.borderRight : "none",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    skeletonRows(4)
                  ) : projects.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={tdStyle}>
                        <Box sx={{ textAlign: "center", py: 6 }}>
                          <Typography
                            level="title-sm"
                            sx={{ color: "#90a4ae" }}
                          >
                            No projects found
                          </Typography>
                        </Box>
                      </td>
                    </tr>
                  ) : (
                    projects.map((project, index) => (
                      <tr
                        key={project.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#fff" : "#fafbff",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f0f4ff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            index % 2 === 0 ? "#fff" : "#fafbff")
                        }
                      >
                        <td style={tdStyle}>
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              backgroundColor: "#e8f0fe",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: "#1976d2",
                              }}
                            >
                              {index + 1}
                            </Typography>
                          </Box>
                        </td>
                        <td style={tdStyle}>
                          <Typography
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              color: "#1976d2",
                            }}
                          >
                            #{project.id}
                          </Typography>
                        </td>
                        <td style={tdStyle}>
                          <Chip
                            size="sm"
                            sx={{
                              backgroundColor: "#e8f5e9",
                              color: "#2e7d32",
                              fontWeight: 700,
                              fontSize: "0.72rem",
                              border: "1px solid #a5d6a7",
                              borderRadius: "6px",
                            }}
                          >
                            {project.code}
                          </Chip>
                        </td>
                        <td style={tdStyle}>
                          <Typography
                            sx={{ fontSize: "0.82rem", fontWeight: 500 }}
                          >
                            {project.name}
                          </Typography>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </TableWrapper>
            </TabPanel>

            {/* ── Work Types Tab ──────────────────────────────── */}
            <TabPanel value={2} sx={{ p: 3 }}>
              <SectionHeader
                title="Work Types"
                buttonLabel="Add Work Type"
                buttonIcon={<AddCircle sx={{ fontSize: "1rem" }} />}
                onAdd={() => {
                  setType("workType");
                  setOpen(true);
                }}
              />
              <TableWrapper>
                <thead>
                  <tr
                    style={{
                      background: "linear-gradient(135deg, #0f1b35, #1565c0)",
                    }}
                  >
                    {["#", "Work Type ID", "Work Type"].map((h, i, arr) => (
                      <th
                        key={h}
                        style={{
                          ...thStyle,
                          borderRight:
                            i < arr.length - 1 ? thStyle.borderRight : "none",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    skeletonRows(3)
                  ) : workTypes.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={tdStyle}>
                        <Box sx={{ textAlign: "center", py: 6 }}>
                          <Typography
                            level="title-sm"
                            sx={{ color: "#90a4ae" }}
                          >
                            No work types found
                          </Typography>
                        </Box>
                      </td>
                    </tr>
                  ) : (
                    workTypes.map((workType, index) => (
                      <tr
                        key={workType.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#fff" : "#fafbff",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f0f4ff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            index % 2 === 0 ? "#fff" : "#fafbff")
                        }
                      >
                        <td style={tdStyle}>
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              backgroundColor: "#e8f0fe",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: "#1976d2",
                              }}
                            >
                              {index + 1}
                            </Typography>
                          </Box>
                        </td>
                        <td style={tdStyle}>
                          <Typography
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              color: "#1976d2",
                            }}
                          >
                            #{workType.id}
                          </Typography>
                        </td>
                        <td style={tdStyle}>
                          <Chip
                            size="sm"
                            sx={{
                              backgroundColor: "#fff8e1",
                              color: "#e65100",
                              fontWeight: 600,
                              fontSize: "0.72rem",
                              border: "1px solid #ffcc80",
                              borderRadius: "6px",
                            }}
                          >
                            {workType.name}
                          </Chip>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </TableWrapper>
            </TabPanel>
          </Tabs>
        </Box>
      </Box>

      <AdminPanelAdd
        type={type}
        open={open}
        onClose={() => setOpen(false)}
        designations={designation}
        organisations={organisations}
        branches={branch}
      />
      <MarkInactive
        open={inactiveModal}
        onClose={() => {
          setInactiveModal(false);
          setInactiveSwitch(null);
        }}
        employeeName={inactiveEmployee}
      />
      <AccessDenied
        open={accessDenied}
        onClose={() => {
          setAccessDenied(false);
          navigate("/dashboard");
        }}
        location={"Admin Panel"}
      />
    </Box>
  );
};

export default AdminPanel;
