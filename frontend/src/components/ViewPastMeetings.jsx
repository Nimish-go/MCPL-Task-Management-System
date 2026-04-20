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

const ViewPastMeetings = ({ meetingData, isLoading = false }) => {
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
                  {/* Index circle */}
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
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "#1976d2",
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>

                  {/* Title & Date */}
                  <Box sx={{ flex: 1 }}>
                    <Typography level="title-sm" fontWeight={600}>
                      {meeting.meetingTitle || "Untitled Meeting"}
                    </Typography>
                    <Typography
                      level="body-xs"
                      sx={{ color: "text.secondary", mt: 0.3 }}
                    >
                      {new Date(meeting.meetingDate).toDateString()}
                    </Typography>
                  </Box>

                  {/* Chips */}
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

              <AccordionDetails
                sx={{ px: 3, pb: 3, backgroundColor: "#fafbff" }}
              >
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
                      sx={{
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
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
                      sx={{
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
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
                      sx={{
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        mb: 1,
                      }}
                    >
                      Directors Present
                    </Typography>
                    {meeting.directors?.length === 0 || !meeting.directors ? (
                      <Typography
                        level="body-xs"
                        sx={{ color: "text.tertiary" }}
                      >
                        None
                      </Typography>
                    ) : (
                      meeting.directors.map((d, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
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
                      sx={{
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        mb: 1,
                      }}
                    >
                      Staff Present
                    </Typography>
                    {meeting.staff?.length === 0 || !meeting.staff ? (
                      <Typography
                        level="body-xs"
                        sx={{ color: "text.tertiary" }}
                      >
                        None
                      </Typography>
                    ) : (
                      meeting.staff.map((s, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
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

                {/* Agenda */}
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
                      mb: 0.5,
                    }}
                  >
                    Agenda
                  </Typography>
                  <Typography level="body-sm">
                    {meeting.agenda || "—"}
                  </Typography>

                  {/* Agenda Points */}
                  {meeting.agendaPoints?.length > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      {meeting.agendaPoints.map((point, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
                            mb: 0.8,
                          }}
                        >
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              backgroundColor: "#e65100",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              mt: 0.1,
                            }}
                          >
                            <Typography
                              sx={{
                                color: "#fff",
                                fontSize: "0.65rem",
                                fontWeight: 700,
                              }}
                            >
                              {i + 1}
                            </Typography>
                          </Box>
                          <Typography level="body-sm" sx={{ mt: 0.2 }}>
                            {point}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Minutes of Meeting */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    backgroundColor: "#fafafa",
                    border: "1px solid #e0e0e0",
                    mb: 2,
                  }}
                >
                  <Typography
                    level="body-xs"
                    sx={{
                      color: "#1976d2",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    📋 Minutes of Meeting
                  </Typography>
                  {meeting.mom ? (
                    <Box
                      sx={{
                        fontSize: "0.875rem",
                        lineHeight: 1.6,
                        "& ol": { listStyleType: "decimal", pl: 3, mb: 0.5 },
                        "& ul": {
                          listStyleType: "disc !important",
                          pl: 3,
                          mb: 0.5,
                        },
                        "& ol li": { listStyleType: "decimal" },
                        "& ul li": { listStyleType: "disc !important" },
                        "& li": { mb: 0.5 },
                        "& p": { mb: 0.5 },
                      }}
                      dangerouslySetInnerHTML={{ __html: meeting.mom }}
                    />
                  ) : (
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                      No minutes recorded.
                    </Typography>
                  )}
                </Box>

                {/* Crucial Decisions */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    backgroundColor: "#fff8f0",
                    border: "1px solid #f0c080",
                    mb: 2,
                  }}
                >
                  <Typography
                    level="body-xs"
                    sx={{
                      color: "#e65100",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    ⚡ Crucial Decisions
                  </Typography>
                  {meeting.crucialDecisions ? (
                    <Box
                      sx={{
                        fontSize: "0.875rem",
                        lineHeight: 1.6,
                        "& ol": { listStyleType: "decimal", pl: 3, mb: 0.5 },
                        "& ul": {
                          listStyleType: "disc !important",
                          pl: 3,
                          mb: 0.5,
                        },
                        "& ol li": { listStyleType: "decimal" },
                        "& ul li": { listStyleType: "disc !important" },
                        "& li": { mb: 0.5 },
                        "& p": { mb: 0.5 },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: meeting.crucialDecisions,
                      }}
                    />
                  ) : (
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                      No crucial decisions recorded.
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
