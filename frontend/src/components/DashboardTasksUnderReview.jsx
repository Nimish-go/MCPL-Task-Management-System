import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Autocomplete,
  IconButton,
  Tooltip,
} from "@mui/joy";
import {
  HourglassEmpty,
  CheckCircle,
  Warning,
  Refresh,
  InboxOutlined,
  FilterList,
  Person,
  ArrowBack,
  EditOutlined,
  FolderOpen,
  PeopleAlt,
} from "@mui/icons-material";
import { Skeleton, useMediaQuery } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import EditModal from "./EditModal";

// ─── Shared colour map ────────────────────────────────────────────────────────
const C = {
  pending: { solid: "#ffbd00", bg: "#fff8e1", border: "#ffcc80" },
  completed: { solid: "#2e7d32", bg: "#e8f5e9", border: "#a5d6a7" },
  overdue: { solid: "#c62828", bg: "#fce4ec", border: "#ef9a9a" },
  reloaded: { solid: "#6a1b9a", bg: "#f3e5f5", border: "#ce93d8" },
};

// ─── sessionStorage helpers ───────────────────────────────────────────────────
// Call this from EditModal after a successful save:
//   import { writeEditedTask } from "./DashboardTasksUnderReview";
//   writeEditedTask(taskId, employeeName, projectCode);
// Or inline the three lines directly in EditModal — either works.
export const writeEditedTask = (taskId, employeeName, projectCode) => {
  const prev = JSON.parse(sessionStorage.getItem("editedTasks") || "{}");
  prev[String(taskId)] = { employeeName, projectCode, ts: Date.now() };
  sessionStorage.setItem("editedTasks", JSON.stringify(prev));
};

const readEditedTasks = () =>
  JSON.parse(sessionStorage.getItem("editedTasks") || "{}");

// ─── NotifDot ─────────────────────────────────────────────────────────────────
// A small pulsing amber dot that signals a recently edited task.
const NotifDot = ({ visible }) => {
  if (!visible) return null;
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "#f59e0b",
        boxShadow: "0 0 0 2px #fef3c7",
        flexShrink: 0,
        animation: "notifPulse 1.6s ease-in-out infinite",
        "@keyframes notifPulse": {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.5, transform: "scale(0.85)" },
        },
      }}
    />
  );
};

// ─── Summary pill ─────────────────────────────────────────────────────────────
const SummaryPill = ({ label, value, colorKey, icon }) => {
  const c = C[colorKey];
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: { xs: 1.5, md: 2 },
        py: { xs: 1, md: 1.2 },
        borderRadius: "12px",
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        minWidth: 0,
      }}
    >
      <Box sx={{ color: c.solid, display: "flex", flexShrink: 0 }}>{icon}</Box>
      <Typography
        sx={{ fontSize: { xs: "1.1rem", md: "1.4rem" }, fontWeight: 800, color: c.solid, lineHeight: 1 }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: { xs: "0.7rem", md: "0.78rem" }, color: c.solid, fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
};

// ─── Table helpers ────────────────────────────────────────────────────────────
const thStyle = {
  padding: "10px 12px",
  textAlign: "left",
  color: "rgba(255,255,255,0.85)",
  fontWeight: 700,
  fontSize: "0.7rem",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  borderRight: "1px solid rgba(255,255,255,0.1)",
};
const tdStyle = {
  padding: "10px 12px",
  fontSize: "0.8rem",
  color: "#1e293b",
  verticalAlign: "middle",
  borderBottom: "1px solid #f0f2f8",
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ colorKey, label }) => {
  const c = C[colorKey] || C.pending;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: c.bg,
        color: c.solid,
        border: `1px solid ${c.border}`,
        px: 1,
        py: 0.3,
        borderRadius: "6px",
        fontWeight: 700,
        fontSize: "0.7rem",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
};

// ─── Count badge ─────────────────────────────────────────────────────────────
const CountBadge = ({ value, colorKey }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      backgroundColor: C[colorKey].bg,
      color: C[colorKey].solid,
      px: 1,
      py: 0.3,
      borderRadius: "6px",
      fontWeight: 700,
      fontSize: "0.8rem",
      border: `1px solid ${C[colorKey].border}`,
    }}
  >
    {value ?? 0}
  </Box>
);

