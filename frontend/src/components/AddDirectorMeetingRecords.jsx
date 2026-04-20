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
  Event,
  Notes,
  Checklist,
  Search,
  Close,
  Add,
  Delete,
} from "@mui/icons-material";
import { Editor } from "primereact/editor";

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
      "&:hover": {
        backgroundColor: person.present ? hoverBg : "#fafafa",
      },
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
const AddDirectorMeetingRecords = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [directors, setDirectors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [meetingDate, setMeetingDate] = useState(today);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [mom, setMom] = useState("");
  const [crucialDecisions, setCrucialDecisions] = useState("");
  const [remarks, setRemarks] = useState("");
  const [agenda, setAgenda] = useState("");
  const [agendaPoints, setAgendaPoints] = useState([]);
  const [staffSearch, setStaffSearch] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5002/getDirectors")
      .then((res) => {
        if (res.status === 200) {
          setDirectors(res.data.map((d) => ({ ...d, present: true })));
        }
      })
      .catch(console.error);

    axios
      .get("http://localhost:5002/getStaff")
      .then((res) => {
        if (res.status === 200) {
          setEmployees(res.data.map((e) => ({ ...e, present: false })));
        }
      })
      .catch(console.error);
  }, []);

  const filteredEmployees = employees.filter(
    (e) =>
      e.name?.toLowerCase().includes(staffSearch.toLowerCase()) ||
      e.designation?.toLowerCase().includes(staffSearch.toLowerCase()),
  );

  // ─── Toggle Handlers ──────────────────────────────────────────────────
  const toggleDirector = (index, checked) => {
    setDirectors((prev) =>
      prev.map((d, i) => (i === index ? { ...d, present: checked } : d)),
    );
  };

  const toggleEmployee = (index, checked) => {
    setEmployees((prev) =>
      prev.map((e, i) => (i === index ? { ...e, present: checked } : e)),
    );
  };

  const toggleAllDirectors = (checked) => {
    setDirectors((prev) => prev.map((d) => ({ ...d, present: checked })));
  };

  const toggleAllEmployees = (checked) => {
    setEmployees((prev) => prev.map((e) => ({ ...e, present: checked })));
  };

  // ─── Agenda Points Handlers ───────────────────────────────────────────
  const addAgendaPoint = () => {
    setAgendaPoints((prev) => [...prev, ""]);
  };

  const updateAgendaPoint = (index, value) => {
    setAgendaPoints((prev) =>
      prev.map((point, i) => (i === index ? value : point)),
    );
  };

  const removeAgendaPoint = (index) => {
    setAgendaPoints((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Form Actions ─────────────────────────────────────────────────────
  const clearForm = () => {
    setMeetingTitle("");
    setAgenda("");
    setAgendaPoints([]);
    setMom("");
    setCrucialDecisions("");
    setRemarks("");
    setMeetingDate(today);
    setDirectors((prev) => prev.map((d) => ({ ...d, present: true })));
    setEmployees((prev) => prev.map((e) => ({ ...e, present: false })));
  };

  const handleSubmit = async () => {
    const presentDirectors = directors.filter((d) => d.present);
    const presentStaff = employees.filter((e) => e.present);
    const payload = {
      meetingDate,
      meetingTitle,
      agenda,
      agendaPoints: agendaPoints.filter((p) => p.trim() !== ""),
      mom,
      crucialDecisions,
      remarks,
      directors: presentDirectors,
      staff: presentStaff,
    };

    try {
      const res = await axios.post("http://localhost:5002/addMeeting", payload);
      if (res.data.success) {
        alert("Meeting saved successfully!");
        clearForm();
      }
    } catch (err) {
      console.error("Failed to save meeting:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  // ─── Derived Counts ───────────────────────────────────────────────────
  const directorPresentCount = directors.filter((d) => d.present).length;
  const employeePresentCount = employees.filter((e) => e.present).length;

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", px: 3, py: 2, textAlign: "left" }}>
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: "16px",
          background: "linear-gradient(135deg, #1a2236 0%, #1976d2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography level="h4" sx={{ color: "#fff", fontWeight: 700 }}>
            Add Meeting Record
          </Typography>
          <Typography
            level="body-sm"
            sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}
          >
            Fill in the details below to record the director meeting.
          </Typography>
        </Box>
        <Chip
          variant="soft"
          sx={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}
        >
          📅 {today.toDateString()}
        </Chip>
      </Box>

      {/* ── Section 1: Meeting Details ────────────────────────────────── */}
      <Card variant="outlined" sx={{ borderRadius: "16px", mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon={<Event sx={{ color: "#fff", fontSize: "1.1rem" }} />}
            title="Meeting Details"
            subtitle="Provide the basic information about this meeting."
          />
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

      {/* ── Section 2: Directors Present ──────────────────────────────── */}
      <Card variant="outlined" sx={{ borderRadius: "16px", mb: 3 }}>
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
                      onChange={(e) => toggleDirector(index, e.target.checked)}
                    />
                  ))}
                </List>
              </Sheet>

              <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
                <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                  {directorPresentCount} director
                  {directorPresentCount !== 1 ? "s" : ""} marked present
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Section 3: Staff Present ───────────────────────────────────── */}
      <Card variant="outlined" sx={{ borderRadius: "16px", mb: 3 }}>
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
                  placeholder="Search by name or designation..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  startDecorator={
                    <Search sx={{ fontSize: "1rem", color: "text.tertiary" }} />
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
                    <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
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
                                        sx={{ color: "text.tertiary", ml: 0.5 }}
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

      {/* ── Section 4: Agenda ─────────────────────────────────────────── */}
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
              placeholder="e.g. Review Q2 performance, plan Q3 targets, discuss expansion..."
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
                    placeholder={`Agenda point ${index + 1}...`}
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
              "&:hover": {
                backgroundColor: "#fffbf0",
                borderStyle: "dashed",
              },
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
              {agendaPoints.length} point
              {agendaPoints.length !== 1 ? "s" : ""} filled
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* ── Section 5: MoM, Crucial Decisions & Remarks ──────────────── */}
      <Card variant="outlined" sx={{ borderRadius: "16px", mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon={<Notes sx={{ color: "#fff", fontSize: "1.1rem" }} />}
            title="Meeting Notes"
            subtitle="Record minutes, crucial decisions, and any additional remarks."
          />

          {/* Minutes of Meeting */}
          <Box sx={{ mb: 3 }}>
            <Typography
              level="title-sm"
              fontWeight={600}
              sx={{
                mb: 1,
                pb: 0.8,
                borderBottom: "2px solid #1976d2",
                color: "#1976d2",
              }}
            >
              📋 Minutes of Meeting
            </Typography>
            <Box
              sx={{
                borderRadius: "10px",
                border: "1px solid #d0d9f0",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <Editor
                value={mom}
                onTextChange={(e) => setMom(e.htmlValue)}
                style={{ height: "280px" }}
              />
            </Box>
            <Box sx={{ mt: 0.8, display: "flex", justifyContent: "flex-end" }}>
              <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                {mom ? mom.replace(/<[^>]*>/g, "").length : 0} characters
              </Typography>
            </Box>
          </Box>

          {/* Crucial Decisions */}
          <Box sx={{ mb: 3 }}>
            <Typography
              level="title-sm"
              fontWeight={600}
              sx={{
                mb: 1,
                pb: 0.8,
                borderBottom: "2px solid #e65100",
                color: "#e65100",
              }}
            >
              ⚡ Crucial Decisions
            </Typography>
            <Box
              sx={{
                borderRadius: "10px",
                border: "1px solid #f0c080",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <Editor
                value={crucialDecisions}
                onTextChange={(e) => setCrucialDecisions(e.htmlValue)}
                style={{ height: "280px" }}
              />
            </Box>
            <Box sx={{ mt: 0.8, display: "flex", justifyContent: "flex-end" }}>
              <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                {crucialDecisions
                  ? crucialDecisions.replace(/<[^>]*>/g, "").length
                  : 0}{" "}
                characters
              </Typography>
            </Box>
          </Box>

          {/* Remarks */}
          <Box>
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
              placeholder="Enter any additional remarks or observations..."
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
          </Box>
        </CardContent>
      </Card>

      {/* ── Sticky Submit Bar ─────────────────────────────────────────── */}
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
    </Box>
  );
};

export default AddDirectorMeetingRecords;
