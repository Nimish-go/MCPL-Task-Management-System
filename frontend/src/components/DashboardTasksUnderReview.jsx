import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, Chip, Button, Autocomplete, IconButton } from "@mui/joy";
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
} from "@mui/icons-material";
import { Skeleton, useMediaQuery } from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import axios from "axios";
import TasksModal from "./TasksModal";
import EditModal from "./EditModal";

// ─── Shared colour map ────────────────────────────────────────────────────────
const C = {
  pending:   { solid: "#ffbd00", bg: "#fff8e1", border: "#ffcc80" },
  completed: { solid: "#2e7d32", bg: "#e8f5e9", border: "#a5d6a7" },
  overdue:   { solid: "#c62828", bg: "#fce4ec", border: "#ef9a9a" },
  reloaded:  { solid: "#6a1b9a", bg: "#f3e5f5", border: "#ce93d8" },
};

// ─── Summary pill ─────────────────────────────────────────────────────────────
const SummaryPill = ({ label, value, colorKey, icon }) => {
  const c = C[colorKey];
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: { xs: 1.5, md: 2 }, py: { xs: 1, md: 1.2 }, borderRadius: "12px", backgroundColor: c.bg, border: `1px solid ${c.border}`, minWidth: 0 }}>
      <Box sx={{ color: c.solid, display: "flex", flexShrink: 0 }}>{icon}</Box>
      <Typography sx={{ fontSize: { xs: "1.1rem", md: "1.4rem" }, fontWeight: 800, color: c.solid, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: { xs: "0.7rem", md: "0.78rem" }, color: c.solid, fontWeight: 600 }}>{label}</Typography>
    </Box>
  );
};

// ─── Table helpers ────────────────────────────────────────────────────────────
const thStyle = {
  padding: "10px 12px", textAlign: "left",
  color: "rgba(255,255,255,0.85)", fontWeight: 700,
  fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase",
  whiteSpace: "nowrap", borderRight: "1px solid rgba(255,255,255,0.1)",
};
const tdStyle = {
  padding: "10px 12px", fontSize: "0.8rem", color: "#1e293b",
  verticalAlign: "middle", borderBottom: "1px solid #f0f2f8",
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ colorKey, label }) => {
  const c = C[colorKey] || C.pending;
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, backgroundColor: c.bg, color: c.solid, border: `1px solid ${c.border}`, px: 1, py: 0.3, borderRadius: "6px", fontWeight: 700, fontSize: "0.7rem", whiteSpace: "nowrap" }}>
      {label}
    </Box>
  );
};

