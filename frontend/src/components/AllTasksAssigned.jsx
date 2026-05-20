import {
  Box,
  Button,
  Chip,
  Link,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import { Skeleton, useMediaQuery } from "@mui/material";
import { Search, FilterList, Person } from "@mui/icons-material";
import axios from "axios";
import React, { useEffect, useState } from "react";

const StatusChip = ({ status, deadline }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  const isOverdue = today > dl && status === "Pending";

  if (isOverdue) {
    const diffDays = Math.round((today - dl) / (1000 * 60 * 60 * 24));
    return (
      <Chip size="sm" variant="solid" sx={{ backgroundColor: "#c62828", color: "#fff", fontWeight: 700, fontSize: "0.7rem", borderRadius: "8px" }}>
        Overdue {diffDays}d
      </Chip>
    );
  }
  const map = {
    Completed: { bg: "#e8f5e9", color: "#2e7d32", label: "Completed" },
    Pending:   { bg: "#fff8e1", color: "#e65100", label: "Pending" },
    Reloaded:  { bg: "#fce4ec", color: "#c62828", label: "Reloaded" },
  };
  const s = map[status] || { bg: "#f0f0f0", color: "#555", label: status };
  return (
    <Chip size="sm" sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.72rem", borderRadius: "8px", border: `1px solid ${s.color}33` }}>
      {s.label}
    </Chip>
  );
};

// ─── Mobile Task Card ─────────────────────────────────────────────────────────
const TaskCard = ({ task, index, startIndex }) => {
  const [expanded, setExpanded]               = useState(false);
  const [remarksExpanded, setRemarksExpanded] = useState(false);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const getShortDescription = (desc) => {
    if (!desc?.includes("Task Assigned: ")) return desc;
    const words = desc.split("Task Assigned: ")[1].trim().split(" ");
    return words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "");
  };

  const getFirstThreeWords = (text) => {
    if (!text) return "—";
    const words = text.trim().split(/\s+/);
    return words.length > 3 ? words.slice(0, 3).join(" ") + "..." : text;
  };

  return (
    <Box sx={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e8ecf4", p: 2, mb: 1.5, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#1976d2" }}>{startIndex + index + 1}</Typography>
          </Box>
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#1976d2" }}>#{task.id}</Typography>
        </Box>
        <StatusChip status={task.status} deadline={task.deadline} />
      </Box>

      {/* Assigned To / By */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1.2 }}>
        <Box>
          <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8" }}>Assigned To</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mt: 0.3 }}>
            <Box sx={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#1976d2" }}>{task.assigned_to?.charAt(0).toUpperCase()}</Typography>
            </Box>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 500 }}>{task.assigned_to}</Typography>
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8" }}>Assigned By</Typography>
          <Typography sx={{ fontSize: "0.78rem", mt: 0.3, color: "#475569" }}>{task.assigned_by}</Typography>
        </Box>
      </Box>

      {/* Date / Deadline */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1.2 }}>
        <Box>
          <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8" }}>Date</Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#475569", mt: 0.3 }}>{formatDate(task.date_of_entry)}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8" }}>Deadline</Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#475569", mt: 0.3 }}>{formatDate(task.deadline)}</Typography>
        </Box>
      </Box>

      {/* Description */}
      <Box sx={{ mb: 1.2 }}>
        <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8" }}>Description</Typography>
        <Typography sx={{ fontSize: "0.8rem", lineHeight: 1.5, mt: 0.3 }}>
          {expanded ? task.task_desc : getShortDescription(task.task_desc)}
        </Typography>
        {task.task_desc?.includes("Task Assigned:") && (
          <Link component="button" onClick={() => setExpanded(!expanded)} sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#1976d2", textDecoration: "none" }}>
            {expanded ? "Show Less ▲" : "Read More ▼"}
          </Link>
        )}
      </Box>

      {/* Remarks */}
      <Box>
        <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8" }}>Remarks</Typography>
        <Typography sx={{ fontSize: "0.8rem", mt: 0.3 }}>
          {remarksExpanded ? task.remarks : getFirstThreeWords(task.remarks)}
        </Typography>
        {task.remarks && task.remarks.split(/\s+/).length > 3 && (
          <Link component="button" onClick={() => setRemarksExpanded(!remarksExpanded)} sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#1976d2", textDecoration: "none" }}>
            {remarksExpanded ? "Show Less ▲" : "Read More ▼"}
          </Link>
        )}
      </Box>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AllTasksAssigned = () => {
  const [tasks, setTasks]                       = useState([]);
  const [employeeNames, setEmployeeNames]       = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading]                   = useState(false);
  const [page, setPage]                         = useState(0);
  const [rows, setRows]                         = useState(5);
  const [expandedRow, setExpandedRow]           = useState(null);
  const [expandedRemarksRow, setExpandedRemarksRow] = useState(null);

  const isMobile = useMediaQuery("(max-width:640px)");

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    setLoading(true);
    axios.get("/get_employee_names")
      .then((res) => { if (res.status === 200) setEmployeeNames(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;
    setLoading(true);
    setPage(0);
    axios.get(`/tasks_assigned_to/${encodeURIComponent(selectedEmployee)}`)
      .then((res) => { if (res.status === 200) setTasks(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedEmployee]);

  const startIndex    = page * rows;
  const paginatedData = tasks.slice(startIndex, startIndex + rows);
  const totalPages    = Math.ceil(tasks.length / rows);

  const getShortDescription = (desc) => {
    if (!desc?.includes("Task Assigned: ")) return desc;
    const words = desc.split("Task Assigned: ")[1].trim().split(" ");
    return words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "");
  };

  const getFirstThreeWords = (text) => {
    if (!text) return "—";
    const words = text.trim().split(/\s+/);
    return words.length > 3 ? words.slice(0, 3).join(" ") + "..." : text;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const colWidths = ["4%","7%","10%","11%","11%","22%","10%","10%","15%"];
  const headers   = ["#","Task ID","Date","Assigned To","Assigned By","Description","Status","Deadline","Remarks"];

  const skeletonCards = (n) =>
    Array.from({ length: n }).map((_, i) => (
      <Box key={i} sx={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e8ecf4", p: 2, mb: 1.5 }}>
        <Skeleton variant="text" animation="wave" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" animation="wave" height={16} width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" animation="wave" height={40} sx={{ borderRadius: "8px" }} />
      </Box>
    ));

  const PaginationBar = () => (
    <Box
      sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        px: { xs: 1.5, md: 3 }, py: 2, borderTop: "1px solid #f0f2f8",
        backgroundColor: "#fafbff", flexWrap: "wrap", gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography level="body-xs" sx={{ color: "#64748b", fontWeight: 500 }}>Rows:</Typography>
        <Select size="sm" value={rows} onChange={(e, val) => { setRows(val); setPage(0); }}
          sx={{ width: 72, borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600 }}>
          {[3, 5, 10].map((n) => <Option value={n} key={n}>{n}</Option>)}
        </Select>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button size="sm" variant="outlined" disabled={page === 0} onClick={() => setPage((p) => p - 1)}
          sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.8rem" }}>← Prev</Button>
        <Box sx={{ px: 2, py: 0.5, borderRadius: "8px", backgroundColor: "#e8f0fe", border: "1px solid #c5cae9" }}>
          <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#1976d2" }}>{page + 1} / {totalPages || 1}</Typography>
        </Box>
        <Button size="sm" variant="outlined" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}
          sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.8rem" }}>Next →</Button>
      </Box>

      {tasks.length > 0 && (
        <Typography level="body-xs" sx={{ color: "#94a3b8" }}>
          {startIndex + 1}–{Math.min(startIndex + rows, tasks.length)} of {tasks.length}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
      {/* Filter Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
          p: { xs: 2, md: 2.5 },
          borderRadius: "14px",
          backgroundColor: "#f4f6fb",
          border: "1px solid #e8ecf4",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#1976d2" }}>
          <FilterList sx={{ fontSize: "1.1rem" }} />
          <Typography level="title-sm" sx={{ fontWeight: 700, color: "#0f1b35", whiteSpace: "nowrap" }}>
            Filter by Employee
          </Typography>
        </Box>
        <Select
          placeholder="Select employee..."
          onChange={(e, newVal) => setSelectedEmployee(newVal)}
          startDecorator={<Person sx={{ fontSize: "1rem", color: "#1976d2" }} />}
          sx={{
            flex: 1,
            minWidth: { xs: "unset", sm: 220 },
            borderRadius: "10px",
            backgroundColor: "#fff",
            border: "1px solid #d0d9f0",
            fontWeight: 500,
            "&:hover": { borderColor: "#1976d2" },
          }}
        >
          <Option value="All">All Employees</Option>
          {employeeNames.map((emp, i) => <Option value={emp.name} key={i}>{emp.name}</Option>)}
        </Select>
        {selectedEmployee && (
          <Chip size="sm" variant="soft" color="primary" sx={{ fontWeight: 600, alignSelf: { xs: "flex-start", sm: "center" } }}>
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} found
          </Chip>
        )}
      </Box>

      {/* Mobile card list */}
      {isMobile ? (
        <Box>
          {loading ? skeletonCards(rows)
            : !selectedEmployee ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Search sx={{ fontSize: "2.5rem", color: "#c5cae9", mb: 1 }} />
                <Typography level="title-sm" sx={{ color: "#90a4ae" }}>Select an employee to view their tasks</Typography>
              </Box>
            ) : paginatedData.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography level="title-sm" sx={{ color: "#90a4ae" }}>No tasks found for this employee</Typography>
              </Box>
            ) : (
              paginatedData.map((task, index) => (
                <TaskCard key={index} task={task} index={index} startIndex={startIndex} />
              ))
            )
          }
          <Box sx={{ borderRadius: "14px", border: "1px solid #e8ecf4", overflow: "hidden", mt: 1 }}>
            <PaginationBar />
          </Box>
        </Box>
      ) : (
        // Desktop table
        <Box sx={{ borderRadius: "14px", border: "1px solid #e8ecf4", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #0f1b35, #1565c0)" }}>
                  {headers.map((h, i) => (
                    <th key={h} style={{ width: colWidths[i], padding: "12px 14px", textAlign: "left", color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", borderRight: i < headers.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: rows }).map((_, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                      {headers.map((h) => (
                        <td key={h} style={{ padding: "12px 14px" }}><Skeleton variant="text" animation="wave" height={20} /></td>
                      ))}
                    </tr>
                  ))
                ) : !selectedEmployee ? (
                  <tr><td colSpan={9}>
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <Search sx={{ fontSize: "2.5rem", color: "#c5cae9", mb: 1 }} />
                      <Typography level="title-sm" sx={{ color: "#90a4ae" }}>Select an employee to view their tasks</Typography>
                    </Box>
                  </td></tr>
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan={9}>
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <Typography level="title-sm" sx={{ color: "#90a4ae" }}>No tasks found for this employee</Typography>
                    </Box>
                  </td></tr>
                ) : (
                  paginatedData.map((task, index) => {
                    const isExpanded        = expandedRow === index;
                    const isRemarksExpanded = expandedRemarksRow === index;
                    const globalIndex       = startIndex + index;
                    return (
                      <tr key={index}
                        style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#fafbff", transition: "background-color 0.15s ease", borderBottom: "1px solid #f0f2f8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#fff" : "#fafbff")}
                      >
                        <td style={{ padding: "11px 14px" }}>
                          <Box sx={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#1976d2" }}>{globalIndex + 1}</Typography>
                          </Box>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#1976d2" }}>#{task.id}</Typography>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <Typography sx={{ fontSize: "0.78rem", color: "#475569" }}>{formatDate(task.date_of_entry)}</Typography>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#1976d2" }}>{task.assigned_to?.charAt(0).toUpperCase()}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>{task.assigned_to}</Typography>
                          </Box>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <Typography sx={{ fontSize: "0.8rem", color: "#475569" }}>{task.assigned_by}</Typography>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <Typography sx={{ fontSize: "0.8rem", lineHeight: 1.5, color: "#1e293b" }}>
                            {isExpanded ? task.task_desc : getShortDescription(task.task_desc)}
                          </Typography>
                          {task.task_desc?.includes("Task Assigned:") && (
                            <Link component="button" onClick={() => setExpandedRow(isExpanded ? null : index)}
                              sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#1976d2", textDecoration: "none", mt: 0.3, display: "block" }}>
                              {isExpanded ? "Show Less ▲" : "Read More ▼"}
                            </Link>
                          )}
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <StatusChip status={task.status} deadline={task.deadline} />
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <Typography sx={{ fontSize: "0.78rem", color: "#475569" }}>{formatDate(task.deadline)}</Typography>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <Typography sx={{ fontSize: "0.8rem", color: "#1e293b" }}>
                            {isRemarksExpanded ? task.remarks : getFirstThreeWords(task.remarks)}
                          </Typography>
                          {task.remarks && task.remarks.split(/\s+/).length > 3 && (
                            <Link component="button" onClick={() => setExpandedRemarksRow(isRemarksExpanded ? null : index)}
                              sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#1976d2", textDecoration: "none", mt: 0.3, display: "block" }}>
                              {isRemarksExpanded ? "Show Less ▲" : "Read More ▼"}
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Box>
          <PaginationBar />
        </Box>
      )}
    </Box>
  );
};

export default AllTasksAssigned;