// ─── Edit Button ──────────────────────────────────────────────────────────────
const EditButton = ({ onClick, size = "desktop" }) => {
  if (size === "mobile") {
    return (
      <IconButton
        size="sm"
        onClick={onClick}
        sx={{
          borderRadius: "8px",
          bgcolor: "#e8f0fe",
          color: "#1565c0",
          border: "1px solid #c5d8f8",
          "&:hover": { bgcolor: "#1565c0", color: "#fff", boxShadow: "0 3px 10px rgba(21,101,192,0.3)" },
          transition: "all 0.2s ease",
        }}
      >
        <EditOutlined sx={{ fontSize: 16 }} />
      </IconButton>
    );
  }
  return (
    <Button
      size="sm"
      variant="soft"
      onClick={onClick}
      startDecorator={<EditOutlined sx={{ fontSize: 15 }} />}
      sx={{
        borderRadius: "8px",
        fontWeight: 700,
        fontSize: "0.75rem",
        bgcolor: "#e8f0fe",
        color: "#1565c0",
        border: "1px solid #c5d8f8",
        px: 1.5,
        "&:hover": { bgcolor: "#1565c0", color: "#fff", boxShadow: "0 3px 10px rgba(21,101,192,0.3)", transform: "translateY(-1px)" },
        transition: "all 0.2s ease",
      }}
    >
      Edit
    </Button>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, rows, setRows, setPage, total, startIndex }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      px: 2,
      py: 1.5,
      borderTop: "1px solid #f0f2f8",
      backgroundColor: "#fafbff",
      flexWrap: "wrap",
      gap: 1,
    }}
  >
    <Typography level="body-xs" sx={{ color: "#94a3b8" }}>
      {total > 0 ? `${startIndex + 1}–${Math.min(startIndex + rows, total)} of ${total}` : "0 results"}
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Button size="sm" variant="outlined" disabled={page === 0} onClick={() => setPage((p) => p - 1)} sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.78rem" }}>← Prev</Button>
      <Box sx={{ px: 1.5, py: 0.4, borderRadius: "8px", backgroundColor: "#e8f0fe", border: "1px solid #c5cae9" }}>
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#1976d2" }}>{page + 1} / {totalPages || 1}</Typography>
      </Box>
      <Button size="sm" variant="outlined" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.78rem" }}>Next →</Button>
    </Box>
  </Box>
);

