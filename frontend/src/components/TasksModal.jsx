import {
  Button,
  Chip,
  Modal,
  ModalDialog,
  ModalClose,
  Table,
  Link,
  Box,
  Typography,
  Select,
  Option,
  Skeleton,
  IconButton,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import EditModal from "./EditModal";
import {
  AssignmentOutlined,
  EditOutlined,
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  AccessTime,
} from "@mui/icons-material";

/* ─── Status chip config ─── */
const statusConfig = {
  Overdue: { color: "danger", variant: "solid", dot: "bg-red-400" },
  Cleared: { color: "success", variant: "soft", dot: "bg-emerald-400" },
  Pending: { color: "warning", variant: "soft", dot: "bg-amber-400" },
  Reloaded: { color: "danger", variant: "soft", dot: "bg-rose-400" },
};

const StatusChip = ({ task }) => {
  const key = task.isOverdue ? "Overdue" : task.status;
  const cfg = statusConfig[key] ?? {
    color: "neutral",
    variant: "soft",
    dot: "bg-gray-400",
  };
  return (
    <Chip
      size="sm"
      variant={cfg.variant}
      color={cfg.color}
      startDecorator={
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      }
      sx={{ fontWeight: 600, letterSpacing: "0.02em", fontSize: "0.72rem" }}
    >
      {key}
    </Chip>
  );
};

/* ─── Expandable cell ─── */
const ExpandCell = ({ full, preview, expanded, onToggle }) => (
  <span className="leading-snug">
    {expanded ? full : preview}
    {full !== preview && (
      <Link
        component="button"
        underline="hover"
        color="primary"
        onClick={onToggle}
        sx={{
          ml: 0.75,
          fontSize: "0.7rem",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {expanded ? "Less" : "More"}
      </Link>
    )}
  </span>
);

/* ─── Column header cell ─── */
const Th = ({ children, className = "" }) => (
  <th>
    <span
      className={`text-[0.65rem] font-extrabold tracking-widest uppercase text-indigo-400 ${className}`}
    >
      {children}
    </span>
  </th>
);

const TasksModal = ({ open, onClose, taskData, name, loading }) => {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(5);
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedRemarksRow, setExpandedRemarksRow] = useState(null);
  const [expandedProjectRow, setExpandedProjectRow] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [taskId, setTaskId] = useState(null);

  const startIndex = page * rows;
  const endIndex = startIndex + rows;
  const paginatedData = taskData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(taskData.length / rows);
  const isSelf = sessionStorage.getItem("empName") === name;

  useEffect(() => {
    setPage(0);
    setExpandedRow(null);
    setExpandedRemarksRow(null);
    setExpandedProjectRow(null);
  }, [name]);

  const getProjectCodeOnly = (text) => text?.split(":")[0].trim() ?? "";

  const getShortDescription = (desc) => {
    if (!desc?.includes("Task Assigned: ")) return desc ?? "";
    const words = desc.split("Task Assigned: ")[1].trim().split(" ");
    return words.slice(0, 3).join(" ") + (words.length > 3 ? "…" : "");
  };

  const getFirstThreeWords = (text) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    return words.length > 3 ? words.slice(0, 3).join(" ") + "…" : text;
  };

  /* ── shared table cell sx ── */
  const cellSx = {
    fontSize: "0.8rem",
    color: "text.primary",
    verticalAlign: "middle",
    py: 1.25,
    px: 1.5,
  };

  return (
    <div>
      <Modal open={open} onClose={onClose}>
        <ModalDialog
          sx={{
            p: 0,
            overflow: "hidden",
            borderRadius: "16px",
            maxWidth: "min(96vw, 1080px)",
            width: "96vw",
            border: "1px solid #e8eaff",
            boxShadow: "0 32px 80px rgba(99,102,241,0.12)",
            bgcolor: "#ffffff",
          }}
        >
          {/* ── Header ── */}
          <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 flex items-center gap-4">
            {/* decorative blobs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 w-64 h-12 bg-white/5 blur-2xl pointer-events-none" />

            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <AssignmentOutlined sx={{ color: "#fff", fontSize: 20 }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-base leading-tight truncate">
                {isSelf
                  ? "Tasks Assigned To Yourself"
                  : `${name}'s Tasks Assigned By You`}
              </h2>
              <p className="text-white/60 text-xs mt-0.5">
                {taskData.length} task{taskData.length !== 1 ? "s" : ""} total
              </p>
            </div>

            <ModalClose
              sx={{
                position: "static",
                ml: "auto",
                color: "rgba(255,255,255,0.7)",
                "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
              }}
            />
          </div>

          {/* ── Table wrapper ── */}
          <div className="overflow-x-auto">
            <Table
              borderAxis="xBetween"
              sx={{
                tableLayout: "fixed",
                minWidth: 860,
                "& thead th": {
                  bgcolor: "#f5f6ff",
                  borderBottom: "1px solid #e8eaff",
                  py: 1.5,
                  px: 1.5,
                },
                "& tbody tr": {
                  transition: "background 0.15s ease",
                  "&:hover": { bgcolor: "#f8f9ff" },
                },
                "& tbody td": {
                  borderBottom: "1px solid #f0f1f8",
                  ...cellSx,
                },
                bgcolor: "#ffffff",
              }}
            >
              <colgroup>
                <col style={{ width: 48 }} />
                <col style={{ width: 72 }} />
                <col style={{ width: 96 }} />
                <col style={{ width: 130 }} />
                <col />
                <col style={{ width: 96 }} />
                <col style={{ width: 96 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 72 }} />
              </colgroup>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>ID</Th>
                  <Th>Date</Th>
                  <Th>Project</Th>
                  <Th>Task</Th>
                  <Th>Status</Th>
                  <Th>Deadline</Th>
                  <Th>Remarks</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: rows }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} style={cellSx}>
                          <Skeleton
                            variant="rectangular"
                            animation="wave"
                            sx={{
                              height: 16,
                              borderRadius: "4px",
                              bgcolor: "#eef0fb",
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <AssignmentOutlined
                          sx={{ fontSize: 36, color: "#c7caed" }}
                        />
                        <span className="text-sm text-gray-400">
                          No tasks found
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((task, index) => (
                    <tr key={task.id}>
                      <td>
                        <span className="text-xs text-gray-400 font-mono">
                          {index + startIndex + 1}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-mono font-semibold text-indigo-400">
                          #{task.id}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <CalendarToday sx={{ fontSize: 11 }} />
                          {task.dateOfEntry}
                        </div>
                      </td>
                      <td>
                        <ExpandCell
                          full={task.projectDetails}
                          preview={getProjectCodeOnly(task.projectDetails)}
                          expanded={expandedProjectRow === index}
                          onToggle={() =>
                            setExpandedProjectRow(
                              expandedProjectRow === index ? null : index,
                            )
                          }
                        />
                      </td>
                      <td>
                        <ExpandCell
                          full={task.taskDesc}
                          preview={getShortDescription(task.taskDesc)}
                          expanded={expandedRow === index}
                          onToggle={() =>
                            setExpandedRow(expandedRow === index ? null : index)
                          }
                        />
                      </td>
                      <td>
                        <StatusChip task={task} />
                      </td>
                      <td>
                        <div
                          className={`flex items-center gap-1 text-xs font-medium ${
                            task.isOverdue ? "text-red-500" : "text-gray-500"
                          }`}
                        >
                          <AccessTime sx={{ fontSize: 11 }} />
                          {new Date(task.deadline).toDateString()}
                        </div>
                      </td>
                      <td>
                        <ExpandCell
                          full={task.remarks}
                          preview={getFirstThreeWords(task.remarks)}
                          expanded={expandedRemarksRow === index}
                          onToggle={() =>
                            setExpandedRemarksRow(
                              expandedRemarksRow === index ? null : index,
                            )
                          }
                        />
                      </td>
                      <td>
                        <IconButton
                          size="sm"
                          variant="soft"
                          color="primary"
                          onClick={() => {
                            setOpenModal(true);
                            setTaskId(task.id);
                          }}
                          sx={{
                            borderRadius: "8px",
                            "&:hover": { bgcolor: "#eef0fe" },
                          }}
                        >
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* ── Footer / Pagination ── */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-indigo-50 bg-[#fafbff]">
            {/* Rows per page */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Rows per page</span>
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
                  bgcolor: "#ffffff",
                  color: "text.primary",
                  border: "1px solid #e0e2f0",
                  borderRadius: "8px",
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

            {/* Page info + controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 tabular-nums">
                {startIndex + 1}–{Math.min(endIndex, taskData.length)} of{" "}
                {taskData.length}
              </span>
              <IconButton
                size="sm"
                variant="outlined"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                sx={{
                  borderRadius: "8px",
                  borderColor: "#e0e2f0",
                  color: "text.secondary",
                  "&:hover:not(:disabled)": { bgcolor: "#eef0fe" },
                }}
              >
                <ChevronLeft sx={{ fontSize: 18 }} />
              </IconButton>

              {/* Page pills */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                      i === page
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                        : "text-gray-400 hover:bg-indigo-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <IconButton
                size="sm"
                variant="outlined"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                sx={{
                  borderRadius: "8px",
                  borderColor: "#e0e2f0",
                  color: "text.secondary",
                  "&:hover:not(:disabled)": { bgcolor: "#eef0fe" },
                }}
              >
                <ChevronRight sx={{ fontSize: 18 }} />
              </IconButton>
            </div>
          </div>
        </ModalDialog>
      </Modal>

      <EditModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        taskId={taskId}
        type="underReview"
      />
    </div>
  );
};

export default TasksModal;
