import React, { useEffect, useState } from "react";
import AccessDenied from "../components/AccessDenied";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Box,
  Typography,
  Chip,
} from "@mui/joy";
import Navbar from "../components/Navbar";
import {
  PostAdd,
  Schedule,
  TableViewTwoTone,
  MeetingRoom,
  TodayOutlined,
  Groups2Outlined,
  EventAvailable,
} from "@mui/icons-material";
import axios from "axios";
import AddDirectorMeetingRecords from "../components/AddDirectorMeetingRecords";
import ViewPastMeetings from "../components/ViewPastMeetings";
import MeetingScheduler from "../components/MeetingScheduler";

const todayDisplay = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const DirectorMeetings = () => {
  const [accessDenied, setAccessDenied] = useState(false);
  const [meetingData, setMeetingData] = useState([]);
  const [loadingMeeting, setLoadingMeeting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [scheduleNextMeeting, setScheduleNextMeeting] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastStatus, setToastStatus] = useState("");

  // ── NEW: Scheduled next meeting state ────────────────────────────────────
  const [scheduledMeeting, setScheduledMeeting] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const designation = sessionStorage.getItem("designation") || "";
    if (!designation.toUpperCase().includes("DIRECTOR")) setAccessDenied(true);
    // axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
  }, []);

  useEffect(() => {
    setLoadingMeeting(true);
    axios
      .get("/getDirectorMeetings")
      .then((res) => {
        if (res.status === 200) setMeetingData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoadingMeeting(false));
  }, []);

  // ── NEW: Fetch the scheduled next meeting ─────────────────────────────────
  useEffect(() => {
    axios
      .get("/getScheduledNextMeetingData")
      .then((res) => {
        if (res.status === 200 && res.data) setScheduledMeeting(res.data);
      })
      .catch(console.error);
  }, []);

  const handleSchedule = (payload) => {
    setToast(true);
    if (payload.success) {
      setToastMsg("Meeting Has Been Scheduled.");
      setToastStatus("success");
    } else {
      setToastMsg("Something Went Wrong. Please Check the Console.");
      setToastStatus("danger");
    }
  };

  // ── Helper: format scheduled date nicely ─────────────────────────────────
  const formattedScheduledDate = scheduledMeeting?.scheduledDate
    ? new Date(scheduledMeeting.scheduledDate + "T00:00:00").toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      )
    : null;

  // ── Helper: how many days away is the next meeting? ──────────────────────
  const daysUntilMeeting = (() => {
    if (!scheduledMeeting?.scheduledDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(scheduledMeeting.scheduledDate + "T00:00:00");
    const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  })();

  return (
    <div className="min-h-screen bg-[#f5f6ff] w-screen min-w-full">
      <Navbar />

      {/* ── Hero Header ── */}
      <div
        className="relative overflow-hidden px-6 md:px-12 pt-10 pb-14"
        style={{
          background:
            "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-20 bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute top-6 left-6 w-24 h-24 rounded-full bg-white/[0.04] pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-white/15 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Groups2Outlined sx={{ fontSize: 14 }} />
            Director Portal
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <MeetingRoom sx={{ color: "#fff", fontSize: 26 }} />
                </div>
                <Typography
                  level="h2"
                  sx={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: { xs: "1.7rem", md: "2.2rem" },
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                  }}
                >
                  Director Meetings
                </Typography>
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-sm mt-1 ml-0.5">
                <TodayOutlined sx={{ fontSize: 15 }} />
                {todayDisplay}
              </div>
            </div>

            <Button
              size="md"
              startDecorator={<Schedule sx={{ fontSize: 18 }} />}
              onClick={() => {
                setActiveTab(1);
                setScheduleNextMeeting(true);
              }}
              sx={{
                bgcolor: "rgba(255,255,255,0.18)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)",
                fontWeight: 700,
                fontSize: "0.85rem",
                borderRadius: "12px",
                backdropFilter: "blur(8px)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.28)",
                  border: "1px solid rgba(255,255,255,0.4)",
                },
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                alignSelf: "flex-start",
              }}
            >
              Schedule Next Meeting
            </Button>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2 rounded-xl">
              <span className="text-2xl font-extrabold text-white tabular-nums">
                {meetingData.length}
              </span>
              <span className="text-white/60 text-xs font-medium leading-tight">
                Total
                <br />
                Meetings
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2 rounded-xl">
              <span className="text-2xl font-extrabold text-white tabular-nums">
                {new Date().getFullYear()}
              </span>
              <span className="text-white/60 text-xs font-medium leading-tight">
                Current
                <br />
                Year
              </span>
            </div>
          </div>

          {/* ── NEW: Scheduled Next Meeting Banner ──────────────────────── */}
          {scheduledMeeting?.scheduledDate && (
            <div
              className="inline-flex items-center gap-3 mt-4 px-4 py-2.5 rounded-xl border"
              style={{
                background: "rgba(99,179,237,0.12)",
                borderColor: "rgba(99,179,237,0.35)",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(99,179,237,0.25)" }}
              >
                <EventAvailable sx={{ color: "#93c5fd", fontSize: 17 }} />
              </div>

              {/* Label + Date */}
              <div className="flex flex-col leading-tight">
                <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">
                  Next Scheduled Meeting
                </span>
                <span className="text-white font-bold text-sm">
                  {formattedScheduledDate}
                </span>
              </div>

              {/* Days pill */}
              {daysUntilMeeting !== null && (
                <div
                  className="px-2.5 py-1 rounded-lg text-xs font-bold shrink-0"
                  style={{
                    background:
                      daysUntilMeeting === 0
                        ? "rgba(16,185,129,0.25)"
                        : daysUntilMeeting < 0
                          ? "rgba(239,68,68,0.2)"
                          : "rgba(251,191,36,0.2)",
                    color:
                      daysUntilMeeting === 0
                        ? "#6ee7b7"
                        : daysUntilMeeting < 0
                          ? "#fca5a5"
                          : "#fde68a",
                    border:
                      daysUntilMeeting === 0
                        ? "1px solid rgba(16,185,129,0.35)"
                        : daysUntilMeeting < 0
                          ? "1px solid rgba(239,68,68,0.3)"
                          : "1px solid rgba(251,191,36,0.3)",
                  }}
                >
                  {daysUntilMeeting === 0
                    ? "Today!"
                    : daysUntilMeeting < 0
                      ? `${Math.abs(daysUntilMeeting)}d ago`
                      : `in ${daysUntilMeeting}d`}
                </div>
              )}

              {/* Agenda preview */}
              {scheduledMeeting.agenda && (
                <>
                  <div className="w-px h-6 bg-white/20 shrink-0" />
                  <span
                    className="text-white/50 text-xs italic truncate max-w-[180px]"
                    title={scheduledMeeting.agenda}
                  >
                    {scheduledMeeting.agenda}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Tab Card — overlaps the hero ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-6 pb-12">
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: "16px",
            border: "1px solid #e8eaff",
            boxShadow: "0 8px 40px rgba(99,102,241,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Tab bar */}
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              bgcolor: "transparent",
              "& .MuiTabList-root": {
                bgcolor: "#f5f6ff",
                borderBottom: "1px solid #e8eaff",
              },
            }}
          >
            <TabList
              disableUnderline
              sx={{
                px: 2,
                pt: 1.5,
                gap: 1,
                bgcolor: "#f5f6ff",
                borderBottom: "1px solid #e8eaff",
                "& .MuiTab-root": {
                  borderRadius: "10px 10px 0 0",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: "text.secondary",
                  gap: 0.75,
                  py: 1.25,
                  px: 2,
                  transition: "all 0.15s ease",
                  "&.Mui-selected": {
                    bgcolor: "#fff",
                    color: "#6366f1",
                    fontWeight: 700,
                    boxShadow: "0 -2px 0 0 #6366f1 inset",
                  },
                  "&:hover:not(.Mui-selected)": {
                    bgcolor: "rgba(99,102,241,0.06)",
                    color: "#6366f1",
                  },
                },
              }}
            >
              <Tab value={0} disableIndicator>
                <TableViewTwoTone sx={{ fontSize: 18 }} />
                View Past Meeting Records
                {meetingData.length > 0 && (
                  <Chip
                    size="sm"
                    sx={{
                      ml: 0.5,
                      bgcolor: "#eef0fe",
                      color: "#6366f1",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      height: 18,
                      minHeight: 18,
                    }}
                  >
                    {meetingData.length}
                  </Chip>
                )}
              </Tab>
              <Tab value={1} disableIndicator>
                <PostAdd sx={{ fontSize: 18 }} />
                Add Meeting Record
              </Tab>
            </TabList>

            <TabPanel value={0} sx={{ p: 0 }}>
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <ViewPastMeetings
                  meetingData={meetingData}
                  isLoading={loadingMeeting}
                />
              </Box>
            </TabPanel>

            <TabPanel value={1} sx={{ p: 0 }}>
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <AddDirectorMeetingRecords
                  meetingData={meetingData}
                  nextMeetingDate={scheduledMeeting?.scheduledDate}
                  scheduledAgendaPoints={
                    scheduledMeeting?.agendaPoints
                      ? (() => {
                          try {
                            const raw = scheduledMeeting.agendaPoints;
                            const parsed =
                              typeof raw === "string" ? JSON.parse(raw) : raw;
                            return parsed.map((p) =>
                              typeof p === "string"
                                ? p
                                : (p.title ?? p.label ?? ""),
                            );
                          } catch {
                            return [];
                          }
                        })()
                      : []
                  }
                />
              </Box>
            </TabPanel>
          </Tabs>
        </Box>
      </div>

      <AccessDenied
        open={accessDenied}
        onClose={() => {
          setAccessDenied(false);
          navigate("/dashboard");
        }}
        location="Director Meetings"
      />
      <MeetingScheduler
        open={scheduleNextMeeting}
        onClose={() => setScheduleNextMeeting(false)}
        onSave={(payload) => handleSchedule(payload)}
      />
    </div>
  );
};

export default DirectorMeetings;