// ─── Improved Edit Button ─────────────────────────────────────────────────────
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
          "&:hover": {
            bgcolor: "#1565c0",
            color: "#fff",
            boxShadow: "0 3px 10px rgba(21,101,192,0.3)",
          },
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
        "&:hover": {
          bgcolor: "#1565c0",
          color: "#fff",
          boxShadow: "0 3px 10px rgba(21,101,192,0.3)",
          transform: "translateY(-1px)",
        },
        transition: "all 0.2s ease",
      }}
    >
      Edit
    </Button>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, rows, setRows, setPage, total, startIndex }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1.5, borderTop: "1px solid #f0f2f8", backgroundColor: "#fafbff", flexWrap: "wrap", gap: 1 }}>
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
const ActiveTasksTable = ({ data, loading, rowsPerPage = 5 }) => {
  const [page, setPage]       = useState(0);
  const [rows, setRows]       = useState(rowsPerPage);
  const [editTask, setEditTask] = useState(false);
  const [taskId, setTaskId]   = useState(0);
  const isMobile = useMediaQuery("(max-width:640px)");

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startIndex  = page * rows;
  const paginated   = data.slice(startIndex, startIndex + rows);
  const totalPages  = Math.ceil(data.length / rows);

  const getStatusKey = (task) => {
    if (task.status === "Reloaded") return "reloaded";
    if (task.status === "Pending") {
      const dl = new Date(task.deadline); dl.setHours(0, 0, 0, 0);
      if (today > dl) return "overdue";
    }
    return "pending";
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const openEdit = (id) => { setTaskId(id); setEditTask(true); };

  const skeletonRows = Array.from({ length: rows }).map((_, i) => (
    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
      {[...Array(7)].map((_, j) => <td key={j} style={tdStyle}><Skeleton variant="text" animation="wave" height={18} /></td>)}
    </tr>
  ));

  // ── Mobile card view ──────────────────────────────────────────────────────
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
            const label = sk.charAt(0).toUpperCase() + sk.slice(1);
            return (
              <Box key={i} sx={{ bgcolor: "#fff", borderRadius: "12px", border: "1px solid #e8ecf4", p: 2, mb: 1.5, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                {/* Top row: date + status + edit */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "monospace" }}>
                    {formatDate(task.dateOfEntry)}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <StatusBadge colorKey={sk} label={label} />
                    <EditButton size="mobile" onClick={() => openEdit(task.id)} />
                  </Box>
                </Box>

                {/* Project */}
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1565c0", mb: 0.3 }}>
                  {task.projectDetails}
                </Typography>

                {/* Description */}
                <Typography sx={{ fontSize: "0.75rem", color: "#475569", lineHeight: 1.5, mb: 0.5 }}>
                  {task.taskDesc?.split("Task Assigned: ")[1]?.split(" ").slice(0, 8).join(" ") ?? task.taskDesc}
                  {task.taskDesc?.includes("Task Assigned:") ? "…" : ""}
                </Typography>

                {/* Deadline */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8" }}>Due:</Typography>
                  <Typography sx={{
                    fontSize: "0.68rem", fontWeight: 600,
                    color: sk === "overdue" ? "#c62828" : "#475569",
                  }}>
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

  // ── Desktop table view ────────────────────────────────────────────────────
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
              <tr><td colSpan={7} style={tdStyle}>
                <Box sx={{ textAlign: "center", py: 5 }}>
                  <InboxOutlined sx={{ fontSize: "2rem", color: "#c5cae9", mb: 0.5 }} />
                  <Typography level="body-sm" sx={{ color: "#90a4ae" }}>No active tasks</Typography>
                </Box>
              </td></tr>
            ) : (
              paginated.map((task, i) => {
                const sk = getStatusKey(task);
                return (
                  <tr key={i}
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
                    <td style={tdStyle}><Typography sx={{ fontSize: "0.78rem", fontWeight: 500 }}>{task.projectDetails}</Typography></td>
                    <td style={tdStyle}>
                      <Typography sx={{ fontSize: "0.78rem", lineHeight: 1.4 }}>
                        {task.taskDesc?.split("Task Assigned: ")[1]?.split(" ").slice(0, 5).join(" ") ?? task.taskDesc}
                        {task.taskDesc?.includes("Task Assigned:") && "…"}
                      </Typography>
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge colorKey={sk} label={sk.charAt(0).toUpperCase() + sk.slice(1)} />
                    </td>
                    <td style={{ ...tdStyle, color: sk === "overdue" ? "#c62828" : "#475569", fontSize: "0.75rem", fontWeight: sk === "overdue" ? 700 : 400 }}>
                      {!task.deadline ? "No deadline set" : formatDate(task.deadline)}
                    </td>
                    <td style={tdStyle}>
                      <EditButton onClick={() => openEdit(task.id)} />
                    </td>
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
  const paginated  = data.slice(startIndex, startIndex + rows);
  const totalPages = Math.ceil(data.length / rows);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const skeletonRows = Array.from({ length: rows }).map((_, i) => (
    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
      {[...Array(4)].map((_, j) => <td key={j} style={tdStyle}><Skeleton variant="text" animation="wave" height={18} /></td>)}
    </tr>
  ));

  // ── Mobile card view ──────────────────────────────────────────────────────
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

  // ── Desktop table view ────────────────────────────────────────────────────
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
              <tr><td colSpan={4} style={tdStyle}>
                <Box sx={{ textAlign: "center", py: 5 }}>
                  <InboxOutlined sx={{ fontSize: "2rem", color: "#c5cae9", mb: 0.5 }} />
                  <Typography level="body-sm" sx={{ color: "#90a4ae" }}>No completed tasks</Typography>
                </Box>
              </td></tr>
            ) : (
              paginated.map((task, i) => (
                <tr key={i}
                  style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}
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

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardTasksUnderReview = () => {
  const [employeeList, setEmployeeList]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTasks, setActiveTasks]       = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [detailLoading, setDetailLoading]   = useState(false);
  const [detailEmployee, setDetailEmployee] = useState(null);
  const isMobile = useMediaQuery("(max-width:640px)");

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app";
    axios.get(`/dashboard_tasks_under_review/${sessionStorage.getItem("empName")}`)
      .then((res) => { if (res.status === 200) setEmployeeList(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadEmployeeDetails = (empName) => {
    if (!empName) return;
    setDetailEmployee(empName);
    setDetailLoading(true);
    setActiveTasks([]); setCompletedTasks([]);
    const assigner = sessionStorage.getItem("empName");
    axios.get("/get_employee_tasks", { params: { employee_name: empName, assigner_name: assigner } })
      .then((res) => {
        if (res.status === 200) {
          const all = res.data;
          setActiveTasks(all.filter((t) => t.status !== "Cleared"));
          setCompletedTasks(all.filter((t) => t.status === "Cleared"));
        }
      })
      .catch(console.error)
      .finally(() => setDetailLoading(false));
  };

  const filteredList = useMemo(() => {
    if (!selectedEmployee) return employeeList;
    return employeeList.filter((e) => e.name === selectedEmployee && e.pending_count > 0);
  }, [employeeList, selectedEmployee]);

  const totals = useMemo(() =>
    filteredList.reduce((acc, e) => ({
      pending:   acc.pending   + (e.pending_count   || 0),
      completed: acc.completed + (e.completed_count || 0),
      overdue:   acc.overdue   + (e.overdue_count   || 0),
      reloaded:  acc.reloaded  + (e.reloaded_count  || 0),
    }), { pending: 0, completed: 0, overdue: 0, reloaded: 0 }),
  [filteredList]);

  const pieData = useMemo(() =>
    [
      { name: "Pending", value: totals.pending },
      { name: "Overdue", value: totals.overdue },
      { name: "Reloaded", value: totals.reloaded },
    ].filter((d) => d.value > 0),
  [totals]);

  const PIE_COLORS   = [C.pending.solid, C.overdue.solid, C.reloaded.solid];
  const employeeNames = useMemo(() => employeeList.map((e) => e.name), [employeeList]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>

      {/* ── Zone 1: Summary pills + filter ── */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between", gap: 2, mb: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(4,auto)" }, gap: 1 }}>
          {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: "12px", minWidth: 90 }} />) : (
            <>
              <SummaryPill label="Pending"   value={totals.pending}   colorKey="pending"   icon={<HourglassEmpty sx={{ fontSize: "1rem" }} />} />
              <SummaryPill label="Completed" value={totals.completed} colorKey="completed" icon={<CheckCircle    sx={{ fontSize: "1rem" }} />} />
              <SummaryPill label="Overdue"   value={totals.overdue}   colorKey="overdue"   icon={<Warning        sx={{ fontSize: "1rem" }} />} />
              <SummaryPill label="Reloaded"  value={totals.reloaded}  colorKey="reloaded"  icon={<Refresh        sx={{ fontSize: "1rem" }} />} />
            </>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: { xs: "100%", sm: 260 } }}>
          <FilterList sx={{ fontSize: "1.1rem", color: "#1976d2", flexShrink: 0 }} />
          <Autocomplete
            placeholder="Filter by employee…"
            options={employeeNames}
            value={selectedEmployee}
            onChange={(_, val) => {
              setSelectedEmployee(val);
              if (val) loadEmployeeDetails(val);
              else { setDetailEmployee(null); setActiveTasks([]); setCompletedTasks([]); }
            }}
            startDecorator={<Person sx={{ fontSize: "1rem", color: "#1976d2" }} />}
            sx={{ flex: 1, borderRadius: "10px", backgroundColor: "#fff", border: "1px solid #d0d9f0", fontSize: "0.85rem", "&:hover": { borderColor: "#1976d2" } }}
          />
        </Box>
      </Box>

      {/* ── Zone 2: Pie chart + table ── */}
      <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e8ecf4", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", p: { xs: 2, md: 3 }, mb: 3 }}>
        <SectionHeader title="Active Tasks Overview" subtitle="Pending, overdue and reloaded tasks across your team" accentColor="#1976d2" />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "280px 1fr" }, gap: 3, alignItems: "start" }}>
          {/* Pie */}
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
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 600 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>

          {/* Employee list or expanded detail */}
          <Box>
            {!detailEmployee ? (
              <Box sx={{ borderRadius: "12px", border: "1px solid #e8ecf4", overflow: "hidden" }}>
                <Box sx={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "linear-gradient(135deg, #0f1b35, #1565c0)" }}>
                        {(isMobile ? ["Employee","Pending","Overdue","Reloaded"] : ["#","Employee","Pending","Overdue","Reloaded"]).map((h, i, arr) => (
                          <th key={h} style={{ ...thStyle, borderRight: i < arr.length - 1 ? thStyle.borderRight : "none" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? [...Array(4)].map((_, i) => (
                        <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                          {[...Array(isMobile ? 4 : 5)].map((_, j) => <td key={j} style={tdStyle}><Skeleton variant="text" height={18} /></td>)}
                        </tr>
                      )) : filteredList.length === 0 ? (
                        <tr><td colSpan={5} style={tdStyle}>
                          <Box sx={{ textAlign: "center", py: 4 }}>
                            <InboxOutlined sx={{ fontSize: "2rem", color: "#c5cae9", mb: 0.5 }} />
                            <Typography level="body-sm" sx={{ color: "#90a4ae" }}>No data</Typography>
                          </Box>
                        </td></tr>
                      ) : filteredList.map((emp, i) => (
                        <tr key={i}
                          style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff", cursor: "pointer" }}
                          onClick={() => loadEmployeeDetails(emp.name)}
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
                                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0f1b35" }}>{emp.name}</Typography>
                                <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8" }}>Click to view tasks</Typography>
                              </Box>
                            </Box>
                          </td>
                          {[
                            { key: "pending_count",  colorKey: "pending"  },
                            { key: "overdue_count",  colorKey: "overdue"  },
                            { key: "reloaded_count", colorKey: "reloaded" },
                          ].map((col) => (
                            <td key={col.key} style={tdStyle}>
                              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, backgroundColor: C[col.colorKey].bg, color: C[col.colorKey].solid, px: 1, py: 0.3, borderRadius: "6px", fontWeight: 700, fontSize: "0.8rem", border: `1px solid ${C[col.colorKey].border}` }}>
                                {emp[col.key] ?? 0}
                              </Box>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Button size="sm" variant="outlined" color="neutral"
                    startDecorator={<ArrowBack sx={{ fontSize: "0.9rem" }} />}
                    onClick={() => { setDetailEmployee(null); setActiveTasks([]); setCompletedTasks([]); setSelectedEmployee(null); }}
                    sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.78rem" }}
                  >
                    Back
                  </Button>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f1b35" }}>
                    Active tasks — <span style={{ color: "#1976d2" }}>{detailEmployee}</span>
                  </Typography>
                </Box>
                <ActiveTasksTable data={activeTasks} loading={detailLoading} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Zone 3: Completed tasks ── */}
      {detailEmployee && (
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e8ecf4", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", p: { xs: 2, md: 3 } }}>
          <SectionHeader title={`Completed Tasks — ${detailEmployee}`} subtitle="Tasks that have been marked as completed or cleared" accentColor="#2e7d32" />
          <CompletedTasksTable data={completedTasks} loading={detailLoading} />
        </Box>
      )}
    </Box>
  );
};

export default DashboardTasksUnderReview;