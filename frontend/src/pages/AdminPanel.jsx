import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  ListItemDecorator,
  Skeleton,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Textarea,
  IconButton,
  Autocomplete,
} from "@mui/joy";
import {
  AddCircle,
  CalendarToday,
  CreateNewFolder,
  Engineering,
  FolderCopy,
  Groups3,
  PersonAdd,
  BeachAccess,
  CheckCircle,
  Refresh,
  TaskAlt,
  Info,
  SaveOutlined,
  AccountTree,
} from "@mui/icons-material";
import axios from "axios";
import AdminPanelAdd from "../components/AdminPanelAdd";
import MarkInactive from "../components/MarkInactive";
import Navbar from "../components/Navbar";
import AccessDenied from "../components/AccessDenied";
import { useNavigate } from "react-router-dom";

const SIDEBAR_W = 68;

const thStyle = {
  padding: "12px 16px", textAlign: "left",
  color: "rgba(255,255,255,0.85)", fontWeight: 700,
  fontSize: "0.72rem", letterSpacing: "0.05em", textTransform: "uppercase",
  whiteSpace: "nowrap", borderRight: "1px solid rgba(255,255,255,0.1)",
};
const tdStyle = {
  padding: "11px 16px", fontSize: "0.82rem", color: "#1e293b",
  verticalAlign: "middle", borderBottom: "1px solid #f0f2f8",
};

// ─── Reporting hierarchy ──────────────────────────────────────────────────
// Maps a designation → which designations they can report to
const REPORTING_RULES = {
  "Junior Architect":   ["Senior Architect", "Director"],
  "Architect Intern":   ["Senior Architect", "Director"],
  "Junior Engineer":    ["Senior Engineer", "Site Engineer", "Director"],
  "Site Engineer":      ["Senior Engineer", "Director"],
  "Senior Architect":   ["Director"],
  "Senior Engineer":    ["Director"],
};

// Returns true if this employee is a Director (top of hierarchy)
const isDirectorLevel = (employee) =>
  employee.designation?.toUpperCase().includes("DIRECTOR") ||
  employee.branch?.toUpperCase().includes("DIRECTOR");

// Returns valid report-to options for a given employee
const getReportingOptions = (employee, allEmployees) => {
  if (isDirectorLevel(employee)) return []; // Directors report to no one

  const allowed = REPORTING_RULES[employee.designation];
  if (!allowed) {
    // Fallback: anyone with "Senior" or "Director" in designation
    return allEmployees.filter(
      (e) =>
        e.id !== employee.id &&
        (e.designation?.includes("Senior") ||
          e.designation?.toUpperCase().includes("DIRECTOR") ||
          e.branch?.toUpperCase().includes("DIRECTOR")),
    );
  }

  return allEmployees.filter(
    (e) =>
      e.id !== employee.id &&
      (allowed.includes(e.designation) ||
        e.designation?.toUpperCase().includes("DIRECTOR") ||
        e.branch?.toUpperCase().includes("DIRECTOR")),
  );
};

// ─── Leave type / status config ───────────────────────────────────────────
const LEAVE_TYPES = [
  { value: "normal",   label: "Normal Leave",  bg: "#e8f0fe", border: "#c5d8f8", text: "#1565c0" },
  { value: "sick",     label: "Sick Leave",    bg: "#fff8e1", border: "#ffcc80", text: "#e65100" },
  { value: "comp_off", label: "Comp Off",      bg: "#e8f5e9", border: "#a5d6a7", text: "#2e7d32" },
  { value: "casual",   label: "Casual Leave",  bg: "#f5f5f5", border: "#e0e0e0", text: "#424242" },
];
const LEAVE_STATUSES = {
  pending_manager:  { label: "Pending Manager",  color: "warning" },
  pending_director: { label: "Pending Director", color: "primary" },
  approved:         { label: "Approved",         color: "success" },
  rejected:         { label: "Rejected",         color: "danger"  },
  auto_rejected:    { label: "Auto Rejected",    color: "danger"  },
  cancelled:        { label: "Cancelled",        color: "neutral" },
};
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const LeaveTypeBadge = ({ type }) => {
  const cfg = LEAVE_TYPES.find((t) => t.value === type) ?? { label: type, bg: "#f5f5f5", border: "#e0e0e0", text: "#424242" };
  return (
    <span className="inline-flex items-center gap-1 text-[0.72rem] font-bold px-2 py-0.5 rounded-lg border"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}>
      {cfg.label}
    </span>
  );
};
const StatusBadge = ({ status }) => {
  const cfg = LEAVE_STATUSES[status] ?? { label: status, color: "neutral" };
  return <Chip size="sm" color={cfg.color} variant="soft" sx={{ fontWeight: 700, fontSize: "0.7rem" }}>{cfg.label}</Chip>;
};

