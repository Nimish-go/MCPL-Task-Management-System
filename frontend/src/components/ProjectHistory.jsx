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
import Toast from "./Toast";

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
  const [selectedWorkType, setSelectedWorkType] = useState(0);
  const [isRework, setIsRework] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [assignerName, setAssignerName] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0.0);
  const [eventDesc, setEventDesc] = useState("");
  const [remarks, setRemarks] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [toastStatus, setToastStatus] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [dateOfEntry, setDateOfEntry] = useState("");
  const [loading, setLoading] = useState(false);

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
  }, [employees, projects, workTypes, selectedProjectCode]);

  const today = new Date().toISOString().split("T")[0];

  const submitRecord = (event) => {
    event.preventDefault();
    setLoading(true);
    if (validateForm()) {
      const formData = new FormData();
      if (type === "performed") {
        formData.append("assignedBy", assignerName);
      }
      formData.append("type", type);
      formData.append("filledBy", sessionStorage.getItem("empName"));
      formData.append("dateOfEntry", today);
      formData.append("eventDate", eventDate);
      formData.append("projectCode", selectedProjectCode);
      formData.append("workType", selectedWorkType);
      formData.append("timeSpent", timeSpent);
      formData.append("eventDesc", eventDesc);
      formData.append("remarks", remarks);
      formData.append("rework", isRework);
      axios
        .post("/project_history", formData)
        .then((res) => {
          if (res.status === 200) {
            const data = res.data;
            setToastStatus(data.status);
            setToastMessage(data.message);
            setToastShow(true);
            resetForm();
            setLoading(false);
            onClose();
          }
        })
        .catch((err) => {
          setLoading(false);
          console.error(err);
          setToastStatus("error");
          setToastMessage("Something Went Wrong. Please Check The Console.");
          setToastShow(true);
        });
    } else {
      setToastMessage("Please Fill In All Fields.");
      setToastStatus("warning");
      setToastShow(true);
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (type === "performed") {
      if (
        !selectedProjectCode ||
        !projectName ||
        !selectedWorkType ||
        !timeSpent ||
        !assignerName ||
        !eventDesc ||
        !remarks
      ) {
        return false;
      }
    } else {
      if (
        !selectedProjectCode ||
        !projectName ||
        !selectedWorkType ||
        !timeSpent ||
        !eventDesc ||
        !remarks
      ) {
        return false;
      }
    }
    return true;
  };

  const resetForm = () => {
    setSelectedProjectCode("");
    setSelectedWorkType(0);
    setProjectName("");
    setEventDate("");
    setEventDesc("");
    setAssignerName(0);
    setRemarks("");
    setIsRework(false);
    setTimeSpent();
  };

  return (
    <>
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
                <Input
                  value={today}
                  readOnly
                  type="date"
                  onChange={(e) => setDateOfEntry(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Event Date</FormLabel>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
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
                  value={selectedWorkType}
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
              <RadioGroup
                orientation="horizontal"
                value={isRework}
                onChange={(e) => setIsRework(e.target.value)}
              >
                <Radio value="true" label="Rework" />
                <Radio value="false" label="No Rework" />
              </RadioGroup>
            </Box>
            <Box display={"flex"} gap={2}>
              {type === "performed" && (
                <FormControl disabled={type === "performed" ? false : true}>
                  <FormLabel>Task Assigner Name</FormLabel>
                  <Select
                    placeholder="Select Employee"
                    onChange={(e, newVal) => setAssignerName(newVal)}
                    value={assignerName}
                  >
                    {employeeData.map((employee) => (
                      <Option key={employee.id} value={employee.id}>
                        {employee.name}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl>
                <FormLabel>Enter Time Spent (in hrs.)</FormLabel>
                <Input
                  type="number"
                  slotProps={{
                    input: {
                      step: "any",
                    },
                  }}
                  placeholder="0.01"
                  onChange={(e) => setTimeSpent(e.target.value)}
                  value={timeSpent}
                />
              </FormControl>
            </Box>
            <FormControl>
              <FormLabel>Event Description</FormLabel>
              <Textarea
                minRows={3}
                placeholder="Event:....."
                onChange={(e) => setEventDesc(e.target.value)}
                value={eventDesc}
              ></Textarea>
            </FormControl>
            <FormControl>
              <FormLabel>Remarks</FormLabel>
              <Textarea
                minRows={3}
                placeholder="Remarks:......."
                onChange={(e) => setRemarks(e.target.value)}
                value={remarks}
              ></Textarea>
            </FormControl>
            <Button
              variant="soft"
              color="primary"
              startDecorator={<Save />}
              onClick={submitRecord}
              loading={loading}
            >
              Save Record to{" "}
              {type === "performed" ? "Tasks Performed" : "Project History"}
            </Button>
          </Stack>
        </Box>
      </Drawer>
      <Toast
        status={toastStatus}
        message={toastMessage}
        open={toastShow}
        onClose={() => setToastShow(false)}
      />
    </>
  );
};

export default ProjectHistory;
