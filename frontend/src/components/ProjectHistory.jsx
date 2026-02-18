import { Save } from "@mui/icons-material";
import {
  Box,
  Drawer,
  ModalClose,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Option,
  Input,
  Textarea,
  RadioGroup,
  Radio,
  Button,
} from "@mui/joy";
import axios from "axios";
import React, { useEffect, useState } from "react";

const ProjectHistory = ({
  open,
  onClose,
  type,
  projects,
  employees,
  workTypes,
}) => {
  const [projectData, setProjectData] = useState([]);
  const [selectedProjectCode, setSelectedProjectCode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [workTypeData, setWorkTypeData] = useState([]);
  const [selectedWorkType, setSelectedWorkType] = useState("");
  const [employeeData, setEmployeeData] = useState([]);
  const [timeSpent, setTimeSpent] = useState("");

  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:5002";
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
  }, [employees, projects, workTypes, selectedProjectCode]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ "--Drawer-width": "520px" }}
    >
      <Box sx={{ p: 3 }}>
        <Typography level="h4" mb={2}>
          {type === "performed" ? "Tasks Performed" : "Project History"}
        </Typography>
        <ModalClose></ModalClose>
        <Stack spacing={2}>
          <Box display={"flex"} mb={2} gap={2}>
            <FormControl>
              <FormLabel>Date Of Entry</FormLabel>
              <Input value={today} readOnly type="date" />
            </FormControl>
            <FormControl>
              <FormLabel>Event Date</FormLabel>
              <Input type="date" />
            </FormControl>
          </Box>
          <Box display={"flex"} gap={2} mb={2}>
            <FormControl>
              <FormLabel>Project Code</FormLabel>
              <Select
                placeholder="Select Project Code"
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
              <FormLabel>Work Type</FormLabel>
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
          </Box>
          <FormControl>
            <FormLabel>Project Name</FormLabel>
            <Textarea
              minRows={2}
              readOnly
              value={projectName}
              placeholder="Project:........"
            ></Textarea>
          </FormControl>
          <Box display={"flex"} justifyContent={"center"} gap={3}>
            <RadioGroup orientation="horizontal">
              <Radio value="yes" label="Rework" />
              <Radio value="no" label="No Rework" />
            </RadioGroup>
          </Box>
          <Box display={"flex"} gap={2}>
            <FormControl disabled={type === "performed" ? false : true}>
              <FormLabel>Task Assigner Name</FormLabel>
              <Select placeholder="Select Employee">
                {employeeData.map((employee) => (
                  <Option key={employee.id} value={employee.id}>
                    {employee.name}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Enter Time Spent (in hrs.)</FormLabel>
              <Input
                type="text"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e)}
              />
            </FormControl>
          </Box>
          <FormControl>
            <FormLabel>Event Description</FormLabel>
            <Textarea minRows={3} placeholder="Event:....."></Textarea>
          </FormControl>
          <FormControl>
            <FormLabel>Remarks</FormLabel>
            <Textarea minRows={3} placeholder="Remarks:......."></Textarea>
          </FormControl>
          <Button variant="soft" color="primary" startDecorator={<Save />}>
            Save Record to{" "}
            {type === "performed" ? "Tasks Performed" : "Project History"}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default ProjectHistory;
