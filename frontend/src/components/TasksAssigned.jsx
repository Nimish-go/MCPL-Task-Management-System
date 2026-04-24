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
  Autocomplete,
  Chip,
  Avatar,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AssignmentTurnedIn,
  CalendarToday,
  FolderOpen,
  WorkOutline,
  Notes,
  AccessTime,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import useEmail from "../hooks/useEmail";
import Toast from "./Toast";

/* ─── Shared MUI Joy sx tokens ─── */
const labelSx = {
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "text.secondary",
  mb: 0.5,
};

const inputSx = {
  borderRadius: "8px",
  "--Input-focusedThickness": "1.5px",
};

/* ─── Section divider ─── */
const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-2 my-1">
    <span className="text-[0.65rem] font-extrabold tracking-widest uppercase text-gray-400 whitespace-nowrap">
      {label}
    </span>
    <hr className="flex-1 border-t border-gray-200" />
  </div>
);

const TasksAssigned = ({ open, onClose, projects, employees, workTypes }) => {
  const [projectData, setProjectData] = useState([]);
  const [selectedProjectCode, setSelectedProjectCode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [employeeData, setEmployeeData] = useState([]);
  const [assignedToEmployee, setAssignedToEmployee] = useState(0);
  const [assignedByEmployee] = useState(sessionStorage.getItem("empName"));
  const [workTypeData, setWorkTypeData] = useState([]);
  const [selectedWorkType, setSelectedWorkType] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [remarks, setRemarks] = useState("");
  const [deadline, setDeadline] = useState("");
  const [toastStatus, setToastStatus] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [projectCodeLoading, setProjectCodeLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayDisplay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { sendEmail } = useEmail();

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app";
    setProjectData(projects);
    setWorkTypeData(workTypes);
    setEmployeeData(employees);
    setProjectCodeLoading(true);
    if (!selectedProjectCode) {
      setProjectCodeLoading(false);
      return;
    }
    axios
      .get(`/get_project_data/${selectedProjectCode}`)
      .then((res) => {
        if (res.status === 200) setProjectName(res.data.project_name);
      })
      .catch(console.error)
      .finally(() => setProjectCodeLoading(false));
  }, [projects, workTypes, employees, selectedProjectCode]);

  const resetForm = () => {
    setProjectName("");
    setSelectedProjectCode("");
    setDeadline("");
    setTaskDescription("");
    setRemarks("");
    setSelectedWorkType("");
    setAssignedToEmployee(0);
  };

  const validate = () =>
    selectedProjectCode &&
    projectName &&
    selectedWorkType &&
    deadline &&
    taskDescription &&
    assignedToEmployee !== 0;

  const assignTask = (event) => {
    event.preventDefault();
    setAssigning(true);
    if (!validate()) {
      setAssigning(false);
      setToastStatus("warning");
      setToastMessage("Please fill all required fields.");
      setShowToast(true);
      return;
    }
    const formData = new FormData();
    formData.append("dateOfEntry", today);
    formData.append("projectCode", selectedProjectCode);
    formData.append("taskDesc", taskDescription);
    formData.append("workType", selectedWorkType);
    formData.append("assignTo", assignedToEmployee);
    formData.append("assignBy", assignedByEmployee);
    formData.append("remarks", remarks);
    formData.append("deadline", deadline);
    formData.append("taskType", "General Task");

    axios
      .post("/assign_task", formData)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setToastStatus(data.status);
          setToastMessage(data.message);
          setShowToast(true);
          try {
            sendEmail({
              to_email: data.empEmail.to_email,
              to_name: data.empEmail.to_name,
              assigner_name: assignedByEmployee,
              from_email: sessionStorage.getItem("email"),
              task_details: taskDescription,
              project_code: selectedProjectCode,
              project_name: projectName,
              deadline: deadline.toString(),
            });
          } catch (err) {
            console.error(err);
          }
        }
      })
      .catch((err) => {
        setToastStatus("error");
        setToastMessage("Something went wrong. Check the console.");
        setShowToast(true);
        console.error(err);
      })
      .finally(() => {
        setAssigning(false);
        resetForm();
      });
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={() => {
          resetForm();
          onClose();
        }}
        anchor="right"
        slotProps={{
          content: {
            sx: {
              width: 440,
              maxWidth: "96vw",
              bgcolor: "#fafbff",
              borderLeft: "1px solid #e8eaff",
              boxShadow: "-8px 0 40px rgba(92,110,248,0.08)",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        {/* ── Gradient Header ── */}
        <div className="relative overflow-hidden px-6 pt-6 pb-5 bg-gradient-to-br from-indigo-500 to-violet-500 shrink-0">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-5 right-16 w-16 h-16 rounded-full bg-white/[0.07] pointer-events-none" />

          <ModalClose
            sx={{
              position: "absolute",
              top: 14,
              right: 14,
              color: "rgba(255,255,255,0.8)",
              "&:hover": {
                color: "#fff",
                background: "rgba(255,255,255,0.15)",
              },
            }}
          />

          {/* Title row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AssignmentTurnedIn sx={{ color: "#fff", fontSize: 20 }} />
            </div>
            <div>
              <Typography
                level="h4"
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                Assign Task
              </Typography>
              <Typography
                sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem" }}
              >
                Fill in the details below
              </Typography>
            </div>
          </div>

          {/* Date badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            <CalendarToday sx={{ fontSize: 13 }} />
            {todayDisplay}
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <Box sx={{ px: 3, py: 3, overflowY: "auto", flex: 1 }}>
          <Stack spacing={2.5}>
            {/* ── Project ── */}
            <SectionDivider label="Project" />

            <div className="grid grid-cols-2 gap-4">
              <FormControl>
                <FormLabel sx={labelSx}>Project Code *</FormLabel>
                <Autocomplete
                  placeholder="e.g. PRJ-001"
                  loading={projectCodeLoading}
                  options={projectData}
                  getOptionLabel={(opt) => opt.code}
                  onChange={(_, val) => {
                    setSelectedProjectCode(val?.code || "");
                    setProjectName(val ? "Loading…" : "");
                  }}
                  sx={{
                    borderRadius: "8px",
                    "--Input-focusedThickness": "1.5px",
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel sx={labelSx}>Assign To *</FormLabel>
                <Select
                  placeholder="Select employee"
                  onChange={(_, v) => setAssignedToEmployee(v)}
                  sx={inputSx}
                >
                  {employeeData.map((e) => (
                    <Option key={e.id} value={e.id}>
                      {e.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </div>

            <FormControl>
              <FormLabel sx={labelSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FolderOpen sx={{ fontSize: 14 }} /> Project Name
                </Box>
              </FormLabel>
              <Textarea
                value={projectName}
                minRows={2}
                placeholder="Auto-filled from project code…"
                readOnly
                sx={{
                  borderRadius: "8px",
                  bgcolor: "#f4f5f9",
                  fontStyle: projectName ? "normal" : "italic",
                  fontSize: "0.88rem",
                  "--Textarea-focusedThickness": "0px",
                  cursor: "default",
                }}
              />
            </FormControl>

            {/* ── Task Details ── */}
            <SectionDivider label="Task Details" />

            <FormControl>
              <FormLabel sx={labelSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Notes sx={{ fontSize: 14 }} /> Task Description *
                </Box>
              </FormLabel>
              <Textarea
                placeholder="Describe the task clearly…"
                value={taskDescription}
                minRows={3}
                onChange={(e) => setTaskDescription(e.target.value)}
                sx={{
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                  "--Textarea-focusedThickness": "1.5px",
                }}
              />
            </FormControl>

            <div className="grid grid-cols-2 gap-4">
              <FormControl>
                <FormLabel sx={labelSx}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <WorkOutline sx={{ fontSize: 14 }} /> Work Type *
                  </Box>
                </FormLabel>
                <Select
                  placeholder="Select type"
                  onChange={(_, v) => setSelectedWorkType(v)}
                  sx={inputSx}
                >
                  {workTypeData.map((w) => (
                    <Option key={w.id} value={w.id}>
                      {w.work_type}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel sx={labelSx}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: 14 }} /> Deadline *
                  </Box>
                </FormLabel>
                <Input
                  type="date"
                  slotProps={{ input: { min: today } }}
                  onChange={(e) => setDeadline(e.target.value)}
                  sx={inputSx}
                />
              </FormControl>
            </div>

            <FormControl>
              <FormLabel sx={labelSx}>Remarks</FormLabel>
              <Textarea
                minRows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any additional notes…"
                sx={{
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                  "--Textarea-focusedThickness": "1.5px",
                }}
              />
            </FormControl>

            {/* ── Assigned By ── */}
            <SectionDivider label="Assigned By" />

            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
              <Avatar
                size="sm"
                sx={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  flexShrink: 0,
                }}
              >
                {assignedByEmployee?.charAt(0) ?? "?"}
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-700 truncate">
                  {assignedByEmployee ?? "—"}
                </span>
                <span className="text-[0.7rem] text-gray-400 font-medium">
                  Task assignor · current session
                </span>
              </div>
              <Chip
                size="sm"
                sx={{
                  ml: "auto",
                  bgcolor: "#e0e7ff",
                  color: "#4f46e5",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.06em",
                  flexShrink: 0,
                }}
              >
                YOU
              </Chip>
            </div>

            {/* ── Submit ── */}
            <div className="pt-1 flex flex-col gap-2">
              <Button
                fullWidth
                size="md"
                loading={assigning}
                startDecorator={
                  !assigning && <AssignmentTurnedIn sx={{ fontSize: 18 }} />
                }
                onClick={assignTask}
                sx={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  fontSize: "0.85rem",
                  height: 44,
                  borderRadius: "10px",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    boxShadow: "0 6px 20px rgba(99,102,241,0.45)",
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "translateY(0)" },
                }}
              >
                {assigning ? "Assigning…" : "Assign Task"}
              </Button>

              <p className="text-center text-[0.72rem] text-gray-400">
                An email notification will be sent to the assignee.
              </p>
            </div>
          </Stack>
        </Box>
      </Drawer>

      <Toast
        open={showToast}
        status={toastStatus}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

export default TasksAssigned;
