import {
  Button,
  Chip,
  FormControl,
  FormLabel,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Textarea,
} from "@mui/joy";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Toast from "./Toast";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// ── Inline styles (no extra CSS file needed) ──────────────────────────────────
const styles = {
  dialog: {
    background: "linear-gradient(160deg, #0f1923 0%, #111d2b 100%)",
    border: "1px solid rgba(99,179,237,0.15)",
    borderRadius: "20px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,179,237,0.08)",
    padding: "0",
    maxWidth: "480px",
    width: "100%",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "'DM Sans', sans-serif",
    color: "#e2eaf4",
  },
  dialogHeader: {
    padding: "1.75rem 2rem 0",
    flexShrink: 0,
  },
  dialogBody: {
    overflowY: "auto",
    padding: "0 2rem",
    flex: 1,
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(99,179,237,0.2) transparent",
  },
  dialogFooter: {
    padding: "1rem 2rem 1.75rem",
    flexShrink: 0,
    background: "linear-gradient(to top, #0f1923 60%, transparent)",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    marginBottom: "0.25rem",
  },
  taskBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    background: "rgba(99,179,237,0.12)",
    border: "1px solid rgba(99,179,237,0.25)",
    borderRadius: "8px",
    padding: "2px 10px",
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#63b3ed",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  titleText: {
    fontSize: "1.35rem",
    fontWeight: 700,
    color: "#e2eaf4",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: "0.82rem",
    color: "rgba(162,183,206,0.7)",
    marginBottom: "1.5rem",
    marginTop: "0.2rem",
  },
  divider: {
    height: "1px",
    background:
      "linear-gradient(90deg, rgba(99,179,237,0.2) 0%, transparent 100%)",
    marginBottom: "1.5rem",
  },
  infoCard: {
    background: "rgba(99,179,237,0.06)",
    border: "1px solid rgba(99,179,237,0.14)",
    borderRadius: "12px",
    padding: "0.85rem 1rem",
    marginBottom: "1.25rem",
  },
  infoLabel: {
    fontSize: "0.7rem",
    fontWeight: 600,
    color: "#63b3ed",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "0.3rem",
  },
  infoText: {
    fontSize: "0.86rem",
    color: "#b8cde0",
    lineHeight: 1.5,
  },
  fieldLabel: {
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "rgba(162,183,206,0.8)",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    marginBottom: "0.4rem",
  },
  textArea: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(99,179,237,0.2)",
    borderRadius: "10px",
    color: "#e2eaf4",
    fontSize: "0.88rem",
    "--Textarea-focusedHighlight": "rgba(99,179,237,0.35)",
    "&:hover": { borderColor: "rgba(99,179,237,0.35)" },
  },
  saveBtn: {
    width: "100%",
    height: "44px",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.9rem",
    letterSpacing: "0.04em",
    background: "linear-gradient(135deg, #2b6cb0 0%, #1a4a7a 100%)",
    color: "#fff",
    border: "none",
    boxShadow: "0 4px 20px rgba(43,108,176,0.35)",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 8px 28px rgba(43,108,176,0.5)",
    },
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1rem 0 0.5rem",
    gap: "0.5rem",
  },
  loadingText: {
    fontSize: "0.82rem",
    color: "rgba(162,183,206,0.65)",
    letterSpacing: "0.04em",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  selectWrap: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(99,179,237,0.2)",
    borderRadius: "10px",
    color: "#e2eaf4",
    fontSize: "0.88rem",
  },
};

