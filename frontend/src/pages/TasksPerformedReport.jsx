import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import { Skeleton } from "@mui/material";
import axios from "axios";
import {
  Download,
  SearchOutlined,
  AssignmentOutlined,
  CalendarToday,
  PersonOutline,
  ChevronLeft,
  ChevronRight,
  FileDownloadOutlined,
} from "@mui/icons-material";
import { downloadReport } from "../hooks/downloadReport";
import Toast from "../components/Toast";

// ─── Shared label style (matches Tables section dividers) ─────────────────
const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-[0.65rem] font-extrabold tracking-widest uppercase text-indigo-400 whitespace-nowrap">
      {label}
    </span>
    <hr className="flex-1 border-t border-indigo-100" />
  </div>
);

// ─── Column header ─────────────────────────────────────────────────────────
const Th = ({ children, className = "" }) => (
  <th className={`px-3.5 py-3 text-left ${className}`}>
    <span className="text-[0.65rem] font-extrabold tracking-widest uppercase text-indigo-200 whitespace-nowrap">
      {children}
    </span>
  </th>
);

// ─── Expandable text cell ──────────────────────────────────────────────────
const ExpandCell = ({ text, expanded, onToggle, minWords = 4 }) => {
  if (!text) return <span className="text-gray-400">—</span>;
  const words = text.trim().split(/\s+/);
  const needsExpand = words.length > minWords;
  const preview = needsExpand ? words.slice(0, minWords).join(" ") + "…" : text;
  return (
    <span className="text-[0.8rem] leading-snug text-slate-700">
      {expanded ? text : preview}
      {needsExpand && (
        <button
          onClick={onToggle}
          className="ml-1 text-[0.7rem] font-bold text-indigo-500 hover:underline"
        >
          {expanded ? "Less ▲" : "More ▼"}
        </button>
      )}
    </span>
  );
};

