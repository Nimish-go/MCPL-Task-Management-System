import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  Box,
  Typography,
  Button,
  Input,
  Select,
  Option,
  Textarea,
  FormControl,
  FormLabel,
  Chip,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Card,
  CardContent,
  Divider,
  IconButton,
  Modal,
  ModalDialog,
  ModalClose,
  Table,
  Skeleton,
  Autocomplete,
} from "@mui/joy";
import {
  BeachAccess,
  LocalHospital,
  AccessTime,
  EventAvailable,
  CalendarToday,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Info,
  Send,
  Refresh,
  AdminPanelSettings,
  PersonOutline,
  ChevronRight,
  Warning,
  CalendarMonth,
  HistoryToggleOff,
  AccountBalance,
  TaskAlt,
  CrisisAlert,
  MoreTime,
  WorkHistory,
  Brightness6,
} from "@mui/icons-material";
import axios from "axios";
import {
  LEAVE_TYPES,
  LEAVE_STATUSES,
  LEAVE_RULES,
  countWorkingDays,
  passesAdvanceNotice,
  getApprovalFlow,
  fmtDate,
  OT_RULES,
  daysUntilNextCredit,
} from "../hooks/leaveUtils";
import Toast from "../components/Toast";

// ─── Shared label sx ──────────────────────────────────────────────────────
const labelSx = {
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "text.secondary",
  mb: 0.5,
};

// ─── Section divider ──────────────────────────────────────────────────────
const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-2 my-3">
    <span className="text-[0.65rem] font-extrabold tracking-widest uppercase text-indigo-400 whitespace-nowrap">
      {label}
    </span>
    <hr className="flex-1 border-t border-indigo-100" />
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = LEAVE_STATUSES[status] ?? {
    label: status,
    color: "neutral",
    dot: "#94a3b8",
  };
  return (
    <Chip
      size="sm"
      color={cfg.color}
      variant="soft"
      sx={{ fontWeight: 700, fontSize: "0.7rem" }}
      startDecorator={
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: cfg.dot,
            display: "inline-block",
          }}
        />
      }
    >
      {cfg.label}
    </Chip>
  );
};

// ─── Leave type badge ─────────────────────────────────────────────────────
const LeaveTypeBadge = ({ type }) => {
  const cfg = LEAVE_TYPES.find((t) => t.value === type) ?? {
    label: type,
    bg: "#f5f5f5",
    border: "#e0e0e0",
    text: "#424242",
  };
  return (
    <span
      className="inline-flex items-center gap-1 text-[0.72rem] font-bold px-2 py-0.5 rounded-lg border"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
};

// ─── Balance card ─────────────────────────────────────────────────────────
const BalanceCard = ({ icon, label, available, total, color, bg, border }) => (
  <div
    className="flex items-center gap-3 p-4 rounded-2xl border"
    style={{ background: bg, borderColor: border }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: color + "22" }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 22, color } })}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className="text-[0.7rem] font-bold uppercase tracking-wider mb-0.5"
        style={{ color }}
      >
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span
          className="text-2xl font-extrabold tabular-nums"
          style={{ color }}
        >
          {available}
        </span>
        <span className="text-xs font-medium" style={{ color: color + "99" }}>
          / {total} remaining
        </span>
      </div>
    </div>
    {/* Mini bar */}
    <div className="w-16 h-1.5 rounded-full bg-black/10 overflow-hidden shrink-0">
      <div
        className="h-full rounded-full"
        style={{
          background: color,
          width: `${Math.min(100, (available / total) * 100)}%`,
        }}
      />
    </div>
  </div>
);