// ── Shared font import via a style tag ────────────────────────────────────────
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .edit-modal-form { animation: fadeSlideUp 0.3s ease forwards; }

    .edit-modal-textarea textarea {
      background: transparent !important;
      color: #e2eaf4 !important;
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.88rem !important;
      resize: vertical;
    }
    .edit-modal-textarea textarea::placeholder { color: rgba(162,183,206,0.4) !important; }

    .edit-modal-select button {
      background: transparent !important;
      color: #b8cde0 !important;
      font-family: 'DM Sans', sans-serif !important;
    }

    .edit-modal-save-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 28px rgba(43,108,176,0.5) !important;
    }
  `}</style>
);

// ── Sub-components ─────────────────────────────────────────────────────────────
const LoadingState = ({ text }) => (
  <div style={styles.loadingWrap}>
    <DotLottieReact
      src="https://lottie.host/ff324918-7d65-4e25-bc65-e53cbb3a9719/pI4WQn4Vaa.lottie"
      loop
      autoplay
      style={{ height: 160, width: 160 }}
    />
    <span style={styles.loadingText}>{text}</span>
  </div>
);

const InfoCard = ({ taskDesc, remarks }) => (
  <div style={styles.infoCard}>
    <div style={styles.infoLabel}>Current Task</div>
    <div style={styles.infoText}>{taskDesc || "—"}</div>
    {remarks && (
      <>
        <div style={{ ...styles.infoLabel, marginTop: "0.6rem" }}>Remarks</div>
        <div style={styles.infoText}>{remarks}</div>
      </>
    )}
  </div>
);

const FieldGroup = ({ label, placeholder, onChange }) => (
  <FormControl style={{ marginBottom: "0.85rem" }}>
    <FormLabel style={styles.fieldLabel}>{label}</FormLabel>
    <Textarea
      className="edit-modal-textarea"
      placeholder={placeholder}
      minRows={2}
      onChange={onChange}
      sx={styles.textArea}
    />
  </FormControl>
);

// ── Main component ─────────────────────────────────────────────────────────────
const loadingMessages = [
  "Fetching task updates…",
  "Analyzing task progress…",
  "Synchronizing employee updates…",
  "Reviewing task history…",
  "Preparing task details…",
  "Connecting to task server…",
  "Optimizing task data…",
  "Loading latest updates…",
  "Finalizing task information…",
  "Almost ready…",
];

const EditModal = ({ open, onClose, taskId, type, onSaved }) => {
  const [taskData, setTaskData] = useState({});
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [taskUpdates, setTaskUpdates] = useState("");
  const [remarksUpdates, setRemarksUpdates] = useState("");
  const [statusUpdates, setStatusUpdates] = useState("");
  const [toastStatus, setToastStatus] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {
    axios.defaults.baseURL = "https://mcpl-task-management-system.vercel.app/";
    if (!open || !taskId) return;
    setLoading(true);
    axios
      .get(`/getTaskUpdates/${taskId}`)
      .then((res) => {
        if (res.status === 200) {
          setTaskData(res.data);
          setToastStatus("success");
          setToastMessage("Task updates loaded");
          setToastShow(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setToastStatus("error");
        setToastMessage("Something went wrong. Please check the console.");
        setToastShow(true);
      })
      .finally(() => setLoading(false));
  }, [taskId, open]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingIndex((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * loadingMessages.length);
        } while (next === prev);
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleTasksUnderReviewUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id", taskId);
    formData.append("taskDescUpdates", taskUpdates);
    formData.append("remarksUpdates", remarksUpdates);
    formData.append("status", statusUpdates);
    formData.append("editedBy", sessionStorage.getItem("empName"));
    setButtonLoading(true);
    axios
      .put("/update_tasks_under_review", formData)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setToastStatus(data.status);
          setToastMessage(data.message);
          setToastShow(true);
          onSaved?.(taskId);
        }
      })
      .catch((err) => {
        console.error(err);
        setToastStatus("error");
        setToastMessage("Something went wrong. Please check the console.");
        setToastShow(true);
      })
      .finally(() => setButtonLoading(false));
  };

  const handleTaskUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("taskDesc", taskUpdates);
    formData.append("remarks", remarksUpdates);
    formData.append("editedBy", sessionStorage.getItem("empName"));
    setButtonLoading(true);
    axios
      .put("/update_task_assigned", formData)
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          setToastStatus(data.status);
          setToastMessage(data.message+" Please Refresh the dashboard once.");
          setToastShow(true);
          window.location.reload();
        }
      })
      .catch((err) => {
        console.error(err);
        setToastStatus("error");
        setToastMessage("Something went wrong. Please check the console.");
        setToastShow(true);
      })
      .finally(() => setButtonLoading(false));
  };

  const isUnderReview = type === "underReview";
  const handleSave = isUnderReview
    ? handleTasksUnderReviewUpdate
    : handleTaskUpdate;

  return (
    <>
      <FontImport />
      <Modal open={open} onClose={onClose}>
        <ModalDialog sx={styles.dialog}>
          <ModalClose
            sx={{
              top: "1rem",
              right: "1rem",
              color: "rgba(162,183,206,0.5)",
              "&:hover": {
                color: "#e2eaf4",
                background: "rgba(255,255,255,0.06)",
              },
            }}
          />

          {/* ── Fixed Header ── */}
          <div style={styles.dialogHeader}>
            <div style={styles.titleRow}>
              <span style={styles.taskBadge}>
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <circle cx="4.5" cy="4.5" r="4.5" fill="#63b3ed" />
                </svg>
                Task #{taskId}
              </span>
            </div>
            <div style={styles.titleText}>
              {isUnderReview ? "Review & Update" : "Edit Task"}
            </div>
            <div style={styles.subtitle}>
              Update the task contents using the form below.
            </div>
            <div style={styles.divider} />
          </div>

          {/* ── Scrollable Body ── */}
          <div style={styles.dialogBody}>
            {loading ? (
              <LoadingState text={loadingMessages[loadingIndex]} />
            ) : (
              <div className="edit-modal-form">
                <InfoCard
                  taskDesc={taskData.taskDesc}
                  remarks={taskData.remarks}
                />
                <FieldGroup
                  label="Task Description Update"
                  placeholder="What changed? Describe the update…"
                  onChange={(e) => setTaskUpdates(e.target.value)}
                />
                <FieldGroup
                  label="Remarks Update"
                  placeholder="Any additional remarks…"
                  onChange={(e) => setRemarksUpdates(e.target.value)}
                />
                {isUnderReview && (
                  <FormControl style={{ marginBottom: "0.85rem" }}>
                    <FormLabel style={styles.fieldLabel}>
                      Update Status
                    </FormLabel>
                    <Select
                      className="edit-modal-select"
                      placeholder="Select new status…"
                      onChange={(e, newVal) => setStatusUpdates(newVal)}
                      sx={styles.selectWrap}
                    >
                      <Option value="Pending">
                        <Chip
                          color="warning"
                          size="sm"
                          variant="soft"
                          sx={{ fontWeight: 600 }}
                        >
                          Pending
                        </Chip>
                      </Option>
                      <Option value="Reloaded">
                        <Chip
                          color="danger"
                          size="sm"
                          variant="soft"
                          sx={{ fontWeight: 600 }}
                        >
                          Reloaded
                        </Chip>
                      </Option>
                      <Option value="Cleared">
                        <Chip
                          color="success"
                          size="sm"
                          variant="soft"
                          sx={{ fontWeight: 600 }}
                        >
                          Cleared
                        </Chip>
                      </Option>
                    </Select>
                  </FormControl>
                )}
              </div>
            )}
          </div>

          {/* ── Sticky Footer ── */}
          {!loading && (
            <div style={styles.dialogFooter}>
              <Button
                className="edit-modal-save-btn"
                loading={buttonLoading}
                onClick={handleSave}
                sx={styles.saveBtn}
              >
                Save Changes
              </Button>
            </div>
          )}
        </ModalDialog>
      </Modal>

      <Toast
        open={toastShow}
        message={toastMessage}
        status={toastStatus}
        onClose={() => setToastShow(false)}
      />
    </>
  );
};

export default EditModal;
