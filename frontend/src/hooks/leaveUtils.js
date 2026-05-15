// ─── Leave Rules ──────────────────────────────────────────────────────────
export const LEAVE_RULES = {
  NORMAL_PER_MONTH: 1,          // 1 normal leave credited per month
  SICK_PER_MONTH: 1,            // 1 sick leave credited per month
  TOTAL_ANNUAL_NORMAL: 12,
  TOTAL_ANNUAL_SICK: 12,
  SICK_CARRY_FORWARD: false,    // sick leaves don't carry forward
  NORMAL_CARRY_FORWARD: true,
  MAX_CARRY_FORWARD: 5,         // max normal leaves carried to next year
  LONG_LEAVE_THRESHOLD: 3,      // > 3 days needs 2-level approval
  ADVANCE_NOTICE_DAYS: 7,       // must apply 7 days before for long leaves
  COMP_OFF_MIN_HOURS: 8,        // full day on holiday/weekend = 1 comp off
};

export const LEAVE_TYPES = [
  { value: "normal",   label: "Casual Leave",  color: "primary",  bg: "#e8f0fe", border: "#c5d8f8", text: "#1565c0" },
  { value: "sick",     label: "Sick Leave",    color: "warning",  bg: "#fff8e1", border: "#ffcc80", text: "#e65100" },
  { value: "comp_off", label: "Comp Off",      color: "success",  bg: "#e8f5e9", border: "#a5d6a7", text: "#2e7d32" },
];

export const LEAVE_STATUSES = {
  pending_manager:   { label: "Pending Manager",   color: "warning", dot: "#f59e0b" },
  pending_director:  { label: "Pending Director",  color: "primary", dot: "#3b82f6" },
  approved:          { label: "Approved",          color: "success", dot: "#22c55e" },
  rejected:          { label: "Rejected",          color: "danger",  dot: "#ef4444" },
  auto_rejected:     { label: "Auto Rejected",     color: "danger",  dot: "#ef4444" },
  cancelled:         { label: "Cancelled",         color: "neutral", dot: "#94a3b8" },
};

// ─── Business logic helpers ────────────────────────────────────────────────

/** Count working days (Mon–Sat) between two date strings */
export const countWorkingDays = (from, to) => {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end   = new Date(to);
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0) count++; // exclude Sundays only (Sat is working)
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

/** Check if a leave application passes the advance-notice rule */
export const passesAdvanceNotice = (fromDate, days) => {
  if (days <= LEAVE_RULES.LONG_LEAVE_THRESHOLD) return true;
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  const from   = new Date(fromDate);
  const diffMs = from - today;
  const diffDays = Math.floor(diffMs / 86400000);
  return diffDays >= LEAVE_RULES.ADVANCE_NOTICE_DAYS;
};

/** Determine approval flow based on days */
export const getApprovalFlow = (days, leaveType) => {
  if (leaveType === "comp_off" || days > LEAVE_RULES.LONG_LEAVE_THRESHOLD) {
    return ["Manager", "Director"];
  }
  return ["Manager"];
};

/** Format a date string nicely */
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/** Days until next month's credit */
export const daysUntilNextCredit = () => {
  const now   = new Date();
  const next  = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.ceil((next - now) / 86400000);
};