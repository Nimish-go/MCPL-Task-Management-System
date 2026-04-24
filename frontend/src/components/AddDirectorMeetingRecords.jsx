import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Sheet,
  List,
  ListItem,
  Typography,
  IconButton,
  Textarea,
  Autocomplete,
  Tooltip,
} from "@mui/joy";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Calendar } from "primereact/calendar";
import {
  Groups2,
  Person,
  Save,
  Notes,
  Checklist,
  Search,
  Close,
  Add,
  Delete,
  AssignmentTurnedIn,
  BoltOutlined,
} from "@mui/icons-material";
import { Editor } from "primereact/editor";
import Toast from "./Toast";
import useEmail from "../hooks/useEmail";

// ─── Template that seeds the single editor ────────────────────────────────
const MOM_PLACEHOLDER = "Type from here and below for MOM.";
const CRUCIAL_PLACEHOLDER = "Type from here and below for Crucial Decisions";

const EDITOR_TEMPLATE = `<h2 style="color:#1976d2;border-bottom:2px solid #1976d2;padding-bottom:6px;margin-bottom:12px">Minutes of Meeting</h2><p><i>${MOM_PLACEHOLDER}</i><br><br></p><h2 style="color:#e65100;border-bottom:2px solid #e65100;padding-bottom:6px;margin-top:24px;margin-bottom:12px">Crucial Decisions</h2><p><i>${CRUCIAL_PLACEHOLDER}</i><br><br></p>`;

// ─── Parse combined HTML into two separate strings ─────────────────────────
const parseCombinedContent = (html = "") => {
  if (!html) return { mom: "", crucial: "" };
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;
  const headings = Array.from(body.querySelectorAll("h2"));

  const momEl = headings.find((h) => h.textContent.includes("Minutes"));
  const crucialEl = headings.find((h) => h.textContent.includes("Crucial"));

  const stripPlaceholder = (text, placeholder) =>
    text.includes(placeholder) ? "" : text;

  const getTextBetween = (startEl, endEl, placeholder) => {
    if (!startEl) return "";
    const parts = [];
    let node = startEl.nextElementSibling;
    while (node && node !== endEl) {
      parts.push(node.outerHTML);
      node = node.nextElementSibling;
    }
    const raw = parts
      .join("")
      .replace(/<p><br><\/p>/g, "")
      .trim();
    const textOnly = raw.replace(/<[^>]*>/g, "").trim();
    return stripPlaceholder(textOnly, placeholder) ? raw : "";
  };

  return {
    mom: getTextBetween(momEl, crucialEl, MOM_PLACEHOLDER),
    crucial: getTextBetween(crucialEl, null, CRUCIAL_PLACEHOLDER),
  };
};

