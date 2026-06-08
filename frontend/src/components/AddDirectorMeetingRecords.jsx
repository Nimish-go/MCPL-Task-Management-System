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
  action,               // optional JSX rendered flush-right
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
    <Box sx={{ flex: 1 }}>
      <Typography level="title-sm" fontWeight={700}>
        {title}
      </Typography>
      <Typography level="body-xs" sx={{ color: "text.secondary" }}>
        {subtitle}
      </Typography>
    </Box>
    {action && (
      <Box sx={{ flexShrink: 0, ml: "auto" }}>
        {action}
      </Box>
    )}
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
  scheduledAgendaPoints: scheduledAgendaPointsProp = null,
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

  // ── Scheduled agenda points fetched from DB ───────────────────────────────
  const [scheduledAgendaPoints, setScheduledAgendaPoints] = useState(
    scheduledAgendaPointsProp
  );
  // ── Agenda categories — fixed list, each is an accordion ─────────────────
  const AGENDA_CATEGORIES = ["Invoicing", "Critical Tasks", "Resource", "Pipeline", "Other"];

  // One agenda point inside a category
  const makeAgendaPoint = () => ({
    id: Date.now() + Math.random(),
    label: "",          // the text input (Image 1 style)
    expanded: false,    // + / − toggle (Image 2 style)
    selectedPoint: null,
    description: "",
    discussions: "",
    decisions: "",
    actionPoints: [],   // action points inside this agenda point
  });

  // One category accordion
  const makeCategory = (name) => ({
    id: name,
    expanded: false,
    agendaPoints: [makeAgendaPoint()], // one default point
  });

  const [agendaCategories, setAgendaCategories] = useState(
    AGENDA_CATEGORIES.map(makeCategory)
  );

  // ── Category-level handlers ───────────────────────────────────────────────
  const toggleCategory = (catId) =>
    setAgendaCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, expanded: !c.expanded } : c))
    );

  // ── Agenda-point-level handlers ───────────────────────────────────────────
  const addAgendaPointToCategory = (catId) =>
    setAgendaCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, agendaPoints: [...c.agendaPoints, makeAgendaPoint()] }
          : c
      )
    );

  const toggleAgendaPoint = (catId, apId) =>
    setAgendaCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              agendaPoints: c.agendaPoints.map((ap) =>
                ap.id === apId ? { ...ap, expanded: !ap.expanded } : ap
              ),
            }
          : c
      )
    );

  const updateAgendaPoint = (catId, apId, field, value) =>
    setAgendaCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              agendaPoints: c.agendaPoints.map((ap) =>
                ap.id === apId ? { ...ap, [field]: value } : ap
              ),
            }
          : c
      )
    );

  const removeAgendaPoint = (catId, apId) =>
    setAgendaCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, agendaPoints: c.agendaPoints.filter((ap) => ap.id !== apId) }
          : c
      )
    );

  // ── Action-point handlers (inside an agenda point) ────────────────────────
  const addActionPoint = (catId, apId) =>
    setAgendaCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              agendaPoints: c.agendaPoints.map((ap) =>
                ap.id === apId
                  ? {
                      ...ap,
                      actionPoints: [
                        ...ap.actionPoints,
                        { id: Date.now() + Math.random(), description: "", assignedTo: null, deadline: "", project: null },
                      ],
                    }
                  : ap
              ),
            }
          : c
      )
    );

  const updateActionPoint = (catId, apId, taskId, field, value) =>
    setAgendaCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              agendaPoints: c.agendaPoints.map((ap) =>
                ap.id === apId
                  ? {
                      ...ap,
                      actionPoints: ap.actionPoints.map((t) =>
                        t.id === taskId ? { ...t, [field]: value } : t
                      ),
                    }
                  : ap
              ),
            }
          : c
      )
    );

  const removeActionPoint = (catId, apId, taskId) =>
    setAgendaCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              agendaPoints: c.agendaPoints.map((ap) =>
                ap.id === apId
                  ? { ...ap, actionPoints: ap.actionPoints.filter((t) => t.id !== taskId) }
                  : ap
              ),
            }
          : c
      )
    );
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastStatus, setToastStatus] = useState("");
  const [projects, setProjects] = useState([]);
  const [meetingId, setMeetingId] = useState("");

  const [staffSearch, setStaffSearch] = useState("");
  const { sendEmail } = useEmail();

  // ── NEW: track whether agenda points have already been injected ─────────
  const [agendaInjected, setAgendaInjected] = useState(false);

  // Parse combined editor HTML into dedicated state on every change
  const handleEditorChange = (htmlValue) => {
    const html = htmlValue ?? "";
    setCombinedNotes(html);
    const parsed = parseCombinedContent(html);
    setMom(parsed.mom);
    setCrucialDecisions(parsed.crucial);
  };

  // ── Inject scheduled agenda points into the MOM section of the editor ────
  const handleInjectAgendaPoints = () => {
    // Parse agendaPoints from the scheduled meeting passed via nextMeetingDate prop
    // The parent fetches /getScheduledNextMeeting and passes scheduledMeeting down
    let pointsToInject = [];

    // Try to use scheduledAgendaPoints prop if parent passed it
    if (scheduledAgendaPoints && scheduledAgendaPoints.length > 0) {
      pointsToInject = scheduledAgendaPoints;
    } else {
      // Fallback: collect from the current form's filled agenda points
      pointsToInject = agendaCategories.flatMap((cat) =>
        cat.agendaPoints
          .filter((ap) => ap.selectedPoint)
          .map((ap) => ({ category: cat.id, point: ap.selectedPoint }))
      );
    }

    if (!pointsToInject.length) return;

    const listItems = pointsToInject
      .map((item) => {
        if (typeof item === "string") {
          return `<li style="margin-bottom:6px;padding:4px 0;">${item}</li>`;
        }
        return `<li style="margin-bottom:6px;padding:4px 0;"><strong>${item.category || ""}</strong>${item.point ? ` — ${item.point}` : item}</li>`;
      })
      .join("");

    const injectedBlock = `<p><strong style="color:#1976d2;">📋 Agenda Points for Discussion:</strong></p><ol style="padding-left:20px;margin:8px 0 16px;">${listItems}</ol>`;

    setCombinedNotes((prev) => {
      const placeholder = `<p><i>${MOM_PLACEHOLDER}</i><br><br></p>`;
      if (prev.includes(placeholder)) {
        return prev.replace(placeholder, `${injectedBlock}<p><br></p>`);
      }
      const crucialMarker = `<h2 style="color:#e65100`;
      const idx = prev.indexOf(crucialMarker);
      if (idx !== -1) {
        return prev.slice(0, idx) + injectedBlock + `<p><br></p>` + prev.slice(idx);
      }
      return prev + injectedBlock;
    });

    setAgendaInjected(true);
  };

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app";
    axios
      .get("/getDirectors")
      .then((res) => {
        if (res.status === 200)
          setDirectors(res.data.map((d) => ({ ...d, present: true })));
      })
      .catch(console.error);
    axios
      .get("/getStaff")
      .then((res) => {
        if (res.status === 200)
          setEmployees(res.data.map((e) => ({ ...e, present: false })));
      })
      .catch(console.error);
    axios
      .get("/get_project_data/All")
      .then((res) => {
        if (res.status === 200) setProjects(res.data);
      })
      .catch(console.error);

    // Fetch scheduled meeting agenda points if not passed via props
    if (!scheduledAgendaPointsProp) {
      axios
        .get("/getScheduledNextMeeting")
        .then((res) => {
          if (res.status === 200 && res.data) {
            const raw = res.data.agendaPoints;
            if (raw) {
              try {
                // agendaPoints is stored as a JSON string e.g. '[{"title":"Point A"},...]'
                const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
                const normalized = parsed.map((p) =>
                  typeof p === "string" ? p : (p.title ?? p.label ?? JSON.stringify(p))
                );
                setScheduledAgendaPoints(normalized);
              } catch {
                // plain string fallback
                setScheduledAgendaPoints([raw]);
              }
            }
          }
        })
        .catch(console.error);
    }
  }, [scheduledAgendaPointsProp]);

  // All staff available for action point assignment (directors + staff)
  const assignableEmployees = [
    ...directors.map((d) => ({ ...d, group: "Directors" })),
    ...employees.map((e) => ({ ...e, group: "Staff" })),
  ];

  const filteredEmployees = employees.filter(
    (e) =>
      e.name?.toLowerCase().includes(staffSearch.toLowerCase()) ||
      e.designation?.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const toggleDirector = (i, v) =>
    setDirectors((p) => p.map((d, j) => (j === i ? { ...d, present: v } : d)));
  const toggleEmployee = (i, v) =>
    setEmployees((p) => p.map((e, j) => (j === i ? { ...e, present: v } : e)));
  const toggleAllDirectors = (v) =>
    setDirectors((p) => p.map((d) => ({ ...d, present: v })));
  const toggleAllEmployees = (v) =>
    setEmployees((p) => p.map((e) => ({ ...e, present: v })));

  const clearForm = () => {
    setMeetingTitle("");
    setAgendaCategories(AGENDA_CATEGORIES.map(makeCategory));
    setCombinedNotes(EDITOR_TEMPLATE);
    setMom("");
    setCrucialDecisions("");
    setRemarks("");
    setMeetingDate(today);
    setAgendaInjected(false);
    setDirectors((p) => p.map((d) => ({ ...d, present: true })));
    setEmployees((p) => p.map((e) => ({ ...e, present: false })));
  };

  const handleSubmit = async () => {
    const presentDirectors = directors.filter((d) => d.present);
    const presentStaff = employees.filter((e) => e.present);

    const payload = new FormData();
    const meetingDateFormatted = new Date(meetingDate).toISOString().split("T")[0];
    payload.append("meetingDate", meetingDateFormatted);
    payload.append("meetingTitle", meetingTitle);
    payload.append("agendaCategories", JSON.stringify(agendaCategories));
    payload.append("mom", mom);
    payload.append("crucialDecisions", crucialDecisions);
    payload.append("remarks", remarks);
    payload.append("directorsPresent", JSON.stringify(presentDirectors));
    payload.append("staffPresent", JSON.stringify(presentStaff));

    try {
      const res = await axios.post("/addDirectorMeetingRecord", payload);
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

    // Flatten all action points from every agenda point in every category
    const allActionPoints = agendaCategories.flatMap((cat) =>
      cat.agendaPoints.flatMap((ap) =>
        ap.actionPoints.map((t) => ({ ...t, categoryName: cat.id, agendaLabel: ap.label }))
      )
    );
    const validActionPoints = allActionPoints.filter((t) => t.description.trim() && t.assignedTo);

    for (const ap of validActionPoints) {
      const fd = new FormData();
      fd.append("dateOfEntry", today.toISOString().split("T")[0]);
      fd.append("taskDesc", `Action Point (${ap.categoryName}): ${ap.description}`);
      fd.append("assignTo", ap.assignedTo.id);
      fd.append("assignBy", sessionStorage.getItem("empName") || "");
      fd.append("deadline", ap.deadline ?? "");
      fd.append("remarks", `From Director Meeting: ${meetingTitle}`);
      fd.append("projectCode", ap.project?.code ?? "");
      fd.append("workType", "10");
      fd.append("taskType", "Meeting Task");
      fd.append("meetingId", meetingId);
      await axios.post("/assign_task", fd)
        .then((res) => {
          if (res.status === 200) {
            const data = res.data;
            setToast(true);
            setToastStatus(data.status);
            setToastMessage(data.message);
            try {
              sendEmail({
                to_email: data.empEmail.to_email,
                to_name: data.empEmail.to_name,
                assigner_name: sessionStorage.getItem("empName"),
                from_email: sessionStorage.getItem("email"),
                task_details: ap.description,
                project_code: ap.project?.code ?? "",
                project_name: ap.project?.name ?? "",
                deadline: ap.deadline ?? "",
              });
            } catch (err) { console.error(err); }
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

  // Inject button is enabled when there are scheduled points OR filled form points
  const scheduledPointCount = scheduledAgendaPoints?.length ?? 0;
  const formFilledCount = agendaCategories.flatMap((c) =>
    c.agendaPoints.filter((ap) => ap.selectedPoint)
  ).length;
  const filledAgendaCount = scheduledPointCount || formFilledCount;

  // Total valid action points across all agenda points in all categories
  const validActionPointCount = agendaCategories
    .flatMap((c) => c.agendaPoints.flatMap((ap) => ap.actionPoints))
    .filter((t) => t.description.trim() && t.assignedTo).length;

  // ── Inject button rendered inside the Meeting Notes SectionHeader ──────────
  // const injectButton = (
  //   <Tooltip
  //     title={
  //       filledAgendaCount === 0
  //         ? "No scheduled agenda points found. Schedule a meeting first."
  //         : agendaInjected
  //           ? "Click to re-inject agenda points from the scheduled meeting"
  //           : scheduledPointCount > 0
  //             ? `Inject ${scheduledPointCount} scheduled agenda point${scheduledPointCount !== 1 ? "s" : ""} into Minutes of Meeting`
  //             : `Inject ${formFilledCount} selected agenda point${formFilledCount !== 1 ? "s" : ""} into Minutes of Meeting`
  //     }
  //     placement="top"
  //     arrow
  //   >
  //     <Button
  //       size="sm"
  //       onClick={handleInjectAgendaPoints}
  //       disabled={filledAgendaCount === 0}
  //       sx={{
  //         borderRadius: "8px",
  //         fontSize: "0.72rem",
  //         fontWeight: 700,
  //         letterSpacing: "0.2px",
  //         whiteSpace: "nowrap",
  //         gap: "5px",
  //         px: 1.5,
  //         height: "32px",
  //         transition: "all 0.18s ease",
  //         ...(filledAgendaCount === 0
  //           ? {
  //               bgcolor: "rgba(0,0,0,0.06)",
  //               color: "text.tertiary",
  //               "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
  //             }
  //           : agendaInjected
  //             ? {
  //                 background: "linear-gradient(135deg, #166534, #15803d)",
  //                 color: "#fff",
  //                 boxShadow: "0 2px 8px rgba(22,101,52,0.3)",
  //                 "&:hover": {
  //                   background: "linear-gradient(135deg, #14532d, #166534)",
  //                 },
  //               }
  //             : {
  //                 background: "linear-gradient(135deg, #1a1f36, #2d3561)",
  //                 color: "#fff",
  //                 boxShadow: "0 2px 8px rgba(29,53,87,0.3)",
  //                 "&:hover": {
  //                   background: "linear-gradient(135deg, #2d3561, #3d4a8a)",
  //                 },
  //               }),
  //       }}
  //     >
  //       {agendaInjected ? "✅" : "📋"}
  //       {agendaInjected ? "Injected" : "Inject Agenda Points"}
  //       {filledAgendaCount > 0 && (
  //         <Box
  //           component="span"
  //           sx={{
  //             background: "rgba(255,255,255,0.22)",
  //             borderRadius: "4px",
  //             px: "5px",
  //             py: "1px",
  //             fontSize: "0.63rem",
  //             fontWeight: 800,
  //             lineHeight: 1.4,
  //           }}
  //         >
  //           {filledAgendaCount}
  //         </Box>
  //       )}
  //     </Button>
  //   </Tooltip>
  // );

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
            subtitle="Expand each category to record discussion, decisions and action points."
            color="#e65100"
            bg="#fffbf0"
            border="#f0e0a0"
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {agendaCategories.map((cat, catIndex) => {
              const hasFill = cat.agendaPoints.some(
                (ap) => ap.selectedPoint || ap.description || ap.discussions || ap.decisions
              );
              const apCount = cat.agendaPoints.reduce(
                (sum, ap) => sum + ap.actionPoints.filter((t) => t.description.trim()).length,
                0
              );

              return (
                <Box
                  key={cat.id}
                  sx={{
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: cat.expanded ? "#f0a000" : hasFill ? "#f0c060" : "#e8e8e8",
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  {/* ── Accordion header row ── */}
                  <Box
                    onClick={() => toggleCategory(cat.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      cursor: "pointer",
                      backgroundColor: cat.expanded ? "#fffbf0" : hasFill ? "#fffdf7" : "#fafafa",
                      transition: "background-color 0.2s",
                      "&:hover": { backgroundColor: "#fffbf0" },
                      userSelect: "none",
                    }}
                  >
                    {/* Number badge */}
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        backgroundColor: hasFill ? "#e65100" : "#d4d4d4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "background-color 0.2s",
                      }}
                    >
                      <Typography sx={{ color: "#fff", fontSize: "0.72rem", fontWeight: 700 }}>
                        {catIndex + 1}
                      </Typography>
                    </Box>

                    {/* Category name */}
                    <Typography
                      level="title-sm"
                      fontWeight={700}
                      sx={{ flex: 1, color: hasFill ? "#c45000" : "text.primary" }}
                    >
                      {cat.id}
                    </Typography>

                    {/* Badges */}
                    {apCount > 0 && (
                      <Chip size="sm" sx={{ bgcolor: "#fde68a", color: "#92400e", fontWeight: 700, fontSize: "0.65rem", height: 20 }}>
                        {apCount} action{apCount !== 1 ? "s" : ""}
                      </Chip>
                    )}
                    {hasFill && !cat.expanded && (
                      <Chip size="sm" sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: 700, fontSize: "0.65rem", height: 20 }}>
                        ✓ filled
                      </Chip>
                    )}

                    {/* Toggle icon */}
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        border: "1.5px solid",
                        borderColor: cat.expanded ? "#e65100" : "#d0d0d0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: cat.expanded ? "#e65100" : "#999",
                        fontSize: "1rem",
                        fontWeight: 700,
                        lineHeight: 1,
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      {cat.expanded ? "−" : "+"}
                    </Box>
                  </Box>

                  {/* ── Accordion body ── */}
                  {cat.expanded && (
                    <Box
                      sx={{
                        px: 2,
                        pb: 2,
                        pt: 1.5,
                        backgroundColor: "#fafafa",
                        borderTop: "1px solid #f0e0a0",
                        animation: "fadeIn 0.18s ease",
                        "@keyframes fadeIn": {
                          from: { opacity: 0, transform: "translateY(-4px)" },
                          to: { opacity: 1, transform: "translateY(0)" },
                        },
                      }}
                    >
                      {/* ── Agenda point rows ── */}
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {cat.agendaPoints.map((ap, apIdx) => {
                          const apFilled = ap.selectedPoint || ap.description || ap.discussions || ap.decisions;
                          const apTaskCount = ap.actionPoints.filter((t) => t.description.trim()).length;
                          return (
                            <Box
                              key={ap.id}
                              sx={{
                                borderRadius: "10px",
                                border: "1px solid",
                                borderColor: ap.expanded ? "#d0b080" : apFilled ? "#e0c080" : "#e8e0d8",
                                overflow: "hidden",
                                backgroundColor: "#fff",
                              }}
                            >
                              {/* ── Agenda point header (Image 1 style) ── */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  px: 1.5,
                                  py: 1.2,
                                  backgroundColor: ap.expanded ? "#fffbf0" : "#fff",
                                }}
                              >
                                {/* Number badge */}
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    backgroundColor: "#f5f0e8",
                                    border: "1.5px solid #d4c4a0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#7a5c30" }}>
                                    {apIdx + 1}
                                  </Typography>
                                </Box>

                                {/* +/− toggle */}
                                <Box
                                  onClick={() => toggleAgendaPoint(cat.id, ap.id)}
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: "50%",
                                    border: "1.5px solid",
                                    borderColor: ap.expanded ? "#e65100" : "#bbb",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: ap.expanded ? "#e65100" : "#999",
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    cursor: "pointer",
                                    flexShrink: 0,
                                    transition: "all 0.15s",
                                    userSelect: "none",
                                    "&:hover": { borderColor: "#e65100", color: "#e65100" },
                                  }}
                                >
                                  {ap.expanded ? "−" : "+"}
                                </Box>

                                {/* Label input — always visible */}
                                <FormControl sx={{ flex: 1 }}>
                                  <FormLabel sx={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase", mb: 0.3, color: "text.tertiary" }}>
                                    Agenda Point to be Discussed
                                  </FormLabel>
                                  <Input
                                    placeholder="Enter agenda point…"
                                    value={ap.selectedPoint ?? ""}
                                    onChange={(e) => updateAgendaPoint(cat.id, ap.id, "selectedPoint", e.target.value)}
                                    sx={{ borderRadius: "7px", "--Input-minHeight": "34px", fontSize: "0.85rem" }}
                                  />
                                </FormControl>

                                {/* Badges + remove */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
                                  {apTaskCount > 0 && (
                                    <Chip size="sm" sx={{ bgcolor: "#fde68a", color: "#92400e", fontWeight: 700, fontSize: "0.63rem", height: 18 }}>
                                      {apTaskCount}AP
                                    </Chip>
                                  )}
                                  {apFilled && !ap.expanded && (
                                    <Chip size="sm" sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: 700, fontSize: "0.63rem", height: 18 }}>✓</Chip>
                                  )}
                                  {cat.agendaPoints.length > 1 && (
                                    <IconButton
                                      size="sm"
                                      variant="plain"
                                      color="danger"
                                      onClick={() => removeAgendaPoint(cat.id, ap.id)}
                                      sx={{ opacity: 0.5, "&:hover": { opacity: 1 }, minWidth: 24, height: 24 }}
                                    >
                                      <Delete sx={{ fontSize: "0.85rem" }} />
                                    </IconButton>
                                  )}
                                </Box>
                              </Box>

                              {/* ── Expanded body (Image 2 style) ── */}
                              {ap.expanded && (
                                <Box
                                  sx={{
                                    px: 2,
                                    pb: 2,
                                    pt: 1.5,
                                    borderTop: "1px solid #f0e8d8",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1.5,
                                    backgroundColor: "#fffcf7",
                                  }}
                                >
                                  {/* Description + Discussions */}
                                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                                    <FormControl>
                                      <FormLabel sx={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.3px", mb: 0.4 }}>
                                        Enter Brief Description
                                      </FormLabel>
                                      <Input
                                        placeholder="Value"
                                        value={ap.description}
                                        onChange={(e) => updateAgendaPoint(cat.id, ap.id, "description", e.target.value)}
                                        sx={{ borderRadius: "7px", fontSize: "0.85rem" }}
                                      />
                                    </FormControl>
                                    <FormControl>
                                      <FormLabel sx={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.3px", mb: 0.4 }}>
                                        Enter Discussions
                                      </FormLabel>
                                      <Input
                                        placeholder="Value"
                                        value={ap.discussions}
                                        onChange={(e) => updateAgendaPoint(cat.id, ap.id, "discussions", e.target.value)}
                                        sx={{ borderRadius: "7px", fontSize: "0.85rem" }}
                                      />
                                    </FormControl>
                                  </Box>

                                  {/* Decisions */}
                                  <FormControl>
                                    <FormLabel sx={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.3px", mb: 0.4 }}>
                                      Enter Decisions
                                    </FormLabel>
                                    <Input
                                      placeholder="Value"
                                      value={ap.decisions}
                                      onChange={(e) => updateAgendaPoint(cat.id, ap.id, "decisions", e.target.value)}
                                      sx={{ borderRadius: "7px", fontSize: "0.85rem" }}
                                    />
                                  </FormControl>

                                  {/* Action Point Section */}
                                  <Box
                                    sx={{
                                      border: "1px solid #d8c8f0",
                                      borderRadius: "9px",
                                      p: 1.5,
                                      background: "rgba(109,40,217,0.025)",
                                    }}
                                  >
                                    <Typography
                                      level="body-xs"
                                      fontWeight={700}
                                      sx={{
                                        color: "#6d28d9",
                                        letterSpacing: "0.4px",
                                        mb: ap.actionPoints.length > 0 ? 1.2 : 0,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.6,
                                      }}
                                    >
                                      <AssignmentTurnedIn sx={{ fontSize: "0.85rem" }} />
                                      Action Point Section
                                    </Typography>

                                    {ap.actionPoints.length > 0 && (
                                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1.2 }}>
                                        {ap.actionPoints.map((task, tIdx) => (
                                          <Box
                                            key={task.id}
                                            sx={{
                                              display: "grid",
                                              gridTemplateColumns: "1fr 1fr 110px 1fr auto",
                                              gap: 0.8,
                                              alignItems: "center",
                                              p: 1,
                                              borderRadius: "7px",
                                              backgroundColor: task.description && task.assignedTo ? "#f5f3ff" : "#fafafa",
                                              border: "1px solid",
                                              borderColor: task.description && task.assignedTo ? "#ddd6fe" : "#eee",
                                            }}
                                          >
                                            <Input
                                              placeholder={`Task ${tIdx + 1}…`}
                                              value={task.description}
                                              onChange={(e) => updateActionPoint(cat.id, ap.id, task.id, "description", e.target.value)}
                                              sx={{ borderRadius: "6px", fontSize: "0.8rem" }}
                                            />
                                            <Autocomplete
                                              placeholder="Assign to…"
                                              options={assignableEmployees}
                                              value={task.assignedTo}
                                              groupBy={(opt) => opt.group}
                                              getOptionLabel={(opt) => opt.name ?? ""}
                                              isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                                              onChange={(_, val) => updateActionPoint(cat.id, ap.id, task.id, "assignedTo", val)}
                                              sx={{ borderRadius: "6px", fontSize: "0.8rem" }}
                                            />
                                            <Input
                                              type="date"
                                              value={task.deadline}
                                              onChange={(e) => updateActionPoint(cat.id, ap.id, task.id, "deadline", e.target.value)}
                                              sx={{ borderRadius: "6px", fontSize: "0.8rem" }}
                                            />
                                            <Autocomplete
                                              placeholder="Project…"
                                              options={projects}
                                              value={task.project}
                                              getOptionLabel={(opt) => opt.code ?? ""}
                                              isOptionEqualToValue={(opt, val) => opt.code === val?.code}
                                              onChange={(_, val) => updateActionPoint(cat.id, ap.id, task.id, "project", val)}
                                              sx={{ borderRadius: "6px", fontSize: "0.8rem" }}
                                            />
                                            <IconButton
                                              size="sm"
                                              variant="soft"
                                              color="danger"
                                              onClick={() => removeActionPoint(cat.id, ap.id, task.id)}
                                            >
                                              <Delete sx={{ fontSize: "0.85rem" }} />
                                            </IconButton>
                                          </Box>
                                        ))}
                                      </Box>
                                    )}

                                    <Button
                                      size="sm"
                                      variant="outlined"
                                      startDecorator={<Add sx={{ fontSize: "0.85rem" }} />}
                                      onClick={() => addActionPoint(cat.id, ap.id)}
                                      sx={{
                                        borderStyle: "dashed",
                                        borderColor: "#a78bfa",
                                        color: "#6d28d9",
                                        fontSize: "0.72rem",
                                        backgroundColor: "transparent",
                                        "&:hover": { backgroundColor: "#f5f3ff", borderStyle: "dashed" },
                                      }}
                                    >
                                      Add Action Point
                                    </Button>
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>

                      {/* ── Add Agenda Point button ── */}
                      <Button
                        variant="outlined"
                        size="sm"
                        startDecorator={<Add sx={{ fontSize: "0.9rem" }} />}
                        onClick={() => addAgendaPointToCategory(cat.id)}
                        sx={{
                          mt: 1.5,
                          width: "100%",
                          borderStyle: "dashed",
                          borderColor: "#f0a000",
                          color: "#e65100",
                          backgroundColor: "transparent",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          "&:hover": { backgroundColor: "#fffbf0", borderStyle: "dashed" },
                        }}
                      >
                        + Add Agenda Point
                      </Button>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
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
                            e.designation === emp.designation
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
                                      transition:
                                        "background-color 0.2s ease",
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
            // action={injectButton}
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

      {/* ── Section 5: Remarks ─────────────────────────────────────────── */}
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
            {validActionPointCount} action point{validActionPointCount !== 1 ? "s" : ""} will be assigned as tasks
          </Chip>
        )}
        <Button variant="outlined" color="neutral" onClick={clearForm}>
          Clear Form
        </Button>
        <Button variant="solid" color="primary" startDecorator={<Save />} onClick={handleSubmit}>
          Save Meeting Record
        </Button>
      </Box>

      <Toast
        open={toast}
        status={toastStatus}
        message={toastMessage}
        onClose={() => setToast(false)}
      />
    </Box>
  );
};

export default AddDirectorMeetingRecords;