// ─── Leave Approval Panel ─────────────────────────────────────────────────
const LeaveApprovalPanel = () => {
  const [pending, setPending]         = useState([]);
  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [actionTab, setActionTab]     = useState(0);
  const [rejectId, setRejectId]       = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing]           = useState(false);
  const [detailLeave, setDetailLeave] = useState(null);

  const designation   = sessionStorage.getItem("designation") || "";
  const isDirector    = designation.toUpperCase().includes("DIRECTOR");
  const approvalLevel = isDirector ? "director" : "manager";

  const fetchPending = () => {
    setLoading(true);
    axios.get("/get_pending_leaves", { params: { level: approvalLevel } })
      .then((res) => { if (res.status === 200) setPending(res.data); })
      .catch(console.error).finally(() => setLoading(false));
  };
  const fetchHistory = () => {
    setHistoryLoading(true);
    axios.get("/get_leave_history", { params: { level: approvalLevel } })
      .then((res) => { if (res.status === 200) setHistory(res.data); })
      .catch(console.error).finally(() => setHistoryLoading(false));
  };

  useEffect(() => { fetchPending(); fetchHistory(); }, []);

  const handleApprove = async (id) => {
    setActing(true);
    try {
      const fd = new FormData();
      fd.append("leaveId", id); fd.append("action", "approve");
      fd.append("level", approvalLevel); fd.append("approverName", sessionStorage.getItem("empName") || "");
      await axios.post("/action_leave", fd);
      fetchPending(); fetchHistory();
    } catch (err) { console.error(err); } finally { setActing(false); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setActing(true);
    try {
      const fd = new FormData();
      fd.append("leaveId", rejectId); fd.append("action", "reject");
      fd.append("level", approvalLevel); fd.append("rejectReason", rejectReason);
      fd.append("approverName", sessionStorage.getItem("empName") || "");
      await axios.post("/action_leave", fd);
      setRejectId(null); setRejectReason("");
      fetchPending(); fetchHistory();
    } catch (err) { console.error(err); } finally { setActing(false); }
  };

  const skeletonRow = (cols) =>
    Array.from({ length: 3 }).map((_, i) => (
      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} style={tdStyle}><Skeleton variant="text" animation="wave" height={16} sx={{ borderRadius: "4px" }} /></td>
        ))}
      </tr>
    ));

  const pendingThCols = ["#","Employee","Type","Reason","From","To","Days","Action"];
  const historyThCols = ["#","Employee","Type","From","To","Days","Status","Actioned By"];

  return (
    <Box>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {[{ label: "Pending Approvals", count: pending.length }, { label: "Action History", count: history.length }].map((t, i) => (
          <button key={t.label} onClick={() => setActionTab(i)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border"
            style={{ background: actionTab === i ? "#e8f0fe" : "#fff", borderColor: actionTab === i ? "#c5d8f8" : "#e8ecf4", color: actionTab === i ? "#1565c0" : "#64748b", fontWeight: actionTab === i ? 700 : 500 }}>
            {t.label}
            <span className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: actionTab === i ? "#1565c0" : "#f0f2f8", color: actionTab === i ? "#fff" : "#94a3b8" }}>
              {t.count}
            </span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Chip size="sm" variant="soft" color={isDirector ? "primary" : "success"} sx={{ fontWeight: 700, fontSize: "0.7rem" }}>
            {isDirector ? "Director Level" : "Manager Level"}
          </Chip>
          <IconButton variant="outlined" size="sm" onClick={() => { fetchPending(); fetchHistory(); }} sx={{ borderRadius: "8px" }}>
            <Refresh sx={{ fontSize: 16 }} />
          </IconButton>
        </div>
      </div>

      {/* Pending */}
      {actionTab === 0 && (
        <Box sx={{ borderRadius: "14px", border: "1px solid #e8ecf4", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 760 }}>
              <colgroup>
                <col style={{ width: 48 }} /><col style={{ width: 140 }} /><col style={{ width: 110 }} />
                <col /><col style={{ width: 95 }} /><col style={{ width: 95 }} />
                <col style={{ width: 60 }} /><col style={{ width: 160 }} />
              </colgroup>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #0f1b35, #1565c0)" }}>
                  {pendingThCols.map((h, i, arr) => (
                    <th key={h} style={{ ...thStyle, borderRight: i < arr.length - 1 ? thStyle.borderRight : "none" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? skeletonRow(8) : pending.length === 0 ? (
                  <tr><td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: "48px 16px" }}>
                    <TaskAlt sx={{ fontSize: 36, color: "#c7caed", display: "block", margin: "0 auto 8px" }} />
                    <Typography sx={{ color: "#94a3b8", fontWeight: 600 }}>All caught up! No pending approvals.</Typography>
                  </td></tr>
                ) : pending.map((leave, i) => (
                  <tr key={leave.id} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#fafbff")}>
                    <td style={tdStyle}><div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center"><span className="text-[0.68rem] font-bold text-indigo-500">{i + 1}</span></div></td>
                    <td style={tdStyle}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #1565c0, #42a5f5)" }}>
                          <span className="text-white text-[0.65rem] font-bold">{leave.emp_name?.charAt(0)}</span>
                        </div>
                        <span className="text-[0.82rem] font-semibold text-slate-700 truncate">{leave.emp_name}</span>
                      </div>
                    </td>
                    <td style={tdStyle}><LeaveTypeBadge type={leave.leave_type} /></td>
                    <td style={{ ...tdStyle, color: "#475569" }}>{leave.reason?.split(" ").slice(0, 5).join(" ")}{leave.reason?.split(" ").length > 5 ? "…" : ""}</td>
                    <td style={{ ...tdStyle, fontSize: "0.75rem", color: "#475569" }}>{fmtDate(leave.from_date)}</td>
                    <td style={{ ...tdStyle, fontSize: "0.75rem", color: "#475569" }}>{fmtDate(leave.to_date)}</td>
                    <td style={tdStyle}><span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{leave.days}d</span></td>
                    <td style={tdStyle}>
                      <div className="flex gap-1.5 flex-wrap">
                        <Button size="sm" color="success" variant="soft" loading={acting} onClick={() => handleApprove(leave.id)}
                          sx={{ borderRadius: "8px", fontWeight: 700, fontSize: "0.72rem", px: 1.5, minWidth: 0 }}>✓ Approve</Button>
                        <Button size="sm" color="danger" variant="soft" onClick={() => setRejectId(leave.id)}
                          sx={{ borderRadius: "8px", fontWeight: 700, fontSize: "0.72rem", px: 1.5, minWidth: 0 }}>✗ Reject</Button>
                        <IconButton size="sm" variant="plain" color="neutral" onClick={() => setDetailLeave(leave)} sx={{ borderRadius: "8px" }}>
                          <Info sx={{ fontSize: 16 }} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Box>
      )}

      {/* History */}
      {actionTab === 1 && (
        <Box sx={{ borderRadius: "14px", border: "1px solid #e8ecf4", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 720 }}>
              <colgroup>
                <col style={{ width: 48 }} /><col style={{ width: 140 }} /><col style={{ width: 110 }} />
                <col style={{ width: 95 }} /><col style={{ width: 95 }} />
                <col style={{ width: 60 }} /><col style={{ width: 130 }} /><col />
              </colgroup>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #0f1b35, #1565c0)" }}>
                  {historyThCols.map((h, i, arr) => (
                    <th key={h} style={{ ...thStyle, borderRight: i < arr.length - 1 ? thStyle.borderRight : "none" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historyLoading ? skeletonRow(8) : history.length === 0 ? (
                  <tr><td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: "48px 16px" }}>
                    <BeachAccess sx={{ fontSize: 36, color: "#c7caed", display: "block", margin: "0 auto 8px" }} />
                    <Typography sx={{ color: "#94a3b8", fontWeight: 600 }}>No actions taken yet.</Typography>
                  </td></tr>
                ) : history.map((leave, i) => (
                  <tr key={leave.id} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#fafbff")}>
                    <td style={tdStyle}><div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center"><span className="text-[0.68rem] font-bold text-indigo-500">{i + 1}</span></div></td>
                    <td style={tdStyle}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #1565c0, #42a5f5)" }}>
                          <span className="text-white text-[0.65rem] font-bold">{leave.emp_name?.charAt(0)}</span>
                        </div>
                        <span className="text-[0.82rem] font-semibold text-slate-700 truncate">{leave.emp_name}</span>
                      </div>
                    </td>
                    <td style={tdStyle}><LeaveTypeBadge type={leave.leave_type} /></td>
                    <td style={{ ...tdStyle, fontSize: "0.75rem", color: "#475569" }}>{fmtDate(leave.from_date)}</td>
                    <td style={{ ...tdStyle, fontSize: "0.75rem", color: "#475569" }}>{fmtDate(leave.to_date)}</td>
                    <td style={tdStyle}><span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{leave.days}d</span></td>
                    <td style={tdStyle}><StatusBadge status={leave.status} /></td>
                    <td style={{ ...tdStyle, color: "#475569", fontSize: "0.78rem" }}>{leave.actioned_by ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Box>
      )}

      {/* Reject modal */}
      <Modal open={!!rejectId} onClose={() => { setRejectId(null); setRejectReason(""); }}>
        <ModalDialog sx={{ borderRadius: "16px", p: 0, overflow: "hidden", maxWidth: 420, width: "92vw", border: "1px solid #e8eaff" }}>
          <div className="px-5 py-4" style={{ background: "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)" }}>
            <Typography level="title-md" sx={{ color: "#fff", fontWeight: 800 }}>Reject Leave Application</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem", mt: 0.3 }}>This will notify the employee with your reason.</Typography>
          </div>
          <Box sx={{ p: 3 }}>
            <FormControl sx={{ mb: 3 }}>
              <FormLabel sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "text.secondary", mb: 0.5 }}>
                Reason for Rejection *
              </FormLabel>
              <Textarea placeholder="Provide a clear reason for rejection…" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} minRows={3} sx={{ borderRadius: "8px", "--Textarea-focusedThickness": "1.5px" }} />
            </FormControl>
            <div className="flex gap-2 justify-end">
              <Button variant="outlined" color="neutral" size="sm" onClick={() => { setRejectId(null); setRejectReason(""); }}>Cancel</Button>
              <Button size="sm" color="danger" loading={acting} disabled={!rejectReason.trim()} onClick={handleReject} sx={{ fontWeight: 700, borderRadius: "8px" }}>Confirm Rejection</Button>
            </div>
          </Box>
        </ModalDialog>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detailLeave} onClose={() => setDetailLeave(null)}>
        <ModalDialog sx={{ borderRadius: "16px", p: 0, overflow: "hidden", maxWidth: 440, width: "92vw", border: "1px solid #e8eaff" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)" }}>
            <Typography level="title-md" sx={{ color: "#fff", fontWeight: 800 }}>Leave Details</Typography>
            <ModalClose sx={{ color: "rgba(255,255,255,0.8)", position: "static", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.15)" } }} />
          </div>
          {detailLeave && (
            <Box sx={{ p: 3 }}>
              {[
                ["Employee",   detailLeave.emp_name],
                ["Leave Type", <LeaveTypeBadge type={detailLeave.leave_type} />],
                ["From",       fmtDate(detailLeave.from_date)],
                ["To",         fmtDate(detailLeave.to_date)],
                ["Days",       `${detailLeave.days} working day(s)`],
                ["Reason",     detailLeave.reason],
                ["Applied On", fmtDate(detailLeave.applied_on)],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", py: 1.2, borderBottom: "1px solid #f0f2f8", gap: 2 }}>
                  <Typography level="body-xs" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>{k}</Typography>
                  <Typography level="body-sm" sx={{ textAlign: "right", color: "#1e293b" }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </ModalDialog>
      </Modal>
    </Box>
  );
};

// ─── Reports To Cell ──────────────────────────────────────────────────────
const ReportsToCell = ({ employee, allEmployees }) => {
  const options = getReportingOptions(employee, allEmployees);

  // Local state: current saved value + draft value being edited
  const [savedValue, setSavedValue]   = useState(
    allEmployees.find((e) => e.id === employee.reportsTo) ?? null,
  );
  const [draftValue, setDraftValue]   = useState(savedValue);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  const isDirty = draftValue?.id !== savedValue?.id;

  if (isDirectorLevel(employee)) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shrink-0">
          <span className="text-white text-[0.55rem] font-bold">D</span>
        </div>
        <span className="text-[0.78rem] font-semibold text-slate-500 italic">Top level</span>
      </div>
    );
  }

  if (options.length === 0) {
    return <span className="text-[0.75rem] text-gray-400 italic">No options defined</span>;
  }

  const handleSave = async () => {
    if (!draftValue) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("empId",     employee.id);
      fd.append("reportsTo", draftValue.id);
      await axios.post("/update_reports_to", fd);
      setSavedValue(draftValue);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 min-w-0 w-45">
      <Autocomplete
        size="lg"
        options={options}
        value={draftValue}
        getOptionLabel={(opt) => opt.name ?? ""}
        isOptionEqualToValue={(opt, val) => opt.id === val?.id}
        onChange={(_, val) => setDraftValue(val)}
        placeholder="Select…"
        groupBy={(opt) =>
          opt.designation?.toUpperCase().includes("DIRECTOR") ||
          opt.branch?.toUpperCase().includes("DIRECTOR")
            ? "Directors"
            : "Seniors"
        }
        renderOption={(props, opt) => (
          <Box component="li" {...props} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.8, cursor: "pointer" }}>
            <Box sx={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #1565c0, #42a5f5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Typography sx={{ color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}>{opt.name?.charAt(0)}</Typography>
            </Box>
            <Box>
              <Typography level="body-sm" fontWeight={600}>{opt.name}</Typography>
              <Typography level="body-xs" sx={{ color: "text.tertiary" }}>{opt.designation}</Typography>
            </Box>
          </Box>
        )}
        sx={{
          flex: 1, minWidth: 140,
          borderRadius: "8px",
          "--Input-focusedThickness": "1.5px",
          fontSize: "0.8rem"
        }}
      />

      {/* Save button — only visible when value changed */}
      {isDirty && (
        <IconButton
          size="sm"
          variant="soft"
          color="primary"
          loading={saving}
          onClick={handleSave}
          title="Save"
          sx={{
            borderRadius: "8px",
            flexShrink: 0,
            bgcolor: "#e8f0fe",
            color: "#1565c0",
            border: "1px solid #c5d8f8",
            "&:hover": { bgcolor: "#1565c0", color: "#fff" },
            transition: "all 0.2s ease",
          }}
        >
          <SaveOutlined sx={{ fontSize: 15 }} />
        </IconButton>
      )}

      {/* Saved confirmation */}
      {saved && !isDirty && (
        <CheckCircle sx={{ fontSize: 18, color: "#2e7d32", flexShrink: 0 }} />
      )}
    </div>
  );
};

// ─── Main AdminPanel ──────────────────────────────────────────────────────
const AdminPanel = () => {
  const [employees, setEmployees]         = useState([]);
  const [workTypes, setWorkTypes]         = useState([]);
  const [projects, setProjects]           = useState([]);
  const [inactiveSwitch, setInactiveSwitch] = useState(null);
  const [type, setType]                   = useState("");
  const [open, setOpen]                   = useState(false);
  const [inactiveModal, setInactiveModal] = useState(false);
  const [inactiveEmployee, setInactiveEmployee] = useState("");
  const [designation, setDesignation]     = useState([]);
  const [branch, setBranch]               = useState([]);
  const [loading, setLoading]             = useState(false);
  const [organisations, setOrganisations] = useState([]);
  const [accessDenied, setAccessDenied]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem("role").toUpperCase().includes("ADMIN")) setAccessDenied(true);
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    setLoading(true);
    axios.get("/getAdminPanelLists")
      .then((res) => {
        if (res.status === 200) {
          setEmployees(res.data.employees);
          setProjects(res.data.projects);
          setWorkTypes(res.data.workTypes);
          setOrganisations(res.data.organisations);
        }
      })
      .catch(console.error).finally(() => setLoading(false));
    axios.get("/getDesignationAndBranch")
      .then((res) => {
        if (res.status === 200) {
          setDesignation(res.data.designations);
          setBranch(res.data.branches);
        }
      }).catch(console.error);
  }, []);

  const handleMarkInactive = (name) => { setInactiveEmployee(name); setInactiveModal(true); };

  const SectionHeader = ({ title, buttonLabel, buttonIcon, onAdd }) => (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, pb: 2, borderBottom: "2px solid #f0f2f8" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 4, height: 28, borderRadius: "4px", background: "linear-gradient(180deg, #1976d2, #42a5f5)" }} />
        <Typography level="title-lg" sx={{ fontWeight: 700, color: "#0f1b35" }}>{title}</Typography>
        <Chip size="sm" variant="soft" color="primary" sx={{ fontWeight: 600 }}>
          {title === "Active Employees" ? employees.length : title === "All Projects" ? projects.length : workTypes.length} records
        </Chip>
      </Box>
      <Button variant="solid" color="primary" startDecorator={buttonIcon} onClick={onAdd}
        sx={{ borderRadius: "10px", fontWeight: 600, fontSize: "0.85rem", background: "linear-gradient(135deg, #1565c0, #1976d2)", boxShadow: "0 4px 12px rgba(25,118,210,0.3)", "&:hover": { background: "linear-gradient(135deg, #0d47a1, #1565c0)", boxShadow: "0 6px 16px rgba(25,118,210,0.4)" } }}>
        {buttonLabel}
      </Button>
    </Box>
  );

  const skeletonRows = (cols) =>
    Array.from({ length: 8 }).map((_, i) => (
      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafbff" }}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} style={tdStyle}><Skeleton variant="text" animation="wave" height={20} /></td>
        ))}
      </tr>
    ));

  const TableWrapper = ({ children }) => (
    <Box sx={{ borderRadius: "14px", border: "1px solid #e8ecf4", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
      <Box sx={{ overflowX: "auto", maxHeight: 480, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>{children}</table>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ ml: { xs: 0, md: `${SIDEBAR_W}px` }, minHeight: "100vh", backgroundColor: "#f4f6fb" }}>
      <Navbar />

      <Box sx={{ background: "linear-gradient(135deg, #0f1b35 0%, #1565c0 60%, #1976d2 100%)", px: { xs: 3, md: 5 }, py: 3, mb: 0 }}>
        <Typography level="h4" sx={{ color: "#fff", fontWeight: 800, letterSpacing: "-0.02em" }}>Admin Panel</Typography>
        <Typography level="body-sm" sx={{ color: "rgba(255,255,255,0.65)", mt: 0.5 }}>Manage employees, projects and work types</Typography>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
        <Box sx={{ backgroundColor: "#fff", borderRadius: "20px", boxShadow: "0 4px 32px rgba(0,0,0,0.07)", border: "1px solid #e8ecf4", overflow: "hidden" }}>
          <Tabs defaultValue={0}>
            <TabList sx={{
              px: 3, pt: 2, gap: 1, backgroundColor: "transparent", borderBottom: "2px solid #f0f2f8", flexWrap: "wrap",
              "& .MuiTab-root": { fontWeight: 600, fontSize: "0.875rem", borderRadius: "10px 10px 0 0", color: "#64748b", border: "none", py: 1.2, px: 2.5, transition: "all 0.2s ease",
                "&:hover": { backgroundColor: "#f0f4ff", color: "#1976d2" },
                "&.Mui-selected": { color: "#1976d2", backgroundColor: "#e8f0fe", fontWeight: 700 },
              },
            }}>
              <Tab value={0} disableIndicator><ListItemDecorator sx={{ mr: 0.5 }}><Groups3 sx={{ fontSize: "1rem" }} /></ListItemDecorator>Employees</Tab>
              <Tab value={1} disableIndicator><ListItemDecorator sx={{ mr: 0.5 }}><FolderCopy sx={{ fontSize: "1rem" }} /></ListItemDecorator>Projects</Tab>
              <Tab value={2} disableIndicator><ListItemDecorator sx={{ mr: 0.5 }}><Engineering sx={{ fontSize: "1rem" }} /></ListItemDecorator>Work Types</Tab>
              <Tab value={3} disableIndicator><ListItemDecorator sx={{ mr: 0.5 }}><CalendarToday sx={{ fontSize: "1rem" }} /></ListItemDecorator>Leave Management</Tab>
            </TabList>

            {/* ── Employees Tab ── */}
            <TabPanel value={0} sx={{ p: 3 }}>
              <SectionHeader title="Active Employees" buttonLabel="Add An Employee" buttonIcon={<PersonAdd sx={{ fontSize: "1rem" }} />} onAdd={() => { setType("employee"); setOpen(true); }} />

              {/* Hierarchy legend */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <AccountTree sx={{ fontSize: 15, color: "#6366f1" }} />
                <span className="text-[0.7rem] font-semibold text-slate-500">Reporting hierarchy:</span>
                {[
                  { from: "Junior Architect / Architect Intern", to: "Senior Architect → Director" },
                  { from: "Junior Engineer / Site Engineer", to: "Senior Engineer → Director" },
                  { from: "Senior Architect / Senior Engineer", to: "Director" },
                ].map((rule) => (
                  <span key={rule.from} className="text-[0.68rem] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg font-medium">
                    {rule.from} → {rule.to}
                  </span>
                ))}
              </div>

              <TableWrapper>
                <thead>
                  <tr style={{ background: "linear-gradient(135deg, #0f1b35, #1565c0)" }}>
                    {["#","Employee ID","Employee Name","Designation","Branch","Reports To","Mark Inactive"].map((h, i, arr) => (
                      <th key={h} style={{ ...thStyle, borderRight: i < arr.length - 1 ? thStyle.borderRight : "none" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? skeletonRows(7) : employees.length === 0 ? (
                    <tr><td colSpan={7} style={tdStyle}><Box sx={{ textAlign: "center", py: 6 }}><Typography level="title-sm" sx={{ color: "#90a4ae" }}>No employees found</Typography></Box></td></tr>
                  ) : employees.map((employee, index) => (
                    <tr key={employee.id} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#fafbff" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#fff" : "#fafbff")}>
                      <td style={tdStyle}>
                        <Box sx={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#1976d2" }}>{index + 1}</Typography>
                        </Box>
                      </td>
                      <td style={tdStyle}><Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#1976d2" }}>#{employee.id}</Typography></td>
                      <td style={tdStyle}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #1565c0, #42a5f5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(25,118,210,0.25)" }}>
                            <Typography sx={{ color: "#fff", fontSize: "0.72rem", fontWeight: 700 }}>{employee.name?.charAt(0).toUpperCase()}</Typography>
                          </Box>
                          <Typography sx={{ fontSize: "0.82rem", fontWeight: 500 }}>{employee.name}</Typography>
                        </Box>
                      </td>
                      <td style={tdStyle}>
                        <Chip size="sm" sx={{ backgroundColor: "#f0f4ff", color: "#1565c0", fontWeight: 600, fontSize: "0.72rem", border: "1px solid #c5cae9", borderRadius: "6px" }}>
                          {employee.designation}
                        </Chip>
                      </td>
                      <td style={tdStyle}><Typography sx={{ fontSize: "0.82rem", color: "#475569" }}>{employee.branch}</Typography></td>

                      {/* ── Reports To ── */}
                      <td style={{ ...tdStyle, minWidth: 220 }}>
                        <ReportsToCell employee={employee} allEmployees={employees} />
                      </td>

                      <td style={tdStyle}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Switch variant="plain" color="danger" size="sm"
                            checked={inactiveSwitch === employee.name}
                            onChange={(e) => { if (e.target.checked) { setInactiveSwitch(employee.name); handleMarkInactive(employee.name); } else { setInactiveSwitch(null); } }}
                          />
                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: inactiveSwitch === employee.name ? "#c62828" : "#94a3b8", transition: "color 0.2s ease" }}>
                            {inactiveSwitch === employee.name ? "Marking..." : "Mark Inactive"}
                          </Typography>
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrapper>
            </TabPanel>

            {/* ── Projects Tab ── */}
            <TabPanel value={1} sx={{ p: 3 }}>
              <SectionHeader title="All Projects" buttonLabel="Add Project" buttonIcon={<CreateNewFolder sx={{ fontSize: "1rem" }} />} onAdd={() => { setType("project"); setOpen(true); }} />
              <TableWrapper>
                <thead>
                  <tr style={{ background: "linear-gradient(135deg, #0f1b35, #1565c0)" }}>
                    {["#","Project ID","Project Code","Project Name"].map((h, i, arr) => (
                      <th key={h} style={{ ...thStyle, borderRight: i < arr.length - 1 ? thStyle.borderRight : "none" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? skeletonRows(4) : projects.length === 0 ? (
                    <tr><td colSpan={4} style={tdStyle}><Box sx={{ textAlign: "center", py: 6 }}><Typography level="title-sm" sx={{ color: "#90a4ae" }}>No projects found</Typography></Box></td></tr>
                  ) : projects.map((project, index) => (
                    <tr key={project.id} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#fafbff" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#fff" : "#fafbff")}>
                      <td style={tdStyle}><Box sx={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}><Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#1976d2" }}>{index + 1}</Typography></Box></td>
                      <td style={tdStyle}><Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#1976d2" }}>#{project.id}</Typography></td>
                      <td style={tdStyle}><Chip size="sm" sx={{ backgroundColor: "#e8f5e9", color: "#2e7d32", fontWeight: 700, fontSize: "0.72rem", border: "1px solid #a5d6a7", borderRadius: "6px" }}>{project.code}</Chip></td>
                      <td style={tdStyle}><Typography sx={{ fontSize: "0.82rem", fontWeight: 500 }}>{project.name}</Typography></td>
                    </tr>
                  ))}
                </tbody>
              </TableWrapper>
            </TabPanel>

            {/* ── Work Types Tab ── */}
            <TabPanel value={2} sx={{ p: 3 }}>
              <SectionHeader title="Work Types" buttonLabel="Add Work Type" buttonIcon={<AddCircle sx={{ fontSize: "1rem" }} />} onAdd={() => { setType("workType"); setOpen(true); }} />
              <TableWrapper>
                <thead>
                  <tr style={{ background: "linear-gradient(135deg, #0f1b35, #1565c0)" }}>
                    {["#","Work Type ID","Work Type"].map((h, i, arr) => (
                      <th key={h} style={{ ...thStyle, borderRight: i < arr.length - 1 ? thStyle.borderRight : "none" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? skeletonRows(3) : workTypes.length === 0 ? (
                    <tr><td colSpan={3} style={tdStyle}><Box sx={{ textAlign: "center", py: 6 }}><Typography level="title-sm" sx={{ color: "#90a4ae" }}>No work types found</Typography></Box></td></tr>
                  ) : workTypes.map((workType, index) => (
                    <tr key={workType.id} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#fafbff" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#fff" : "#fafbff")}>
                      <td style={tdStyle}><Box sx={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}><Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#1976d2" }}>{index + 1}</Typography></Box></td>
                      <td style={tdStyle}><Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#1976d2" }}>#{workType.id}</Typography></td>
                      <td style={tdStyle}><Chip size="sm" sx={{ backgroundColor: "#fff8e1", color: "#e65100", fontWeight: 600, fontSize: "0.72rem", border: "1px solid #ffcc80", borderRadius: "6px" }}>{workType.name}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </TableWrapper>
            </TabPanel>

            {/* ── Leave Management Tab ── */}
            <TabPanel value={3} sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, pb: 2, borderBottom: "2px solid #f0f2f8" }}>
                <Box sx={{ width: 4, height: 28, borderRadius: "4px", background: "linear-gradient(180deg, #1976d2, #42a5f5)" }} />
                <Typography level="title-lg" sx={{ fontWeight: 700, color: "#0f1b35" }}>Leave Approvals</Typography>
                <Chip size="sm" variant="soft" color="primary" sx={{ fontWeight: 600 }}>
                  {sessionStorage.getItem("designation")?.toUpperCase().includes("DIRECTOR") ? "Director Level" : "Manager Level"}
                </Chip>
              </Box>
              <LeaveApprovalPanel />
            </TabPanel>
          </Tabs>
        </Box>
      </Box>

      <AdminPanelAdd type={type} open={open} onClose={() => setOpen(false)} designations={designation} organisations={organisations} branches={branch} />
      <MarkInactive open={inactiveModal} onClose={() => { setInactiveModal(false); setInactiveSwitch(null); }} employeeName={inactiveEmployee} />
      <AccessDenied open={accessDenied} onClose={() => { setAccessDenied(false); navigate("/dashboard"); }} location={"Admin Panel"} />
    </Box>
  );
};

export default AdminPanel;