// ─── Apply Leave Form ─────────────────────────────────────────────────────
const ApplyLeaveForm = ({ balance, onSuccess }) => {
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [compDate, setCompDate] = useState("");
  const [compHours, setCompHours] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState("");
  const [halfDayDate, setHalfDayDate] = useState("");
  const [halfDaySession, setHalfDaySession] = useState(""); // "first" | "second"
  const isHalfDay = leaveType === "halfDay";

  const today = new Date().toISOString().split("T")[0];
  const days = countWorkingDays(fromDate, toDate);
  const flow = leaveType ? getApprovalFlow(days, leaveType) : [];
  const advOk = fromDate ? passesAdvanceNotice(fromDate, days) : true;
  const isCompOff = leaveType === "comp_off";

  const [otLogs, setOtLogs] = useState([]);
  const [selectedOtLog, setSelectedOtLog] = useState(null);

  // Load OT logs for the comp off picker
  useEffect(() => {
    const empName = sessionStorage.getItem("empName");
    axios
      .get("/get_overtime_logs", { params: { empName, status: "approved" } })
      .then((res) => {
        if (res.status === 200) setOtLogs(res.data);
      })
      .catch(console.error);
  }, []);

  // Reset OT log selection when leave type changes away from comp_off
  useEffect(() => {
    if (leaveType !== "comp_off") {
      setSelectedOtLog(null);
      setCompDate("");
      setCompHours("");
    }
  }, [leaveType]);

  useEffect(() => {
    if (!fromDate || !leaveType) {
      setWarning("");
      return;
    }
    if (days > LEAVE_RULES.LONG_LEAVE_THRESHOLD && !advOk) {
      setWarning(
        `Leaves > ${LEAVE_RULES.LONG_LEAVE_THRESHOLD} days require at least ${LEAVE_RULES.ADVANCE_NOTICE_DAYS} days advance notice. This will be auto-rejected.`,
      );
    } else if (leaveType === "sick" && days > 1) {
      setWarning(
        "Sick leave is 1 day per application. Please split into separate applications.",
      );
    } else {
      setWarning("");
    }
  }, [fromDate, toDate, leaveType, days, advOk]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveType || !reason) return;
    if (!isCompOff && (!fromDate || !toDate)) return;
    if (isCompOff && (!compDate || !compHours)) return;

    if (days > LEAVE_RULES.LONG_LEAVE_THRESHOLD && !advOk) {
      return; // blocked by auto-reject rule
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("empName", sessionStorage.getItem("empName") || "");
      fd.append("empId", sessionStorage.getItem("empId") || "");
      fd.append("leaveType", leaveType);
      fd.append("fromDate", isCompOff ? compDate : fromDate);
      fd.append("toDate", isCompOff ? compDate : toDate);
      fd.append("days", isCompOff ? 1 : days);
      fd.append("reason", reason);
      fd.append("compDate", isCompOff ? compDate : "");
      fd.append("compHours", isCompOff ? compHours : "");
      fd.append(
        "autoReject",
        !advOk && days > LEAVE_RULES.LONG_LEAVE_THRESHOLD ? true : false,
      );
      await axios.post("/applyForLeave", fd);
      onSuccess("Leave application submitted successfully.");
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setReason("");
      setCompDate("");
      setCompHours("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <SectionDivider label="Leave Type" />

      {/* Type picker */}
      <div className="flex flex-row items-center text-center justify-center sm:grid-cols-4 gap-3 mb-4">
        {LEAVE_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setLeaveType(t.value)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center"
            style={{
              background: leaveType === t.value ? t.bg : "#fff",
              borderColor: leaveType === t.value ? t.text : "#e8eaff",
              color: leaveType === t.value ? t.text : "#64748b",
              boxShadow:
                leaveType === t.value ? `0 4px 14px ${t.text}22` : "none",
              fontWeight: leaveType === t.value ? 700 : 500,
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            {t.value === "normal" && <BeachAccess sx={{ fontSize: 22 }} />}
            {t.value === "sick" && <LocalHospital sx={{ fontSize: 22 }} />}
            {t.value === "comp_off" && <AccessTime sx={{ fontSize: 22 }} />}
            {t.value === "casual" && <EventAvailable sx={{ fontSize: 22 }} />}
            {t.value === "emergency" && <CrisisAlert sx={{ fontSize: 22 }} />}
            {t.value === "halfDay" && <Brightness6 sx={{ fontSize: 22 }} />}
            {t.label}
          </button>
        ))}
      </div>

      {leaveType && (
        <>
          {/* Warning banner */}
          {warning && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
              <Warning
                sx={{ fontSize: 18, color: "#d97706", flexShrink: 0, mt: 0.2 }}
              />
              <p className="text-xs font-semibold text-amber-700 leading-relaxed">
                {warning}
              </p>
            </div>
          )}

          {/* Approval flow info */}
          {flow.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-4">
              <Info sx={{ fontSize: 16, color: "#1976d2" }} />
              <p className="text-xs font-semibold text-blue-700">
                Approval flow:{" "}
                {flow.map((f, i) => (
                  <span key={f}>
                    {f}
                    {i < flow.length - 1 ? " → " : ""}
                  </span>
                ))}
              </p>
            </div>
          )}

          <SectionDivider
            label={
              isCompOff
                ? "Comp Off Details"
                : isHalfDay
                  ? "Half Day Details"
                  : "Date Range"
            }
          />

          {isCompOff ? (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormControl required>
                <FormLabel sx={labelSx}>
                  Date Worked (Holiday/Weekend)
                </FormLabel>
                {/* ↓ Changed: Autocomplete from OT logs instead of free date input */}
                <Autocomplete
                  placeholder="Pick from your OT logs…"
                  options={otLogs}
                  getOptionLabel={(opt) =>
                    `${fmtDate(opt.date)} — ${opt.hours}h — ${opt.project_code}`
                  }
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  value={selectedOtLog}
                  onChange={(_, v) => {
                    setSelectedOtLog(v);
                    setCompDate(v?.date ?? "");
                    setCompHours(v?.hours ?? "");
                  }}
                  sx={{ borderRadius: "8px" }}
                  noOptionsText="No overtime logs found. Log overtime first."
                />
                {selectedOtLog && (
                  <Typography
                    level="body-xs"
                    sx={{ mt: 0.5, color: "text.tertiary" }}
                  >
                    {new Date(
                      selectedOtLog.date + "T00:00:00",
                    ).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Typography>
                )}
              </FormControl>
              <FormControl>
                <FormLabel sx={labelSx}>Hours (auto-filled)</FormLabel>
                <Input
                  value={compHours ? `${compHours} hours` : "—"}
                  disabled
                  sx={{ borderRadius: "8px", bgcolor: "#f8f9ff" }}
                />
              </FormControl>
            </div>
          ) : isHalfDay ? (
            <>
              {/* Date + Session picker */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <FormControl required>
                  <FormLabel sx={labelSx}>Date</FormLabel>
                  <Input
                    type="date"
                    value={halfDayDate}
                    onChange={(e) => setHalfDayDate(e.target.value)}
                    slotProps={{ input: { min: today } }}
                    sx={{ borderRadius: "8px" }}
                  />
                  {halfDayDate && (
                    <Typography
                      level="body-xs"
                      sx={{ mt: 0.5, color: "text.tertiary" }}
                    >
                      {new Date(halfDayDate + "T00:00:00").toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        },
                      )}
                    </Typography>
                  )}
                </FormControl>

                <FormControl required>
                  <FormLabel sx={labelSx}>Session</FormLabel>
                  <Select
                    placeholder="Select session…"
                    value={halfDaySession}
                    onChange={(_, v) => setHalfDaySession(v)}
                    sx={{ borderRadius: "8px" }}
                  >
                    <Option value="first">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#f59e0b",
                          }}
                        />
                        First Half (Morning)
                      </Box>
                    </Option>
                    <Option value="second">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#6366f1",
                          }}
                        />
                        Second Half (Afternoon)
                      </Box>
                    </Option>
                  </Select>
                </FormControl>
              </div>

              {/* Session info banner */}
              {halfDaySession && (
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 border"
                  style={{
                    background:
                      halfDaySession === "first" ? "#fffbeb" : "#eef2ff",
                    borderColor:
                      halfDaySession === "first" ? "#fcd34d" : "#c7d2fe",
                  }}
                >
                  <Brightness6
                    sx={{
                      fontSize: 18,
                      color: halfDaySession === "first" ? "#d97706" : "#4f46e5",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p
                      className="text-xs font-bold mb-0.5"
                      style={{
                        color:
                          halfDaySession === "first" ? "#92400e" : "#3730a3",
                      }}
                    >
                      {halfDaySession === "first"
                        ? "Morning Session — 9:00 AM to 1:00 PM"
                        : "Afternoon Session — 2:00 PM to 6:00 PM"}
                    </p>
                    <p
                      className="text-[0.7rem]"
                      style={{
                        color:
                          halfDaySession === "first" ? "#b45309" : "#4338ca",
                      }}
                    >
                      0.5 days will be deducted from your leave balance on
                      approval
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormControl required>
                <FormLabel sx={labelSx}>From Date</FormLabel>
                <Input
                  type="date"
                  value={fromDate}
                  slotProps={{ input: { min: today } }}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    if (!toDate) setToDate(e.target.value);
                  }}
                  sx={{ borderRadius: "8px" }}
                />
              </FormControl>
              <FormControl required>
                <FormLabel sx={labelSx}>To Date</FormLabel>
                <Input
                  type="date"
                  value={toDate}
                  slotProps={{ input: { min: fromDate || today } }}
                  onChange={(e) => setToDate(e.target.value)}
                  sx={{ borderRadius: "8px" }}
                />
              </FormControl>
            </div>
          )}

          {/* Days summary */}
          {!isCompOff && fromDate && toDate && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2">
                <CalendarToday sx={{ fontSize: 15, color: "#4f46e5" }} />
                <span className="text-sm font-bold text-indigo-700">
                  {days} working day{days !== 1 ? "s" : ""}
                </span>
              </div>
              {days > LEAVE_RULES.LONG_LEAVE_THRESHOLD && (
                <Chip
                  size="sm"
                  color="warning"
                  variant="soft"
                  sx={{ fontWeight: 700 }}
                >
                  2-level approval required
                </Chip>
              )}
            </div>
          )}

          {isCompOff && compDate && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                <AccessTime sx={{ fontSize: 15, color: "#2e7d32" }} />
                <span className="text-sm font-bold text-green-700">
                  1 comp off day will be credited on approval
                </span>
              </div>
            </div>
          )}

          <SectionDivider label="Reason" />

          <FormControl required sx={{ mb: 4 }}>
            <FormLabel sx={labelSx}>Reason for Leave *</FormLabel>
            <Textarea
              placeholder="Please provide a brief reason for your leave…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minRows={3}
              sx={{
                borderRadius: "8px",
                "--Textarea-focusedThickness": "1.5px",
              }}
            />
          </FormControl>

          <Button
            fullWidth
            size="md"
            loading={submitting}
            disabled={
              (!isCompOff && (!fromDate || !toDate)) ||
              (isCompOff && (!compDate || !compHours)) ||
              !reason ||
              (days > LEAVE_RULES.LONG_LEAVE_THRESHOLD && !advOk)
            }
            startDecorator={!submitting && <Send sx={{ fontSize: 18 }} />}
            onClick={handleSubmit}
            sx={{
              background:
                "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
              color: "#fff",
              fontWeight: 700,
              height: 44,
              borderRadius: "10px",
              boxShadow: "0 4px 14px rgba(21,101,192,0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #0a1228 0%, #0d47a1 100%)",
              },
            }}
          >
            {submitting ? "Submitting…" : "Submit Leave Application"}
          </Button>
        </>
      )}
    </Box>
  );
};

