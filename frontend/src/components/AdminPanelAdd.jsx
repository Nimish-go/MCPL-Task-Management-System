import {
  AddCircle,
  CreateNewFolder,
  PersonAdd,
  FolderSpecial,
  WorkOutline,
  PersonOutline,
} from "@mui/icons-material";
import {
  Autocomplete,
  AutocompleteOption,
  Drawer,
  Input,
  ListItemContent,
  Textarea,
} from "@mui/joy";
import axios from "axios";
import React, { useState } from "react";
import Toast from "./Toast";

// ── Shared style injection ────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("admin-panel-styles")) return;
  const el = document.createElement("style");
  el.id = "admin-panel-styles";
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

    .ap-drawer .MuiDrawer-paper,
    .ap-drawer > div > div {
      background: linear-gradient(160deg, #0c1520 0%, #0f1b2a 100%) !important;
      border-left: 1px solid rgba(99,179,237,0.12) !important;
      box-shadow: -24px 0 64px rgba(0,0,0,0.5) !important;
      font-family: 'DM Sans', sans-serif !important;
    }

    @keyframes ap-slide-in {
      from { opacity: 0; transform: translateX(24px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .ap-form-body {
      animation: ap-slide-in 0.3s cubic-bezier(0.22,1,0.36,1) forwards;
    }

    .ap-input input,
    .ap-input textarea {
      background: transparent !important;
      color: #e2eaf4 !important;
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.875rem !important;
    }
    .ap-input input::placeholder,
    .ap-input textarea::placeholder {
      color: rgba(162,183,206,0.35) !important;
    }
    .ap-input input:disabled {
      color: rgba(162,183,206,0.4) !important;
    }

    .ap-select button {
      background: transparent !important;
      color: #b8cde0 !important;
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.875rem !important;
    }

    /* Autocomplete overrides — kill white hover/focus backgrounds */
    .ap-autocomplete {
      background: rgba(255,255,255,0.04) !important;
    }
    .ap-autocomplete input {
      color: #e2eaf4 !important;
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.875rem !important;
      background: transparent !important;
    }
    .ap-autocomplete input::placeholder {
      color: rgba(162,183,206,0.35) !important;
    }
    /* The wrapper div that gets the white bg on hover/focus */
    .ap-autocomplete > div:first-of-type,
    .ap-autocomplete [class*="JoyAutocomplete-root"],
    .ap-autocomplete:hover,
    .ap-autocomplete:focus-within {
      background: rgba(255,255,255,0.04) !important;
    }
    /* Autocomplete portal dropdown — rendered outside drawer so must use global selectors */
    ul[role="listbox"] {
      background: #0d1b2a !important;
      border: 1px solid rgba(99,179,237,0.18) !important;
      border-radius: 12px !important;
      padding: 6px !important;
      box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,179,237,0.06) !important;
      backdrop-filter: blur(8px) !important;
    }
    ul[role="listbox"] li {
      color: #b8cde0 !important;
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.875rem !important;
      border-radius: 7px !important;
      padding: 8px 12px !important;
      transition: background 0.12s ease !important;
    }
    ul[role="listbox"] li:hover,
    ul[role="listbox"] li[aria-selected="true"],
    ul[role="listbox"] li.Joy-focused {
      background: rgba(99,179,237,0.12) !important;
      color: #e2eaf4 !important;
    }
    ul[role="listbox"] li[aria-selected="true"] {
      background: rgba(99,179,237,0.18) !important;
      color: #63b3ed !important;
      font-weight: 600 !important;
    }
    /* Scrollbar inside dropdown */
    ul[role="listbox"]::-webkit-scrollbar { width: 4px; }
    ul[role="listbox"]::-webkit-scrollbar-track { background: transparent; }
    ul[role="listbox"]::-webkit-scrollbar-thumb {
      background: rgba(99,179,237,0.25);
      border-radius: 4px;
    }

    .ap-submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 28px rgba(43,108,176,0.5) !important;
    }

    .ap-field-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 1rem;
    }

    .ap-field-label {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: rgba(162,183,206,0.7);
    }

    /* Scrollbar */
    .ap-scroll::-webkit-scrollbar { width: 4px; }
    .ap-scroll::-webkit-scrollbar-track { background: transparent; }
    .ap-scroll::-webkit-scrollbar-thumb {
      background: rgba(99,179,237,0.2);
      border-radius: 4px;
    }
  `;
  document.head.appendChild(el);
};

// ── Run immediately on import — no render lag ─────────────────────────────────
injectStyles();
axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";

// ── Shared field style tokens ─────────────────────────────────────────────────
const fieldSx = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(99,179,237,0.18)",
  borderRadius: "10px",
  color: "#e2eaf4",
  fontSize: "0.875rem",
  fontFamily: "'DM Sans', sans-serif",
  "--Input-focusedHighlight": "rgba(99,179,237,0.35)",
  "--Textarea-focusedHighlight": "rgba(99,179,237,0.35)",
  "--Autocomplete-focusedHighlight": "rgba(99,179,237,0.35)",
  "&:hover": {
    borderColor: "rgba(99,179,237,0.3)",
    background: "rgba(255,255,255,0.04)",
  },
  "&:focus-within": {
    background: "rgba(255,255,255,0.04)",
  },
};

// ── Section header for the drawer types ──────────────────────────────────────
const TYPE_META = {
  project: {
    Icon: FolderSpecial,
    color: "#63b3ed",
    colorDim: "rgba(99,179,237,0.12)",
    colorBorder: "rgba(99,179,237,0.25)",
    title: "Add a Project",
    subtitle: "Register a new project and its client details",
  },
  workType: {
    Icon: WorkOutline,
    color: "#a78bfa",
    colorDim: "rgba(167,139,250,0.12)",
    colorBorder: "rgba(167,139,250,0.25)",
    title: "Add Work Type",
    subtitle: "Define a new category of work",
  },
  employee: {
    Icon: PersonOutline,
    color: "#34d399",
    colorDim: "rgba(52,211,153,0.12)",
    colorBorder: "rgba(52,211,153,0.25)",
    title: "Add an Employee",
    subtitle: "Onboard a new team member to the system",
  },
};

// ── Reusable field wrapper ────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="ap-field-group">
    <label className="ap-field-label">{label}</label>
    {children}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const AdminPanelAdd = ({
  open,
  onClose,
  type,
  designations = [],
  branches = [],
  organisations,
}) => {
  const [projectName, setProjectName] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddr, setClientAddr] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [remarks, setRemarks] = useState("");

  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [dob, setDOB] = useState("");
  const [doj, setDOJ] = useState("");
  const [designation, setDesignation] = useState(0);
  const [branch, setBranch] = useState(0);
  const [role, setRole] = useState("");

  const [workType, setWorkType] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastStatus, setToastStatus] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  const organisation = sessionStorage.getItem("org");

  const toast = (status, message) => {
    setToastStatus(status);
    setToastMessage(message);
    setToastOpen(true);
  };

  const addEmployee = (e) => {
    e.preventDefault();
    if (!validateEmployee()) return toast("warning", "Please fill in all fields.");
    setLoading(true);
    const fd = new FormData();
    fd.append("empName", employeeName);
    fd.append("empEmail", employeeEmail);
    fd.append("dob", dob);
    fd.append("doj", doj);
    fd.append("designation", designation);
    fd.append("branch", branch);
    fd.append("role", role);
    fd.append("organisation", organisation);
    axios.post("/addEmployee", fd)
      .then((res) => {
        if (res.status === 200) {
          toast(res.data.status, res.data.message);
          resetEmployee();
          onClose();
          setTimeout(() => window.location.reload(), 3000);
        }
      })
      .catch(() => toast("error", "Something went wrong. Please check the console."))
      .finally(() => setLoading(false));
  };

  const addProject = (e) => {
    e.preventDefault();
    if (!validateProject()) return toast("warning", "Please fill in all fields.");
    setLoading(true);
    const fd = new FormData();
    fd.append("projectCode", projectCode);
    fd.append("projectName", projectName);
    fd.append("clientName", clientName);
    fd.append("clientAddr", clientAddr);
    fd.append("clientContact", clientContact);
    fd.append("org", organisation);
    fd.append("remarks", remarks);
    axios.post("/addProject", fd)
      .then((res) => {
        if (res.status === 200) {
          toast(res.data.status, res.data.message);
          resetProject();
          onClose();
          setTimeout(() => window.location.reload(), 3000);
        }
      })
      .catch(() => toast("error", "Something went wrong. Please check the console."))
      .finally(() => setLoading(false));
  };

  const addWorkType = (e) => {
    e.preventDefault();
    if (!validateWorkType()) return toast("warning", "Please fill in all fields.");
    setLoading(true);
    const fd = new FormData();
    fd.append("workType", workType);
    fd.append("remarks", remarks);
    axios.post("/addWorkType", fd)
      .then((res) => {
        if (res.status === 200) {
          toast(res.data.status, res.data.message);
          resetWorkType();
          onClose();
          setTimeout(() => window.location.reload(), 3000);
        }
      })
      .catch(() => toast("error", "Something went wrong. Please check the console."))
      .finally(() => setLoading(false));
  };

  const validateEmployee = () =>
    employeeName && employeeEmail && dob && doj && designation && branch && role;
  const validateProject = () =>
    projectCode && projectName && clientName && clientContact && clientAddr;
  const validateWorkType = () => !!workType;

  const resetEmployee = () => {
    setEmployeeName(""); setEmployeeEmail(""); setDOB(""); setDOJ("");
    setDesignation(""); setBranch(""); setRole("");
  };
  const resetProject = () => {
    setProjectCode(""); setProjectName(""); setClientName("");
    setClientContact(""); setClientAddr(""); setRemarks("");
  };
  const resetWorkType = () => { setWorkType(""); setRemarks(""); };

  const meta = TYPE_META[type];

  const btnColor = { project: "#2b6cb0", workType: "#6d4bb5", employee: "#0d7a55" };
  const btnAccent = btnColor[type] || "#2b6cb0";

  return (
    <>
      <Drawer
        className="ap-drawer"
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          content: {
            sx: {
              background: "linear-gradient(160deg, #0c1520 0%, #0f1b2a 100%)",
              borderLeft: "1px solid rgba(99,179,237,0.12)",
              boxShadow: "-24px 0 64px rgba(0,0,0,0.5)",
              width: { xs: "100vw", sm: "420px" },
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            },
          },
        }}
      >
        {/* ── Fixed Header ── */}
        {meta && (
          <div
            style={{
              flexShrink: 0,
              padding: "1.75rem 1.75rem 0",
              borderBottom: "1px solid rgba(99,179,237,0.08)",
              paddingBottom: "1.25rem",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "1.1rem",
                right: "1.1rem",
                width: 30,
                height: 30,
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "none",
                color: "rgba(162,183,206,0.55)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                lineHeight: 1,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#e2eaf4"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(162,183,206,0.55)"; }}
            >
              ✕
            </button>

            {/* Icon pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: meta.colorDim,
                border: `1px solid ${meta.colorBorder}`,
                borderRadius: "10px",
                padding: "5px 12px 5px 8px",
                marginBottom: "0.85rem",
              }}
            >
              <meta.Icon style={{ fontSize: 16, color: meta.color }} />
              <span style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: meta.color,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {type === "project" ? "Project" : type === "workType" ? "Work Type" : "Employee"}
              </span>
            </div>

            <div style={{
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#e2eaf4",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {meta.title}
            </div>
            <div style={{
              fontSize: "0.82rem",
              color: "rgba(162,183,206,0.6)",
              marginTop: "0.25rem",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {meta.subtitle}
            </div>
          </div>
        )}

        {/* ── Scrollable Body ── */}
        <div
          className="ap-scroll ap-form-body"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem 1.75rem",
          }}
        >
          {type === "project" && (
            <>
              <Field label="Project Code">
                <Input className="ap-input" placeholder="XYZ01" value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)} sx={fieldSx} />
              </Field>
              <Field label="Project Name">
                <Input className="ap-input" placeholder="Full project name…" value={projectName}
                  onChange={(e) => setProjectName(e.target.value)} sx={fieldSx} />
              </Field>
              <Field label="Client Name">
                <Input className="ap-input" placeholder="ABC Client…" value={clientName}
                  onChange={(e) => setClientName(e.target.value)} sx={fieldSx} />
              </Field>
              <Field label="Client Contact">
                <Input className="ap-input" placeholder="Mobile / Email" value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)} sx={fieldSx} />
              </Field>
              <Field label="Client Address">
                <Textarea className="ap-input" placeholder="221B Baker Street…" minRows={3}
                  value={clientAddr} onChange={(e) => setClientAddr(e.target.value)} sx={fieldSx} />
              </Field>
              <Field label="Remarks">
                <Input className="ap-input" placeholder="Any additional notes…" value={remarks}
                  onChange={(e) => setRemarks(e.target.value)} sx={fieldSx} />
              </Field>
            </>
          )}

          {type === "workType" && (
            <>
              <Field label="Work Type">
                <Input className="ap-input" placeholder="Designing / Drafting…" value={workType}
                  onChange={(e) => setWorkType(e.target.value)} sx={fieldSx} />
              </Field>
              <Field label="Remarks">
                <Input className="ap-input" placeholder="Any additional notes…" value={remarks}
                  onChange={(e) => setRemarks(e.target.value)} sx={fieldSx} />
              </Field>
            </>
          )}

          {type === "employee" && (
            <>
              <Field label="Full Name">
                <Input className="ap-input" placeholder="Joe Stern" value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)} sx={fieldSx} />
              </Field>
              <Field label="Email Address">
                <Input className="ap-input" type="email" placeholder="joe@example.com"
                  value={employeeEmail} onChange={(e) => setEmployeeEmail(e.target.value)} sx={fieldSx} />
              </Field>

              {/* Side-by-side dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <Field label="Date of Birth">
                  <Input className="ap-input" type="date" value={dob}
                    onChange={(e) => setDOB(e.target.value)} sx={fieldSx} />
                </Field>
                <Field label="Date of Joining">
                  <Input className="ap-input" type="date" value={doj}
                    onChange={(e) => setDOJ(e.target.value)} sx={fieldSx} />
                </Field>
              </div>

              <Field label="Designation">
                <Autocomplete
                  className="ap-autocomplete"
                  placeholder="Search designation…"
                  options={designations}
                  getOptionLabel={(o) => o?.name ?? ""}
                  isOptionEqualToValue={(o, v) => o.id === v?.id}
                  onChange={(_, v) => setDesignation(v?.id ?? 0)}
                  renderOption={(props, o) => (
                    <AutocompleteOption {...props} key={o.id}>
                      <ListItemContent sx={{ color: "#b8cde0", fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem" }}>
                        {o.name}
                      </ListItemContent>
                    </AutocompleteOption>
                  )}
                  sx={fieldSx}
                />
              </Field>

              <Field label="Branch">
                <Autocomplete
                  className="ap-autocomplete"
                  placeholder="Search branch…"
                  options={branches}
                  getOptionLabel={(o) => o?.name ?? ""}
                  isOptionEqualToValue={(o, v) => o.id === v?.id}
                  onChange={(_, v) => setBranch(v?.id ?? 0)}
                  renderOption={(props, o) => (
                    <AutocompleteOption {...props} key={o.id}>
                      <ListItemContent sx={{ color: "#b8cde0", fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem" }}>
                        {o.name}
                      </ListItemContent>
                    </AutocompleteOption>
                  )}
                  sx={fieldSx}
                />
              </Field>

              <Field label="Organisation">
                <Input className="ap-input" value={organisation} disabled sx={{
                  ...fieldSx,
                  opacity: 0.55,
                  cursor: "not-allowed",
                }} />
              </Field>

              <Field label="Role">
                <Autocomplete
                  className="ap-autocomplete"
                  placeholder="Select role…"
                  options={[{ label: "User", value: "User" }, { label: "Admin", value: "Admin" }]}
                  getOptionLabel={(o) => o?.label ?? ""}
                  isOptionEqualToValue={(o, v) => o.value === v?.value}
                  onChange={(_, v) => setRole(v?.value ?? "")}
                  renderOption={(props, o) => (
                    <AutocompleteOption {...props} key={o.value}>
                      <ListItemContent sx={{ color: "#b8cde0", fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem" }}>
                        {o.label}
                      </ListItemContent>
                    </AutocompleteOption>
                  )}
                  sx={fieldSx}
                />
              </Field>
            </>
          )}
        </div>

        {/* ── Sticky Footer ── */}
        {meta && (
          <div style={{
            flexShrink: 0,
            padding: "1rem 1.75rem 1.75rem",
            borderTop: "1px solid rgba(99,179,237,0.08)",
            background: "linear-gradient(to top, #0c1520 60%, transparent)",
          }}>
            <button
              className="ap-submit-btn"
              disabled={loading}
              onClick={type === "project" ? addProject : type === "workType" ? addWorkType : addEmployee}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "10px",
                background: loading
                  ? "rgba(255,255,255,0.07)"
                  : `linear-gradient(135deg, ${btnAccent} 0%, ${btnAccent}cc 100%)`,
                border: "none",
                color: loading ? "rgba(162,183,206,0.4)" : "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.03em",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: loading ? "none" : `0 4px 20px ${btnAccent}55`,
                transition: "all 0.2s ease",
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(162,183,206,0.2)",
                    borderTopColor: "rgba(162,183,206,0.6)",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Saving…
                </>
              ) : (
                <>
                  {type === "project" ? <CreateNewFolder style={{ fontSize: 18 }} />
                    : type === "workType" ? <AddCircle style={{ fontSize: 18 }} />
                    : <PersonAdd style={{ fontSize: 18 }} />}
                  {type === "project" ? "Add Project"
                    : type === "workType" ? "Add Work Type"
                    : "Add Employee"}
                </>
              )}
            </button>
          </div>
        )}
      </Drawer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Toast
        open={toastOpen}
        status={toastStatus}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
};

export default AdminPanelAdd;