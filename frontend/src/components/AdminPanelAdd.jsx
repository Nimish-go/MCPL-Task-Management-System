import {
  AddCircle,
  CreateNewFolder,
  PersonAdd,
  KeyboardArrowDown,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Drawer,
  FormControl,
  FormLabel,
  Input,
  ModalClose,
  Option,
  Select,
  Textarea,
  Typography,
} from "@mui/joy";
import { selectClasses } from "@mui/material/Select";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Toast from "./Toast";

const AdminPanelAdd = ({
  open,
  onClose,
  type,
  designations,
  branches,
  organisations,
}) => {
  const [projectName, setProjectName] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddr, setClientAddr] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [remarks, setRemarks] = useState("");

  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [dob, setDOB] = useState("");
  const [doj, setDOJ] = useState("");
  const [designation, setDesignation] = useState(0);
  const [branch, setBranch] = useState(0);
  const [role, setRole] = useState("");

  const organisation = sessionStorage.getItem("org");

  const [workType, setWorkType] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastStatus, setToastStatus] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
  }, []);

  const addEmployee = (event) => {
    event.preventDefault();
    if (!validateEmployee()) {
      setToastStatus("warning");
      setToastMessage("Please Fill In all Feilds");
      setToastOpen(true);
      setLoading(false);
    } else {
      setLoading(true);
      const formData = new FormData();
      formData.append("empName", employeeName);
      formData.append("empEmail", employeeEmail);
      formData.append("dob", dob);
      formData.append("doj", doj);
      formData.append("designation", designation);
      formData.append("branch", branch);
      formData.append("role", role);
      formData.append("organisation", organisation);
      axios
        .post("/addEmployee", formData)
        .then((res) => {
          if (res.status === 200) {
            const data = res.data;
            setToastStatus(data.status);
            setToastMessage(data.message);
            setToastOpen(true);
            setLoading(false);
            resetEmployee();
            onClose();
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        })
        .catch((err) => {
          console.error(err);
          setToastStatus("error");
          setToastMessage("Something Went Wrong. Please Check The Console");
          setToastOpen(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const addProject = (event) => {
    event.preventDefault();
    setLoading(true);
    if (!validateProject()) {
      setToastStatus("warning");
      setToastMessage("Please Fill In all Feilds.");
      setToastOpen(true);
      setLoading(false);
    } else {
      const formData = new FormData();
      formData.append("projectCode", projectCode);
      formData.append("projectName", projectName);
      formData.append("clientName", clientName);
      formData.append("clientAddr", clientAddr);
      formData.append("clientContact", clientContact);
      formData.append("org", organisation);
      formData.append("remarks", remarks);
      axios
        .post("/addProject", formData)
        .then((res) => {
          if (res.status === 200) {
            const data = res.data;
            setToastStatus(data.status);
            setToastMessage(data.message);
            setToastOpen(true);
            resetProject();
            onClose();
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        })
        .catch((err) => {
          console.error(err);
          setToastStatus("error");
          setToastMessage("Something Went Wrong. Please Check The Console");
          setToastOpen(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const addWorkType = (event) => {
    event.preventDefault();
    setLoading(true);
    if (!validateWorkType()) {
      setToastStatus("warning");
      setToastMessage("Please Fill In all Feilds.");
      setToastOpen(true);
      setLoading(false);
    } else {
      const formData = new FormData();
      formData.append("workType", workType);
      formData.append("remarks", remarks);
      axios
        .post("/addWorkType", formData)
        .then((res) => {
          if (res.status === 200) {
            const data = res.data;
            setToastStatus(data.status);
            setToastMessage(data.message);
            setToastOpen(true);
            resetWorkType();
            onClose();
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        })
        .catch((err) => {
          console.error(err);
          setToastStatus("error");
          setToastMessage("Something Went Wrong. Please Check The Console");
          setToastOpen(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const validateEmployee = () => {
    if (
      !employeeName ||
      employeeName === "" ||
      !employeeEmail ||
      employeeEmail === "" ||
      !dob ||
      dob === "" ||
      !doj ||
      doj === "" ||
      !designation ||
      designation === "" ||
      !branch ||
      branch === "" ||
      !role ||
      role === ""
    ) {
      return false;
    }
    return true;
  };

  const validateProject = () => {
    if (
      !projectCode ||
      !projectName ||
      !clientName ||
      !clientContact ||
      !clientAddr
    ) {
      return false;
    }
    return true;
  };

  const validateWorkType = () => {
    if (!workType) {
      return false;
    }
    return true;
  };

  const resetEmployee = () => {
    setEmployeeName("");
    setEmployeeEmail("");
    setDOB("");
    setDOJ("");
    setDesignation("");
    setBranch("");
    setRole("");
  };

  const resetProject = () => {
    setProjectCode("");
    setProjectName("");
    setClientName("");
    setClientContact("");
    setClientAddr("");
    setRemarks("");
  };

  const resetWorkType = () => {
    setWorkType("");
    setRemarks("");
  };

  return (
    <>
      <Drawer variant="soft" anchor="right" open={open} onClose={onClose}>
        <Box>
          <Typography level="h4" my={2} textAlign={"center"}>
            {type === "project"
              ? "Add a Project"
              : type === "workType"
                ? "Add Work Type"
                : type === "employee"
                  ? "Add An Employee"
                  : ""}
          </Typography>
          <ModalClose></ModalClose>
          <Box
            textAlign={"center"}
            justifyContent={"center"}
            mx={4}
            alignItems={"center"}
            mt={2}
          >
            {type === "project" ? (
              <>
                <FormControl>
                  <FormLabel>Enter Project Code</FormLabel>
                  <Input
                    type="text"
                    variant="outlined"
                    placeholder="XYZ01"
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ mt: 2 }}>
                  <FormLabel>Enter Project Name</FormLabel>
                  <Input
                    type="text"
                    variant="outlined"
                    placeholder="Lorem Ipsum dolor sit amet......."
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ mt: 2 }}>
                  <FormLabel>Enter Client Name</FormLabel>
                  <Input
                    type="text"
                    variant="outlined"
                    placeholder="ABC Client...."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ mt: 2 }}>
                  <FormLabel>Enter Client Contact Info</FormLabel>
                  <Input
                    type="text"
                    variant="outlined"
                    placeholder="Mobile/Email"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ mt: 2 }}>
                  <FormLabel>Enter Address</FormLabel>
                  <Textarea
                    type="text"
                    variant="outlined"
                    placeholder="221B Baker Street"
                    minRows={3}
                    value={clientAddr}
                    onChange={(e) => setClientAddr(e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ mt: 2 }}>
                  <FormLabel>Enter Remarks</FormLabel>
                  <Input
                    type="text"
                    variant="outlined"
                    placeholder="Remarks...."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </FormControl>
                <Button
                  variant="soft"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={addProject}
                  loading={loading}
                >
                  <CreateNewFolder /> Add Project Details
                </Button>
              </>
            ) : type === "workType" ? (
              <>
                <FormControl>
                  <FormLabel>Enter Work Type</FormLabel>
                  <Input
                    type="text"
                    variant="outlined"
                    placeholder="Designing/Drafting/Dr..."
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ mt: 2 }}>
                  <FormLabel>Enter Remarks</FormLabel>
                  <Input
                    type="text"
                    variant="outlined"
                    placeholder="Remarks...."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </FormControl>
                <Button
                  variant="soft"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={addWorkType}
                  loading={loading}
                >
                  <AddCircle /> Add Work Type
                </Button>
              </>
            ) : type === "employee" ? (
              <div className="text-center">
                <FormControl>
                  <FormLabel>Enter Employee Name</FormLabel>
                  <Input
                    type="text"
                    variant="outlined"
                    placeholder="Joe Stern"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ mt: 3 }}>
                  <FormLabel>Enter Employee Email</FormLabel>
                  <Input
                    type="email"
                    variant="outlined"
                    placeholder="joestern@example.com"
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ mt: 3 }}>
                  <FormLabel>Enter Date Of Birth</FormLabel>
                  <Input
                    type="date"
                    variant="outlined"
                    value={dob}
                    onChange={(e) => setDOB(e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ mt: 3 }}>
                  <FormLabel>Enter Date Of Joining</FormLabel>
                  <Input
                    type="date"
                    variant="outlined"
                    value={doj}
                    onChange={(e) => setDOJ(e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{ mt: 3 }}>
                  <FormLabel>Enter Designation</FormLabel>
                  <Select
                    variant="outlined"
                    placeholder="Analyst"
                    onChange={(e, newVal) => setDesignation(newVal)}
                    indicator={<KeyboardArrowDown />}
                    sx={{
                      [`& .${selectClasses.indicator}`]: {
                        transition: "0.2s",
                        [`&.${selectClasses.expanded}`]: {
                          transform: "rotate(-180deg)",
                        },
                      },
                    }}
                  >
                    {designations.map((designation) => (
                      <Option value={designation.id}>{designation.name}</Option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ mt: 3 }}>
                  <FormLabel>Enter Branch</FormLabel>
                  <Select
                    variant="outlined"
                    placeholder="Director"
                    onChange={(e, newVal) => setBranch(newVal)}
                    indicator={<KeyboardArrowDown />}
                    sx={{
                      [`& .${selectClasses.indicator}`]: {
                        transition: "0.2s",
                        [`&.${selectClasses.expanded}`]: {
                          transform: "rotate(-180deg)",
                        },
                      },
                    }}
                  >
                    {branches.map((branch) => (
                      <Option value={branch.id}>{branch.name}</Option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ mt: 3 }}>
                  <FormLabel>Organisation</FormLabel>
                  <Input type="text" value={organisation} disabled />
                </FormControl>
                <FormControl sx={{ mt: 3 }}>
                  <FormLabel>Enter Role</FormLabel>
                  <Select
                    variant="outlined"
                    placeholder="Select Role"
                    indicator={<KeyboardArrowDown />}
                    sx={{
                      [`& .${selectClasses.indicator}`]: {
                        transition: "0.2s",
                        [`&.${selectClasses.expanded}`]: {
                          transform: "rotate(-180deg)",
                        },
                      },
                    }}
                    onChange={(e, newVal) => setRole(newVal)}
                  >
                    <Option value={"User"}>User</Option>
                    <Option value={"Admin"}>Admin</Option>
                  </Select>
                </FormControl>
                <Button
                  variant="soft"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={addEmployee}
                  loading={loading}
                >
                  <PersonAdd /> Add Employee to database
                </Button>
              </div>
            ) : (
              <></>
            )}
          </Box>
        </Box>
      </Drawer>
      <Toast
        open={toastOpen}
        status={toastStatus}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
};

export default AdminPanelAdd;
