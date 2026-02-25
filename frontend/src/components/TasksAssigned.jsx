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
import { useLocation } from "react-router-dom";
import useEmail from "../hooks/useEmail";
import Toast from "./Toast";

const TasksAssigned = ({ open, onClose, projects, employees, workTypes }) => {
  const [projectData, setProjectData] = useState([]);
  const [selectedProjectCode, setSelectedProjectCode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [employeeData, setEmployeeData] = useState([]);
  const [assignedToEmployee, setAssignedToEmployee] = useState("");
  const [assignedByEmployee, setAssignedByEmployee] = useState(
    sessionStorage.getItem("empName"),
  );
  const [workTypeData, setWorkTypeData] = useState([]);
  const [selectedWorkType, setSelectedWorkType] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [remarks, setRemarks] = useState("");
  const [deadline, setDeadline] = useState("");
  const [toastStatus, setToastStatus] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const location = useLocation();

  const { sendEmail, loading, error, success } = useEmail();

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    setProjectData(projects);
    setWorkTypeData(workTypes);
    setEmployeeData(employees);
    if (!selectedProjectCode) return;
    axios.get(`/get_project_data/${selectedProjectCode}`).then((res) => {
      if (res.status === 200) {
        const data = res.data;
        setProjectName(data.project_name);
      }
    });
  }, [projects, workTypes, employees, selectedProjectCode]);

  const resetForm = () => {
    
  };

  const assignTask = (event) => {
    event.preventDefault();
    setAssigning(true);
    const formData = new FormData();
    formData.append("dateOfEntry", today);
    formData.append("projectCode", selectedProjectCode);
    formData.append("taskDesc", taskDescription);
    formData.append("workType", selectedWorkType);
    formData.append("assignTo", assignedToEmployee);
    formData.append("assignBy", assignedByEmployee);
    formData.append("remarks", remarks);
    formData.append("deadline", deadline);
    axios
      .post("/assign_task", formData)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setToastStatus(data.status);
          setToastMessage(data.message);
          setShowToast(true);
          setAssigning(false);
          const templateParams = {
            to_email: data.empEmail.to_email,
            to_name: data.empEmail.to_name,
            from_name: assignedByEmployee,
            from_email: sessionStorage.getItem("email"),
            task_details: taskDescription,
            project_code: selectedProjectCode,
            project_name: projectName,
          };
          console.log(templateParams);
          try {
            sendEmail(templateParams);
          } catch (err) {
            setToastStatus("error");
            setToastMessage("Something Went Wrong while sending email.");
            setShowToast(true);
            console.error(err);
          }
        }
      })
      .catch((err) => {
        setToastStatus("error");
        setToastMessage("Something Went Wrong. Check Console for the same.");
        setShowToast(true);
        console.error(err);
      });
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
                  <Option key={project.id} value={project.id}>
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
            <Input
              type="date"
              onChange={(e) => setDeadline(e.target.value.toString())}
            />
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
          <Button
            size="md"
            variant="soft"
            color="primary"
            loading={assigning}
            startDecorator={<AddTask />}
            onClick={assignTask}
          >
            Assign Task
          </Button>
        </Stack>
      </Box>
      <Toast
        open={showToast}
        status={toastStatus}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </Drawer>
  );
};

export default TasksAssigned;