// ─── Reusable Section Header ───────────────────────────────────────────────
const SectionHeader = ({
  icon,
  title,
  subtitle,
  color = "#1976d2",
  bg = "#f0f4ff",
  border = "#d0d9f0",
}) => (
  <Box
    sx={{
      mb: 2,
      p: 2,
      borderRadius: "12px",
      backgroundColor: bg,
      border: `1px solid ${border}`,
      display: "flex",
      alignItems: "center",
      gap: 1.5,
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography level="title-sm" fontWeight={700}>
        {title}
      </Typography>
      <Typography level="body-xs" sx={{ color: "text.secondary" }}>
        {subtitle}
      </Typography>
    </Box>
  </Box>
);

// ─── Reusable Person Row ───────────────────────────────────────────────────
const PersonRow = ({
  person,
  isLast,
  accentColor,
  checkedBg,
  hoverBg,
  onChange,
}) => (
  <ListItem
    sx={{
      px: 2,
      py: 1.2,
      borderBottom: isLast ? "none" : "1px solid #f0f0f0",
      backgroundColor: person.present ? checkedBg : "#fff",
      transition: "background-color 0.2s ease",
      "&:hover": { backgroundColor: person.present ? hoverBg : "#fafafa" },
    }}
  >
    <Checkbox
      checked={person.present}
      onChange={onChange}
      label={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: person.present ? accentColor : "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s ease",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{ color: "#fff", fontSize: "0.7rem", fontWeight: 700 }}
            >
              {person.name?.charAt(0).toUpperCase()}
            </Typography>
          </Box>
          <Box>
            <Typography level="body-sm" fontWeight={person.present ? 600 : 400}>
              {person.name}
            </Typography>
            {person.designation && (
              <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                {person.designation}
              </Typography>
            )}
          </Box>
        </Box>
      }
      sx={{ width: "100%" }}
    />
  </ListItem>
);

// ─── Main Component ────────────────────────────────────────────────────────
const AddDirectorMeetingRecords = ({
  nextMeetingDate,
  employees: staffList = [],
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [directors, setDirectors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [meetingDate, setMeetingDate] = useState(today);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [combinedNotes, setCombinedNotes] = useState(EDITOR_TEMPLATE);
  const [mom, setMom] = useState("");
  const [crucialDecisions, setCrucialDecisions] = useState("");
  const [remarks, setRemarks] = useState("");
  const [agenda, setAgenda] = useState("");
  const [agendaPoints, setAgendaPoints] = useState([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastStatus, setToastStatus] = useState("");
  const [deadline, setDeadline] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState([]);
  const [meetingId, setMeetingId] = useState("");

  // ── Action Points state ────────────────────────────────────────────────
  // Each action point: { id, description, assignedTo: employee object | null }
  const [actionPoints, setActionPoints] = useState([]);
  const { sendEmail } = useEmail();

  // Parse combined editor HTML into dedicated state on every change
  const handleEditorChange = (htmlValue) => {
    const html = htmlValue ?? "";
    setCombinedNotes(html);
    const parsed = parseCombinedContent(html);
    setMom(parsed.mom);
    setCrucialDecisions(parsed.crucial);
  };

  useEffect(() => {
    axios
      .get("http://localhost:5002/getDirectors")
      .then((res) => {
        if (res.status === 200)
          setDirectors(res.data.map((d) => ({ ...d, present: true })));
      })
      .catch(console.error);
    axios
      .get("http://localhost:5002/getStaff")
      .then((res) => {
        if (res.status === 200)
          setEmployees(res.data.map((e) => ({ ...e, present: false })));
      })
      .catch(console.error);
    axios
      .get("http://localhost:5002/get_project_data/All")
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setProjects(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // All staff available for action point assignment (directors + staff)
  const assignableEmployees = [
    ...directors.map((d) => ({ ...d, group: "Directors" })),
    ...employees.map((e) => ({ ...e, group: "Staff" })),
  ];

  const filteredEmployees = employees.filter(
    (e) =>
      e.name?.toLowerCase().includes(staffSearch.toLowerCase()) ||
      e.designation?.toLowerCase().includes(staffSearch.toLowerCase()),
  );

  const toggleDirector = (i, v) =>
    setDirectors((p) => p.map((d, j) => (j === i ? { ...d, present: v } : d)));
  const toggleEmployee = (i, v) =>
    setEmployees((p) => p.map((e, j) => (j === i ? { ...e, present: v } : e)));
  const toggleAllDirectors = (v) =>
    setDirectors((p) => p.map((d) => ({ ...d, present: v })));
  const toggleAllEmployees = (v) =>
    setEmployees((p) => p.map((e) => ({ ...e, present: v })));

  const addAgendaPoint = () => setAgendaPoints((p) => [...p, ""]);
  const updateAgendaPoint = (i, v) =>
    setAgendaPoints((p) => p.map((pt, j) => (j === i ? v : pt)));
  const removeAgendaPoint = (i) =>
    setAgendaPoints((p) => p.filter((_, j) => j !== i));

  // ── Action Point handlers ──────────────────────────────────────────────
  const addActionPoint = () =>
    setActionPoints((p) => [
      ...p,
      { id: Date.now(), description: "", assignedTo: null },
    ]);
  const updateActionPoint = (id, field, value) =>
    setActionPoints((p) =>
      p.map((ap) => (ap.id === id ? { ...ap, [field]: value } : ap)),
    );
  const removeActionPoint = (id) =>
    setActionPoints((p) => p.filter((ap) => ap.id !== id));

  const clearForm = () => {
    setMeetingTitle("");
    setAgenda("");
    setAgendaPoints([]);
    setCombinedNotes(EDITOR_TEMPLATE);
    setMom("");
    setCrucialDecisions("");
    setRemarks("");
    setMeetingDate(today);
    setActionPoints([]);
    setDirectors((p) => p.map((d) => ({ ...d, present: true })));
    setEmployees((p) => p.map((e) => ({ ...e, present: false })));
    setSelectedProject("");
  };

  const handleSubmit = async () => {
    const presentDirectors = directors.filter((d) => d.present);
    const presentStaff = employees.filter((e) => e.present);

    const payload = new FormData();
    const meetingDateFormatted = new Date(meetingDate)
      .toISOString()
      .split("T")[0];
    console.log(meetingDateFormatted);
    payload.append("meetingDate", meetingDateFormatted);
    payload.append("meetingTitle", meetingTitle);
    payload.append("agenda", agenda);
    payload.append("agendaPoints", JSON.stringify(agendaPoints));
    payload.append("mom", mom);
    payload.append("crucialDecisions", crucialDecisions);
    payload.append("remarks", remarks);
    payload.append("directorsPresent", JSON.stringify(presentDirectors));
    payload.append("staffPresent", JSON.stringify(presentStaff));
    payload.append("actionPoints", JSON.stringify(actionPoints));

    try {
      const res = await axios.post(
        "http://localhost:5002/addDirectorMeetingRecord",
        payload,
      );
      if (res.status === 200) {
        setToast(true);
        setToastMessage("Meeting Record Saved Successfully.");
        setToastStatus("success");
        clearForm();
        setMeetingId(res.data.meetingId);
      }
    } catch (err) {
      console.error(err);
      setToast(true);
      setToastMessage("Something Went Wrong. Please Check the Console.");
      setToastStatus("error");
    }

    // Submit action points as tasks via /assign_task
    const validActionPoints = actionPoints.filter(
      (ap) => ap.description.trim() && ap.assignedTo,
    );
    for (const ap of validActionPoints) {
      const fd = new FormData();
      fd.append("dateOfEntry", today.toISOString().split("T")[0]);
      fd.append(
        "taskDesc",
        `Action Point (Director Meeting): ${ap.description}`,
      );
      fd.append("assignTo", ap.assignedTo.id);
      fd.append("assignBy", sessionStorage.getItem("empName") || "");
      fd.append("deadline", deadline);
      fd.append("remarks", `From Director Meeting: ${meetingTitle}`);
      fd.append("projectCode", selectedProject.code);
      fd.append("workType", "10");
      fd.append("taskType", "Meeting Task");
      fd.append("meetingId", meetingId);
      await axios
        .post("http://localhost:5002/assign_task", fd)
        .then((res) => {
          if (res.status === 200) {
            const data = res.data;
            setToast(open);
            setToastStatus(data.status);
            setToastMessage(data.message);
            try {
              sendEmail({
                to_email: data.empEmail.to_email,
                to_name: data.empEmail.to_name,
                assigner_name: sessionStorage.getItem("empName"),
                from_email: sessionStorage.getItem("email"),
                task_details: ap.description,
                project_code: selectedProject.code,
                project_name: selectedProject.name,
                deadline: deadline.toString(),
              });
            } catch (err) {
              console.error(err);
            }
          }
        })
        .catch((err) => {
          setToast(true);
          setToastStatus("error");
          setToastMessage("Something Went Wrong. Please Check the Console.");
          console.error(err);
        });
    }
  };

  const directorPresentCount = directors.filter((d) => d.present).length;
  const employeePresentCount = employees.filter((e) => e.present).length;
  const momChars = mom.replace(/<[^>]*>/g, "").trim().length;
  const crucialChars = crucialDecisions.replace(/<[^>]*>/g, "").trim().length;
  const validActionPointCount = actionPoints.filter(
    (ap) => ap.description.trim() && ap.assignedTo,
  ).length;

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", px: 3, py: 2, textAlign: "left" }}>
      {/* ── Section 1: Meeting Details ─────────────────────────────────── */}
      <Card variant="outlined" sx={{ borderRadius: "16px", mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <FormControl sx={{ flex: 1, minWidth: 200 }}>
              <FormLabel>Meeting Date</FormLabel>
              <Calendar
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.value)}
                showIcon
                dateFormat="dd MM yy"
                inputStyle={{ width: "100%" }}
                style={{ width: "100%" }}
                panelStyle={{ zIndex: 2000 }}
              />
            </FormControl>
            <FormControl sx={{ flex: 2, minWidth: 280 }}>
              <FormLabel>Meeting Title</FormLabel>
              <Input
                type="text"
                placeholder="e.g. Q2 Strategic Review Meeting"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* ── Section 2: Agenda ─────────────────────────────────────────── */}
      <Card variant="outlined" sx={{ borderRadius: "16px", mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon={<Checklist sx={{ color: "#fff", fontSize: "1.1rem" }} />}
            title="Agenda"
            subtitle="Briefly describe the agenda and add specific agenda points below."
            color="#e65100"
            bg="#fffbf0"
            border="#f0e0a0"
          />
          <FormControl sx={{ mb: 2 }}>
            <Input
              placeholder="e.g. Review Q2 performance, plan Q3 targets…"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
            />
          </FormControl>
          {agendaPoints.length > 0 && (
            <Box
              sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              {agendaPoints.map((point, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: "10px",
                    backgroundColor: "#fffbf0",
                    border: "1px solid #f0e0a0",
                    animation: "fadeSlideIn 0.2s ease",
                    "@keyframes fadeSlideIn": {
                      from: { opacity: 0, transform: "translateY(-6px)" },
                      to: { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      backgroundColor: "#e65100",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#fff",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>
                  <Input
                    placeholder={`Agenda point ${index + 1}…`}
                    value={point}
                    onChange={(e) => updateAgendaPoint(index, e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    size="sm"
                    variant="soft"
                    color="danger"
                    onClick={() => removeAgendaPoint(index)}
                    sx={{ flexShrink: 0 }}
                  >
                    <Delete sx={{ fontSize: "1rem" }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
          <Button
            variant="outlined"
            color="warning"
            size="sm"
            startDecorator={<Add sx={{ fontSize: "1rem" }} />}
            onClick={addAgendaPoint}
            sx={{
              borderStyle: "dashed",
              borderColor: "#f0a000",
              color: "#e65100",
              backgroundColor: "transparent",
              "&:hover": { backgroundColor: "#fffbf0", borderStyle: "dashed" },
            }}
          >
            Add Agenda Point
          </Button>
          {agendaPoints.length > 0 && (
            <Typography
              level="body-xs"
              sx={{ color: "text.tertiary", mt: 1.5 }}
            >
              {agendaPoints.filter((p) => p.trim()).length} of{" "}
              {agendaPoints.length} point{agendaPoints.length !== 1 ? "s" : ""}{" "}
              filled
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* ── Section 3: Attendance ─────────────────────────────────────── */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Directors */}
        <Card variant="outlined" sx={{ borderRadius: "16px", mb: 3, flex: 1 }}>
          <CardContent>
            <SectionHeader
              icon={<Groups2 sx={{ color: "#fff", fontSize: "1.1rem" }} />}
              title="Directors Present"
              subtitle="All directors are marked present by default. Uncheck if absent."
            />
            {directors.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  borderRadius: "10px",
                  border: "2px dashed #e0e0e0",
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  No directors found.
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1.5,
                    mb: 1.5,
                    borderRadius: "10px",
                    backgroundColor: "#f0f4ff",
                    border: "1px solid #d0d9f0",
                  }}
                >
                  <Checkbox
                    label={
                      <Typography level="title-sm" fontWeight={700}>
                        Select All Directors
                      </Typography>
                    }
                    checked={directors.every((d) => d.present)}
                    indeterminate={
                      directors.some((d) => d.present) &&
                      !directors.every((d) => d.present)
                    }
                    onChange={(e) => toggleAllDirectors(e.target.checked)}
                  />
                  <Chip variant="soft" color="primary" size="sm">
                    {directorPresentCount} / {directors.length} present
                  </Chip>
                </Box>
                <Sheet
                  variant="outlined"
                  sx={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <List size="sm" sx={{ py: 0 }}>
                    {directors.map((director, index) => (
                      <PersonRow
                        key={index}
                        person={director}
                        isLast={index === directors.length - 1}
                        accentColor="#1976d2"
                        checkedBg="#f0f4ff"
                        hoverBg="#e8f0fe"
                        onChange={(e) =>
                          toggleDirector(index, e.target.checked)
                        }
                      />
                    ))}
                  </List>
                </Sheet>
                <Box
                  sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}
                >
                  <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    {directorPresentCount} director
                    {directorPresentCount !== 1 ? "s" : ""} marked present
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Staff */}
        <Card variant="outlined" sx={{ borderRadius: "16px", mb: 3, flex: 1 }}>
          <CardContent>
            <SectionHeader
              icon={<Person sx={{ color: "#fff", fontSize: "1.1rem" }} />}
              title="Additional Staff Present"
              subtitle="Select any additional staff members who attended this meeting."
              color="#2e7d32"
              bg="#f6fff6"
              border="#c3e6cb"
            />
            {employees.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  borderRadius: "10px",
                  border: "2px dashed #e0e0e0",
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                  No staff found.
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 2,
                      py: 1.2,
                      borderRadius: "10px",
                      backgroundColor: "#f6fff6",
                      border: "1px solid #c3e6cb",
                      flexShrink: 0,
                    }}
                  >
                    <Checkbox
                      label={
                        <Typography level="title-sm" fontWeight={700}>
                          Select All
                        </Typography>
                      }
                      checked={employees.every((e) => e.present)}
                      indeterminate={
                        employees.some((e) => e.present) &&
                        !employees.every((e) => e.present)
                      }
                      onChange={(e) => toggleAllEmployees(e.target.checked)}
                    />
                  </Box>
                  <Input
                    placeholder="Search by name or designation…"
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    startDecorator={
                      <Search
                        sx={{ fontSize: "1rem", color: "text.tertiary" }}
                      />
                    }
                    endDecorator={
                      staffSearch ? (
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() => setStaffSearch("")}
                        >
                          <Close sx={{ fontSize: "1rem" }} />
                        </IconButton>
                      ) : null
                    }
                    sx={{ flex: 1 }}
                  />
                  <Chip
                    variant="soft"
                    color="success"
                    size="sm"
                    sx={{ flexShrink: 0 }}
                  >
                    {employeePresentCount} / {employees.length} present
                  </Chip>
                </Box>
                <Sheet
                  variant="outlined"
                  sx={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    maxHeight: 320,
                    overflowY: "auto",
                  }}
                >
                  {filteredEmployees.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography
                        level="body-sm"
                        sx={{ color: "text.tertiary" }}
                      >
                        No staff match your search.
                      </Typography>
                    </Box>
                  ) : (
                    <List size="sm" sx={{ py: 0 }}>
                      {filteredEmployees.map((emp, index) => {
                        const realIndex = employees.findIndex(
                          (e) =>
                            e.name === emp.name &&
                            e.designation === emp.designation,
                        );
                        return (
                          <ListItem
                            key={realIndex}
                            sx={{
                              px: 2,
                              py: 1.2,
                              borderBottom:
                                index === filteredEmployees.length - 1
                                  ? "none"
                                  : "1px solid #f0f0f0",
                              backgroundColor: emp.present ? "#f6fff6" : "#fff",
                              transition: "background-color 0.2s ease",
                              "&:hover": {
                                backgroundColor: emp.present
                                  ? "#e8f5e9"
                                  : "#fafafa",
                              },
                            }}
                          >
                            <Checkbox
                              checked={emp.present}
                              onChange={(e) =>
                                toggleEmployee(realIndex, e.target.checked)
                              }
                              label={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: "50%",
                                      backgroundColor: emp.present
                                        ? "#2e7d32"
                                        : "#e0e0e0",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      transition: "background-color 0.2s ease",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        color: "#fff",
                                        fontSize: "0.7rem",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {emp.name?.charAt(0).toUpperCase()}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography
                                      level="body-sm"
                                      fontWeight={emp.present ? 600 : 400}
                                    >
                                      {emp.name}
                                      {emp.designation && (
                                        <Typography
                                          component="span"
                                          level="body-xs"
                                          sx={{
                                            color: "text.tertiary",
                                            ml: 0.5,
                                          }}
                                        >
                                          — {emp.designation}
                                        </Typography>
                                      )}
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                              sx={{ width: "100%" }}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </Sheet>
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    {filteredEmployees.length !== employees.length
                      ? `Showing ${filteredEmployees.length} of ${employees.length} staff`
                      : ""}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                    {employeePresentCount} staff member
                    {employeePresentCount !== 1 ? "s" : ""} marked present
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* ── Section 4: Combined Meeting Notes Editor ───────────────────── */}
      <Card variant="outlined" sx={{ borderRadius: "16px", mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon={<Notes sx={{ color: "#fff", fontSize: "1.1rem" }} />}
            title="Meeting Notes"
            subtitle="Type under each heading — Minutes of Meeting and Crucial Decisions are separated by the blue and orange headings."
          />

          {/* Legend */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {[
              {
                label: "📋 Minutes of Meeting",
                color: "#1976d2",
                bg: "#e8f0fe",
                border: "#c5d8f8",
                count: momChars,
              },
              {
                label: "⚡ Crucial Decisions",
                color: "#e65100",
                bg: "#fff3e0",
                border: "#ffcc80",
                count: crucialChars,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold"
                style={{
                  background: s.bg,
                  borderColor: s.border,
                  color: s.color,
                }}
              >
                {s.label}
                <span className="font-normal opacity-70">{`${s.count} chars`}</span>
              </div>
            ))}
            <span className="text-xs text-gray-400 italic">
              ← Scroll past the first heading to reach Crucial Decisions
            </span>
          </div>

          <Box
            sx={{
              borderRadius: "10px",
              border: "1px solid #d0d9f0",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Editor
              value={combinedNotes}
              onTextChange={(e) => handleEditorChange(e.htmlValue)}
              style={{ height: "380px" }}
            />
          </Box>

          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
            <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
              {momChars + crucialChars} total characters across both sections
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* ── Section 5: Action Points ───────────────────────────────────── */}
      <Card variant="outlined" sx={{ borderRadius: "16px", mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon={
              <AssignmentTurnedIn sx={{ color: "#fff", fontSize: "1.1rem" }} />
            }
            title="Action Points"
            subtitle={`These will be assigned as tasks.`}
            color="#6d28d9"
            bg="#f5f3ff"
            border="#ddd6fe"
          />

          {/* Deadline badge */}
          {/* <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-lg mb-4">
            <BoltOutlined sx={{ fontSize: 14 }} />
            Deadline: {deadlineDisplay}
          </div> */}

          {/* Action point rows */}
          {actionPoints.length > 0 && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}
            >
              {actionPoints.map((ap, index) => (
                <Box
                  key={ap.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor:
                      ap.description && ap.assignedTo ? "#f5f3ff" : "#fafbff",
                    border: `1px solid ${ap.description && ap.assignedTo ? "#ddd6fe" : "#e8eaff"}`,
                    transition: "all 0.2s ease",
                    animation: "apSlide 0.2s ease",
                    "@keyframes apSlide": {
                      from: { opacity: 0, transform: "translateY(-8px)" },
                      to: { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  {/* Index badge */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs text-white ${ap.description && ap.assignedTo ? "bg-violet-500" : "bg-gray-300"}`}
                  >
                    {index + 1}
                  </div>

                  {/* Description input */}
                  <Input
                    placeholder="Describe the action point…"
                    value={ap.description}
                    onChange={(e) =>
                      updateActionPoint(ap.id, "description", e.target.value)
                    }
                    sx={{
                      flex: 2,
                      borderRadius: "8px",
                      "--Input-focusedThickness": "1.5px",
                    }}
                  />

                  {/* Assign to autocomplete */}
                  <Autocomplete
                    placeholder="Assign to employee…"
                    options={assignableEmployees}
                    value={ap.assignedTo}
                    groupBy={(opt) => opt.group}
                    getOptionLabel={(opt) => opt.name ?? ""}
                    isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                    onChange={(_, val) =>
                      updateActionPoint(ap.id, "assignedTo", val)
                    }
                    sx={{
                      flex: 1.5,
                      borderRadius: "8px",
                      "--Input-focusedThickness": "1.5px",
                      minWidth: 180,
                    }}
                    renderOption={(props, opt) => (
                      <Box
                        component="li"
                        {...props}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          py: 1,
                          mx: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            bgcolor:
                              opt.group === "Directors" ? "#1976d2" : "#2e7d32",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#fff",
                              fontSize: "0.65rem",
                              fontWeight: 700,
                            }}
                          >
                            {opt.name?.charAt(0)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography level="body-sm" fontWeight={600}>
                            {opt.name}
                          </Typography>
                          {opt.designation && (
                            <Typography
                              level="body-xs"
                              sx={{ color: "text.tertiary" }}
                            >
                              {opt.designation}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                  />

                  <Input
                    type="date"
                    placeholder="Deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />

                  <Autocomplete
                    placeholder="Select Project...."
                    value={projects.code}
                    options={projects}
                    getOptionLabel={(opt) => opt.code}
                    onChange={(e, newVal) => setSelectedProject(newVal)}
                  />

                  {/* Remove */}
                  <IconButton
                    size="sm"
                    variant="soft"
                    color="danger"
                    onClick={() => removeActionPoint(ap.id)}
                    sx={{ flexShrink: 0 }}
                  >
                    <Delete sx={{ fontSize: "1rem" }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          {/* Add button + counter */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Button
              variant="outlined"
              size="sm"
              startDecorator={<Add sx={{ fontSize: "1rem" }} />}
              onClick={addActionPoint}
              sx={{
                borderStyle: "dashed",
                borderColor: "#a78bfa",
                color: "#6d28d9",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "#f5f3ff",
                  borderStyle: "dashed",
                },
              }}
            >
              Add Action Point
            </Button>
            {actionPoints.length > 0 && (
              <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                {validActionPointCount} of {actionPoints.length} action point
                {actionPoints.length !== 1 ? "s" : ""} ready to assign
              </Typography>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Section 6: Remarks ─────────────────────────────────────────── */}
      <Card variant="outlined" sx={{ borderRadius: "16px", mb: 3 }}>
        <CardContent>
          <Typography
            level="title-sm"
            fontWeight={600}
            sx={{
              mb: 1,
              pb: 0.8,
              borderBottom: "2px solid #2e7d32",
              color: "#2e7d32",
            }}
          >
            💬 Remarks
          </Typography>
          <Textarea
            placeholder="Enter any additional remarks or observations…"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            minRows={4}
            sx={{
              width: "100%",
              borderRadius: "10px",
              border: "1px solid #c3e6cb",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              resize: "none",
              "&:focus-within": { borderColor: "#2e7d32" },
            }}
          />
          <Box sx={{ mt: 0.8, display: "flex", justifyContent: "flex-end" }}>
            <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
              {remarks.length} characters
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* ── Sticky Submit Bar ──────────────────────────────────────────── */}
      <Box
        sx={{
          position: "sticky",
          bottom: 16,
          zIndex: 10,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          p: 2,
          borderRadius: "14px",
          backgroundColor: "#fff",
          boxShadow: "0 -2px 16px rgba(0,0,0,0.1)",
          border: "1px solid #e0e0e0",
        }}
      >
        {validActionPointCount > 0 && (
          <Chip
            variant="soft"
            color="primary"
            size="sm"
            sx={{ alignSelf: "center", mr: "auto" }}
          >
            {validActionPointCount} action point
            {validActionPointCount !== 1 ? "s" : ""} will be assigned as tasks
          </Chip>
        )}
        <Button variant="outlined" color="neutral" onClick={clearForm}>
          Clear Form
        </Button>
        <Button
          variant="solid"
          color="primary"
          startDecorator={<Save />}
          onClick={handleSubmit}
        >
          Save Meeting Record
        </Button>
      </Box>

      <Toast open={toast} status={toastStatus} message={toastMessage} />
    </Box>
  );
};

export default AddDirectorMeetingRecords;
