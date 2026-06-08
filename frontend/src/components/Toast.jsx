import React, { useEffect, useRef, useState } from "react";
import { Check, ErrorOutline, WarningAmber, Close } from "@mui/icons-material";

// ── Config ────────────────────────────────────────────────────────────────────
const AUTO_CLOSE_MS = 4500;

const VARIANTS = {
  success: {
    accent: "#34d399",
    accentDim: "rgba(52,211,153,0.12)",
    accentBorder: "rgba(52,211,153,0.25)",
    iconBg: "rgba(52,211,153,0.15)",
    label: "Success",
    Icon: Check,
  },
  error: {
    accent: "#f87171",
    accentDim: "rgba(248,113,113,0.12)",
    accentBorder: "rgba(248,113,113,0.25)",
    iconBg: "rgba(248,113,113,0.15)",
    label: "Error",
    Icon: ErrorOutline,
  },
  warning: {
    accent: "#fbbf24",
    accentDim: "rgba(251,191,36,0.12)",
    accentBorder: "rgba(251,191,36,0.25)",
    iconBg: "rgba(251,191,36,0.15)",
    label: "Warning",
    Icon: WarningAmber,
  },
};

// ── Styles ────────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("toast-styles")) return;
  const el = document.createElement("style");
  el.id = "toast-styles";
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateX(110%) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes toast-out {
      from {
        opacity: 1;
        transform: translateX(0) scale(1);
        max-height: 120px;
        margin-bottom: 0;
      }
      to {
        opacity: 0;
        transform: translateX(110%) scale(0.95);
        max-height: 0;
        margin-bottom: -8px;
      }
    }

    @keyframes toast-progress {
      from { width: 100%; }
      to   { width: 0%; }
    }

    .toast-item {
      animation: toast-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      font-family: 'DM Sans', sans-serif;
    }

    .toast-item.leaving {
      animation: toast-out 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
    }

    .toast-progress-bar {
      animation: toast-progress linear forwards;
    }

    .toast-dismiss-btn {
      transition: background 0.15s ease, opacity 0.15s ease;
      cursor: pointer;
    }
    .toast-dismiss-btn:hover {
      opacity: 0.8;
    }
  `;
  document.head.appendChild(el);
};

// ── Single Toast Item ─────────────────────────────────────────────────────────
const ToastItem = ({ id, status, message, onRemove }) => {
  const [leaving, setLeaving] = useState(false);
  const v = VARIANTS[status] || VARIANTS.warning;
  const { accent, accentDim, accentBorder, iconBg, label, Icon } = v;

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 280);
  };

  useEffect(() => {
    const t = setTimeout(dismiss, AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`toast-item${leaving ? " leaving" : ""}`}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        background: "linear-gradient(135deg, #0f1923 0%, #111d2b 100%)",
        border: `1px solid ${accentBorder}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: "12px",
        padding: "0.85rem 1rem 1.1rem",
        minWidth: "300px",
        maxWidth: "380px",
        boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.03), 0 2px 8px ${accentDim}`,
        overflow: "hidden",
      }}
    >
      {/* Icon */}
      <div
        style={{
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: "9px",
          background: iconBg,
          border: `1px solid ${accentBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "1px",
        }}
      >
        <Icon style={{ fontSize: 18, color: accent }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: accent,
            marginBottom: "0.2rem",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "0.86rem",
            color: "#c8daea",
            lineHeight: 1.45,
            wordBreak: "break-word",
          }}
        >
          {message}
        </div>
      </div>

      {/* Close button */}
      <button
        className="toast-dismiss-btn"
        onClick={dismiss}
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: "6px",
          background: "rgba(255,255,255,0.06)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(162,183,206,0.6)",
          padding: 0,
          marginTop: "2px",
        }}
        aria-label="Dismiss"
      >
        <Close style={{ fontSize: 14 }} />
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
          borderRadius: "0 0 0 12px",
          animationDuration: `${AUTO_CLOSE_MS}ms`,
        }}
        className="toast-progress-bar"
      />
    </div>
  );
};

// ── Toast Portal (stack container) ───────────────────────────────────────────
let _addToast = null;
export const showToast = (status, message) => _addToast?.({ status, message });

// ── Main component (drop-in replacement, also supports imperative API) ────────
const Toast = ({ status, message, open, onClose }) => {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  useEffect(() => {
    injectStyles();
    _addToast = ({ status, message }) => {
      const id = ++counterRef.current;
      setToasts((prev) => [...prev, { id, status, message }]);
    };
    return () => {
      _addToast = null;
    };
  }, []);

  // Props-driven mode: respond to open/message/status changes
  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current && message) {
      const id = ++counterRef.current;
      setToasts((prev) => [...prev, { id, status, message }]);
      onClose?.();
    }
    prevOpen.current = open;
  }, [open, message, status]);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "1.25rem",
        right: "1.25rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "auto" }}>
          <ToastItem
            id={t.id}
            status={t.status}
            message={t.message}
            onRemove={remove}
          />
        </div>
      ))}
    </div>
  );
};

export default Toast;
