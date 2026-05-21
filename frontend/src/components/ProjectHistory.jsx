import { Save, FolderOpen, WorkOutline, AccessTime, EventNote, Person, Notes, Comment, Replay } from "@mui/icons-material";
import {
  Box,
  Drawer,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Select,
  Option,
  Input,
  Textarea,
  Button,
  Chip,
} from "@mui/joy";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Toast from "./Toast";

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
    <Box
      sx={{
        width: 28, height: 28, borderRadius: "8px",
        background: "linear-gradient(135deg, #0f1b35, #1565c0)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: "0.85rem", color: "#fff" } })}
    </Box>
    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {label}
    </Typography>
    <Box sx={{ flex: 1, height: "1px", backgroundColor: "#e8ecf4" }} />
  </Box>
);

// ─── Styled Form Label ────────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <FormLabel sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", mb: 0.5 }}>
    {children}
  </FormLabel>
);

// ─── Rework Toggle ────────────────────────────────────────────────────────────
const ReworkToggle = ({ value, onChange }) => {
  const options = [
    { value: "false", label: "No Rework", color: "#2e7d32", bg: "#e8f5e9", border: "#a5d6a7" },
    { value: "true",  label: "Rework",    color: "#c62828", bg: "#fce4ec", border: "#ef9a9a" },
  ];
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {options.map((opt) => {
        const active = String(value) === opt.value;
        return (
          <Box
            key={opt.value}
            onClick={() => onChange(opt.value)}
            sx={{
              flex: 1, py: 1, px: 2, borderRadius: "10px", cursor: "pointer",
              textAlign: "center", fontWeight: 700, fontSize: "0.82rem",
              border: `2px solid ${active ? opt.border : "#e8ecf4"}`,
              backgroundColor: active ? opt.bg : "#fafbff",
              color: active ? opt.color : "#94a3b8",
              transition: "all 0.18s ease",
              "&:hover": { borderColor: opt.border, backgroundColor: opt.bg, color: opt.color },
            }}
          >
            {opt.label}
          </Box>
        );
      })}
    </Box>
  );
};