const TasksPerformedReport = () => {
  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [toastStatus, setToastStatus] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(5);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    setEmployeeLoading(true);
    axios
      .get("/get_employee_names")
      .then((res) => {
        if (res.status === 200) setEmployees(res.data);
      })
      .catch(() => {
        setToastStatus("error");
        setToastMessage("Failed to load employees.");
        setToastShow(true);
      })
      .finally(() => setEmployeeLoading(false));
  }, []);

  const formatString = (date) => {
    const d = new Date(date);
    const day = d.getDate();
    const getOrdinal = (n) => {
      if (n > 3 && n < 21) return "th";
      return ["th", "st", "nd", "rd"][n % 10] ?? "th";
    };
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const search = (e) => {
    e.preventDefault();
    setReportLoading(true);
    setPage(0);
    axios
      .get("/getEmployeeReport", {
        params: { employeeName: selectedEmployee, from: fromDate, to: toDate },
      })
      .then((res) => {
        if (res.status === 200) {
          setReportData(res.data);
          setTitle(`${selectedEmployee}'s Report · ${fromDate} → ${toDate}`);
        }
      })
      .catch((err) => {
        const msg =
          err.response?.status === 404
            ? `No records found for ${selectedEmployee}.`
            : "Something went wrong. Check the console.";
        setToastStatus("error");
        setToastMessage(msg);
        setToastShow(true);
      })
      .finally(() => setReportLoading(false));
  };

  const download = (e) => {
    e.preventDefault();
    const pdfTitle = `Employee Report Of ${selectedEmployee} from ${formatString(fromDate)} to ${formatString(toDate)}`;
    downloadReport(reportData, "performed", pdfTitle);
  };

  const toggleExpand = (index) =>
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));

  const startIndex = page * rows;
  const paginatedData = reportData.slice(startIndex, startIndex + rows);
  const totalPages = Math.ceil(reportData.length / rows);

  const todayDisplay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f5f6ff] w-screen min-w-full">
      <Navbar />

      {/* ── Hero Header (matches Dashboard) ── */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)",
          px: { xs: 3, md: 6 },
          py: 4,
          mb: 0,
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <div className="flex items-center gap-2 mb-2">
            <AssignmentOutlined
              sx={{ color: "rgba(255,255,255,0.7)", fontSize: 20 }}
            />
            <Typography
              sx={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              Reports
            </Typography>
          </div>
          <Typography
            level="h3"
            sx={{
              color: "#fff",
              fontWeight: 800,
              fontSize: { xs: "1.6rem", md: "2rem" },
              letterSpacing: "-0.02em",
              mb: 1,
            }}
          >
            Tasks Performed Report
          </Typography>
          <div className="flex items-center gap-1.5 text-white/60 text-sm">
            <CalendarToday sx={{ fontSize: 14 }} />
            {todayDisplay}
          </div>
        </Box>
      </Box>

      {/* ── Main Content ── */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* ── Left: Filter Panel ── */}
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "16px",
              border: "1px solid #e8eaff",
              boxShadow: "0 4px 24px rgba(99,102,241,0.07)",
              p: 3,
              position: "sticky",
              top: 16,
            }}
          >
            <SectionDivider label="Search Filters" />

            <FormControl sx={{ mb: 2.5 }}>
              <FormLabel
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "text.secondary",
                  mb: 0.75,
                }}
              >
                Employee
              </FormLabel>
              <Autocomplete
                placeholder="Select employee…"
                options={employees}
                loading={employeeLoading}
                getOptionLabel={(e) => e.name}
                onChange={(_, v) => setSelectedEmployee(v?.name || "")}
                startDecorator={
                  <PersonOutline sx={{ fontSize: 16, color: "#94a3b8" }} />
                }
                sx={{
                  borderRadius: "8px",
                  "--Input-focusedThickness": "1.5px",
                }}
              />
            </FormControl>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <FormControl>
                <FormLabel
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "text.secondary",
                    mb: 0.75,
                  }}
                >
                  From
                </FormLabel>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  sx={{
                    borderRadius: "8px",
                    "--Input-focusedThickness": "1.5px",
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "text.secondary",
                    mb: 0.75,
                  }}
                >
                  To
                </FormLabel>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  sx={{
                    borderRadius: "8px",
                    "--Input-focusedThickness": "1.5px",
                  }}
                />
              </FormControl>
            </div>

            <Button
              fullWidth
              loading={reportLoading}
              onClick={search}
              disabled={!selectedEmployee}
              startDecorator={
                !reportLoading && <SearchOutlined sx={{ fontSize: 18 }} />
              }
              sx={{
                background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                color: "#fff",
                fontWeight: 700,
                borderRadius: "10px",
                height: 42,
                boxShadow: "0 4px 14px rgba(21,101,192,0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #0f1b35 0%, #1565c0 100%)",
                },
                "&:disabled": { opacity: 0.5 },
                mb: 2,
              }}
            >
              {reportLoading ? "Searching…" : "Search Report"}
            </Button>

            {reportData.length > 0 && (
              <Button
                fullWidth
                variant="outlined"
                onClick={download}
                startDecorator={<FileDownloadOutlined sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: "10px",
                  height: 40,
                  fontWeight: 600,
                  borderColor: "#e0e2f0",
                  color: "#64748b",
                  "&:hover": { bgcolor: "#f5f6ff" },
                }}
              >
                Download PDF
              </Button>
            )}

            {/* Stats */}
            {reportData.length > 0 && (
              <div className="mt-4 pt-4 border-t border-indigo-50">
                <SectionDivider label="Summary" />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "Total Tasks",
                      value: reportData.length,
                      color: "#1976d2",
                      bg: "#e8f0fe",
                    },
                    {
                      label: "Reworks",
                      value: reportData.filter((r) => r.isRework === "Rework")
                        .length,
                      color: "#c62828",
                      bg: "#fce4ec",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl p-3 text-center"
                      style={{ background: s.bg }}
                    >
                      <div
                        className="text-xl font-extrabold tabular-nums"
                        style={{ color: s.color }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="text-[0.68rem] font-semibold mt-0.5"
                        style={{ color: s.color + "cc" }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Box>

          {/* ── Right: Table Panel ── */}
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "16px",
              border: "1px solid #e8eaff",
              boxShadow: "0 4px 24px rgba(99,102,241,0.07)",
              overflow: "hidden",
            }}
          >
            {/* Table header bar */}
            <div className="px-5 py-4 border-b border-indigo-50">
              <SectionDivider label="Results" />
              {title ? (
                <Typography
                  level="title-sm"
                  sx={{ fontWeight: 700, color: "#0f1b35" }}
                >
                  {title}
                </Typography>
              ) : (
                <Typography
                  level="body-sm"
                  sx={{ color: "text.tertiary", fontStyle: "italic" }}
                >
                  Select an employee and date range, then click Search.
                </Typography>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                style={{ tableLayout: "fixed", minWidth: 780 }}
              >
                <colgroup>
                  <col style={{ width: 48 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 72 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 130 }} />
                  <col />
                  <col style={{ width: 80 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 120 }} />
                </colgroup>
                <thead>
                  <tr
                    style={{
                      background: "linear-gradient(135deg, #0f1b35, #1565c0)",
                    }}
                  >
                    <Th>#</Th>
                    <Th>Date</Th>
                    <Th>Task ID</Th>
                    <Th>Work Type</Th>
                    <Th>Project</Th>
                    <Th>Description</Th>
                    <Th>Time</Th>
                    <Th>Rework?</Th>
                    <Th>Remarks</Th>
                  </tr>
                </thead>
                <tbody>
                  {reportLoading ? (
                    Array.from({ length: rows }).map((_, i) => (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-white" : "bg-[#fafbff]"}
                      >
                        {Array.from({ length: 9 }).map((_, j) => (
                          <td key={j} className="px-3.5 py-3">
                            <Skeleton
                              variant="text"
                              animation="wave"
                              height={16}
                              sx={{ borderRadius: "4px", bgcolor: "#eef0fb" }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <div className="flex flex-col items-center justify-center py-16 gap-2">
                          <AssignmentOutlined
                            sx={{ fontSize: 40, color: "#c7caed" }}
                          />
                          <span className="text-sm text-gray-400 font-medium">
                            {selectedEmployee
                              ? "No records found for the selected range."
                              : "Select an employee to view their report."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row, i) => (
                      <tr
                        key={i}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-[#fafbff]"} hover:bg-indigo-50/40 transition-colors duration-150`}
                      >
                        {/* # */}
                        <td className="px-3.5 py-2.5">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
                            <span className="text-[0.68rem] font-bold text-indigo-500">
                              {startIndex + i + 1}
                            </span>
                          </div>
                        </td>
                        {/* Date */}
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-1 text-[0.75rem] text-slate-500">
                            <CalendarToday sx={{ fontSize: 11 }} />
                            {formatString(row.eventDate)}
                          </div>
                        </td>
                        {/* Task ID */}
                        <td className="px-3.5 py-2.5">
                          <span className="text-xs font-bold font-mono text-indigo-500">
                            #{row.id}
                          </span>
                        </td>
                        {/* Work Type */}
                        <td className="px-3.5 py-2.5 text-[0.8rem] text-slate-600">
                          {row.workType}
                        </td>
                        {/* Project */}
                        <td className="px-3.5 py-2.5 text-[0.8rem] text-slate-600 truncate">
                          {row.projectDetails}
                        </td>
                        {/* Description */}
                        <td className="px-3.5 py-2.5">
                          <ExpandCell
                            text={row.event}
                            expanded={!!expandedRows[i]}
                            onToggle={() => toggleExpand(i)}
                          />
                        </td>
                        {/* Time */}
                        <td className="px-3.5 py-2.5 text-[0.8rem] text-slate-600">
                          {row.timeSpent}
                        </td>
                        {/* Rework */}
                        <td className="px-3.5 py-2.5">
                          <Chip
                            size="sm"
                            variant="soft"
                            color={
                              row.isRework === "Rework" ? "danger" : "success"
                            }
                            sx={{ fontWeight: 700, fontSize: "0.68rem" }}
                          >
                            {row.isRework}
                          </Chip>
                        </td>
                        {/* Remarks */}
                        <td className="px-3.5 py-2.5">
                          <ExpandCell
                            text={row.remarks}
                            expanded={!!expandedRows[i]}
                            onToggle={() => toggleExpand(i)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-indigo-50 bg-[#fafbff] flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">
                  Rows per page
                </span>
                <Select
                  size="sm"
                  value={rows}
                  onChange={(_, v) => {
                    setRows(v);
                    setPage(0);
                  }}
                  sx={{
                    width: 68,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    borderRadius: "8px",
                    bgcolor: "#fff",
                    border: "1px solid #e0e2f0",
                    "--Select-focusedThickness": "1px",
                  }}
                >
                  {[3, 5, 10].map((n) => (
                    <Option key={n} value={n}>
                      {n}
                    </Option>
                  ))}
                </Select>
              </div>

              {reportData.length > 0 && (
                <span className="text-xs text-gray-400 tabular-nums">
                  {startIndex + 1}–
                  {Math.min(startIndex + rows, reportData.length)} of{" "}
                  {reportData.length}
                </span>
              )}

              <div className="flex items-center gap-2">
                <IconButton
                  size="sm"
                  variant="outlined"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  sx={{
                    borderRadius: "8px",
                    borderColor: "#e0e2f0",
                    "&:hover:not(:disabled)": { bgcolor: "#eef0fe" },
                  }}
                >
                  <ChevronLeft sx={{ fontSize: 18 }} />
                </IconButton>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Show pages around current
                    const offset = Math.max(
                      0,
                      Math.min(page - 2, totalPages - 5),
                    );
                    const p = i + offset;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                          p === page
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                            : "text-gray-400 hover:bg-indigo-50"
                        }`}
                      >
                        {p + 1}
                      </button>
                    );
                  })}
                </div>

                <IconButton
                  size="sm"
                  variant="outlined"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  sx={{
                    borderRadius: "8px",
                    borderColor: "#e0e2f0",
                    "&:hover:not(:disabled)": { bgcolor: "#eef0fe" },
                  }}
                >
                  <ChevronRight sx={{ fontSize: 18 }} />
                </IconButton>
              </div>
            </div>
          </Box>
        </div>
      </Box>

      <Toast
        status={toastStatus}
        message={toastMessage}
        open={toastShow}
        onClose={() => setToastShow(false)}
      />
    </div>
  );
};

export default TasksPerformedReport;
