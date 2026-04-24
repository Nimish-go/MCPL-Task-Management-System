import { Box, Button, Chip, Link, Option, Select, Typography } from "@mui/joy";
import { Skeleton } from "@mui/material";
import {
  Edit,
  CheckCircle,
  HourglassEmpty,
  Warning,
  Refresh,
  InboxOutlined,
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import EditModal from "./EditModal";
import axios from "axios";
import TasksModal from "./TasksModal";

// ─── Reusable Status Chip ──────────────────────────────────────────────────
const StatusChip = ({ status, deadline }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  const isOverdue = today > dl && status === "Pending";

  if (isOverdue) {
    const diffDays = Math.round((today - dl) / (1000 * 60 * 60 * 24));
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Warning sx={{ fontSize: "0.85rem", color: "#c62828" }} />
        <Typography
          sx={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "#c62828",
            backgroundColor: "#fce4ec",
            px: 1,
            py: 0.3,
            borderRadius: "6px",
            border: "1px solid #ef9a9a",
            whiteSpace: "nowrap",
          }}
        >
          Overdue {diffDays}d
        </Typography>
      </Box>
    );
  }

  const map = {
    Completed: {
      bg: "#e8f5e9",
      color: "#2e7d32",
      border: "#a5d6a7",
      icon: <CheckCircle sx={{ fontSize: "0.8rem" }} />,
    },
    Pending: {
      bg: "#fff8e1",
      color: "#e65100",
      border: "#ffcc80",
      icon: <HourglassEmpty sx={{ fontSize: "0.8rem" }} />,
    },
    Reloaded: {
      bg: "#fce4ec",
      color: "#c62828",
      border: "#ef9a9a",
      icon: <Refresh sx={{ fontSize: "0.8rem" }} />,
    },
  };

  const s = map[status] || {
    bg: "#f0f0f0",
    color: "#555",
    border: "#ccc",
    icon: null,
  };
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        px: 1,
        py: 0.3,
        borderRadius: "6px",
        fontWeight: 700,
        fontSize: "0.72rem",
      }}
    >
      {s.icon}
      {status}
    </Box>
  );
};

// ─── Reusable Pagination Bar ───────────────────────────────────────────────
const PaginationBar = ({
  page,
  totalPages,
  rows,
  setRows,
  setPage,
  total,
  startIndex,
}) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      px: 3,
      py: 2,
      borderTop: "1px solid #f0f2f8",
      backgroundColor: "#fafbff",
      flexWrap: "wrap",
      gap: 1.5,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Typography level="body-xs" sx={{ color: "#64748b", fontWeight: 500 }}>
        Rows per page:
      </Typography>
      <Select
        size="sm"
        value={rows}
        onChange={(e, val) => {
          setRows(val);
          setPage(0);
        }}
        sx={{
          width: 70,
          borderRadius: "8px",
          fontSize: "0.8rem",
          fontWeight: 600,
        }}
      >
        {[3, 5, 10].map((n) => (
          <Option key={n} value={n}>
            {n}
          </Option>
        ))}
      </Select>
    </Box>

    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Button
        size="sm"
        variant="outlined"
        disabled={page === 0}
        onClick={() => setPage((p) => p - 1)}
        sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.8rem" }}
      >
        ← Prev
      </Button>
      <Box
        sx={{
          px: 2,
          py: 0.5,
          borderRadius: "8px",
          backgroundColor: "#e8f0fe",
          border: "1px solid #c5cae9",
        }}
      >
        <Typography
          sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#1976d2" }}
        >
          {page + 1} / {totalPages || 1}
        </Typography>
      </Box>
      <Button
        size="sm"
        variant="outlined"
        disabled={page + 1 >= totalPages}
        onClick={() => setPage((p) => p + 1)}
        sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.8rem" }}
      >
        Next →
      </Button>
    </Box>

    {total > 0 && (
      <Typography level="body-xs" sx={{ color: "#94a3b8" }}>
        Showing {startIndex + 1}–{Math.min(startIndex + rows, total)} of {total}
      </Typography>
    )}
  </Box>
);

// ─── Table Header Style ────────────────────────────────────────────────────
const thStyle = {
  padding: "12px 14px",
  textAlign: "left",
  color: "rgba(255,255,255,0.85)",
  fontWeight: 700,
  fontSize: "0.72rem",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  borderRight: "1px solid rgba(255,255,255,0.1)",
};

const tdStyle = {
  padding: "11px 14px",
  fontSize: "0.8rem",
  color: "#1e293b",
  verticalAlign: "middle",
  borderBottom: "1px solid #f0f2f8",
};

