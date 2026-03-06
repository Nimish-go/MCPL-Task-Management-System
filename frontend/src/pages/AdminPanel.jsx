import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  Box,
  Button,
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
  AddBusiness,
  AddCircle,
  CreateNewFolder,
  Engineering,
  FolderCopy,
  Groups2,
  Groups3,
  PersonAdd,
} from "@mui/icons-material";
import axios from "axios";
import AdminPanelAdd from "../components/AdminPanelAdd";
import MarkInactive from "../components/MarkInactive";

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

  useEffect(() => {
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
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));

    axios
      .get("/getDesignationAndBranch")
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setDesignation(data.designations);
          setBranch(data.branches);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleMarkInactive = (name) => {
    setInactiveEmployee(name);
    setInactiveModal(true);
  };

  return (
    <div className="w-screen min-w-full h-screen overflow-y-auto">
      <div className="navbar-container">
        <Navbar />
      </div>
      <Box sx={{ width: "95%", mx: "auto", mt: 3 }}>
        <Tabs defaultValue={0}>
          {/* TAB HEADERS */}
          <TabList>
            <Tab value={0}>
              <ListItemDecorator>
                <Groups3 />
              </ListItemDecorator>{" "}
              Employees
            </Tab>
            <Tab value={1}>
              <ListItemDecorator>
                <FolderCopy />
              </ListItemDecorator>{" "}
              Projects
            </Tab>
            <Tab value={2}>
              <ListItemDecorator>
                <Engineering />
              </ListItemDecorator>{" "}
              Work Types
            </Tab>
          </TabList>

          {/* ================= EMPLOYEES TAB ================= */}
          <TabPanel value={0}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mb={2}
            >
              <Typography level="title-lg">Active Employees</Typography>
              <Button
                variant="solid"
                color="primary"
                sx={{ mx: 3 }}
                onClick={() => {
                  setType("employee");
                  setOpen(true);
                }}
              >
                <PersonAdd sx={{ mr: 1 }} /> Add An Employee
              </Button>
            </Box>

            <Box
              sx={{
                height: "400px",
                overflow: "auto",
                width: "80%",
                mx: "auto",
              }}
            >
              <Table
                borderAxis="yBetween"
                color="primary"
                variant="soft"
                stickyHeader
                sx={{
                  width: "100%",
                  tableLayout: "fixed",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <thead>
                  <tr>
                    <th className="w-10">Sr. No</th>
                    <th className="w-10">Employee Id</th>
                    <th className="w-25">Employee Name</th>
                    <th className="w-23">Designation</th>
                    <th className="w-17">Branch</th>
                    <th className="w-17">Mark Inactive</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <tr key={index}>
                          <td>
                            <Skeleton
                              variant="text"
                              width={30}
                              animation="wave"
                            />
                          </td>
                          <td>
                            <Skeleton
                              variant="text"
                              width={80}
                              animation="wave"
                            />
                          </td>
                          <td>
                            <Skeleton
                              variant="text"
                              width={140}
                              animation="wave"
                            />
                          </td>
                          <td>
                            <Skeleton
                              variant="text"
                              width={120}
                              animation="wave"
                            />
                          </td>
                          <td>
                            <Skeleton
                              variant="text"
                              width={100}
                              animation="wave"
                            />
                          </td>
                          <td>
                            <Skeleton
                              variant="rectangular"
                              width={120}
                              height={32}
                              animation="wave"
                            />
                          </td>
                        </tr>
                      ))
                    : employees.map((employee, index) => (
                        <tr key={employee.id}>
                          <td>{index + 1}</td>
                          <td>{employee.id}</td>
                          <td>{employee.name}</td>
                          <td>{employee.designation}</td>
                          <td>{employee.branch}</td>
                          <td>
                            <Box display={"flex"}>
                              <Typography level="body-md" mx={1} color="danger">
                                Mark as Inactive
                              </Typography>
                              <Switch
                                variant="plain"
                                color="danger"
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
                            </Box>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </Table>
            </Box>
          </TabPanel>

          {/* ================= PROJECTS TAB ================= */}
          <TabPanel value={1}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mb={2}
            >
              <Typography level="title-lg">All Projects</Typography>
              <Button
                variant="solid"
                color="primary"
                sx={{ mx: 3 }}
                onClick={() => {
                  setType("project");
                  setOpen(true);
                }}
              >
                <CreateNewFolder sx={{ mr: 1 }} /> Add Project
              </Button>
            </Box>

            <Box
              sx={{
                height: "400px",
                overflow: "auto",
                width: "80%",
                mx: "auto",
              }}
            >
              <Table
                borderAxis="yBetween"
                color="primary"
                variant="soft"
                stickyHeader
                sx={{
                  width: "100%",
                  tableLayout: "fixed",
                  textAlign: "center",
                }}
              >
                <thead>
                  <tr>
                    <th className="w-10">Sr. No</th>
                    <th className="w-10">Project Id</th>
                    <th className="w-10">Project Code</th>
                    <th className="w-70">Project Name</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <tr key={index}>
                          <td>
                            <Skeleton
                              variant="text"
                              width={30}
                              animation="wave"
                            />
                          </td>
                          <td>
                            <Skeleton
                              variant="text"
                              width={80}
                              animation="wave"
                            />
                          </td>
                          <td>
                            <Skeleton
                              variant="text"
                              width={140}
                              animation="wave"
                            />
                          </td>
                          <td>
                            <Skeleton
                              variant="text"
                              width={120}
                              animation="wave"
                            />
                          </td>
                        </tr>
                      ))
                    : projects.map((project, index) => (
                        <tr key={project.id}>
                          <td>{index + 1}</td>
                          <td>{project.id}</td>
                          <td>{project.code}</td>
                          <td>{project.name}</td>
                        </tr>
                      ))}
                </tbody>
              </Table>
            </Box>
          </TabPanel>

          {/* ================= WORK TYPES TAB ================= */}
          <TabPanel value={2}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mb={2}
            >
              <Typography level="title-lg">Work Types</Typography>
              <Button
                variant="solid"
                color="primary"
                sx={{ mx: 3 }}
                onClick={() => {
                  setType("workType");
                  setOpen(true);
                }}
              >
                <AddCircle sx={{ mr: 1 }} /> Add Work Type
              </Button>
            </Box>

            <Box
              sx={{
                height: "400px",
                overflow: "auto",
                width: "80%",
                mx: "auto",
              }}
            >
              <Table
                borderAxis="yBetween"
                color="primary"
                variant="soft"
                stickyHeader
                sx={{
                  width: "100%",
                  tableLayout: "fixed",
                  textAlign: "center",
                }}
              >
                <thead>
                  <tr>
                    <th className="w-10">Sr. No</th>
                    <th className="w-10">Work Type Id</th>
                    <th className="w-33">Work Type</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <tr key={index}>
                          <td>
                            <Skeleton
                              variant="text"
                              width={30}
                              animation="wave"
                            />
                          </td>
                          <td>
                            <Skeleton
                              variant="text"
                              width={80}
                              animation="wave"
                            />
                          </td>
                          <td>
                            <Skeleton
                              variant="text"
                              width={140}
                              animation="wave"
                            />
                          </td>
                        </tr>
                      ))
                    : workTypes.map((workType, index) => (
                        <tr key={workType.id}>
                          <td>{index + 1}</td>
                          <td>{workType.id}</td>
                          <td>{workType.name}</td>
                        </tr>
                      ))}
                </tbody>
              </Table>
            </Box>
          </TabPanel>
        </Tabs>
      </Box>
      <AdminPanelAdd
        type={type}
        open={open}
        onClose={() => setOpen(false)}
        designations={designation}
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
    </div>
  );
};

export default AdminPanel;