const inputSx = {
  borderRadius: "10px",
  backgroundColor: "#fafbff",
  border: "1px solid #e2e8f0",
  fontSize: "0.85rem",
  "&:hover": { borderColor: "#1976d2" },
  "&:focus-within": { borderColor: "#1976d2", boxShadow: "0 0 0 3px rgba(25,118,210,0.1)" },
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProjectHistory = ({ open, onClose, type, projects, employees, workTypes }) => {
  const [projectData, setProjectData]               = useState([]);
  const [selectedProjectCode, setSelectedProjectCode] = useState("");
  const [projectName, setProjectName]               = useState("");
  const [workTypeData, setWorkTypeData]             = useState([]);
  const [selectedWorkType, setSelectedWorkType]     = useState(0);
  const [isRework, setIsRework]                     = useState("false");
  const [employeeData, setEmployeeData]             = useState([]);
  const [assignerName, setAssignerName]             = useState(0);
  const [timeSpent, setTimeSpent]                   = useState("");
  const [eventDesc, setEventDesc]                   = useState("");
  const [remarks, setRemarks]                       = useState("");
  const [toastShow, setToastShow]                   = useState(false);
  const [toastStatus, setToastStatus]               = useState("");
  const [toastMessage, setToastMessage]             = useState("");
  const [eventDate, setEventDate]                   = useState("");
  const [loading, setLoading]                       = useState(false);

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    setProjectData(projects);
    setWorkTypeData(workTypes);
    setEmployeeData(employees);
    if (!selectedProjectCode) return;
    axios.get(`/get_project_data/${selectedProjectCode}`).then((res) => {
      if (res.status === 200) setProjectName(res.data.project_name);
    });
  }, [employees, projects, workTypes, selectedProjectCode]);

  const today = new Date().toISOString().split("T")[0];

  const submitRecord = (event) => {
    event.preventDefault();
    setLoading(true);
    if (validateForm()) {
      const formData = new FormData();
      if (type === "performed") formData.append("assignedBy", assignerName);
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
      axios.post("/project_history", formData)
        .then((res) => {
          if (res.status === 200) {
            setToastStatus(res.data.status);
            setToastMessage(res.data.message);
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
    const base = selectedProjectCode && projectName && selectedWorkType && timeSpent && eventDesc && remarks;
    return type === "performed" ? base && assignerName : !!base;
  };

  const resetForm = () => {
    setSelectedProjectCode("");
    setSelectedWorkType(0);
    setProjectName("");
    setEventDate("");
    setEventDesc("");
    setAssignerName(0);
    setRemarks("");
    setIsRework("false");
    setTimeSpent("");
  };

  const isPerformed = type === "performed";
  const drawerTitle = isPerformed ? "Tasks Performed" : "Project History";

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          content: {
            sx: {
              width: { xs: "100vw", sm: 520 },
              background: "#f4f6fb",
              p: 0,
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
            px: 3, py: 2.5,
            display: "flex", alignItems: "center", gap: 2,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: 40, height: 40, borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {isPerformed
              ? <WorkOutline sx={{ color: "#fff", fontSize: "1.3rem" }} />
              : <FolderOpen sx={{ color: "#fff", fontSize: "1.3rem" }} />
            }
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.2 }}>
              {drawerTitle}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", mt: 0.3 }}>
              {isPerformed ? "Log a task you've completed" : "Add a project history entry"}
            </Typography>
          </Box>
          <Chip
            size="sm"
            sx={{
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.25)",
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          >
            {today}
          </Chip>
          <ModalClose sx={{ color: "#ffffff", position: "relative", top: "unset", right: "unset" }} />
        </Box>

        {/* ── Form Body ── */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { borderRadius: 4, backgroundColor: "#c5cae9" } }}>

          {/* Section: Dates */}
          <SectionHeader icon={<EventNote />} label="Entry Details" />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
            <FormControl>
              <FieldLabel>Date of Entry</FieldLabel>
              <Input value={today} readOnly type="date" sx={{ ...inputSx, backgroundColor: "#f0f2f8", color: "#94a3b8" }} />
            </FormControl>
            <FormControl>
              <FieldLabel>Event Date</FieldLabel>
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} sx={inputSx} />
            </FormControl>
          </Box>

          {/* Section: Project */}
          <SectionHeader icon={<FolderOpen />} label="Project Details" />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
            <FormControl>
              <FieldLabel>Project Code</FieldLabel>
              <Select
                placeholder="Select code"
                onChange={(e, newValue) => setSelectedProjectCode(newValue)}
                value={selectedProjectCode || null}
                sx={inputSx}
              >
                {projectData.map((project) => (
                  <Option key={project.code} value={project.code}>{project.code}</Option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FieldLabel>Work Type</FieldLabel>
              <Select
                placeholder="Select type"
                onChange={(e, newValue) => setSelectedWorkType(newValue)}
                value={selectedWorkType || null}
                sx={inputSx}
              >
                {workTypeData.map((workType) => (
                  <Option key={workType.id} value={workType.id}>{workType.work_type}</Option>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Project Name (readonly) */}
          <FormControl sx={{ mb: 3 }}>
            <FieldLabel>Project Name</FieldLabel>
            <Box
              sx={{
                minHeight: 48, borderRadius: "10px", border: "1px solid #e2e8f0",
                backgroundColor: "#f0f2f8", px: 1.5, py: 1, display: "flex", alignItems: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.85rem", color: projectName ? "#0f1b35" : "#94a3b8", fontStyle: projectName ? "normal" : "italic" }}>
                {projectName || "Select a project code to auto-fill…"}
              </Typography>
            </Box>
          </FormControl>

          {/* Section: Task Details */}
          <SectionHeader icon={<WorkOutline />} label="Task Details" />

          {/* Rework Toggle */}
          <FormControl sx={{ mb: 2 }}>
            <FieldLabel>Rework Status</FieldLabel>
            <ReworkToggle value={isRework} onChange={setIsRework} />
          </FormControl>

          <Box sx={{ display: "grid", gridTemplateColumns: isPerformed ? "1fr 1fr" : "1fr", gap: 2, mb: 2 }}>
            {isPerformed && (
              <FormControl>
                <FieldLabel>Task Assigner</FieldLabel>
                <Select
                  placeholder="Select employee"
                  onChange={(e, newVal) => setAssignerName(newVal)}
                  value={assignerName || null}
                  startDecorator={<Person sx={{ fontSize: "1rem", color: "#1976d2" }} />}
                  sx={inputSx}
                >
                  {employeeData.map((employee) => (
                    <Option key={employee.id} value={employee.id}>{employee.name}</Option>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl>
              <FieldLabel>Time Spent (hrs)</FieldLabel>
              <Input
                type="number"
                slotProps={{ input: { step: "any", min: 0 } }}
                placeholder="e.g. 1.5"
                onChange={(e) => setTimeSpent(e.target.value)}
                value={timeSpent}
                startDecorator={<AccessTime sx={{ fontSize: "1rem", color: "#1976d2" }} />}
                sx={inputSx}
              />
            </FormControl>
          </Box>

          {/* Section: Description & Remarks */}
          <SectionHeader icon={<Notes />} label="Description & Remarks" />
          <FormControl sx={{ mb: 2 }}>
            <FieldLabel>Event Description</FieldLabel>
            <Textarea
              minRows={3}
              placeholder="Describe the event or task performed…"
              onChange={(e) => setEventDesc(e.target.value)}
              value={eventDesc}
              sx={{ ...inputSx, fontFamily: "inherit" }}
            />
          </FormControl>
          <FormControl sx={{ mb: 3 }}>
            <FieldLabel>Remarks</FieldLabel>
            <Textarea
              minRows={3}
              placeholder="Any additional remarks or notes…"
              onChange={(e) => setRemarks(e.target.value)}
              value={remarks}
              sx={{ ...inputSx, fontFamily: "inherit" }}
            />
          </FormControl>
        </Box>

        {/* ── Footer ── */}
        <Box
          sx={{
            px: 3, py: 2.5,
            borderTop: "1px solid #e8ecf4",
            backgroundColor: "#fff",
            flexShrink: 0,
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => { resetForm(); onClose(); }}
            sx={{ flex: 1, borderRadius: "10px", fontWeight: 600, fontSize: "0.875rem", borderColor: "#e2e8f0", color: "#64748b", "&:hover": { backgroundColor: "#f4f6fb" } }}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={submitRecord}
            loading={loading}
            startDecorator={<Save sx={{ fontSize: "1rem" }} />}
            sx={{
              flex: 2,
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.875rem",
              background: "linear-gradient(135deg, #0f1b35, #1565c0)",
              "&:hover": { background: "linear-gradient(135deg, #1a2d54, #1976d2)" },
              boxShadow: "0 4px 14px rgba(21,101,192,0.35)",
            }}
          >
            Save to {drawerTitle}
          </Button>
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