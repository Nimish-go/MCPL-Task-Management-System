import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Chip,
  Typography,
} from "@mui/joy";
import { CalendarMonth, Group, Person } from "@mui/icons-material";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect } from "react";

// ─── Shared HTML renderer styles for PrimeReact Editor output ─────────────
const htmlRendererSx = {
  fontSize: "0.875rem",
  lineHeight: 1.7,
  color: "text.primary",
  // Headings
  "& h1": { fontSize: "1.2rem", fontWeight: 700, mb: 1, mt: 1.5, color: "inherit" },
  "& h2": { fontSize: "1.05rem", fontWeight: 700, mb: 0.8, mt: 1.2, color: "inherit" },
  "& h3": { fontSize: "0.95rem", fontWeight: 600, mb: 0.6, mt: 1, color: "inherit" },
  // Lists
  "& ol": { listStyleType: "decimal", pl: 3, mb: 0.5 },
  "& ul": { listStyleType: "disc !important", pl: 3, mb: 0.5 },
  "& ol li": { listStyleType: "decimal", mb: 0.4 },
  "& ul li": { listStyleType: "disc !important", mb: 0.4 },
  // Paragraphs & inline
  "& p": { mb: 0.5, mt: 0 },
  "& strong": { fontWeight: 700 },
  "& em": { fontStyle: "italic" },
  "& u": { textDecoration: "underline" },
  "& s": { textDecoration: "line-through" },
  // Blockquote
  "& blockquote": {
    borderLeft: "3px solid #e0c080",
    pl: 1.5,
    ml: 0,
    color: "text.secondary",
    fontStyle: "italic",
  },
  // Code
  "& pre": {
    backgroundColor: "#f4f4f4",
    borderRadius: "6px",
    p: 1,
    fontSize: "0.8rem",
    overflowX: "auto",
  },
  "& code": {
    backgroundColor: "#f4f4f4",
    borderRadius: "3px",
    px: 0.5,
    fontSize: "0.82rem",
    fontFamily: "monospace",
  },
};