// ─── My Leaves Tab ─────────────────────────────────────────────────────────
const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const empId = sessionStorage.getItem("empId");
    axios
      .get("/get_my_leaves", { params: { empId } })
      .then((res) => {
        if (res.status === 200) setLeaves(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const thStyle = {
    padding: "10px 14px",
    textAlign: "left",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 700,
    fontSize: "0.68rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    borderRight: "1px solid rgba(255,255,255,0.1)",
  };
  const tdStyle = {
    padding: "10px 14px",
    fontSize: "0.8rem",
    color: "#1e293b",
    borderBottom: "1px solid #f0f2f8",
    verticalAlign: "middle",
  };

  return (
    <Box>
      <Box
        sx={{
          borderRadius: "14px",
          border: "1px solid #e8ecf4",
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        }}
      >
        <div className="overflow-x-auto">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              minWidth: 680,
            }}
          >
            <colgroup>
              <col style={{ width: 48 }} />
              <col style={{ width: 110 }} />
              <col />
              <col style={{ width: 100 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 80 }} />
            </colgroup>
            <thead>
              <tr
                style={{
                  background:
                    "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
                }}
              >
                {[
                  "#",
                  "Type",
                  "Reason",
                  "From",
                  "To",
                  "Days",
                  "Status",
                  "Detail",
                ].map((h, i, arr) => (
                  <th
                    key={h}
                    style={{
                      ...thStyle,
                      borderRight:
                        i < arr.length - 1 ? thStyle.borderRight : "none",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff",
                    }}
                  >
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} style={tdStyle}>
                        <Skeleton
                          variant="text"
                          animation="wave"
                          height={16}
                          sx={{ borderRadius: "4px" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leaves.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      padding: "48px 16px",
                    }}
                  >
                    <BeachAccess
                      sx={{
                        fontSize: 36,
                        color: "#c7caed",
                        display: "block",
                        margin: "0 auto 8px",
                      }}
                    />
                    <Typography
                      sx={{
                        color: "#94a3b8",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      No leave applications yet
                    </Typography>
                  </td>
                </tr>
              ) : (
                leaves.map((leave, i) => (
                  <tr
                    key={leave.id}
                    style={{
                      backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f0f4ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        i % 2 === 0 ? "#fff" : "#fafbff")
                    }
                  >
                    <td style={tdStyle}>
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
                        <span className="text-[0.68rem] font-bold text-indigo-500">
                          {i + 1}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <LeaveTypeBadge type={leave.leave_type} />
                    </td>
                    <td style={{ ...tdStyle, color: "#475569" }}>
                      {leave.reason?.split(" ").slice(0, 5).join(" ")}
                      {leave.reason?.split(" ").length > 5 ? "…" : ""}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        fontSize: "0.75rem",
                        color: "#475569",
                      }}
                    >
                      {fmtDate(leave.from_date)}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        fontSize: "0.75rem",
                        color: "#475569",
                      }}
                    >
                      {fmtDate(leave.to_date)}
                    </td>
                    <td style={tdStyle}>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                        {leave.days}d
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={leave.status} />
                    </td>
                    <td style={tdStyle}>
                      <IconButton
                        size="sm"
                        variant="soft"
                        color="primary"
                        onClick={() => setSelected(leave)}
                        sx={{ borderRadius: "8px" }}
                      >
                        <Info sx={{ fontSize: 16 }} />
                      </IconButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Box>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        <ModalDialog
          sx={{
            borderRadius: "16px",
            p: 0,
            overflow: "hidden",
            maxWidth: 440,
            width: "92vw",
            border: "1px solid #e8eaff",
          }}
        >
          <div
            className="px-5 py-4 border-b border-indigo-50 flex items-center justify-between"
            style={{
              background:
                "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
            }}
          >
            <Typography
              level="title-md"
              sx={{ color: "#fff", fontWeight: 800 }}
            >
              Leave Details
            </Typography>
            <ModalClose
              sx={{
                color: "rgba(255,255,255,0.8)",
                position: "static",
                "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.15)" },
              }}
            />
          </div>
          {selected && (
            <Box sx={{ p: 3 }}>
              {[
                ["Leave Type", <LeaveTypeBadge type={selected.leave_type} />],
                ["Status", <StatusBadge status={selected.status} />],
                ["From", fmtDate(selected.from_date)],
                ["To", fmtDate(selected.to_date)],
                ["Days", `${selected.days} working day(s)`],
                ["Reason", selected.reason],
                ["Applied On", fmtDate(selected.applied_on)],
                ["Manager", selected.manager_status ?? "—"],
                ["Director", selected.director_status ?? "—"],
                ["Remarks", selected.rejection_reason ?? "—"],
              ].map(([k, v]) => (
                <Box
                  key={k}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    py: 1.2,
                    borderBottom: "1px solid #f0f2f8",
                    gap: 2,
                  }}
                >
                  <Typography
                    level="body-xs"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      flexShrink: 0,
                    }}
                  >
                    {k}
                  </Typography>
                  <Typography
                    level="body-sm"
                    sx={{ textAlign: "right", color: "#1e293b" }}
                  >
                    {v}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </ModalDialog>
      </Modal>
    </Box>
  );
};

// ─── Admin Approval Panel ──────────────────────────────────────────────────
const AdminPanel = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing] = useState(false);

  const role = sessionStorage.getItem("role") || "";
  const designation = sessionStorage.getItem("designation") || "";
  const isDirector = designation.toUpperCase().includes("DIRECTOR");
  const approvalLevel = isDirector ? "director" : "manager";

  const fetchPending = () => {
    setLoading(true);
    axios
      .get("/get_pending_leaves", { params: { level: approvalLevel } })
      .then((res) => {
        if (res.status === 200) setPending(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    setActing(true);
    try {
      const fd = new FormData();
      fd.append("leaveId", id);
      fd.append("action", action); // "approve" | "reject"
      fd.append("level", approvalLevel);
      fd.append("rejectReason", rejectReason);
      fd.append("approverName", sessionStorage.getItem("empName") || "");
      await axios.post("/action_leave", fd);
      setActionId(null);
      setActionType("");
      setRejectReason("");
      fetchPending();
    } catch (err) {
      console.error(err);
    } finally {
      setActing(false);
    }
  };

  const thStyle = {
    padding: "10px 14px",
    textAlign: "left",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 700,
    fontSize: "0.68rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    borderRight: "1px solid rgba(255,255,255,0.1)",
  };
  const tdStyle = {
    padding: "10px 14px",
    fontSize: "0.8rem",
    color: "#1e293b",
    borderBottom: "1px solid #f0f2f8",
    verticalAlign: "middle",
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <div>
          <SectionDivider
            label={`Pending Approvals · ${isDirector ? "Director Level" : "Manager Level"}`}
          />
          <Typography level="body-xs" sx={{ color: "text.secondary", mt: -1 }}>
            {pending.length} application{pending.length !== 1 ? "s" : ""}{" "}
            awaiting your action
          </Typography>
        </div>
        <IconButton
          variant="outlined"
          size="sm"
          onClick={fetchPending}
          sx={{ borderRadius: "8px" }}
        >
          <Refresh sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Box
        sx={{
          borderRadius: "14px",
          border: "1px solid #e8ecf4",
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        }}
      >
        <div className="overflow-x-auto">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              minWidth: 720,
            }}
          >
            <colgroup>
              <col style={{ width: 48 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 110 }} />
              <col />
              <col style={{ width: 95 }} />
              <col style={{ width: 95 }} />
              <col style={{ width: 60 }} />
              <col style={{ width: 140 }} />
            </colgroup>
            <thead>
              <tr
                style={{
                  background:
                    "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
                }}
              >
                {[
                  "#",
                  "Employee",
                  "Type",
                  "Reason",
                  "From",
                  "To",
                  "Days",
                  "Action",
                ].map((h, i, arr) => (
                  <th
                    key={h}
                    style={{
                      ...thStyle,
                      borderRight:
                        i < arr.length - 1 ? thStyle.borderRight : "none",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff",
                    }}
                  >
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} style={tdStyle}>
                        <Skeleton
                          variant="text"
                          animation="wave"
                          height={16}
                          sx={{ borderRadius: "4px" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pending.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      padding: "48px 16px",
                    }}
                  >
                    <TaskAlt
                      sx={{
                        fontSize: 36,
                        color: "#c7caed",
                        display: "block",
                        margin: "0 auto 8px",
                      }}
                    />
                    <Typography
                      sx={{
                        color: "#94a3b8",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      All caught up! No pending approvals.
                    </Typography>
                  </td>
                </tr>
              ) : (
                pending.map((leave, i) => (
                  <tr
                    key={leave.id}
                    style={{
                      backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f0f4ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        i % 2 === 0 ? "#fff" : "#fafbff")
                    }
                  >
                    <td style={tdStyle}>
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
                        <span className="text-[0.68rem] font-bold text-indigo-500">
                          {i + 1}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
                          <span className="text-white text-[0.65rem] font-bold">
                            {leave.emp_name?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-[0.82rem] font-semibold text-slate-700 truncate">
                          {leave.emp_name}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <LeaveTypeBadge type={leave.leave_type} />
                    </td>
                    <td style={{ ...tdStyle, color: "#475569" }}>
                      {leave.reason?.split(" ").slice(0, 4).join(" ")}
                      {leave.reason?.split(" ").length > 4 ? "…" : ""}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        fontSize: "0.75rem",
                        color: "#475569",
                      }}
                    >
                      {fmtDate(leave.from_date)}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        fontSize: "0.75rem",
                        color: "#475569",
                      }}
                    >
                      {fmtDate(leave.to_date)}
                    </td>
                    <td style={tdStyle}>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                        {leave.days}d
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          color="success"
                          variant="soft"
                          onClick={() => handleAction(leave.id, "approve")}
                          sx={{
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            minWidth: 0,
                            px: 1.5,
                          }}
                        >
                          ✓ Approve
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="soft"
                          onClick={() => {
                            setActionId(leave.id);
                            setActionType("reject");
                          }}
                          sx={{
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            minWidth: 0,
                            px: 1.5,
                          }}
                        >
                          ✗ Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Box>

      {/* Reject reason modal */}
      <Modal
        open={actionType === "reject" && !!actionId}
        onClose={() => {
          setActionId(null);
          setActionType("");
          setRejectReason("");
        }}
      >
        <ModalDialog
          sx={{
            borderRadius: "16px",
            p: 0,
            overflow: "hidden",
            maxWidth: 420,
            width: "92vw",
            border: "1px solid #e8eaff",
          }}
        >
          <div
            className="px-5 py-4 border-b border-indigo-50"
            style={{
              background:
                "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
            }}
          >
            <Typography
              level="title-md"
              sx={{ color: "#fff", fontWeight: 800 }}
            >
              Reject Leave
            </Typography>
          </div>
          <Box sx={{ p: 3 }}>
            <FormControl sx={{ mb: 3 }}>
              <FormLabel sx={labelSx}>Reason for Rejection *</FormLabel>
              <Textarea
                placeholder="Please provide a reason…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                minRows={3}
                sx={{ borderRadius: "8px" }}
              />
            </FormControl>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outlined"
                color="neutral"
                size="sm"
                onClick={() => {
                  setActionId(null);
                  setActionType("");
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                color="danger"
                loading={acting}
                disabled={!rejectReason.trim()}
                onClick={() => handleAction(actionId, "reject")}
                sx={{ fontWeight: 700 }}
              >
                Confirm Rejection
              </Button>
            </div>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

// ─── Leave Balance Summary ─────────────────────────────────────────────────
const BalanceSummary = ({ balance }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
    <BalanceCard
      icon={<BeachAccess />}
      label="Casual Leaves"
      available={balance.normal}
      total={12}
      color="#1565c0"
      bg="#e8f0fe"
      border="#c5d8f8"
    />
    <BalanceCard
      icon={<LocalHospital />}
      label="Sick Leaves"
      available={balance.sick}
      total={1}
      color="#e65100"
      bg="#fff8e1"
      border="#ffcc80"
    />
    <BalanceCard
      icon={<AccessTime />}
      label="Comp Off"
      available={balance.comp_off}
      total={balance.comp_off + (balance.comp_used ?? 0)}
      color="#2e7d32"
      bg="#e8f5e9"
      border="#a5d6a7"
    />
    <BalanceCard
      icon={<AccountBalance />}
      label="Carry Forward"
      available={balance.carry_forward ?? 0}
      total={LEAVE_RULES.MAX_CARRY_FORWARD}
      color="#6d28d9"
      bg="#f5f3ff"
      border="#ddd6fe"
    />
  </div>
);

// ─── Rules Info Card ──────────────────────────────────────────────────────
const RulesCard = () => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: "14px",
      mb: 4,
      bgcolor: "#f8f9ff",
      border: "1px solid #e8eaff",
    }}
  >
    <CardContent>
      <div className="flex items-center gap-2 mb-3">
        <Info sx={{ fontSize: 18, color: "#4f46e5" }} />
        <Typography level="title-sm" sx={{ fontWeight: 800, color: "#0f1b35" }}>
          Leave Policy Summary
        </Typography>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
        {[
          `1 normal leave credited per month (total ${LEAVE_RULES.TOTAL_ANNUAL_NORMAL}/year)`,
          `1 sick leave per month — not carried forward`,
          `Leaves > ${LEAVE_RULES.LONG_LEAVE_THRESHOLD} days require Manager → Director approval`,
          `Leaves > ${LEAVE_RULES.LONG_LEAVE_THRESHOLD} days must be applied ${LEAVE_RULES.ADVANCE_NOTICE_DAYS} days in advance`,
          `Year-end: max ${LEAVE_RULES.MAX_CARRY_FORWARD} normal leaves carry forward — rest encashable`,
          `Comp off: min ${LEAVE_RULES.COMP_OFF_MIN_HOURS} hrs on holiday/weekend = 1 day (Manager → Director approval)`,
        ].map((rule) => (
          <div key={rule} className="flex items-start gap-2">
            <ChevronRight
              sx={{ fontSize: 14, color: "#6366f1", mt: 0.3, flexShrink: 0 }}
            />
            <span className="text-[0.78rem] text-slate-600 leading-relaxed">
              {rule}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// ─── Log Overtime ─────────────────────────────────────────────────────────
const LogOvertime = ({ onSuccess }) => {
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [projectCode, setProjectCode] = useState(null);
  const [notes, setNotes] = useState("");
  const [projects, setProjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  // Derived: what will this OT earn?
  const parsedHours = parseFloat(hours) || 0;
  const compEarned =
    parsedHours >= OT_RULES.FULL_DAY_HOURS
      ? "1 full comp off day"
      : parsedHours >= OT_RULES.MIN_HOURS_FOR_COMP
        ? "½ comp off day"
        : parsedHours > 0
          ? `Not enough hours (min ${OT_RULES.MIN_HOURS_FOR_COMP}h for comp off)`
          : "";

  const compEarnedColor =
    parsedHours >= OT_RULES.MIN_HOURS_FOR_COMP ? "#2e7d32" : "#b91c1c";

  useEffect(() => {
    axios
      .get("/get_project_data/All")
      .then((res) => {
        if (res.status === 200) setProjects(res.data);
      })
      .catch(console.error);

    const empId = sessionStorage.getItem("empId");
    axios
      .get("/get_overtime_logs", { params: { empId } })
      .then((res) => {
        if (res.status === 200) setLogs(res.data);
      })
      .catch(console.error)
      .finally(() => setLoadingLogs(false));
  }, []);

  const handleSubmit = async () => {
    if (!date || !hours || !projectCode) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("empName", sessionStorage.getItem("empName") || "");
      fd.append("date", date);
      fd.append("hours", hours);
      fd.append("projectCode", projectCode.code);
      fd.append("projectName", projectCode.name);
      fd.append("notes", notes);
      await axios.post("/log_overtime", fd).then((res) => {
        if (res.status === 200) {
          onSuccess("Overtime logged successfully.");
        }
      });
      // Refresh logs
      const empId = sessionStorage.getItem("empId");
      const res = await axios.get("/get_overtime_logs", { params: { empId } });
      if (res.status === 200) setLogs(res.data);
      setDate("");
      setHours("");
      setProjectCode(null);
      setNotes("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const thStyle = {
    padding: "9px 12px",
    textAlign: "left",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 700,
    fontSize: "0.67rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };
  const tdStyle = {
    padding: "10px 12px",
    fontSize: "0.8rem",
    color: "#1e293b",
    borderBottom: "1px solid #f0f2f8",
    verticalAlign: "middle",
  };

  return (
    <Box sx={{ maxWidth: 860, mx: "auto" }}>
      {/* ── Form Card ── */}
      <Box
        sx={{
          border: "1px solid #e8eaff",
          borderRadius: "16px",
          overflow: "hidden",
          mb: 4,
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%)",
            px: 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoreTime sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography
              sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}
            >
              Log Overtime
            </Typography>
            <Typography
              sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem" }}
            >
              Overtime on holidays or weekends earns comp off
            </Typography>
          </Box>
        </Box>

        {/* Form body */}
        <Box sx={{ p: 3 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Date */}
            <FormControl required>
              <FormLabel sx={labelSx}>Date Worked</FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                slotProps={{ input: { max: today } }}
                sx={{ borderRadius: "8px" }}
              />
              {date && (
                <Typography
                  level="body-xs"
                  sx={{ mt: 0.5, color: "text.tertiary" }}
                >
                  {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                </Typography>
              )}
            </FormControl>

            {/* Hours */}
            <FormControl required>
              <FormLabel sx={labelSx}>Hours Worked</FormLabel>
              <Select
                placeholder="Select hours…"
                value={hours}
                onChange={(_, v) => setHours(v)}
                sx={{ borderRadius: "8px" }}
              >
                {[4, 5, 6, 7, 8, 9, 10].map((h) => (
                  <Option key={h} value={String(h)}>
                    {h} hour{h !== 1 ? "s" : ""}
                    {h >= OT_RULES.FULL_DAY_HOURS
                      ? " — Full comp off"
                      : h >= OT_RULES.MIN_HOURS_FOR_COMP
                        ? " — Half comp off"
                        : ""}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Project */}
            <FormControl required>
              <FormLabel sx={labelSx}>Project</FormLabel>
              <Autocomplete
                placeholder="Select project…"
                options={projects}
                value={projectCode}
                getOptionLabel={(opt) => `${opt.code} — ${opt.name}`}
                onChange={(_, v) => setProjectCode(v)}
                sx={{ borderRadius: "8px" }}
              />
            </FormControl>
          </div>

          {/* Comp off preview banner */}
          {parsedHours > 0 && (
            <div
              className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 mb-4 border"
              style={{
                background:
                  parsedHours >= OT_RULES.MIN_HOURS_FOR_COMP
                    ? "#f0fdf4"
                    : "#fff0f0",
                borderColor:
                  parsedHours >= OT_RULES.MIN_HOURS_FOR_COMP
                    ? "#86efac"
                    : "#fca5a5",
              }}
            >
              <AccessTime
                sx={{ fontSize: 16, color: compEarnedColor, flexShrink: 0 }}
              />
              <span
                className="text-xs font-bold"
                style={{ color: compEarnedColor }}
              >
                {compEarned}
              </span>
            </div>
          )}

          {/* Notes */}
          <FormControl sx={{ mb: 4 }}>
            <FormLabel sx={labelSx}>Notes (optional)</FormLabel>
            <Textarea
              placeholder="What were you working on? Any specific tasks?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              minRows={2}
              sx={{
                borderRadius: "8px",
                "--Textarea-focusedThickness": "1.5px",
              }}
            />
          </FormControl>

          <Button
            fullWidth
            size="md"
            loading={submitting}
            disabled={!date || !hours || !projectCode}
            startDecorator={
              !submitting && <WorkHistory sx={{ fontSize: 18 }} />
            }
            onClick={handleSubmit}
            sx={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%)",
              color: "#fff",
              fontWeight: 700,
              height: 44,
              borderRadius: "10px",
              boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #12122a 0%, #6d28d9 100%)",
              },
              "&:disabled": { opacity: 0.45 },
            }}
          >
            {submitting ? "Logging…" : "Log Overtime"}
          </Button>
        </Box>
      </Box>

      {/* ── Past OT Logs table ── */}
      <SectionDivider label="My Overtime History" />
      <Box
        sx={{
          borderRadius: "14px",
          border: "1px solid #e8ecf4",
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        }}
      >
        <div className="overflow-x-auto">
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%)",
                }}
              >
                {["#", "Date", "Hours", "Project", "Comp Earned", "Status"].map(
                  (h, i, arr) => (
                    <th
                      key={h}
                      style={{
                        ...thStyle,
                        borderRight:
                          i < arr.length - 1
                            ? "1px solid rgba(255,255,255,0.1)"
                            : "none",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loadingLogs ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff",
                    }}
                  >
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={tdStyle}>
                        <Skeleton
                          variant="text"
                          animation="wave"
                          height={16}
                          sx={{ borderRadius: "4px" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      padding: "40px 16px",
                    }}
                  >
                    <MoreTime
                      sx={{
                        fontSize: 32,
                        color: "#c7caed",
                        display: "block",
                        margin: "0 auto 8px",
                      }}
                    />
                    <Typography
                      sx={{
                        color: "#94a3b8",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      No overtime logged yet
                    </Typography>
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => {
                  const h = parseFloat(log.hours) || 0;
                  const earned =
                    h >= OT_RULES.FULL_DAY_HOURS
                      ? "1 full day"
                      : h >= OT_RULES.MIN_HOURS_FOR_COMP
                        ? "½ day"
                        : "—";
                  const earnedColor =
                    h >= OT_RULES.MIN_HOURS_FOR_COMP ? "#2e7d32" : "#94a3b8";
                  return (
                    <tr
                      key={log.id ?? i}
                      style={{
                        backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f5f3ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          i % 2 === 0 ? "#fff" : "#fafbff")
                      }
                    >
                      <td style={tdStyle}>
                        <div className="w-6 h-6 rounded-full bg-violet-50 flex items-center justify-center">
                          <span className="text-[0.68rem] font-bold text-violet-500">
                            {i + 1}
                          </span>
                        </div>
                      </td>
                      <td style={tdStyle}>{fmtDate(log.date)}</td>
                      <td style={tdStyle}>
                        <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg">
                          {log.hours}h
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: "#475569" }}>
                        {log.project_code}
                      </td>
                      <td style={tdStyle}>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{
                            color: earnedColor,
                            background: earnedColor + "18",
                          }}
                        >
                          {earned}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={log.status ?? "pending_manager"} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Box>
    </Box>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
const LeaveManagement = () => {
  const [tab, setTab] = useState(0);
  const [balance, setBalance] = useState({
    normal: 0,
    sick: 0,
    comp_off: 0,
    carry_forward: 0,
  });
  const [toastMsg, setToastMsg] = useState("");
  const [toast, setToast] = useState(false);
  const [toastStatus, setToastStatus] = useState("");
  const designation = sessionStorage.getItem("designation") || "";
  const role = sessionStorage.getItem("role") || "";
  const isManager =
    role === "SuperAdmin" ||
    role === "Admin" ||
    designation.toUpperCase().includes("MANAGER") ||
    designation.toUpperCase().includes("DIRECTOR");

  const todayDisplay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    const empId = sessionStorage.getItem("empId");
    axios
      .get("/get_leave_balance", { params: { empId } })
      .then((res) => {
        if (res.status === 200) setBalance(res.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f6fb" }}>
      <Navbar />

      {/* ── Hero Header ── */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
          px: { xs: 2, sm: 3, md: 6 },
          py: { xs: 3, md: 4 },
          mb: 0,
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}
          >
            <BeachAccess
              sx={{ color: "rgba(255,255,255,0.7)", fontSize: 18 }}
            />
            <Typography
              sx={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              Leaves
            </Typography>
          </Box>
          <Typography
            level="h3"
            sx={{
              color: "#fff",
              fontWeight: 800,
              fontSize: { xs: "1.4rem", sm: "1.6rem", md: "2rem" },
              letterSpacing: "-0.02em",
              mb: 0.5,
            }}
          >
            Leave Management
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <CalendarToday
              sx={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}
            />
            <Typography
              sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem" }}
            >
              {todayDisplay}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 1.5, sm: 2, md: 4 },
          py: { xs: 2, md: 4 },
        }}
      >
        {/* Balance summary */}
        <BalanceSummary balance={balance} />

        {/* Main card */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: "20px",
            boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
            overflow: "hidden",
            border: "1px solid #e8ecf4",
          }}
        >
          {/* Section title */}
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 2.5,
              borderBottom: "1px solid #f0f2f8",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 28,
                borderRadius: "4px",
                background: "linear-gradient(180deg, #1976d2, #42a5f5)",
                flexShrink: 0,
              }}
            />
            <Typography
              level="title-lg"
              sx={{
                fontWeight: 700,
                color: "#0f1b35",
                letterSpacing: "-0.01em",
              }}
            >
              Leave Portal
            </Typography>
          </Box>

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ bgcolor: "transparent" }}
          >
            <TabList
              sx={{
                px: { xs: 1, md: 3 },
                pt: 2,
                gap: 0.5,
                bgcolor: "transparent",
                borderBottom: "2px solid #f0f2f8",
                flexWrap: "wrap",
                "& .MuiTab-root": {
                  fontWeight: 600,
                  fontSize: { xs: "0.78rem", md: "0.875rem" },
                  borderRadius: "10px 10px 0 0",
                  color: "#64748b",
                  border: "none",
                  py: 1.2,
                  px: { xs: 1.5, md: 2.5 },
                  transition: "all 0.2s ease",
                  "&:hover": { backgroundColor: "#f0f4ff", color: "#1976d2" },
                  "&.Mui-selected": {
                    color: "#1976d2",
                    backgroundColor: "#e8f0fe",
                    fontWeight: 700,
                  },
                },
              }}
            >
              <Tab value={0} disableIndicator>
                <Send sx={{ fontSize: "1rem", mr: 0.5 }} />
                Apply Leave
              </Tab>
              <Tab value={1} disableIndicator>
                <HistoryToggleOff sx={{ fontSize: "1rem", mr: 0.5 }} />
                My Leaves
              </Tab>
              {isManager && (
                <Tab value={2} disableIndicator>
                  <AdminPanelSettings sx={{ fontSize: "1rem", mr: 0.5 }} />
                  Approvals
                </Tab>
              )}

              <Tab value={3} disableIndicator>
                <MoreTime sx={{ fontSize: "1rem", mr: 0.5 }} />
                Log Overtime
              </Tab>
            </TabList>

            <TabPanel value={0} sx={{ p: { xs: 2, md: 3 } }}>
              <RulesCard />
              <ApplyLeaveForm
                balance={balance}
                onSuccess={(msg) => {
                  setToastMsg(msg);
                  setTab(1);
                }}
              />
            </TabPanel>

            <TabPanel value={1} sx={{ p: { xs: 2, md: 3 } }}>
              <MyLeaves />
            </TabPanel>

            {isManager && (
              <TabPanel value={2} sx={{ p: { xs: 2, md: 3 } }}>
                <AdminPanel />
              </TabPanel>
            )}

            <TabPanel value={3} sx={{ p: { xs: 2, md: 3 } }}>
              <LogOvertime
                onSuccess={(msg) => {
                  setToast(true);
                  setToastMsg(msg);
                  setToastStatus("success");
                }}
              />
            </TabPanel>
          </Tabs>
        </Box>
      </Box>
      <Toast open={toast} onClose={() => setToast(false)} status={toastStatus} />
    </div>
  );
};

export default LeaveManagement;
