import { CalendarMonth } from "@mui/icons-material";
import {
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  IconButton,
  Divider,
  Chip,
  Box,
  Typography,
  Sheet,
} from "@mui/joy";
import React, { useState } from "react";
import axios from "axios";
import Toast from "./Toast";

const AGENDA_CATEGORIES = [
  "Invoicing",
  "Critical Tasks",
  "Resource",
  "Pipeline",
  "Other",
];

const makePoint = () => ({ id: Date.now() + Math.random(), title: "" });
const makeCategory = (name) => ({
  id: name,
  expanded: true,
  points: [makePoint()],
});

const MeetingScheduler = ({ open, onClose, onSave }) => {
  const today = new Date().toISOString().split("T")[0];
  const [nextMeetingDate, setNextMeetingDate] = useState(today);
  const [nextMeetingAgenda, setNextMeetingAgenda] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [categories, setCategories] = useState(
    AGENDA_CATEGORIES.map(makeCategory),
  );
  const [scheduling, setScheduling] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastStatus, setToastStatus] = useState("");

  // ── Category handlers ───────────────────────────────────────────────────
  const toggleCategory = (catId) =>
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, expanded: !c.expanded } : c)),
    );

  const addPoint = (catId) =>
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, points: [...c.points, makePoint()] } : c,
      ),
    );

  const updatePoint = (catId, ptId, value) =>
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              points: c.points.map((p) =>
                p.id === ptId ? { ...p, title: value } : p,
              ),
            }
          : c,
      ),
    );

  const removePoint = (catId, ptId) =>
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, points: c.points.filter((p) => p.id !== ptId) }
          : c,
      ),
    );

  // ── Computed ────────────────────────────────────────────────────────────
  const totalFilledPoints = categories.reduce(
    (sum, c) => sum + c.points.filter((p) => p.title.trim()).length,
    0,
  );

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    // Build a flat agenda points array: [{ category, title }]
    const agendaPoints = categories.map((c) => ({
      category: c.id,
      title: c.points.filter((p) => p.title.trim()).map((p) => p.title.trim()),
    }));

    const payload = new FormData();
    payload.append("scheduledMeetingDate", nextMeetingDate);
    payload.append("meetingTitle", meetingTitle);
    payload.append("agenda", nextMeetingAgenda);
    payload.append("agendaPoints", JSON.stringify(agendaPoints));
    payload.append("organizer", sessionStorage.getItem("empName"));

    setScheduling(true);
    axios
      .post("/scheduleNextMeeting", payload)
      .then((res) => {
        if (res.status === 200) {
          onSave?.({
            scheduledDate: nextMeetingDate,
            agenda: nextMeetingAgenda,
            agendaPoints,
            success: true,
          });
          handleClose();
          setToast(true);
          setToastMessage(res.data.message);
          setToastStatus("success");
        }
      })
      .catch(console.error)
      .finally(() => setScheduling(false));
  };

  const handleClose = () => {
    setNextMeetingDate(today);
    setNextMeetingAgenda("");
    setMeetingTitle("");
    setCategories(AGENDA_CATEGORIES.map(makeCategory));
    onClose?.();
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <ModalDialog
          sx={{
            width: { xs: "95vw", sm: 620 },
            maxHeight: "92vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            p: 0,
            borderRadius: "20px",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {/* ── Header ── */}
          <Sheet
            sx={{
              background: "linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)",
              px: 3,
              pt: 3,
              pb: 2.5,
              borderRadius: "20px 20px 0 0",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <ModalClose
              sx={{
                top: 14,
                right: 14,
                color: "rgba(255,255,255,0.7)",
                "&:hover": {
                  color: "#fff",
                  background: "rgba(255,255,255,0.1)",
                },
              }}
            />

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  background: "rgba(99,179,237,0.2)",
                  border: "1px solid rgba(99,179,237,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarMonth sx={{ color: "#fff" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "1.15rem",
                    letterSpacing: "-0.3px",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Schedule Next Meeting
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.75rem",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Plan ahead for the board
                </Typography>
              </Box>
            </Box>

            {/* Stats strip */}
            <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
              {[
                {
                  label: "Date set",
                  value: nextMeetingDate ? "✓" : "—",
                  active: !!nextMeetingDate,
                },
                {
                  label: "Agenda",
                  value: nextMeetingAgenda ? "✓" : "—",
                  active: !!nextMeetingAgenda,
                },
                {
                  label: "Points",
                  value: totalFilledPoints || "0",
                  active: totalFilledPoints > 0,
                },
              ].map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    flex: 1,
                    background: stat.active
                      ? "rgba(99,179,237,0.18)"
                      : "rgba(255,255,255,0.06)",
                    border: "1px solid",
                    borderColor: stat.active
                      ? "rgba(99,179,237,0.4)"
                      : "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    px: 1.5,
                    py: 0.8,
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <Typography
                    sx={{
                      color: stat.active ? "#63b3ed" : "rgba(255,255,255,0.6)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Sheet>

          {/* ── Scrollable body ── */}
          <Box sx={{ overflowY: "auto", flex: 1, px: 3, py: 2.5 }}>
            {/* Date + Title */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 2.5,
              }}
            >
              <FormControl>
                <FormLabel
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  Next Meeting Date
                </FormLabel>
                <Input
                  type="date"
                  value={nextMeetingDate}
                  onChange={(e) => setNextMeetingDate(e.target.value)}
                  slotProps={{ input: { min: today } }}
                  sx={{
                    borderRadius: "10px",
                    "--Input-focusedHighlight": "#2d3561",
                    fontSize: "0.875rem",
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  Meeting Title
                </FormLabel>
                <Input
                  placeholder="e.g. Q3 Board Review"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  sx={{
                    borderRadius: "10px",
                    "--Input-focusedHighlight": "#2d3561",
                    fontSize: "0.875rem",
                  }}
                />
              </FormControl>
            </Box>

            {/* Agenda Overview */}
            <FormControl sx={{ mb: 2.5 }}>
              <FormLabel
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  mb: 0.5,
                }}
              >
                Agenda Overview
              </FormLabel>
              <Textarea
                placeholder="Brief summary of what needs to be discussed..."
                minRows={2}
                maxRows={3}
                value={nextMeetingAgenda}
                onChange={(e) => setNextMeetingAgenda(e.target.value)}
                sx={{
                  borderRadius: "10px",
                  "--Textarea-focusedHighlight": "#2d3561",
                  fontSize: "0.875rem",
                  resize: "none",
                }}
              />
            </FormControl>

            {/* ── Category accordions ── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {categories.map((cat, catIdx) => {
                const filledInCat = cat.points.filter((p) =>
                  p.title.trim(),
                ).length;
                const hasFill = filledInCat > 0;

                return (
                  <Box
                    key={cat.id}
                    sx={{
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: cat.expanded
                        ? "#f0a000"
                        : hasFill
                          ? "#f0c060"
                          : "#e8e8e8",
                      overflow: "hidden",
                      transition: "border-color 0.2s",
                    }}
                  >
                    {/* Category header */}
                    <Box
                      onClick={() => toggleCategory(cat.id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 2,
                        py: 1.4,
                        cursor: "pointer",
                        backgroundColor: cat.expanded
                          ? "#fffbf0"
                          : hasFill
                            ? "#fffdf7"
                            : "#fafafa",
                        transition: "background-color 0.2s",
                        "&:hover": { backgroundColor: "#fffbf0" },
                        userSelect: "none",
                      }}
                    >
                      {/* Number badge */}
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          backgroundColor: hasFill ? "#e65100" : "#d4d4d4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "background-color 0.2s",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#fff",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {catIdx + 1}
                        </Typography>
                      </Box>

                      {/* Category name */}
                      <Typography
                        fontWeight={700}
                        sx={{
                          flex: 1,
                          fontSize: "0.92rem",
                          color: hasFill ? "#c45000" : "text.primary",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {cat.id}
                      </Typography>

                      {/* Filled count chip */}
                      {hasFill && (
                        <Chip
                          size="sm"
                          sx={{
                            bgcolor: "#fde68a",
                            color: "#92400e",
                            fontWeight: 700,
                            fontSize: "0.63rem",
                            height: 18,
                          }}
                        >
                          {filledInCat} point{filledInCat !== 1 ? "s" : ""}
                        </Chip>
                      )}

                      {/* Toggle circle */}
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
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

                    {/* Category body */}
                    {cat.expanded && (
                      <Box
                        sx={{
                          px: 2,
                          pb: 2,
                          pt: 1.5,
                          backgroundColor: "#fffdf7",
                          borderTop: "1px solid #f0e0a0",
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          animation: "fadeIn 0.15s ease",
                          "@keyframes fadeIn": {
                            from: { opacity: 0, transform: "translateY(-3px)" },
                            to: { opacity: 1, transform: "translateY(0)" },
                          },
                        }}
                      >
                        {/* Agenda point rows */}
                        {cat.points.map((pt, ptIdx) => (
                          <Box
                            key={pt.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              p: 1,
                              borderRadius: "10px",
                              border: "1px solid",
                              borderColor: pt.title ? "#e0c080" : "#ece8e0",
                              backgroundColor: "#fff",
                              transition: "border-color 0.15s",
                            }}
                          >
                            {/* Number badge */}
                            <Box
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: "50%",
                                backgroundColor: "#f5f0e8",
                                border: "1.5px solid #d4c4a0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  color: "#7a5c30",
                                }}
                              >
                                {ptIdx + 1}
                              </Typography>
                            </Box>

                            {/* + expand placeholder (visual only, matches design) */}
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                border: "1.5px solid #bbb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#bbb",
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                lineHeight: 1,
                                flexShrink: 0,
                              }}
                            >
                              +
                            </Box>

                            {/* Input */}
                            <FormControl sx={{ flex: 1 }}>
                              <FormLabel
                                sx={{
                                  fontSize: "0.62rem",
                                  fontWeight: 600,
                                  letterSpacing: "0.4px",
                                  textTransform: "uppercase",
                                  mb: 0.3,
                                  color: "text.tertiary",
                                }}
                              >
                                Agenda Point to be Discussed
                              </FormLabel>
                              <Input
                                placeholder="Enter agenda point..."
                                value={pt.title}
                                onChange={(e) =>
                                  updatePoint(cat.id, pt.id, e.target.value)
                                }
                                sx={{
                                  borderRadius: "7px",
                                  "--Input-minHeight": "34px",
                                  fontSize: "0.85rem",
                                  "--Input-focusedHighlight": "#e65100",
                                }}
                              />
                            </FormControl>

                            {/* Remove button (only when >1 point) */}
                            {cat.points.length > 1 && (
                              <IconButton
                                size="sm"
                                variant="plain"
                                color="danger"
                                onClick={() => removePoint(cat.id, pt.id)}
                                sx={{
                                  opacity: 0.45,
                                  "&:hover": { opacity: 1 },
                                  flexShrink: 0,
                                }}
                              >
                                ✕
                              </IconButton>
                            )}
                          </Box>
                        ))}

                        {/* Add Agenda Point button */}
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => addPoint(cat.id)}
                          sx={{
                            mt: 0.5,
                            width: "100%",
                            borderStyle: "dashed",
                            borderColor: "#f0a000",
                            color: "#e65100",
                            backgroundColor: "transparent",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                            "&:hover": {
                              backgroundColor: "#fffbf0",
                              borderStyle: "dashed",
                            },
                          }}
                        >
                          + &nbsp;+ Add Agenda Point
                        </Button>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Auto-fill info banner */}
            {nextMeetingDate && (
              <Box
                sx={{
                  mt: 2.5,
                  p: 1.5,
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, rgba(99,179,237,0.1), rgba(45,53,97,0.08))",
                  border: "1px solid rgba(99,179,237,0.25)",
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-start",
                }}
              >
                <Typography sx={{ fontSize: "0.85rem", mt: "1px" }}>
                  💡
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    lineHeight: 1.5,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  On{" "}
                  <strong>
                    {new Date(nextMeetingDate + "T00:00:00").toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </strong>
                  , the <em>Agenda</em> and <em>Agenda Points</em> fields will
                  auto-populate when directors open a new meeting entry.
                </Typography>
              </Box>
            )}
          </Box>

          {/* ── Footer ── */}
          <Divider />
          <Box
            sx={{
              px: 3,
              py: 2,
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Button
              variant="plain"
              color="neutral"
              onClick={handleClose}
              sx={{
                borderRadius: "10px",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!nextMeetingDate}
              onClick={handleSave}
              loading={scheduling}
              sx={{
                borderRadius: "10px",
                background: "linear-gradient(135deg, #1a1f36, #2d3561)",
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                px: 3,
                "&:hover": {
                  background: "linear-gradient(135deg, #2d3561, #3d4a8a)",
                },
                "&:disabled": { opacity: 0.45 },
              }}
            >
              Schedule Meeting →
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      <Toast
        open={toast}
        onClose={() => setToast(false)}
        message={toastMessage}
        status={toastStatus}
      />
    </>
  );
};

export default MeetingScheduler;