// ─── Active tasks table ───────────────────────────────────────────────────────
// NEW: accepts editedTaskIds so it can show a dot on each recently-edited row.
const ActiveTasksTable = ({ data, loading, rowsPerPage = 5, editedTaskIds = new Set() }) => {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(rowsPerPage);
  const [editTask, setEditTask] = useState(false);
  const [taskId, setTaskId] = useState(0);
  const isMobile = useMediaQuery("(max-width:640px)");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startIndex = page * rows;
  const paginated = data.slice(startIndex, startIndex + rows);
  const totalPages = Math.ceil(data.length / rows);

  const getStatusKey = (task) => {
    if (task.status === "Reloaded") return "reloaded";
    if (task.status === "Pending") {
      const dl = new Date(task.deadline);
      dl.setHours(0, 0, 0, 0);
      if (today > dl) return "overdue";
    }
    return "pending";
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const openEdit = (id) => { setTaskId(id); setEditTask(true); };

  const skeletonRows = Array.from({ length: rows }).map((_, i) => (
    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
      {[...Array(7)].map((_, j) => (<td key={j} style={tdStyle}><Skeleton variant="text" animation="wave" height={18} /></td>))}
    </tr>
  ));

  if (isMobile) {
    return (
      <Box>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Box key={i} sx={{ bgcolor: "#fff", borderRadius: "10px", border: "1px solid #e8ecf4", p: 1.8, mb: 1 }}>
              <Skeleton variant="text" height={18} sx={{ mb: 0.8 }} />
              <Skeleton variant="text" height={14} width="55%" />
            </Box>
          ))
        ) : data.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <InboxOutlined sx={{ fontSize: "2rem", color: "#c5cae9", mb: 0.5 }} />
            <Typography level="body-sm" sx={{ color: "#90a4ae" }}>No active tasks</Typography>
          </Box>
        ) : (
          paginated.map((task, i) => {
            const sk = getStatusKey(task);
            // NEW: check if this task was recently edited
            const hasEdit = editedTaskIds.has(String(task.id));
            return (
              <Box key={i} sx={{ bgcolor: "#fff", borderRadius: "12px", border: "1px solid #e8ecf4", p: 2, mb: 1.5, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    {/* NEW: dot next to date on mobile */}
                    <NotifDot visible={hasEdit} />
                    <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "monospace" }}>{formatDate(task.dateOfEntry)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <StatusBadge colorKey={sk} label={sk.charAt(0).toUpperCase() + sk.slice(1)} />
                    <EditButton size="mobile" onClick={() => openEdit(task.id)} />
                  </Box>
                </Box>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1565c0", mb: 0.3 }}>{task.projectDetails}</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#475569", lineHeight: 1.5, mb: 0.5 }}>
                  {task.taskDesc?.split("Task Assigned: ")[1]?.split(" ").slice(0, 8).join(" ") ?? task.taskDesc}
                  {task.taskDesc?.includes("Task Assigned:") ? "…" : ""}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8" }}>Due:</Typography>
                  <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: sk === "overdue" ? "#c62828" : "#475569" }}>
                    {!task.deadline ? "No deadline set" : formatDate(task.deadline)}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <Box sx={{ borderRadius: "10px", border: "1px solid #e8ecf4", overflow: "hidden" }}>
          <Pagination page={page} totalPages={totalPages} rows={rows} setRows={setRows} setPage={setPage} total={data.length} startIndex={startIndex} />
        </Box>
        <EditModal open={editTask} onClose={() => setEditTask(false)} type="underReview" taskId={taskId} />
      </Box>
    );
  }

  const headers = ["#", "Date", "Project", "Description", "Status", "Deadline", "Action"];
  return (
    <Box sx={{ borderRadius: "12px", border: "1px solid #e8ecf4", overflow: "hidden" }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #0f1b35, #1565c0)" }}>
              {headers.map((h, i) => (
                <th key={h} style={{ ...thStyle, borderRight: i < headers.length - 1 ? thStyle.borderRight : "none" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? skeletonRows : data.length === 0 ? (
              <tr>
                <td colSpan={7} style={tdStyle}>
                  <Box sx={{ textAlign: "center", py: 5 }}>
                    <InboxOutlined sx={{ fontSize: "2rem", color: "#c5cae9", mb: 0.5 }} />
                    <Typography level="body-sm" sx={{ color: "#90a4ae" }}>No active tasks</Typography>
                  </Box>
                </td>
              </tr>
            ) : (
              paginated.map((task, i) => {
                const sk = getStatusKey(task);
                // NEW: check if this task was recently edited
                const hasEdit = editedTaskIds.has(String(task.id));
                return (
                  <tr
                    key={i}
                    style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#fafbff")}
                  >
                    <td style={tdStyle}>
                      <Box sx={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#1976d2" }}>{startIndex + i + 1}</Typography>
                      </Box>
                    </td>
                    <td style={{ ...tdStyle, color: "#475569", fontSize: "0.75rem" }}>{formatDate(task.dateOfEntry)}</td>
                    <td style={tdStyle}>
                      {/* NEW: dot next to project name in task row */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        <NotifDot visible={hasEdit} />
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 500 }}>{task.projectDetails}</Typography>
                      </Box>
                    </td>
                    <td style={tdStyle}>
                      <Typography sx={{ fontSize: "0.78rem", lineHeight: 1.4 }}>
                        {task.taskDesc?.split("Task Assigned: ")[1]?.split(" ").slice(0, 5).join(" ") ?? task.taskDesc}
                        {task.taskDesc?.includes("Task Assigned:") && "…"}
                      </Typography>
                    </td>
                    <td style={tdStyle}><StatusBadge colorKey={sk} label={sk.charAt(0).toUpperCase() + sk.slice(1)} /></td>
                    <td style={{ ...tdStyle, color: sk === "overdue" ? "#c62828" : "#475569", fontSize: "0.75rem", fontWeight: sk === "overdue" ? 700 : 400 }}>
                      {!task.deadline ? "No deadline set" : formatDate(task.deadline)}
                    </td>
                    <td style={tdStyle}><EditButton onClick={() => openEdit(task.id)} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Box>
      <Pagination page={page} totalPages={totalPages} rows={rows} setRows={setRows} setPage={setPage} total={data.length} startIndex={startIndex} />
      <EditModal open={editTask} onClose={() => setEditTask(false)} type="underReview" taskId={taskId} />
    </Box>
  );
};

// ─── Completed tasks table ────────────────────────────────────────────────────
const CompletedTasksTable = ({ data, loading }) => {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(5);
  const isMobile = useMediaQuery("(max-width:640px)");

  const startIndex = page * rows;
  const paginated = data.slice(startIndex, startIndex + rows);
  const totalPages = Math.ceil(data.length / rows);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const skeletonRows = Array.from({ length: rows }).map((_, i) => (
    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
      {[...Array(4)].map((_, j) => (<td key={j} style={tdStyle}><Skeleton variant="text" animation="wave" height={18} /></td>))}
    </tr>
  ));

  if (isMobile) {
    return (
      <Box>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Box key={i} sx={{ bgcolor: "#fff", borderRadius: "10px", border: "1px solid #e8ecf4", p: 1.8, mb: 1 }}>
              <Skeleton variant="text" height={18} sx={{ mb: 0.8 }} />
              <Skeleton variant="text" height={14} width="55%" />
            </Box>
          ))
        ) : data.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <InboxOutlined sx={{ fontSize: "2rem", color: "#c5cae9", mb: 0.5 }} />
            <Typography level="body-sm" sx={{ color: "#90a4ae" }}>No completed tasks</Typography>
          </Box>
        ) : (
          paginated.map((task, i) => (
            <Box key={i} sx={{ bgcolor: "#fff", borderRadius: "12px", border: "1px solid #e8ecf4", p: 2, mb: 1.5, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "monospace" }}>{formatDate(task.dateOfEntry)}</Typography>
                <StatusBadge colorKey="completed" label="Completed" />
              </Box>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#2e7d32", mb: 0.3 }}>{task.projectDetails}</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#475569", lineHeight: 1.5 }}>
                {task.taskDesc?.split("Task Assigned: ")[1]?.split(" ").slice(0, 8).join(" ") ?? task.taskDesc}
                {task.taskDesc?.includes("Task Assigned:") ? "…" : ""}
              </Typography>
            </Box>
          ))
        )}
        <Box sx={{ borderRadius: "10px", border: "1px solid #e8ecf4", overflow: "hidden" }}>
          <Pagination page={page} totalPages={totalPages} rows={rows} setRows={setRows} setPage={setPage} total={data.length} startIndex={startIndex} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ borderRadius: "12px", border: "1px solid #e8ecf4", overflow: "hidden" }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #1b5e20, #2e7d32)" }}>
              {["#", "Date", "Project", "Description"].map((h, i, arr) => (
                <th key={h} style={{ ...thStyle, borderRight: i < arr.length - 1 ? thStyle.borderRight : "none" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? skeletonRows : data.length === 0 ? (
              <tr>
                <td colSpan={4} style={tdStyle}>
                  <Box sx={{ textAlign: "center", py: 5 }}>
                    <InboxOutlined sx={{ fontSize: "2rem", color: "#c5cae9", mb: 0.5 }} />
                    <Typography level="body-sm" sx={{ color: "#90a4ae" }}>No completed tasks</Typography>
                  </Box>
                </td>
              </tr>
            ) : (
              paginated.map((task, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0fff4")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#fafbff")}
                >
                  <td style={tdStyle}>
                    <Box sx={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#2e7d32" }}>{startIndex + i + 1}</Typography>
                    </Box>
                  </td>
                  <td style={{ ...tdStyle, color: "#475569", fontSize: "0.75rem" }}>{formatDate(task.dateOfEntry)}</td>
                  <td style={tdStyle}><Typography sx={{ fontSize: "0.78rem", fontWeight: 500 }}>{task.projectDetails}</Typography></td>
                  <td style={tdStyle}>
                    <Typography sx={{ fontSize: "0.78rem", lineHeight: 1.4 }}>
                      {task.taskDesc?.split("Task Assigned: ")[1]?.split(" ").slice(0, 5).join(" ") ?? task.taskDesc}
                      {task.taskDesc?.includes("Task Assigned:") && "…"}
                    </Typography>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>
      <Pagination page={page} totalPages={totalPages} rows={rows} setRows={setRows} setPage={setPage} total={data.length} startIndex={startIndex} />
    </Box>
  );
};

// ─── Custom pie tooltip ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const c = C[name.toLowerCase()] || C.pending;
  return (
    <Box sx={{ backgroundColor: "#fff", border: `1px solid ${c.border}`, borderRadius: "10px", px: 2, py: 1.2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: c.solid }}>{name}</Typography>
      <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: c.solid }}>{value}</Typography>
    </Box>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, accentColor = "#1976d2" }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
    <Box sx={{ width: 4, height: 28, borderRadius: "4px", background: `linear-gradient(180deg, ${accentColor}, ${accentColor}88)`, flexShrink: 0 }} />
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f1b35", lineHeight: 1.2 }}>{title}</Typography>
      {subtitle && <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", mt: 0.2 }}>{subtitle}</Typography>}
    </Box>
  </Box>
);

// ─── Zone2 tab toggle ─────────────────────────────────────────────────────────
const Zone2Tab = ({ label, icon, active, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex", alignItems: "center", gap: 0.8, px: 2, py: 0.9, borderRadius: "8px",
      cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", transition: "all 0.18s ease",
      backgroundColor: active ? "#1976d2" : "transparent",
      color: active ? "#fff" : "#64748b",
      border: active ? "1px solid #1976d2" : "1px solid #e2e8f0",
      userSelect: "none",
      "&:hover": { backgroundColor: active ? "#1565c0" : "#f0f4ff", color: active ? "#fff" : "#1976d2", borderColor: "#1976d2" },
    }}
  >
    {icon}{label}
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardTasksUnderReview = ({ refreshKey = 0, onRefresh }) => {
  const [employeeList, setEmployeeList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [zone2Tab, setZone2Tab] = useState("employees");

  // ── Employee drill-down state ──
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [detailEmployee, setDetailEmployee] = useState(null);
  const [empActiveTasks, setEmpActiveTasks] = useState([]);
  const [empCompletedTasks, setEmpCompletedTasks] = useState([]);
  const [empDetailLoading, setEmpDetailLoading] = useState(false);

  // ── Project drill-down state ──
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailProject, setDetailProject] = useState(null);
  const [projActiveTasks, setProjActiveTasks] = useState([]);
  const [projCompletedTasks, setProjCompletedTasks] = useState([]);
  const [projDetailLoading, setProjDetailLoading] = useState(false);

  // NEW ── Edited-task tracking ──────────────────────────────────────────────
  // editedMeta: { [taskId]: { employeeName, projectCode, ts } }
  const [editedMeta, setEditedMeta] = useState({});

  // Refresh editedMeta from sessionStorage. Called on mount and whenever the
  // edit modal closes (via a storage event or manual poll).
  const syncEditedMeta = useCallback(() => {
    setEditedMeta(readEditedTasks());
  }, []);

  useEffect(() => {
    syncEditedMeta();
    // Listen for storage writes from the same tab (EditModal saves via writeEditedTask)
    const onStorage = (e) => {
      if (e.key === "editedTasks") syncEditedMeta();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [syncEditedMeta]);

  // Derived sets for quick O(1) lookup
  const editedTaskIds = useMemo(() => new Set(Object.keys(editedMeta)), [editedMeta]);
  const editedEmployees = useMemo(
    () => new Set(Object.values(editedMeta).map((m) => m.employeeName).filter(Boolean)),
    [editedMeta],
  );
  const editedProjects = useMemo(
    () => new Set(Object.values(editedMeta).map((m) => m.projectCode).filter(Boolean)),
    [editedMeta],
  );
  // ─────────────────────────────────────────────────────────────────────────

  const isMobile = useMediaQuery("(max-width:640px)");

  // ── Fetch both lists ──────────────────────────────────────────────────────
  const fetchList = () => {
    setLoading(true);
    return axios
      .get(`/dashboard_tasks_under_review/${sessionStorage.getItem("empName")}`)
      .then((res) => {
        if (res.status === 200) {
          const d = res.data;
          setEmployeeList(d.employees);
          setProjectList(d.projects);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app";
    fetchList();
  }, [refreshKey]);

  const handleRefresh = () => {
    setSpinning(true);
    fetchList().finally(() => setTimeout(() => setSpinning(false), 500));
    if (onRefresh) onRefresh();
  };

  // ── Employee drill-down ───────────────────────────────────────────────────
  const loadEmployeeDetails = (empName) => {
    if (!empName) return;
    setDetailEmployee(empName);
    setEmpDetailLoading(true);
    setEmpActiveTasks([]);
    setEmpCompletedTasks([]);
    axios
      .get("/get_employee_tasks", {
        params: { employee_name: empName, assigner_name: sessionStorage.getItem("empName") },
      })
      .then((res) => {
        if (res.status === 200) {
          setEmpActiveTasks(res.data.filter((t) => t.status !== "Cleared"));
          setEmpCompletedTasks(res.data.filter((t) => t.status === "Cleared"));
        }
      })
      .catch(console.error)
      .finally(() => setEmpDetailLoading(false));
  };

  const clearEmployeeDrilldown = () => {
    setDetailEmployee(null);
    setEmpActiveTasks([]);
    setEmpCompletedTasks([]);
    setSelectedEmployee(null);
  };

  // ── Project drill-down ────────────────────────────────────────────────────
  const loadProjectDetails = (projectCode) => {
    if (!projectCode) return;
    setDetailProject(projectCode);
    setProjDetailLoading(true);
    setProjActiveTasks([]);
    setProjCompletedTasks([]);
    axios
      .get("/get_employee_tasks", {
        params: { project_code: projectCode, assigner_name: sessionStorage.getItem("empName") },
      })
      .then((res) => {
        if (res.status === 200) {
          setProjActiveTasks(res.data.filter((t) => t.status !== "Cleared"));
          setProjCompletedTasks(res.data.filter((t) => t.status === "Cleared"));
        }
      })
      .catch(console.error)
      .finally(() => setProjDetailLoading(false));
  };

  const clearProjectDrilldown = () => {
    setDetailProject(null);
    setProjActiveTasks([]);
    setProjCompletedTasks([]);
    setSelectedProject(null);
  };

  const handleRefreshofProjects = () => loadProjectDetails(selectedProject);
  const handleRefreshofEmployees = () => loadEmployeeDetails(selectedEmployee);

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredEmployeeList = useMemo(() => {
    if (!selectedEmployee) return employeeList;
    return employeeList.filter((e) => e.name === selectedEmployee && e.pending_count > 0);
  }, [employeeList, selectedEmployee]);

  const filteredProjectList = useMemo(() => {
    if (!selectedProject) return projectList;
    return projectList.filter((p) => p.projectCode === selectedProject);
  }, [projectList, selectedProject]);

  const totals = useMemo(
    () =>
      filteredEmployeeList.reduce(
        (acc, e) => ({
          pending: acc.pending + (e.pending_count || 0),
          completed: acc.completed + (e.completed_count || 0),
          overdue: acc.overdue + (e.overdue_count || 0),
          reloaded: acc.reloaded + (e.reloaded_count || 0),
        }),
        { pending: 0, completed: 0, overdue: 0, reloaded: 0 },
      ),
    [filteredEmployeeList],
  );

  const pieData = useMemo(
    () =>
      [
        { name: "Pending", value: totals.pending },
        { name: "Overdue", value: totals.overdue },
        { name: "Reloaded", value: totals.reloaded },
      ].filter((d) => d.value > 0),
    [totals],
  );

  const PIE_COLORS = [C.pending.solid, C.overdue.solid, C.reloaded.solid];
  const employeeNames = useMemo(() => employeeList.map((e) => e.name), [employeeList]);
  const projectCodes = useMemo(() => projectList.map((p) => p.projectCode), [projectList]);

  const isEmployeeDrilldown = zone2Tab === "employees" && !!detailEmployee;
  const isProjectDrilldown = zone2Tab === "projects" && !!detailProject;
  const isDrilldown = isEmployeeDrilldown || isProjectDrilldown;

  const spinStyle = {
    fontSize: "1.1rem",
    color: loading ? "#c5cae9" : "#64748b",
    ...(spinning && {
      animation: "spin 0.5s linear",
      "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
    }),
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* ── Zone 1: Summary pills + filter + refresh ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(4,auto)" }, gap: 1 }}>
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: "12px", minWidth: 90 }} />)
          ) : (
            <>
              <SummaryPill label="Pending" value={totals.pending} colorKey="pending" icon={<HourglassEmpty sx={{ fontSize: "1rem" }} />} />
              <SummaryPill label="Completed" value={totals.completed} colorKey="completed" icon={<CheckCircle sx={{ fontSize: "1rem" }} />} />
              <SummaryPill label="Overdue" value={totals.overdue} colorKey="overdue" icon={<Warning sx={{ fontSize: "1rem" }} />} />
              <SummaryPill label="Reloaded" value={totals.reloaded} colorKey="reloaded" icon={<Refresh sx={{ fontSize: "1rem" }} />} />
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: { xs: "100%", sm: "auto" } }}>
          <FilterList sx={{ fontSize: "1.1rem", color: "#1976d2", flexShrink: 0 }} />
          <Autocomplete
            placeholder={zone2Tab === "projects" ? "Filter by project…" : "Filter by employee…"}
            options={zone2Tab === "projects" ? projectCodes : employeeNames}
            value={zone2Tab === "projects" ? selectedProject : selectedEmployee}
            onChange={(_, val) => {
              if (zone2Tab === "projects") {
                setSelectedProject(val);
                if (val) loadProjectDetails(val); else clearProjectDrilldown();
              } else {
                setSelectedEmployee(val);
                if (val) loadEmployeeDetails(val); else clearEmployeeDrilldown();
              }
            }}
            startDecorator={zone2Tab === "projects" ? <FolderOpen sx={{ fontSize: "1rem", color: "#1976d2" }} /> : <Person sx={{ fontSize: "1rem", color: "#1976d2" }} />}
            sx={{ flex: 1, minWidth: { sm: 220 }, borderRadius: "10px", backgroundColor: "#fff", border: "1px solid #d0d9f0", fontSize: "0.85rem", "&:hover": { borderColor: "#1976d2" } }}
          />
          <Tooltip title="Refresh" placement="top">
            <IconButton size="sm" variant="outlined" color="neutral" onClick={handleRefresh} disabled={loading}
              sx={{ flexShrink: 0, borderRadius: "8px", borderColor: "#e2e8f0", "&:hover": { backgroundColor: "#f0f4ff", borderColor: "#1976d2" }, transition: "all 0.2s ease" }}
            >
              <Refresh sx={spinStyle} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Zone 2: Pie + tabbed right panel ── */}
      <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e8ecf4", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <SectionHeader title="Active Tasks Overview" subtitle="Pending, overdue and reloaded tasks across your team" accentColor="#1976d2" />
          {!isDrilldown && (
            <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
              <Zone2Tab label="Employees" icon={<PeopleAlt sx={{ fontSize: "0.95rem" }} />} active={zone2Tab === "employees"}
                onClick={() => { setZone2Tab("employees"); setSelectedProject(null); clearProjectDrilldown(); }} />
              <Zone2Tab label="Projects" icon={<FolderOpen sx={{ fontSize: "0.95rem" }} />} active={zone2Tab === "projects"}
                onClick={() => { setZone2Tab("projects"); setSelectedEmployee(null); clearEmployeeDrilldown(); }} />
            </Box>
          )}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "280px 1fr" }, gap: 3, alignItems: "start" }}>
          {/* Pie chart */}
          <Box>
            {loading ? (
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: "auto" }} />
            ) : pieData.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CheckCircle sx={{ fontSize: "2.5rem", color: "#a5d6a7", mb: 1 }} />
                <Typography level="body-sm" sx={{ color: "#90a4ae" }}>All tasks cleared!</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 600 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>

          {/* Right panel */}
          <Box>
            {isEmployeeDrilldown ? (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Button size="sm" variant="outlined" color="neutral" startDecorator={<ArrowBack sx={{ fontSize: "0.9rem" }} />} onClick={clearEmployeeDrilldown} sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.78rem" }}>Back</Button>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f1b35" }}>
                    Active tasks — <span style={{ color: "#1976d2" }}>{detailEmployee}</span>
                    <Tooltip title={"Refresh " + detailEmployee + " Tasks:"} placement="top" sx={{ mx: 5 }}>
                      <IconButton size="sm" variant="outlined" color="neutral" onClick={handleRefreshofEmployees} disabled={loading}
                        sx={{ flexShrink: 0, borderRadius: "8px", borderColor: "#e2e8f0", "&:hover": { backgroundColor: "#f0f4ff", borderColor: "#1976d2" }, transition: "all 0.2s ease" }}
                      >
                        <Refresh sx={spinStyle} />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                </Box>
                {/* NEW: pass editedTaskIds so task rows show dots */}
                <ActiveTasksTable data={empActiveTasks} loading={empDetailLoading} editedTaskIds={editedTaskIds} />
              </Box>
            ) : isProjectDrilldown ? (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Button size="sm" variant="outlined" color="neutral" startDecorator={<ArrowBack sx={{ fontSize: "0.9rem" }} />} onClick={clearProjectDrilldown} sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.78rem" }}>Back</Button>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, textAlign: "center" }}>
                    <Box sx={{ width: 26, height: 26, borderRadius: "6px", background: "linear-gradient(135deg, #0f1b35, #1565c0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FolderOpen sx={{ fontSize: "0.85rem", color: "#fff" }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f1b35" }}>
                      Active tasks — <span style={{ color: "#1976d2" }}>{detailProject}</span>
                      <Tooltip title={"Refresh " + detailProject + " Tasks:"} placement="top">
                        <IconButton size="sm" variant="outlined" color="neutral" onClick={handleRefreshofProjects} disabled={loading}
                          sx={{ flexShrink: 0, borderRadius: "8px", borderColor: "#e2e8f0", "&:hover": { backgroundColor: "#f0f4ff", borderColor: "#1976d2" }, transition: "all 0.2s ease" }}
                        >
                          <Refresh sx={spinStyle} />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                  </Box>
                </Box>
                {/* NEW: pass editedTaskIds so task rows show dots */}
                <ActiveTasksTable data={projActiveTasks} loading={projDetailLoading} editedTaskIds={editedTaskIds} />
              </Box>
            ) : zone2Tab === "employees" ? (
              /* ── Employee list ── */
              <Box sx={{ borderRadius: "12px", border: "1px solid #e8ecf4", overflow: "hidden" }}>
                <Box sx={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "linear-gradient(135deg, #0f1b35, #1565c0)" }}>
                        {(isMobile ? ["Employee", "Pending", "Overdue", "Reloaded"] : ["#", "Employee", "Pending", "Overdue", "Reloaded"]).map((h, i, arr) => (
                          <th key={h} style={{ ...thStyle, borderRight: i < arr.length - 1 ? thStyle.borderRight : "none" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [...Array(4)].map((_, i) => (
                          <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                            {[...Array(isMobile ? 4 : 5)].map((_, j) => (<td key={j} style={tdStyle}><Skeleton variant="text" height={18} /></td>))}
                          </tr>
                        ))
                      ) : filteredEmployeeList.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={tdStyle}>
                            <Box sx={{ textAlign: "center", py: 4 }}>
                              <InboxOutlined sx={{ fontSize: "2rem", color: "#c5cae9", mb: 0.5 }} />
                              <Typography level="body-sm" sx={{ color: "#90a4ae" }}>No data</Typography>
                            </Box>
                          </td>
                        </tr>
                      ) : (
                        filteredEmployeeList.map((emp, i) => {
                          // NEW: dot if any task for this employee was recently edited
                          const hasEdit = editedEmployees.has(emp.name);
                          return (
                            <tr
                              key={i}
                              style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff", cursor: "pointer" }}
                              onClick={() => { setSelectedEmployee(emp.name); loadEmployeeDetails(emp.name); }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#fafbff")}
                            >
                              {!isMobile && (
                                <td style={tdStyle}>
                                  <Box sx={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#1976d2" }}>{i + 1}</Typography>
                                  </Box>
                                </td>
                              )}
                              <td style={tdStyle}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Box sx={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #1565c0, #42a5f5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff" }}>{emp.name?.charAt(0).toUpperCase()}</Typography>
                                  </Box>
                                  <Box>
                                    {/* NEW: dot next to employee name */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0f1b35" }}>{emp.name}</Typography>
                                      <NotifDot visible={hasEdit} />
                                    </Box>
                                    <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8" }}>Click to view tasks</Typography>
                                  </Box>
                                </Box>
                              </td>
                              {[
                                { key: "pending_count", colorKey: "pending" },
                                { key: "overdue_count", colorKey: "overdue" },
                                { key: "reloaded_count", colorKey: "reloaded" },
                              ].map((col) => (
                                <td key={col.key} style={tdStyle}>
                                  <CountBadge value={emp[col.key]} colorKey={col.colorKey} />
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </Box>
              </Box>
            ) : (
              /* ── Project list ── */
              <Box sx={{ borderRadius: "12px", border: "1px solid #e8ecf4", overflow: "hidden" }}>
                <Box sx={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "linear-gradient(135deg, #0f1b35, #1565c0)" }}>
                        {(isMobile ? ["Project", "Pending", "Overdue", "Reloaded"] : ["#", "Project Code", "Pending", "Overdue", "Reloaded"]).map((h, i, arr) => (
                          <th key={h} style={{ ...thStyle, borderRight: i < arr.length - 1 ? thStyle.borderRight : "none" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [...Array(4)].map((_, i) => (
                          <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                            {[...Array(isMobile ? 4 : 5)].map((_, j) => (<td key={j} style={tdStyle}><Skeleton variant="text" height={18} /></td>))}
                          </tr>
                        ))
                      ) : filteredProjectList.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={tdStyle}>
                            <Box sx={{ textAlign: "center", py: 4 }}>
                              <InboxOutlined sx={{ fontSize: "2rem", color: "#c5cae9", mb: 0.5 }} />
                              <Typography level="body-sm" sx={{ color: "#90a4ae" }}>No project data</Typography>
                            </Box>
                          </td>
                        </tr>
                      ) : (
                        filteredProjectList.map((proj, i) => {
                          // NEW: dot if any task in this project was recently edited
                          const hasEdit = editedProjects.has(proj.projectCode);
                          return (
                            <tr
                              key={i}
                              style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff", cursor: "pointer" }}
                              onClick={() => { setSelectedProject(proj.projectCode); loadProjectDetails(proj.projectCode); }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#fafbff")}
                            >
                              {!isMobile && (
                                <td style={tdStyle}>
                                  <Box sx={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#1976d2" }}>{i + 1}</Typography>
                                  </Box>
                                </td>
                              )}
                              <td style={tdStyle}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Box sx={{ width: 30, height: 30, borderRadius: "8px", background: "linear-gradient(135deg, #0f1b35, #1565c0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <FolderOpen sx={{ fontSize: "0.85rem", color: "#fff" }} />
                                  </Box>
                                  <Box>
                                    {/* NEW: dot next to project code */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f1b35" }}>{proj.projectCode}</Typography>
                                      <NotifDot visible={hasEdit} />
                                    </Box>
                                    <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8" }}>Click to view tasks</Typography>
                                  </Box>
                                </Box>
                              </td>
                              {[
                                { key: "pendingCount", colorKey: "pending" },
                                { key: "overdueCount", colorKey: "overdue" },
                                { key: "reloadedCount", colorKey: "reloaded" },
                              ].map((col) => (
                                <td key={col.key} style={tdStyle}>
                                  <CountBadge value={proj[col.key]} colorKey={col.colorKey} />
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Zone 3: Completed tasks — employee drill-down ── */}
      {isEmployeeDrilldown && (
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e8ecf4", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", p: { xs: 2, md: 3 } }}>
          <SectionHeader title={`Completed Tasks — ${detailEmployee}`} subtitle="Tasks that have been marked as completed or cleared" accentColor="#2e7d32" />
          <CompletedTasksTable data={empCompletedTasks} loading={empDetailLoading} />
        </Box>
      )}

      {/* ── Zone 3: Completed tasks — project drill-down ── */}
      {isProjectDrilldown && (
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e8ecf4", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", p: { xs: 2, md: 3 } }}>
          <SectionHeader title={`Completed Tasks — ${detailProject}`} subtitle="Tasks that have been cleared under this project" accentColor="#2e7d32" />
          <CompletedTasksTable data={projCompletedTasks} loading={projDetailLoading} />
        </Box>
      )}
    </Box>
  );
};

export default DashboardTasksUnderReview;