// ─── Main Component ────────────────────────────────────────────────────────
const Tables = ({ type, tableData, loading = true }) => {
  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
  }, []);

  const [expandedRow, setExpandedRow] = useState(null);
  const [taskId, setTaskId] = useState(0);
  const [editModal, setEditModal] = useState(false);
  const [expandedRemarksRow, setExpandedRemarksRow] = useState(null);
  const [employeeTasksLoading, setEmployeeTasksLoading] = useState(false);
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [showEmployeeTasks, setShowEmployeeTasks] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [editModalType, setEditModalType] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(5);

  const fetchEmployeeTasks = (name, assignerName) => {
    if (!name) return;
    setEmployeeTasks([]);
    setEmployeeName(name);
    setShowEmployeeTasks(true);
    setEmployeeTasksLoading(true);
    axios
      .get(`/get_employee_tasks`, {
        params: {
          employee_name: name,
          assigner_name: assignerName,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setEmployeeTasks(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setEmployeeTasksLoading(false));
  };

  const startIndex = page * rows;
  const paginatedData = tableData.slice(startIndex, startIndex + rows);
  const totalPages = Math.ceil(tableData.length / rows);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

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

  const tableWrapper = (children, pagination) => (
    <Box
      sx={{
        borderRadius: "14px",
        border: "1px solid #e8ecf4",
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
      }}
    >
      <Box sx={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          {children}
        </table>
      </Box>
      {pagination}
    </Box>
  );

  const skeletonRows = (cols) =>
    Array.from({ length: rows }).map((_, i) => (
      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} style={tdStyle}>
            <Skeleton variant="text" animation="wave" height={20} />
          </td>
        ))}
      </tr>
    ));

  // ── Assigned Table ─────────────────────────────────────────────────────
  if (type === "assigned") {
    return (
      <>
        {tableWrapper(
          <>
            <thead>
              <tr
                style={{
                  background: "linear-gradient(135deg, #0f1b35, #1565c0)",
                }}
              >
                {[
                  "#",
                  "Task ID",
                  "Date",
                  "Assigned By",
                  "Description",
                  "Status",
                  "Deadline",
                  "Remarks",
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
                skeletonRows(9)
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} style={tdStyle}>
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <InboxOutlined
                        sx={{ fontSize: "2.5rem", color: "#c5cae9", mb: 1 }}
                      />
                      <Typography level="title-sm" sx={{ color: "#90a4ae" }}>
                        No tasks pending
                      </Typography>
                    </Box>
                  </td>
                </tr>
              ) : (
                paginatedData.map((task, index) => {
                  const isExpanded = expandedRow === index;
                  const isRemarksExpanded = expandedRemarksRow === index;

                  return (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: index % 2 === 0 ? "#fff" : "#fafbff",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f0f4ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          index % 2 === 0 ? "#fff" : "#fafbff")
                      }
                    >
                      <td style={tdStyle}>
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            backgroundColor: "#e8f0fe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              color: "#1976d2",
                            }}
                          >
                            {startIndex + index + 1}
                          </Typography>
                        </Box>
                      </td>
                      <td style={tdStyle}>
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "#1976d2",
                          }}
                        >
                          #{task.id}
                        </Typography>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          color: "#475569",
                          fontSize: "0.78rem",
                        }}
                      >
                        {formatDate(task.date_of_entry)}
                      </td>
                      <td style={tdStyle}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
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
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                color: "#1976d2",
                              }}
                            >
                              {task.assigned_by?.charAt(0).toUpperCase()}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: "0.8rem" }}>
                            {task.assigned_by}
                          </Typography>
                        </Box>
                      </td>
                      <td style={tdStyle}>
                        <Typography
                          sx={{ fontSize: "0.8rem", lineHeight: 1.5 }}
                        >
                          {isExpanded
                            ? task.task_desc
                            : getShortDescription(task.task_desc)}
                        </Typography>
                        {task.task_desc?.includes("Task Assigned:") && (
                          <Link
                            component="button"
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : index)
                            }
                            sx={{
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              color: "#1976d2",
                              textDecoration: "none",
                              mt: 0.3,
                              display: "block",
                            }}
                          >
                            {isExpanded ? "Show Less ▲" : "Read More ▼"}
                          </Link>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <StatusChip
                          status={task.status}
                          deadline={task.deadline}
                        />
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          color: "#475569",
                          fontSize: "0.78rem",
                        }}
                      >
                        {formatDate(task.deadline)}
                      </td>
                      <td style={tdStyle}>
                        <Typography sx={{ fontSize: "0.8rem" }}>
                          {isRemarksExpanded
                            ? task.remarks
                            : getFirstThreeWords(task.remarks)}
                        </Typography>
                        {task.remarks &&
                          task.remarks.split(/\s+/).length > 3 && (
                            <Link
                              component="button"
                              onClick={() =>
                                setExpandedRemarksRow(
                                  isRemarksExpanded ? null : index,
                                )
                              }
                              sx={{
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                color: "#1976d2",
                                textDecoration: "none",
                                mt: 0.3,
                                display: "block",
                              }}
                            >
                              {isRemarksExpanded
                                ? "Show Less ▲"
                                : "Read More ▼"}
                            </Link>
                          )}
                      </td>
                      <td style={tdStyle}>
                        <Button
                          size="sm"
                          variant="soft"
                          color="primary"
                          startDecorator={<Edit sx={{ fontSize: "0.85rem" }} />}
                          onClick={() => {
                            setTaskId(task.id);
                            setEditModal(true);
                            setEditModalType("assigned");
                          }}
                          sx={{
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            "&:hover": {
                              backgroundColor: "#1976d2",
                              color: "#fff",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </>,
          <PaginationBar
            page={page}
            totalPages={totalPages}
            rows={rows}
            setRows={setRows}
            setPage={setPage}
            total={tableData.length}
            startIndex={startIndex}
          />,
        )}
        <EditModal
          taskId={taskId}
          open={editModal}
          onClose={() => setEditModal(false)}
          type={editModalType}
        />
        <TasksModal
          open={showEmployeeTasks}
          taskData={employeeTasks}
          loading={employeeTasksLoading}
          name={employeeName}
          onClose={() => setShowEmployeeTasks(false)}
        />
      </>
    );
  }

  // ── Under Review Table ─────────────────────────────────────────────────
  if (type === "underReview") {
    const statCols = [
      {
        key: "pending_count",
        label: "Pending",
        color: "#e65100",
        bg: "#fff8e1",
        icon: <HourglassEmpty sx={{ fontSize: "0.9rem" }} />,
      },
      {
        key: "completed_count",
        label: "Completed",
        color: "#2e7d32",
        bg: "#e8f5e9",
        icon: <CheckCircle sx={{ fontSize: "0.9rem" }} />,
      },
      {
        key: "overdue_count",
        label: "Overdue",
        color: "#c62828",
        bg: "#fce4ec",
        icon: <Warning sx={{ fontSize: "0.9rem" }} />,
      },
      {
        key: "reloaded_count",
        label: "Reloaded",
        color: "#6a1b9a",
        bg: "#f3e5f5",
        icon: <Refresh sx={{ fontSize: "0.9rem" }} />,
      },
    ];

    return (
      <>
        {tableWrapper(
          <>
            <thead>
              <tr
                style={{
                  background: "linear-gradient(135deg, #0f1b35, #1565c0)",
                }}
              >
                {[
                  "#",
                  "Employee",
                  "Pending",
                  "Completed",
                  "Overdue",
                  "Reloaded",
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
                skeletonRows(6)
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} style={tdStyle}>
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <InboxOutlined
                        sx={{ fontSize: "2.5rem", color: "#c5cae9", mb: 1 }}
                      />
                      <Typography level="title-sm" sx={{ color: "#90a4ae" }}>
                        No tasks under review
                      </Typography>
                    </Box>
                  </td>
                </tr>
              ) : (
                paginatedData.map((task, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#fff" : "#fafbff",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      fetchEmployeeTasks(
                        task.name,
                        sessionStorage.getItem("empName"),
                      )
                    }
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f0f4ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "#fff" : "#fafbff")
                    }
                  >
                    <td style={tdStyle}>
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          backgroundColor: "#e8f0fe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "#1976d2",
                          }}
                        >
                          {startIndex + index + 1}
                        </Typography>
                      </Box>
                    </td>
                    <td style={tdStyle}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #1565c0, #42a5f5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 2px 6px rgba(25,118,210,0.3)",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "#fff",
                            }}
                          >
                            {task.name?.charAt(0).toUpperCase()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              color: "#0f1b35",
                            }}
                          >
                            {task.name}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "0.7rem", color: "#94a3b8" }}
                          >
                            Click to view tasks
                          </Typography>
                        </Box>
                      </Box>
                    </td>
                    {statCols.map((col) => (
                      <td key={col.key} style={tdStyle}>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.6,
                            backgroundColor: col.bg,
                            color: col.color,
                            px: 1.2,
                            py: 0.4,
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            border: `1px solid ${col.color}33`,
                          }}
                        >
                          {col.icon}
                          {task[col.key] ?? 0}
                        </Box>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </>,
          <PaginationBar
            page={page}
            totalPages={totalPages}
            rows={rows}
            setRows={setRows}
            setPage={setPage}
            total={tableData.length}
            startIndex={startIndex}
          />,
        )}
        <EditModal
          taskId={taskId}
          open={editModal}
          onClose={() => setEditModal(false)}
          type={editModalType}
        />
        <TasksModal
          open={showEmployeeTasks}
          taskData={employeeTasks}
          loading={employeeTasksLoading}
          name={employeeName}
          onClose={() => setShowEmployeeTasks(false)}
        />
      </>
    );
  }

  return null;
};

export default Tables;
