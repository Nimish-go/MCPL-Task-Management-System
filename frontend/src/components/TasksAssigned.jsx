import {
  Box,
  Drawer,
  Typography,
  ModalClose,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Option,
  Textarea,
  Input,
  Button,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { AddTask } from "@mui/icons-material";

const TasksAssigned = ({ open, onClose }) => {
  const [projectData, setProjectData] = useState([]);
  const [selectedProjectCode, setSelectedProjectCode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [employeeData, setEmployeeData] = useState([]);
  const [assignedToEmployee, setAssignedToEmployee] = useState("");
  const [assignedByEmployee, setAssignedByEmployee] = useState(
    sessionStorage.getItem("emp_name"),
  );
  const [workTypeData, setWorkTypeData] = useState([]);
  const [selectedWorkType, setSelectedWorkType] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [remarks, setRemarks] = useState("");
  const [formData, setFormData] = useState({
    projectCode: "",
    projectName: "",
    assigningToEmp: "",
    assignedBy: "",
    workType: "",
    taskDescription: "",
    remarks: "",
    deadline: "",
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:5002";
    axios.get("/get_all_projects").then((res) => {
      if (res.status === 200) {
        const data = res.data;
        setProjectData(data);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProjectCode) return;
    axios.get(`/get_project_data/${selectedProjectCode}`).then((res) => {
      if (res.status === 200) {
        const data = res.data;
        setProjectName(data.project_name);
      }
    });
  }, [selectedProjectCode]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
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

  const assignTask = (event) => {
    event.preventDefault();
  };

  return (
    <Drawer open={open} onClose={onClose} anchor="right">
      <Box sx={{ p: 3 }}>
        <Typography level="h4" mb={2}>
          Assign a Task
        </Typography>
        <ModalClose></ModalClose>
        <Stack spacing={2}>
          <FormControl>
            <FormLabel>Date Of Entry</FormLabel>
            <Input type="date" value={today} readOnly />
          </FormControl>
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Project Code</FormLabel>
              <Select
                placeholder="Select Code"
                onChange={(e, newValue) => setSelectedProjectCode(newValue)}
              >
                {projectData.map((project) => (
                  <Option key={project.code} value={project.code}>
                    {project.code}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Assigning To</FormLabel>
              <Select
                placeholder="Select Employee"
                onChange={(e, newValue) => setAssignedToEmployee(newValue)}
              >
                {employeeData.map((employee) => (
                  <Option key={employee.id} value={employee.id}>
                    {employee.name}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Box>
          <FormControl>
            <FormLabel>Project Name</FormLabel>
            <Textarea
              value={projectName}
              minRows={3}
              placeholder="Project 02...."
              readOnly
            ></Textarea>
          </FormControl>
          <FormControl>
            <FormLabel>Enter Task Decription</FormLabel>
            <Textarea
              placeholder="Task:........"
              value={taskDescription}
              minRows={3}
              onChange={(e) => setTaskDescription(e.target.value)}
            ></Textarea>
          </FormControl>
          <FormControl>
            <FormLabel>Select Work Type</FormLabel>
            <Select
              placeholder="Select Work Type"
              onChange={(e, newValue) => setSelectedWorkType(newValue)}
            >
              {workTypeData.map((workType) => (
                <Option key={workType.id} value={workType.id}>
                  {workType.work_type}
                </Option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Assigned By</FormLabel>
            <Input
              readOnly
              value={assignedByEmployee}
              onChange={(e) => setAssignedByEmployee(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Assign Deadline</FormLabel>
            <Input type="date" />
          </FormControl>
          <FormControl>
            <FormLabel>Remarks</FormLabel>
            <Textarea
              minRows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Remarks:......"
            ></Textarea>
          </FormControl>
          <Button size="md" variant="soft" color="primary" onClick={assignTask} startDecorator={<AddTask />}>
            Assign Task
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default TasksAssigned;