const ViewPastMeetings = ({
  meetingData,
  isLoading = false,
  actionPointStatus,
}) => {
  useEffect(() => {
    console.log(meetingData);
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
          textAlign: "center",
          px: 2,
          py: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
        }}
      >
        <DotLottieReact
          src="https://lottie.host/876ba248-54ac-48d0-a9dc-67747bd5b80a/0QJm3EJB8I.lottie"
          loop
          autoplay
          style={{ width: 220, height: 220 }}
        />
        <Typography level="title-md" sx={{ color: "text.secondary", mt: 1 }}>
          Loading meeting records...
        </Typography>
        <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.5 }}>
          Please wait while we fetch your data.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", textAlign: "left", px: 2, py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography level="title-lg" fontWeight={700}>
            Past Meeting Records
          </Typography>
          <Typography level="body-xs" sx={{ color: "text.secondary", mt: 0.5 }}>
            {meetingData.length} meeting{meetingData.length !== 1 ? "s" : ""}{" "}
            recorded
          </Typography>
        </Box>
        <Chip
          variant="soft"
          color="primary"
          size="sm"
          startDecorator={<CalendarMonth sx={{ fontSize: "0.9rem" }} />}
        >
          {new Date().getFullYear()}
        </Chip>
      </Box>

      {/* Empty State */}
      {meetingData.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            borderRadius: "16px",
            border: "2px dashed #e0e0e0",
            backgroundColor: "#fafafa",
          }}
        >
          <Typography sx={{ fontSize: "3rem", mb: 1 }}>📋</Typography>
          <Typography level="title-md" sx={{ color: "text.secondary" }}>
            No meeting records found
          </Typography>
          <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.5 }}>
            Past meeting records will appear here once added.
          </Typography>
        </Box>
      ) : (
        <AccordionGroup
          variant="outlined"
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
            "& .MuiAccordion-root": {
              border: "none",
              borderBottom: "1px solid #f0f0f0",
              "&:last-child": { borderBottom: "none" },
            },
          }}
        >
          {meetingData.map((meeting, index) => (
            <Accordion key={index}>
              <AccordionSummary
                sx={{
                  px: 3,
                  py: 1.5,
                  "&:hover": { backgroundColor: "#f8f9ff" },
                  transition: "background-color 0.2s ease",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: "#e8f0fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#1976d2" }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography level="title-sm" fontWeight={600}>
                      {meeting.meetingTitle || "Untitled Meeting"}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: "text.secondary", mt: 0.3 }}>
                      {new Date(meeting.meetingDate).toDateString()}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                    <Chip
                      size="sm"
                      variant="soft"
                      color="primary"
                      startDecorator={<Person sx={{ fontSize: "0.8rem" }} />}
                    >
                      {meeting.directors?.length || 0} Directors
                    </Chip>
                    <Chip
                      size="sm"
                      variant="soft"
                      color="success"
                      startDecorator={<Group sx={{ fontSize: "0.8rem" }} />}
                    >
                      {meeting.staff?.length || 0} Staff
                    </Chip>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 3, pb: 3, backgroundColor: "#fafbff" }}>
                {/* Date & Title Row */}
                <Box sx={{ display: "flex", gap: 2, mb: 2, mt: 1 }}>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: "10px",
                      backgroundColor: "#f0f4ff",
                      border: "1px solid #d0d9f0",
                    }}
                  >
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1 }}
                    >
                      Meeting Date
                    </Typography>
                    <Typography level="title-sm" sx={{ mt: 0.5 }}>
                      {new Date(meeting.meetingDate).toDateString()}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: "10px",
                      backgroundColor: "#f0f4ff",
                      border: "1px solid #d0d9f0",
                    }}
                  >
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1 }}
                    >
                      Meeting Title
                    </Typography>
                    <Typography level="title-sm" sx={{ mt: 0.5 }}>
                      {meeting.meetingTitle || "—"}
                    </Typography>
                  </Box>
                </Box>

                {/* Directors & Staff Row */}
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: "10px",
                      backgroundColor: "#f6fff6",
                      border: "1px solid #c3e6cb",
                    }}
                  >
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1, mb: 1 }}
                    >
                      Directors Present
                    </Typography>
                    {meeting.directors?.length === 0 || !meeting.directors ? (
                      <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        None
                      </Typography>
                    ) : (
                      meeting.directors.map((d, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              backgroundColor: "primary.400",
                              flexShrink: 0,
                            }}
                          />
                          <Typography level="body-sm">{d.name}</Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: "10px",
                      backgroundColor: "#f6fff6",
                      border: "1px solid #c3e6cb",
                    }}
                  >
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1, mb: 1 }}
                    >
                      Staff Present
                    </Typography>
                    {meeting.staff?.length === 0 || !meeting.staff ? (
                      <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        None
                      </Typography>
                    ) : (
                      meeting.staff.map((s, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              backgroundColor: "success.400",
                              flexShrink: 0,
                            }}
                          />
                          <Typography level="body-sm">{s.name}</Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>

                {/* ── Agenda ──────────────────────────────────────────── */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    backgroundColor: "#fffbf0",
                    border: "1px solid #f0e0a0",
                    mb: 2,
                  }}
                >
                  <Typography
                    level="body-xs"
                    sx={{
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      mb: 1.5,
                    }}
                  >
                    Agenda
                  </Typography>

                  {meeting.agendaPoints?.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {meeting.agendaPoints.map((category, ci) => (
                        <Box key={ci}>
                          {/* Category Header */}
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, px: 0.5 }}
                          >
                            <Box
                              sx={{ height: "2px", width: 16, backgroundColor: "#e65100", borderRadius: 2 }}
                            />
                            <Typography
                              level="body-xs"
                              sx={{
                                color: "#e65100",
                                textTransform: "uppercase",
                                letterSpacing: 1,
                                fontWeight: 700,
                              }}
                            >
                              {category.id}
                            </Typography>
                            <Box sx={{ flex: 1, height: "1px", backgroundColor: "#f0e0a0" }} />
                          </Box>

                          {/* Agenda Points accordion */}
                          <AccordionGroup
                            variant="outlined"
                            sx={{
                              borderRadius: "8px",
                              overflow: "hidden",
                              backgroundColor: "#fff",
                              "& .MuiAccordion-root": {
                                border: "none",
                                borderBottom: "1px solid #f5ead0",
                                "&:last-child": { borderBottom: "none" },
                              },
                            }}
                          >
                            {category.agendaPoints?.map((point, pi) => {
                              // Strip HTML to check if there's actual content (new records)
                              const notesText = (point.notes || "").replace(/<[^>]*>/g, "").trim();
                              // hasNotes covers both new (point.notes HTML) and legacy (plain-text fields)
                              const hasNotes =
                                notesText.length > 0 ||
                                !!point.description ||
                                !!point.discussions ||
                                !!point.decisions;
                              const hasActionPoints = point.actionPoints?.length > 0;

                              return (
                                <Accordion key={pi}>
                                  <AccordionSummary
                                    sx={{
                                      px: 2,
                                      py: 1,
                                      "&:hover": { backgroundColor: "#fffbf5" },
                                      transition: "background-color 0.2s ease",
                                    }}
                                  >
                                    <Box
                                      sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}
                                    >
                                      {/* Point number badge */}
                                      <Box
                                        sx={{
                                          width: 22,
                                          height: 22,
                                          borderRadius: "50%",
                                          backgroundColor: "#fff3e0",
                                          border: "1.5px solid #e65100",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          flexShrink: 0,
                                        }}
                                      >
                                        <Typography
                                          sx={{ color: "#e65100", fontSize: "0.6rem", fontWeight: 700 }}
                                        >
                                          {pi + 1}
                                        </Typography>
                                      </Box>

                                      {/* Point title */}
                                      <Typography level="title-sm" fontWeight={600} sx={{ flex: 1 }}>
                                        {point.selectedPoint || "Nothing was discussed"}
                                      </Typography>

                                      {/* Badges */}
                                      <Box sx={{ display: "flex", gap: 0.75, alignItems: "center", flexShrink: 0 }}>
                                        {hasNotes && (
                                          <Chip
                                            size="sm"
                                            variant="soft"
                                            sx={{
                                              bgcolor: "#fffbf0",
                                              color: "#b45309",
                                              border: "1px solid #f0e0a0",
                                              fontSize: "0.62rem",
                                              fontWeight: 700,
                                              height: 20,
                                            }}
                                          >
                                            📝 Notes
                                          </Chip>
                                        )}
                                        {hasActionPoints && (
                                          <Chip
                                            size="sm"
                                            variant="soft"
                                            color="primary"
                                            sx={{ fontSize: "0.62rem", fontWeight: 700, height: 20 }}
                                          >
                                            {point.actionPoints.length} action{point.actionPoints.length !== 1 ? "s" : ""}
                                          </Chip>
                                        )}
                                      </Box>
                                    </Box>
                                  </AccordionSummary>

                                  <AccordionDetails sx={{ px: 2, pb: 2, backgroundColor: "#fffdf7" }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>

                                      {/* ── Discussions & Decisions ──
                                          New records  → point.notes (HTML from editor)
                                          Legacy records → point.description / discussions / decisions (plain text) */}
                                      {notesText.length > 0 ? (
                                        <Box
                                          sx={{
                                            p: 2,
                                            borderRadius: "8px",
                                            backgroundColor: "#fff",
                                            border: "1px solid #e8d8b8",
                                          }}
                                        >
                                          <Typography
                                            level="body-xs"
                                            sx={{
                                              color: "#7a5c30",
                                              textTransform: "uppercase",
                                              letterSpacing: 0.8,
                                              fontWeight: 700,
                                              mb: 1,
                                            }}
                                          >
                                            📝 Discussions &amp; Decisions
                                          </Typography>
                                          <Box
                                            sx={htmlRendererSx}
                                            dangerouslySetInnerHTML={{ __html: point.notes }}
                                          />
                                        </Box>
                                      ) : (point.description || point.discussions || point.decisions) ? (
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                                          {point.description && (
                                            <Box
                                              sx={{
                                                p: 1.5,
                                                borderRadius: "8px",
                                                backgroundColor: "#fff",
                                                border: "1px solid #e8d8b8",
                                              }}
                                            >
                                              <Typography
                                                level="body-xs"
                                                sx={{
                                                  color: "#7a5c30",
                                                  textTransform: "uppercase",
                                                  letterSpacing: 0.8,
                                                  fontWeight: 700,
                                                  mb: 0.4,
                                                }}
                                              >
                                                Description
                                              </Typography>
                                              <Typography level="body-sm">{point.description}</Typography>
                                            </Box>
                                          )}
                                          {point.discussions && (
                                            <Box
                                              sx={{
                                                p: 1.5,
                                                borderRadius: "8px",
                                                backgroundColor: "#fff",
                                                border: "1px solid #e8d8b8",
                                              }}
                                            >
                                              <Typography
                                                level="body-xs"
                                                sx={{
                                                  color: "#7a5c30",
                                                  textTransform: "uppercase",
                                                  letterSpacing: 0.8,
                                                  fontWeight: 700,
                                                  mb: 0.4,
                                                }}
                                              >
                                                Discussion
                                              </Typography>
                                              <Typography level="body-sm">{point.discussions}</Typography>
                                            </Box>
                                          )}
                                          {point.decisions && (
                                            <Box
                                              sx={{
                                                p: 1.5,
                                                borderRadius: "8px",
                                                backgroundColor: "#fff3e0",
                                                border: "1px solid #ffcc80",
                                              }}
                                            >
                                              <Typography
                                                level="body-xs"
                                                sx={{
                                                  color: "#e65100",
                                                  textTransform: "uppercase",
                                                  letterSpacing: 0.8,
                                                  fontWeight: 700,
                                                  mb: 0.4,
                                                }}
                                              >
                                                ⚡ Decision
                                              </Typography>
                                              <Typography level="body-sm">{point.decisions}</Typography>
                                            </Box>
                                          )}
                                        </Box>
                                      ) : (
                                        <Typography level="body-xs" sx={{ color: "text.tertiary", fontStyle: "italic" }}>
                                          No discussions or decisions recorded.
                                        </Typography>
                                      )}

                                      {/* ── Action Points ── */}
                                      {hasActionPoints && (
                                        <Box>
                                          <Typography
                                            level="body-xs"
                                            sx={{
                                              color: "#1976d2",
                                              textTransform: "uppercase",
                                              letterSpacing: 0.8,
                                              fontWeight: 700,
                                              mb: 0.8,
                                            }}
                                          >
                                            ✅ Action Points
                                          </Typography>
                                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                                            {point.actionPoints.map((ap, j) => (
                                              <Box
                                                key={j}
                                                sx={{
                                                  display: "flex",
                                                  gap: 1.5,
                                                  alignItems: "flex-start",
                                                  p: 1.2,
                                                  borderRadius: "6px",
                                                  backgroundColor: "#f0f4ff",
                                                  border: "1px solid #d0d9f0",
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    width: 18,
                                                    height: 18,
                                                    borderRadius: "50%",
                                                    backgroundColor: "#1976d2",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                    mt: 0.2,
                                                  }}
                                                >
                                                  <Typography
                                                    sx={{ color: "#fff", fontSize: "0.55rem", fontWeight: 700 }}
                                                  >
                                                    {j + 1}
                                                  </Typography>
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "space-between",
                                                      gap: 1,
                                                      flexWrap: "wrap",
                                                    }}
                                                  >
                                                    <Typography level="body-sm" fontWeight={600} sx={{ flex: 1 }}>
                                                      {ap.description}
                                                    </Typography>
                                                    {actionPointStatus && (
                                                      <Chip
                                                        size="sm"
                                                        variant="soft"
                                                        color={
                                                          ap.status?.toLowerCase() === "completed"
                                                            ? "success"
                                                            : ap.status?.toLowerCase() === "in progress"
                                                              ? "warning"
                                                              : ap.status?.toLowerCase() === "overdue"
                                                                ? "danger"
                                                                : "neutral"
                                                        }
                                                        sx={{ fontWeight: 600, textTransform: "capitalize", flexShrink: 0 }}
                                                      >
                                                        {actionPointStatus}
                                                      </Chip>
                                                    )}
                                                  </Box>
                                                  <Typography level="body-xs" sx={{ color: "text.secondary", mt: 0.3 }}>
                                                    {ap.assignedTo?.name}
                                                    {ap.assignedTo?.designation ? ` · ${ap.assignedTo.designation}` : ""}
                                                  </Typography>
                                                  {ap.deadline && (
                                                    <Typography level="body-xs" sx={{ color: "#e65100", mt: 0.2 }}>
                                                      Due: {new Date(ap.deadline).toDateString()}
                                                    </Typography>
                                                  )}
                                                  {ap.project?.name && (
                                                    <Typography
                                                      level="body-xs"
                                                      sx={{ color: "text.tertiary", mt: 0.2, fontStyle: "italic" }}
                                                    >
                                                      {ap.project.code} – {ap.project.name}
                                                    </Typography>
                                                  )}
                                                </Box>
                                              </Box>
                                            ))}
                                          </Box>
                                        </Box>
                                      )}
                                    </Box>
                                  </AccordionDetails>
                                </Accordion>
                              );
                            })}
                          </AccordionGroup>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.5 }}>
                      No agenda points recorded.
                    </Typography>
                  )}
                </Box>

                {/* Remarks */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    backgroundColor: "#f6fff6",
                    border: "1px solid #c3e6cb",
                  }}
                >
                  <Typography
                    level="body-xs"
                    sx={{
                      color: "#2e7d32",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    💬 Remarks
                  </Typography>
                  <Typography level="body-sm">
                    {meeting.remarks || "No remarks recorded."}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </AccordionGroup>
      )}
    </Box>
  );
};

export default ViewPastMeetings;